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
 * SaaS Quota Check Helper
 */
async function checkUsageAllowed(userId: string): Promise<{ allowed: boolean; current?: number; limit?: number }> {
  try {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return { allowed: true };

    const oneMonth = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - new Date(user.usageResetAt).getTime() > oneMonth) {
      const updated = await db.user.update({
        where: { id: userId },
        data: {
          dmsCountThisMonth: 0,
          usageResetAt: new Date(),
        }
      });
      return { allowed: true, current: 0, limit: updated.dmsLimit };
    }

    if (user.dmsCountThisMonth >= user.dmsLimit) {
      return { allowed: false, current: user.dmsCountThisMonth, limit: user.dmsLimit };
    }

    return { allowed: true, current: user.dmsCountThisMonth, limit: user.dmsLimit };
  } catch (err) {
    console.error("[Usage Check Error]", err);
    return { allowed: true };
  }
}

/**
 * Increment SaaS Quota Helper
 */
async function incrementUsage(userId: string) {
  try {
    await db.user.update({
      where: { id: userId },
      data: {
        dmsCountThisMonth: { increment: 1 }
      }
    });
  } catch (err) {
    console.error("[Usage Increment Error]", err);
  }
}

/**
 * Build Message Payload for Meta
 * Formats as Generic Template if buttonTitle/buttonUrl exist, otherwise standard text DM
 */
function buildMessagePayload(matchedAutomation: any, resolvedUsername: string) {
  const dmText = matchedAutomation.replyDmMessage.replace("{{username}}", resolvedUsername);

  if (matchedAutomation.buttonTitle && matchedAutomation.buttonUrl) {
    const buttons: any[] = [
      {
        type: "web_url",
        url: matchedAutomation.buttonUrl,
        title: matchedAutomation.buttonTitle.slice(0, 20),
      }
    ];

    if (matchedAutomation.secondaryButtonTitle && matchedAutomation.secondaryButtonUrl) {
      buttons.push({
        type: "web_url",
        url: matchedAutomation.secondaryButtonUrl,
        title: matchedAutomation.secondaryButtonTitle.slice(0, 20),
      });
    }

    return {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: matchedAutomation.name.slice(0, 80),
              subtitle: dmText.slice(0, 80),
              buttons: buttons,
            }
          ]
        }
      }
    };
  }

  return { text: dmText };
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
      
      // A. PROCESS COMMENT EVENTS
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

          console.log(`[Webhook Comments] Processing comment ${commentId} ("${commentText}") on media ${mediaId || "unknown"}`);

          try {
            // 1. Atomic Deduplication
            try {
              await db.executionLog.create({
                data: {
                  commentId,
                  commentText,
                  commenterUsername,
                  triggerSource: "COMMENT",
                  dmStatus: "PROCESSING",
                  commentStatus: "PROCESSING",
                },
              });
            } catch (err: any) {
              console.log(`[Webhook Comments] Duplicate comment skipped (atomic check): ${commentId}`);
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
              console.log(`[Webhook Comments] Account ${instagramAccountId} not found. Falling back to first database account for testing.`);
              igAccount = await db.igAccount.findFirst();
            }

            if (!igAccount) {
              console.warn(`[Webhook Comments] No Instagram Account found in db even after fallback. Updating placeholder to FAILED.`);
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

            // Check SaaS Quota Limits
            const quota = await checkUsageAllowed(igAccount.userId);
            if (!quota.allowed) {
              console.warn(`[Webhook Comments] DM Quota Exceeded for user ${igAccount.userId}. Current: ${quota.current}/${quota.limit}`);
              await db.executionLog.update({
                where: { commentId },
                data: {
                  dmStatus: "FAILED",
                  dmError: `Quota limit exceeded (${quota.current}/${quota.limit})`,
                  commentStatus: "SKIPPED",
                },
              });
              continue;
            }

            // Decrypt access token
            let decryptedToken = "";
            try {
              decryptedToken = decrypt(igAccount.accessToken);
            } catch (err: any) {
              console.error(`[Webhook Comments] Failed to decrypt access token for account ${igAccount.instagramAccountId}:`, err);
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

            // 3. Match rules (COMMENTS or ALL)
            const automations = await db.automation.findMany({
              where: {
                userId: igAccount.userId,
                active: true,
                triggerSource: { in: ["COMMENTS", "ALL"] }
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
              console.log(`[Webhook Comments] No active automation rule matched comment text/scope logic.`);
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

            console.log(`[Webhook Comments] Matched automation "${matchedAutomation.name}"`);

            // 4. Execute Actions (Private DM & Public Comment Reply via Direct Instagram API with retries)
            let dmStatus = "SKIPPED";
            let dmError: string | null = null;
            let commentStatus = "SKIPPED";
            let commentError: string | null = null;

            // A. Send Private Reply (DM) using the Instagram Graph API
            try {
              await sleep(Math.floor(Math.random() * 1500) + 500);
              console.log("Dispatching DM for comment:", commentId);
              
              const dmPayload = buildMessagePayload(matchedAutomation, commenterUsername || "there");

              const dmRes = await fetchWithRetry("https://graph.instagram.com/v24.0/me/messages", {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${decryptedToken}`,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  recipient: { comment_id: commentId },
                  message: dmPayload
                })
              });
              const dmJson = await dmRes.json();
              console.log("Meta DM API Response:", dmRes.status, JSON.stringify(dmJson));

              if (dmRes.ok && !dmJson.error) {
                dmStatus = "SUCCESS";
                await incrementUsage(igAccount.userId);
              } else {
                dmStatus = "FAILED";
                const errCode = dmJson.error?.code ? `[Code ${dmJson.error.code}] ` : "";
                const errMsg = dmJson.error?.message || JSON.stringify(dmJson) || "Failed to send private reply";
                dmError = `${errCode}${errMsg}`;
              }
            } catch (err: any) {
              console.error("[Webhook Comments] Failed to dispatch DM:", err);
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
                console.log(`[Webhook Comments] Dispatching Public Reply to comment ${commentId}...`);
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
                console.error("[Webhook Comments] Failed to dispatch public reply:", err);
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
            console.error(`[Webhook Comments] Error executing comment automation:`, err);
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

      // B. PROCESS DIRECT MESSAGES, STORY MENTIONS, AND POSTBACKS
      const messaging = entry.messaging || [];
      for (const msgEvent of messaging) {
        const senderId = msgEvent.sender?.id;
        const message = msgEvent.message;
        const postback = msgEvent.postback;

        // Verify sender and that we have a message or postback payload to process
        if (!senderId || (!message && !postback)) {
          continue;
        }

        const messageText = message ? (message.text || "") : (postback.payload || postback.title || "");
        const messageId = message ? (message.mid || "") : ("postback_" + msgEvent.timestamp + "_" + senderId);

        if (!messageId) {
          continue;
        }

        console.log(`[Webhook Messaging] Processing messaging event ${messageId} (Postback: ${!!postback}) from sender ${senderId}`);

        try {
          // 1. Atomic Deduplication
          try {
            await db.executionLog.create({
              data: {
                commentId: messageId,
                commentText: messageText || "[Media/Postback/Attachment]",
                commenterUsername: "ig_user_" + senderId, // Temporary fallback
                triggerSource: "DIRECT_MESSAGE", // Temporary default
                dmStatus: "PROCESSING",
                commentStatus: "SKIPPED",
              },
            });
          } catch (err: any) {
            console.log(`[Webhook Messaging] Duplicate message skipped (atomic check): ${messageId}`);
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
            console.log(`[Webhook Messaging] Account ${instagramAccountId} not found. Falling back to first database account for testing.`);
            igAccount = await db.igAccount.findFirst();
          }

          if (!igAccount) {
            console.warn(`[Webhook Messaging] No Instagram Account found in db even after fallback. Updating placeholder to FAILED.`);
            await db.executionLog.update({
              where: { commentId: messageId },
              data: {
                dmStatus: "FAILED",
                dmError: "No accounts linked in system database",
              },
            });
            continue;
          }

          // Check SaaS Quota Limits
          const quota = await checkUsageAllowed(igAccount.userId);
          if (!quota.allowed) {
            console.warn(`[Webhook Messaging] DM Quota Exceeded for user ${igAccount.userId}. Current: ${quota.current}/${quota.limit}`);
            await db.executionLog.update({
              where: { commentId: messageId },
              data: {
                dmStatus: "FAILED",
                dmError: `Quota limit exceeded (${quota.current}/${quota.limit})`,
              },
            });
            continue;
          }

          // Decrypt access token
          let decryptedToken = "";
          try {
            decryptedToken = decrypt(igAccount.accessToken);
          } catch (err: any) {
            console.error(`[Webhook Messaging] Failed to decrypt access token for account ${igAccount.instagramAccountId}:`, err);
            await db.executionLog.update({
              where: { commentId: messageId },
              data: {
                dmStatus: "FAILED",
                dmError: "Failed to decrypt token: " + err.message,
              },
            });
            continue;
          }

          // 3. Resolve real Instagram username via Meta API
          let resolvedUsername = "there";
          try {
            const profileRes = await fetch(`https://graph.instagram.com/v24.0/${senderId}?fields=username&access_token=${decryptedToken}`);
            if (profileRes.ok) {
              const profileData = await profileRes.json();
              if (profileData.username) {
                resolvedUsername = profileData.username;
              }
            }
          } catch (profErr) {
            console.warn("[Webhook Messaging] Could not resolve sender profile info:", profErr);
          }

          // 3.5 Inbound Email & Phone Detection for Lead Capture
          const emailMatch = messageText ? messageText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/) : null;
          const phoneMatch = messageText ? messageText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/) : null;

          const email = emailMatch ? emailMatch[0] : null;
          const phone = phoneMatch ? phoneMatch[0] : null;

          if (email || phone) {
            console.log(`[Webhook Lead Capture] Lead details detected from ${senderId}: email=${email}, phone=${phone}`);

            // Find active lead capture automation
            const leadCaptureAuto = await db.automation.findFirst({
              where: {
                userId: igAccount.userId,
                active: true,
                enableLeadCapture: true,
              }
            });

            // Upsert the Lead in the database
            await db.lead.upsert({
              where: {
                igAccountId_instagramId: {
                  igAccountId: igAccount.id,
                  instagramId: senderId,
                }
              },
              update: {
                username: resolvedUsername,
                email: email || undefined,
                phone: phone || undefined,
                automationId: leadCaptureAuto?.id || undefined,
              },
              create: {
                igAccountId: igAccount.id,
                instagramId: senderId,
                username: resolvedUsername,
                email,
                phone,
                automationId: leadCaptureAuto?.id || null,
              }
            });

            // Update execution log trigger source & status
            await db.executionLog.update({
              where: { commentId: messageId },
              data: {
                triggerSource: "DIRECT_MESSAGE",
                commenterUsername: resolvedUsername,
                automationId: leadCaptureAuto?.id || null,
                dmStatus: "LEAD_CAPTURED",
              }
            });

            // Send lead confirmation DM if configured
            if (leadCaptureAuto && leadCaptureAuto.leadConfirmationDm) {
              const quotaCheck = await checkUsageAllowed(igAccount.userId);
              if (quotaCheck.allowed) {
                try {
                  await sleep(Math.floor(Math.random() * 1500) + 500);
                  const dmText = leadCaptureAuto.leadConfirmationDm.replace("{{username}}", resolvedUsername);
                  
                  const dmRes = await fetchWithRetry("https://graph.instagram.com/v24.0/me/messages", {
                    method: "POST",
                    headers: {
                      "Authorization": `Bearer ${decryptedToken}`,
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      recipient: { id: senderId },
                      message: { text: dmText }
                    })
                  });
                  const dmJson = await dmRes.json();
                  console.log("[Webhook Lead Capture] DM confirmation response:", dmRes.status, JSON.stringify(dmJson));
                  if (dmRes.ok && !dmJson.error) {
                    await incrementUsage(igAccount.userId);
                  }
                } catch (dmErr) {
                  console.error("[Webhook Lead Capture] Failed to send DM confirmation:", dmErr);
                }
              }
            }

            continue; // Stop further keyword matching for this DM
          }

          // Check if Story Mention
          const isStoryMention = message?.attachments?.some(
            (att: any) => att.type === "story_mention" || att.type === "ig_story_mention"
          ) || false;

          let matchedAutomation = null;
          let triggerSourceField = postback ? "DIRECT_MESSAGE" : "DIRECT_MESSAGE";

          if (isStoryMention) {
            triggerSourceField = "STORY_MENTION";
            // Match rules with triggerSource === "STORY_MENTIONS" or "ALL"
            const automations = await db.automation.findMany({
              where: {
                userId: igAccount.userId,
                active: true,
                triggerSource: { in: ["STORY_MENTIONS", "ALL"] }
              },
            });

            // Match the first active Story Mention rule as rewards don't require keyword checks
            if (automations.length > 0) {
              matchedAutomation = automations[0];
            }
          } else if (messageText) {
            triggerSourceField = "DIRECT_MESSAGE";
            // Match rules with triggerSource === "DIRECT_MESSAGES" or "ALL"
            const automations = await db.automation.findMany({
              where: {
                userId: igAccount.userId,
                active: true,
                triggerSource: { in: ["DIRECT_MESSAGES", "ALL"] }
              },
            });

            const normalizedMsg = normalizeText(messageText);

            for (const auto of automations) {
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
                if (targetKeywords.includes(normalizedMsg)) {
                  matchedAutomation = auto;
                  break;
                }
              } else if (triggerType === "KEYWORD") {
                if (targetKeywords.some(k => normalizedMsg.includes(k))) {
                  matchedAutomation = auto;
                  break;
                }
              }
            }
          }

          // Update triggerSource and resolvedUsername in Log
          await db.executionLog.update({
            where: { commentId: messageId },
            data: {
              triggerSource: triggerSourceField,
              commenterUsername: resolvedUsername,
            }
          });

          if (!matchedAutomation) {
            console.log(`[Webhook Messaging] No active automation rule matched DM/Story Mention/Postback.`);
            await db.executionLog.update({
              where: { commentId: messageId },
              data: {
                dmStatus: "SKIPPED",
                dmError: "No matching automation trigger",
              },
            });
            continue;
          }

          console.log(`[Webhook Messaging] Matched automation "${matchedAutomation.name}"`);

          // 4. Execute DM Private Reply
          let dmStatus = "SKIPPED";
          let dmError: string | null = null;

          try {
            await sleep(Math.floor(Math.random() * 1500) + 500);
            console.log("Dispatching Direct Message to user:", senderId);
            
            const dmPayload = buildMessagePayload(matchedAutomation, resolvedUsername);

            const dmRes = await fetchWithRetry("https://graph.instagram.com/v24.0/me/messages", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${decryptedToken}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                recipient: { id: senderId },
                message: dmPayload
              })
            });
            const dmJson = await dmRes.json();
            console.log("Meta Messaging API Response:", dmRes.status, JSON.stringify(dmJson));

            if (dmRes.ok && !dmJson.error) {
              dmStatus = "SUCCESS";
              await incrementUsage(igAccount.userId);
            } else {
              dmStatus = "FAILED";
              const errCode = dmJson.error?.code ? `[Code ${dmJson.error.code}] ` : "";
              const errMsg = dmJson.error?.message || JSON.stringify(dmJson) || "Failed to send private reply";
              dmError = `${errCode}${errMsg}`;
            }
          } catch (err: any) {
            console.error("[Webhook Messaging] Failed to dispatch DM:", err);
            dmStatus = "FAILED";
            dmError = err.message || "Failed to dispatch DM";
          }

          // 5. Update placeholder log with outcomes
          await db.executionLog.update({
            where: { commentId: messageId },
            data: {
              automationId: matchedAutomation.id,
              dmStatus,
              dmError,
            },
          });
        } catch (err: any) {
          console.error(`[Webhook Messaging] Error executing messaging automation:`, err);
          try {
            await db.executionLog.update({
              where: { commentId: messageId },
              data: {
                dmStatus: "FAILED",
                dmError: err.message || "Unknown execution crash",
              },
            });
          } catch (logErr) {
            console.error("Could not write update execution log:", logErr);
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
