import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { MetaApi } from "@/lib/meta";

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
 * POST Handler: Handles incoming real-time events from Meta
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
  const appSecret = process.env.META_APP_SECRET || "";

  // Verify HMAC-SHA256 signature
  const expectedHash = crypto
    .createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex");

  if (signatureHash !== expectedHash) {
    console.error("[Webhook] Signature verification failed: Signature mismatch.");
    return new NextResponse("Unauthorized: Signature mismatch", { status: 401 });
  }

  try {
    const payload = JSON.parse(rawBody);

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

          if (!commentId || !commentText || !commenterUsername) {
            continue;
          }

          console.log(`[Webhook] Direct-processing comment ${commentId} ("${commentText}") from user "${commenterUsername}"`);

          try {
            // 1. Deduplication: Check if comment was already processed
            const existingLog = await db.executionLog.findUnique({
              where: { commentId },
            });

            if (existingLog) {
              console.log(`[Webhook] Comment ${commentId} has already been processed. Skipping.`);
              continue;
            }

            // 2. Fetch linked Instagram Account
            const igAccount = await db.igAccount.findUnique({
              where: { instagramAccountId },
            });

            if (!igAccount) {
              console.warn(`[Webhook] No Instagram Account found in db for ID: ${instagramAccountId}`);
              continue;
            }

            // Decrypt page access token
            let pageAccessToken = "";
            try {
              pageAccessToken = decrypt(igAccount.accessToken);
            } catch (err: any) {
              console.error(`[Webhook] Failed to decrypt access token for account ${instagramAccountId}:`, err);
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
            const normalizedComment = commentText.trim().toLowerCase();

            for (const auto of automations) {
              const triggerType = auto.triggerType.toUpperCase();
              const keyword = auto.triggerKeyword?.trim().toLowerCase() || "";

              if (triggerType === "ALL") {
                matchedAutomation = auto;
                break;
              } else if (triggerType === "EXACT") {
                if (normalizedComment === keyword) {
                  matchedAutomation = auto;
                  break;
                }
              } else if (triggerType === "KEYWORD") {
                if (normalizedComment.includes(keyword)) {
                  matchedAutomation = auto;
                  break;
                }
              }
            }

            if (!matchedAutomation) {
              console.log(`[Webhook] No active automation rule matched comment text: "${commentText}"`);
              await db.executionLog.create({
                data: {
                  commentId,
                  commentText,
                  commenterUsername,
                  dmStatus: "SKIPPED",
                  dmError: "No matching automation trigger",
                  commentStatus: "SKIPPED",
                  commentError: "No matching automation trigger",
                },
              });
              continue;
            }

            console.log(`[Webhook] Matched automation "${matchedAutomation.name}"`);

            // 4. Execute Actions (Private DM & Public Comment Reply)
            let dmStatus = "SKIPPED";
            let dmError: string | null = null;
            let commentStatus = "SKIPPED";
            let commentError: string | null = null;

            // A. Send Private Reply (DM)
            const dmResult = await MetaApi.sendPrivateReply(
              commentId,
              matchedAutomation.replyDmMessage,
              pageAccessToken
            );

            if (dmResult.success) {
              dmStatus = "SUCCESS";
            } else {
              dmStatus = "FAILED";
              dmError = dmResult.error || "Failed to send private reply";
            }

            // B. Send Public Comment Reply (Randomized option if available)
            if (
              matchedAutomation.replyCommentOptions &&
              matchedAutomation.replyCommentOptions.length > 0
            ) {
              const options = matchedAutomation.replyCommentOptions;
              const randomReply = options[Math.floor(Math.random() * options.length)];

              const commentResult = await MetaApi.sendPublicCommentReply(
                commentId,
                randomReply,
                pageAccessToken
              );

              if (commentResult.success) {
                commentStatus = "SUCCESS";
              } else {
                commentStatus = "FAILED";
                commentError = commentResult.error || "Failed to send public comment reply";
              }
            }

            // 5. Log outcome
            await db.executionLog.create({
              data: {
                automationId: matchedAutomation.id,
                commentId,
                commentText,
                commenterUsername,
                dmStatus,
                dmError,
                commentStatus,
                commentError,
              },
            });
          } catch (err: any) {
            console.error(`[Webhook] Error executing comment automation:`, err);
          }
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error("[Webhook] Failed to process payload:", err);
    // Return a 200 OK anyway to satisfy Meta webhook requirements and prevent retries
    return NextResponse.json({ error: "Internal processing error acknowledged" }, { status: 200 });
  }
}
