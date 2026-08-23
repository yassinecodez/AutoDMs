import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Text Normalization Helper
 * Strips accents, emojis, punctuation, and lowercase/trims the string
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^\w\s]/gi, "")        // strip emojis/punctuation/special characters
    .replace(/\s+/g, " ")            // normalize whitespace
    .trim();
}

/**
 * Fetch With Retry Helper
 * Retries fetch once if Meta returns 500, 503, or ETIMEDOUT
 */
async function fetchWithRetry(url: string, options: RequestInit, retries = 1): Promise<Response> {
  try {
    const res = await fetch(url, options);
    if ((res.status === 500 || res.status === 503) && retries > 0) {
      console.log(`[Webhook] Meta returned status ${res.status}. Retrying 1 time...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return fetchWithRetry(url, options, retries - 1);
    }
    return res;
  } catch (err: any) {
    const isTimeout = err.code === "ETIMEDOUT" || err.message?.toLowerCase().includes("timeout");
    if (isTimeout && retries > 0) {
      console.log(`[Webhook] Fetch timed out. Retrying 1 time...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw err;
  }
}

/**
 * GET Handler: Meta Webhook Subscription Verification Handshake
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    console.log("[Webhook] Verification successful.");
    return new NextResponse(challenge, { status: 200 });
  }

  console.error("[Webhook] Verification failed. Token mismatch.");
  return new NextResponse("Forbidden", { status: 403 });
}

/**
 * POST Handler: Handles incoming real-time events from Meta/Instagram
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get("X-Hub-Signature-256");
  
  if (!signature) {
    console.error("[Webhook] Signature verification failed: X-Hub-Signature-256 header missing.");
    return new NextResponse("Unauthorized: Signature missing", { status: 401 });
  }

  const parts = signature.split("=");
  if (parts.length !== 2 || parts[0] !== "sha256") {
    console.error("[Webhook] Signature verification failed: Invalid signature format.");
    return new NextResponse("Bad Request: Invalid signature format", { status: 400 });
  }

  const signatureHash = parts[1];
  const rawBody = await request.text();
  const appSecret = process.env.INSTAGRAM_APP_SECRET || process.env.META_APP_SECRET || "41fed97dd8c8940e7b929984d3f16a5f";

  // Verify HMAC-SHA256 signature
  const expectedHash = crypto
    .createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex");

  if (signatureHash !== expectedHash) {
    console.error("[Webhook] Signature verification failed: Signature mismatch.");
    const isDev = process.env.NODE_ENV !== "production";
    if (isDev) {
      console.warn("Signature mismatch, proceeding for debug in development...");
    } else {
      return new NextResponse("Unauthorized: Signature mismatch", { status: 401 });
    }
  }

  try {
    const payload = JSON.parse(rawBody);
    
    // Add full debug logging
    console.log("Incoming Webhook:", JSON.stringify(payload, null, 2));

    if (payload.object !== "instagram") {
      return NextResponse.json({ received: true });
    }

    const entries = payload.entry || [];

    for (const entry of entries) {
      const instagramAccountId = entry.id; // Instagram Business Account ID
      const changes = entry.changes || [];

      for (const change of changes) {
        if (change.field === "comments" && change.value) {
          const commentVal = change.value;
          const commentId = commentVal.id;
          const commentText = commentVal.text;
          const commenterUsername = commentVal.from?.username;
          const mediaId = commentVal.media?.id; // Extract Instagram media ID

          if (!commentId || !commentText || !commenterUsername) {
            continue;
          }

          console.log(`[Webhook] Processing comment ${commentId} ("${commentText}") on media ${mediaId || "unknown"}`);

          try {
            // 1. Atomic Deduplication: Check-and-set using database unique constraint
            try {
              await db.executionLog.create({
                data: {
                  commentId,
                  commentText,
                  commenterUsername,
                  dmStatus: "PROCESSING",
                  commentStatus: "PROCESSING",
                },
              });
            } catch (err: any) {
              console.log(`[Webhook] Duplicate comment skipped (atomic check): ${commentId}`);
              continue;
            }

            // 2. Fetch linked Instagram Account flexibly
            let igAccount = await db.igAccount.findFirst({
              where: {
                OR: [
                  { instagramAccountId: String(instagramAccountId) },
                  { pageId: String(instagramAccountId) }
                ]
              }
            });

            // Fallback for Meta Dashboard Test Events (entry.id === "0")
            if (!igAccount) {
              console.log(`[Webhook] Account ${instagramAccountId} not found. Falling back to first database account for testing.`);
              igAccount = await db.igAccount.findFirst();
            }

            if (!igAccount) {
              console.warn(`[Webhook] No Instagram Account found in db even after fallback. Updating placeholder to FAILED.`);
              await db.executionLog.update({
                where: { commentId },
                data: {
                  dmStatus: "FAILED",
                  dmError: "No accounts linked in system database",
                  commentStatus: "FAILED",
                  commentError: "No accounts linked in system database",
                },
              });
              continue;
            }

            // Decrypt access token
            let decryptedToken = "";
            try {
              decryptedToken = decrypt(igAccount.accessToken);
            } catch (err: any) {
              console.error(`[Webhook] Failed to decrypt access token for account ${igAccount.instagramAccountId}:`, err);
              await db.executionLog.update({
                where: { commentId },
                data: {
                  dmStatus: "FAILED",
                  dmError: "Failed to decrypt token: " + err.message,
                  commentStatus: "FAILED",
                  commentError: "Failed to decrypt token: " + err.message,
                },
              });
              continue;
            }

            // 3. Match rules
            const automations = await db.automation.findMany({
              where: {
                userId: igAccount.userId,
                active: true,
              },
            });

            let matchedAutomation = null;
            const normalizedComment = normalizeText(commentText);

            for (const auto of automations) {
              // Post-Specific Targeting check:
              if (auto.triggerScope === "SPECIFIC_POSTS") {
                if (!mediaId || !auto.targetMediaIds.includes(mediaId)) {
                  continue; // Skip this rule, doesn't match this post
                }
              }

              const triggerType = auto.triggerType.toUpperCase();

              if (triggerType === "ALL") {
                matchedAutomation = auto;
                break;
              }

              // Split trigger keyword string by comma to get individual targets
              const targetKeywords = auto.triggerKeyword
                ? auto.triggerKeyword.split(",").map(k => normalizeText(k)).filter(k => k.length > 0)
                : [];

              if (targetKeywords.length === 0) {
                continue;
              }

              if (triggerType === "EXACT") {
                if (targetKeywords.includes(normalizedComment)) {
                  matchedAutomation = auto;
                  break;
                }
              } else if (triggerType === "KEYWORD") {
                if (targetKeywords.some(k => normalizedComment.includes(k))) {
                  matchedAutomation = auto;
                  break;
                }
              }
            }

            if (!matchedAutomation) {
              console.log(`[Webhook] No active automation rule matched comment text/scope logic.`);
              const isTest = instagramAccountId === "0" || commenterUsername === "instagram";
              await db.executionLog.update({
                where: { commentId },
                data: {
                  dmStatus: isTest ? "TEST_EVENT" : "SKIPPED",
                  dmError: "No matching automation trigger",
                  commentStatus: isTest ? "TEST_EVENT" : "SKIPPED",
                  commentError: "No matching automation trigger",
                },
              });
              continue;
            }

            console.log(`[Webhook] Matched automation "${matchedAutomation.name}"`);

            // 4. Execute Actions (Private DM & Public Comment Reply via Direct Instagram API with retries)
            let dmStatus = "SKIPPED";
            let dmError: string | null = null;
            let commentStatus = "SKIPPED";
            let commentError: string | null = null;

            // A. Send Private Reply (DM) using the Instagram Graph API
            try {
              await sleep(Math.floor(Math.random() * 1500) + 500);
              console.log("Dispatching DM for comment:", commentId);
              const dmText = matchedAutomation.replyDmMessage.replace("{{username}}", commenterUsername || "there");
              const dmRes = await fetchWithRetry("https://graph.instagram.com/v24.0/me/messages", {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${decryptedToken}`,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  recipient: { comment_id: commentId },
                  message: { text: dmText }
                })
              });
              const dmJson = await dmRes.json();
              console.log("Meta DM API Response:", dmRes.status, JSON.stringify(dmJson));

              if (dmRes.ok && !dmJson.error) {
                dmStatus = "SUCCESS";
              } else {
                dmStatus = "FAILED";
                const errCode = dmJson.error?.code ? `[Code ${dmJson.error.code}] ` : "";
                const errMsg = dmJson.error?.message || JSON.stringify(dmJson) || "Failed to send private reply";
                dmError = `${errCode}${errMsg}`;
              }
            } catch (err: any) {
              console.error("[Webhook] Failed to dispatch DM:", err);
              dmStatus = "FAILED";
              dmError = err.message || "Failed to dispatch DM";
            }

            // B. Send Public Comment Reply (Randomized option if available)
            if (
              matchedAutomation.replyCommentOptions &&
              matchedAutomation.replyCommentOptions.length > 0
            ) {
              const options = matchedAutomation.replyCommentOptions;
              const chosenPublicReply = options[Math.floor(Math.random() * options.length)];

              try {
                await sleep(Math.floor(Math.random() * 1500) + 500);
                console.log(`[Webhook] Dispatching Public Reply to comment ${commentId}...`);
                const replyRes = await fetchWithRetry(`https://graph.instagram.com/v24.0/${commentId}/replies`, {
                  method: "POST",
                  headers: {
                    "Authorization": `Bearer ${decryptedToken}`,
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({ message: chosenPublicReply })
                });
                const replyResultJson = await replyRes.json();
                console.log("Public Reply Response:", replyResultJson);

                if (replyRes.ok && !replyResultJson.error) {
                  commentStatus = "SUCCESS";
                } else {
                  commentStatus = "FAILED";
                  const errCode = replyResultJson.error?.code ? `[Code ${replyResultJson.error.code}] ` : "";
                  const errMsg = replyResultJson.error?.message || JSON.stringify(replyResultJson) || "Failed to send public comment reply";
                  commentError = `${errCode}${errMsg}`;
                }
              } catch (err: any) {
                console.error("[Webhook] Failed to dispatch public reply:", err);
                commentStatus = "FAILED";
                commentError = err.message || "Failed to dispatch public reply";
              }
            }

            // 5. Update placeholder log with outcomes
            await db.executionLog.update({
              where: { commentId },
              data: {
                automationId: matchedAutomation.id,
                dmStatus,
                dmError,
                commentStatus,
                commentError,
              },
            });
          } catch (err: any) {
            console.error(`[Webhook] Error executing comment automation:`, err);
            // Try to log general failure outcome
            try {
              await db.executionLog.update({
                where: { commentId },
                data: {
                  dmStatus: "FAILED",
                  dmError: err.message || "Unknown execution crash",
                  commentStatus: "FAILED",
                  commentError: err.message || "Unknown execution crash",
                },
              });
            } catch (logErr) {
              console.error("Could not write update execution log:", logErr);
            }
          }
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error("[Webhook] Failed to process payload:", err);
    return NextResponse.json({ error: "Internal processing error acknowledged" }, { status: 200 });
  }
}
