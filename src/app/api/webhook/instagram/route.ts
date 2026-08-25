import { NextRequest, NextResponse, after } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { MetaApi, buildMessagePayload, buildFollowGatePayload } from "@/lib/meta";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Text Normalization Helper
 * Strips accents, emojis, punctuation, and lowercases/trims the string
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
 * SaaS Quota Check Helper (Workspace-scoped)
 */
async function checkUsageAllowed(igAccount: any): Promise<{ allowed: boolean; current?: number; limit?: number }> {
  try {
    if (!igAccount) return { allowed: true };

    const oneMonth = 30 * 24 * 60 * 60 * 1000;
    const now = new Date();
    const lastReset = igAccount.usageResetAt ? new Date(igAccount.usageResetAt) : new Date(0);

    if (now.getTime() - lastReset.getTime() > oneMonth) {
      const updated = await db.igAccount.update({
        where: { id: igAccount.id },
        data: {
          dmsCountThisMonth: 0,
          usageResetAt: now,
        },
      });
      return { allowed: true, current: 0, limit: updated.dmsLimit };
    }

    if (igAccount.dmsCountThisMonth >= igAccount.dmsLimit) {
      return { allowed: false, current: igAccount.dmsCountThisMonth, limit: igAccount.dmsLimit };
    }

    return { allowed: true, current: igAccount.dmsCountThisMonth, limit: igAccount.dmsLimit };
  } catch (err) {
    console.error("[Usage Check Error]", err);
    return { allowed: true };
  }
}

/**
 * Increment SaaS Quota Helper (Workspace + User aggregated)
 */
async function incrementUsage(igAccountId: string, userId: string) {
  try {
    await Promise.all([
      db.igAccount.update({
        where: { id: igAccountId },
        data: {
          dmsCountThisMonth: { increment: 1 },
        },
      }),
      db.user.update({
        where: { id: userId },
        data: {
          dmsCountThisMonth: { increment: 1 },
        },
      }),
    ]);
  } catch (err) {
    console.error("[Usage Increment Error]", err);
  }
}

/**
 * Background processor for incoming Meta webhook payloads
 */
async function processWebhookPayload(payload: any) {
  if (payload.object !== "instagram") {
    return;
  }

  const entries = payload.entry || [];

  for (const entry of entries) {
    const instagramAccountId = entry.id; // Instagram Business Account ID

    // ==========================================
    // A. PROCESS COMMENT EVENTS
    // ==========================================
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

        // 1. Graceful Atomic Deduplication
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
          if (err.code === "P2002" || err.message?.includes("Unique constraint")) {
            console.log(`[Webhook Comments] Duplicate comment skipped (atomic check): ${commentId}`);
            continue;
          }
          console.error(`[Webhook Comments] Deduplication error:`, err);
          continue;
        }

        try {
          // 2. Fetch linked Instagram Account strictly to prevent cross-tenant leaks
          let igAccount = await db.igAccount.findFirst({
            where: {
              OR: [
                { instagramAccountId: String(instagramAccountId) },
                { pageId: String(instagramAccountId) },
              ],
            },
          });

          // Only allow fallback for local development test events with ID "0"
          if (!igAccount && process.env.NODE_ENV !== "production" && (instagramAccountId === "0" || String(instagramAccountId) === "0")) {
            console.log(`[Webhook Comments Dev Fallback] Test event detected (ID 0). Falling back to first database account.`);
            igAccount = await db.igAccount.findFirst();
          }

          if (!igAccount) {
            console.warn(`[Webhook Comments] Account ${instagramAccountId} not linked in database. Skipping event to prevent cross-tenant leaks.`);
            await db.executionLog.update({
              where: { commentId },
              data: {
                dmStatus: "SKIPPED",
                dmError: `Account ${instagramAccountId} not linked in database`,
                commentStatus: "SKIPPED",
                commentError: `Account ${instagramAccountId} not linked in database`,
              },
            });
            continue;
          }

          // Link execution log to this Instagram account
          await db.executionLog.update({
            where: { commentId },
            data: {
              igAccountId: igAccount.id,
            },
          });

          // Check SaaS Quota Limits for this workspace
          const quota = await checkUsageAllowed(igAccount);
          if (!quota.allowed) {
            console.warn(`[Webhook Comments] DM Quota Exceeded for account @${igAccount.pageName}. Current: ${quota.current}/${quota.limit}`);
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

          // 3. Match rules strictly for THIS Instagram account (COMMENTS or ALL)
          const automations = await db.automation.findMany({
            where: {
              igAccountId: igAccount.id,
              active: true,
              triggerSource: { in: ["COMMENTS", "ALL"] },
            },
          });

          let matchedAutomation = null;
          const normalizedComment = normalizeText(commentText);

          for (const auto of automations) {
            // Post-Specific Targeting check
            if (auto.triggerScope === "SPECIFIC_POSTS") {
              if (!mediaId || !auto.targetMediaIds.includes(mediaId)) {
                continue;
              }
            }

            const triggerType = auto.triggerType.toUpperCase();

            if (triggerType === "ALL") {
              matchedAutomation = auto;
              break;
            }

            const targetKeywords = auto.triggerKeyword
              ? auto.triggerKeyword.split(",").map((k) => normalizeText(k)).filter((k) => k.length > 0)
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
              if (targetKeywords.some((k) => normalizedComment.includes(k))) {
                matchedAutomation = auto;
                break;
              }
            }
          }

          if (!matchedAutomation) {
            console.log(`[Webhook Comments] No active automation rule matched comment text on @${igAccount.pageName}.`);
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

          console.log(`[Webhook Comments] Matched automation "${matchedAutomation.name}" for @${igAccount.pageName}`);

          // 4. Execute Actions with Anti-Spam Jitter Pacing
          let dmStatus = "SKIPPED";
          let dmError: string | null = null;
          let commentStatus = "SKIPPED";
          let commentError: string | null = null;

          // Check if commenter is known follower from previous events
          const existingLead = commenterUsername
            ? await db.lead.findFirst({
                where: {
                  igAccountId: igAccount.id,
                  username: commenterUsername,
                },
              })
            : null;

          const isFollower = existingLead?.isFollower ?? false;

          // A. Send Private Reply (DM)
          try {
            await sleep(Math.floor(Math.random() * 1500) + 500);
            console.log("Dispatching DM for comment:", commentId, "RequireFollow:", matchedAutomation.requireFollow, "IsFollower:", isFollower);

            const dmPayload = (matchedAutomation.requireFollow && !isFollower)
              ? buildFollowGatePayload(matchedAutomation, commenterUsername || "there", igAccount.pageName)
              : buildMessagePayload(matchedAutomation, commenterUsername || "there");

            const dmResult = await MetaApi.sendPrivateReply(commentId, dmPayload, decryptedToken);

            dmStatus = dmResult.status;
            dmError = dmResult.error || null;

            if (dmResult.status === "SUCCESS") {
              await incrementUsage(igAccount.id, igAccount.userId);
            }
          } catch (err: any) {
            console.error("[Webhook Comments] Failed to dispatch DM:", err);
            dmStatus = "FAILED";
            dmError = err.message || "Failed to dispatch DM";
          }

          // B. Send Public Comment Reply (Randomized option if configured)
          if (
            matchedAutomation.replyCommentOptions &&
            matchedAutomation.replyCommentOptions.length > 0
          ) {
            const options = matchedAutomation.replyCommentOptions;
            const chosenPublicReply = options[Math.floor(Math.random() * options.length)];

            try {
              await sleep(Math.floor(Math.random() * 1000) + 300);
              const pubResult = await MetaApi.sendPublicCommentReply(commentId, chosenPublicReply, decryptedToken);
              commentStatus = pubResult.status;
              commentError = pubResult.error || null;
            } catch (err: any) {
              console.error("[Webhook Comments] Failed to send comment reply:", err);
              commentStatus = "FAILED";
              commentError = err.message || "Failed to send comment reply";
            }
          }

          // 5. Update execution log with outcomes
          await db.executionLog.update({
            where: { commentId },
            data: {
              igAccountId: igAccount.id,
              automationId: matchedAutomation.id,
              dmStatus,
              dmError,
              commentStatus,
              commentError,
              isFollower,
            },
          });
        } catch (err: any) {
          console.error(`[Webhook Comments] Error executing automation:`, err);
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

    // ==========================================
    // B. PROCESS DIRECT MESSAGES & STORY MENTIONS
    // ==========================================
    const messaging = entry.messaging || [];
    for (const msgEvent of messaging) {
      const senderId = msgEvent.sender?.id;
      const recipientId = msgEvent.recipient?.id;
      const message = msgEvent.message;
      const postback = msgEvent.postback;

      // Ignore echoes (messages sent by our bot)
      if (message?.is_echo) {
        continue;
      }

      const messageId = message?.mid || postback?.mid || `msg_${Date.now()}_${Math.random()}`;
      const messageText = message?.text || postback?.title || "";

      console.log(`[Webhook Messaging] Event from sender ${senderId}: "${messageText}"`);

      // 1. Graceful Atomic Deduplication
      try {
        await db.executionLog.create({
          data: {
            commentId: messageId,
            commentText: messageText,
            commenterUsername: senderId,
            triggerSource: "DIRECT_MESSAGE",
            dmStatus: "PROCESSING",
          },
        });
      } catch (err: any) {
        if (err.code === "P2002" || err.message?.includes("Unique constraint")) {
          console.log(`[Webhook Messaging] Duplicate message skipped (atomic check): ${messageId}`);
          continue;
        }
        console.error(`[Webhook Messaging] Deduplication error:`, err);
        continue;
      }

      try {
        // 2. Fetch linked Instagram Account strictly to prevent cross-tenant leaks
        let igAccount = await db.igAccount.findFirst({
          where: {
            OR: [
              { instagramAccountId: String(instagramAccountId) },
              { pageId: String(instagramAccountId) },
            ],
          },
        });

        // Only allow fallback for local development test events with ID "0"
        if (!igAccount && process.env.NODE_ENV !== "production" && (instagramAccountId === "0" || String(instagramAccountId) === "0")) {
          console.log(`[Webhook Messaging Dev Fallback] Test event detected (ID 0). Falling back to first database account.`);
          igAccount = await db.igAccount.findFirst();
        }

        if (!igAccount) {
          console.warn(`[Webhook Messaging] Account ${instagramAccountId} not linked in database. Skipping event to prevent cross-tenant leaks.`);
          await db.executionLog.update({
            where: { commentId: messageId },
            data: {
              dmStatus: "SKIPPED",
              dmError: `Account ${instagramAccountId} not linked in database`,
            },
          });
          continue;
        }

        // Link execution log to this workspace
        await db.executionLog.update({
          where: { commentId: messageId },
          data: {
            igAccountId: igAccount.id,
          },
        });

        // Check SaaS Quota Limits for this workspace
        const quota = await checkUsageAllowed(igAccount);
        if (!quota.allowed) {
          console.warn(`[Webhook Messaging] DM Quota Exceeded for account @${igAccount.pageName}. Current: ${quota.current}/${quota.limit}`);
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

        // 3.5 Inbound Email & International/Moroccan Phone Detection for Lead Capture Guard
        const emailMatch = messageText ? messageText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/) : null;
        const phoneRegex = /(?:(?:\+|00)212[\s.-]?|0)[5-7](?:[\s.-]?\d{2}){4}|(?:\+?\d{1,4}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/;
        const phoneMatch = messageText ? messageText.match(phoneRegex) : null;

        const email = emailMatch ? emailMatch[0] : null;
        const phone = phoneMatch ? phoneMatch[0] : null;

        if (email || phone) {
          console.log(`[Webhook Lead Capture] Contact details captured from ${senderId} on @${igAccount.pageName}: email=${email}, phone=${phone}`);

          const leadCaptureAuto = await db.automation.findFirst({
            where: {
              igAccountId: igAccount.id,
              active: true,
              enableLeadCapture: true,
            },
          });

          // Upsert Lead using @@unique([igAccountId, instagramId])
          await db.lead.upsert({
            where: {
              igAccountId_instagramId: {
                igAccountId: igAccount.id,
                instagramId: senderId,
              },
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
            },
          });

          // Update execution log
          await db.executionLog.update({
            where: { commentId: messageId },
            data: {
              igAccountId: igAccount.id,
              triggerSource: "DIRECT_MESSAGE",
              commenterUsername: resolvedUsername,
              automationId: leadCaptureAuto?.id || null,
              dmStatus: "LEAD_CAPTURED",
            },
          });

          // Send Lead Confirmation DM if configured
          if (leadCaptureAuto && leadCaptureAuto.leadConfirmationDm) {
            const quotaCheck = await checkUsageAllowed(igAccount);
            if (quotaCheck.allowed) {
              try {
                await sleep(Math.floor(Math.random() * 1500) + 500);
                const dmText = leadCaptureAuto.leadConfirmationDm.replace(/\{\{username\}\}/g, resolvedUsername);

                const confirmationResult = await MetaApi.sendDirectMessage(senderId, { text: dmText }, decryptedToken);

                if (confirmationResult.status === "SUCCESS") {
                  await incrementUsage(igAccount.id, igAccount.userId);
                }
              } catch (dmErr) {
                console.error("[Webhook Lead Capture] Failed to send DM confirmation:", dmErr);
              }
            }
          }

          continue; // Lead successfully handled; skip subsequent keyword rules
        }

        let matchedAutomation: any = null;

        // Check if user confirmed follow via postback button
        const isFollowConfirmation = postback?.payload?.startsWith("CONFIRM_FOLLOW");
        let isFollower = false;

        // Check if user is known follower
        const existingLead = senderId
          ? await db.lead.findUnique({
              where: {
                igAccountId_instagramId: {
                  igAccountId: igAccount.id,
                  instagramId: senderId,
                },
              },
            })
          : null;

        if (isFollowConfirmation) {
          isFollower = true;
          const autoId = postback.payload.replace("CONFIRM_FOLLOW_", "");
          if (autoId) {
            matchedAutomation = await db.automation.findUnique({
              where: { id: autoId },
            });
          }
        } else {
          isFollower = existingLead?.isFollower ?? false;
        }

        // Check if Story Mention
        const isStoryMention = message?.attachments?.some(
          (att: any) => att.type === "story_mention" || att.type === "ig_story_mention"
        ) || false;

        let triggerSourceField = "DIRECT_MESSAGE";

        if (!matchedAutomation) {
          if (isStoryMention) {
            triggerSourceField = "STORY_MENTION";
            const automations = await db.automation.findMany({
              where: {
                igAccountId: igAccount.id,
                active: true,
                triggerSource: { in: ["STORY_MENTIONS", "ALL"] },
              },
            });

            if (automations.length > 0) {
              matchedAutomation = automations[0];
            }
          } else if (messageText) {
            triggerSourceField = "DIRECT_MESSAGE";
            const automations = await db.automation.findMany({
              where: {
                igAccountId: igAccount.id,
                active: true,
                triggerSource: { in: ["DIRECT_MESSAGES", "ALL"] },
              },
            });

            const normalizedMsg = normalizeText(messageText);

            for (const auto of automations) {
              const triggerType = auto.triggerType.toUpperCase();

              if (triggerType === "ALL") {
                matchedAutomation = auto;
                break;
              }

              const targetKeywords = auto.triggerKeyword
                ? auto.triggerKeyword.split(",").map((k) => normalizeText(k)).filter((k) => k.length > 0)
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
                if (targetKeywords.some((k) => normalizedMsg.includes(k))) {
                  matchedAutomation = auto;
                  break;
                }
              }
            }
          }
        }

        // Update triggerSource, commenterUsername, and isFollower in Log
        await db.executionLog.update({
          where: { commentId: messageId },
          data: {
            igAccountId: igAccount.id,
            triggerSource: triggerSourceField,
            commenterUsername: resolvedUsername,
            isFollower,
          },
        });

        if (!matchedAutomation) {
          console.log(`[Webhook Messaging] No active automation rule matched DM/Story Mention on @${igAccount.pageName}.`);
          await db.executionLog.update({
            where: { commentId: messageId },
            data: {
              dmStatus: "SKIPPED",
              dmError: "No matching automation trigger",
              isFollower,
            },
          });
          continue;
        }

        console.log(`[Webhook Messaging] Matched automation "${matchedAutomation.name}" for @${igAccount.pageName} (RequireFollow: ${matchedAutomation.requireFollow}, IsFollower: ${isFollower})`);

        // 4. Execute Direct Message Reply
        let dmStatus = "SKIPPED";
        let dmError: string | null = null;

        try {
          await sleep(Math.floor(Math.random() * 1500) + 500);
          console.log("Dispatching Direct Message to user:", senderId);

          const dmPayload = (matchedAutomation.requireFollow && !isFollower)
            ? buildFollowGatePayload(matchedAutomation, resolvedUsername, igAccount.pageName)
            : buildMessagePayload(matchedAutomation, resolvedUsername);

          const dmResult = await MetaApi.sendDirectMessage(senderId, dmPayload, decryptedToken);

          dmStatus = dmResult.status;
          dmError = dmResult.error || null;

          if (dmResult.status === "SUCCESS") {
            await incrementUsage(igAccount.id, igAccount.userId);
            
            // Record or update lead follower status
            await db.lead.upsert({
              where: {
                igAccountId_instagramId: {
                  igAccountId: igAccount.id,
                  instagramId: senderId,
                },
              },
              update: {
                username: resolvedUsername,
                isFollower,
                automationId: matchedAutomation.id,
              },
              create: {
                igAccountId: igAccount.id,
                instagramId: senderId,
                username: resolvedUsername,
                isFollower,
                automationId: matchedAutomation.id,
              },
            });
          }
        } catch (err: any) {
          console.error("[Webhook Messaging] Failed to dispatch DM:", err);
          dmStatus = "FAILED";
          dmError = err.message || "Failed to dispatch DM";
        }

        // 5. Update execution log with outcomes
        await db.executionLog.update({
          where: { commentId: messageId },
          data: {
            igAccountId: igAccount.id,
            automationId: matchedAutomation.id,
            dmStatus,
            dmError,
            isFollower,
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
 * Uses Next.js 15 after() for immediate Fast ACK (<50ms) to Meta servers
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get("X-Hub-Signature-256") || request.headers.get("x-hub-signature-256");

  if (!signature) {
    console.error("[Webhook Verification] Missing X-Hub-Signature-256 header.");
    return new NextResponse("Missing Signature", { status: 401 });
  }

  const rawBody = await request.text();
  const appSecret = process.env.INSTAGRAM_APP_SECRET || process.env.META_APP_SECRET;

  if (appSecret) {
    const expectedSignature = `sha256=${crypto
      .createHmac("sha256", appSecret)
      .update(rawBody)
      .digest("hex")}`;

    if (signature !== expectedSignature && process.env.NODE_ENV === "production") {
      console.error("[Webhook Verification] Signature mismatch.");
      return new NextResponse("Invalid Signature", { status: 401 });
    }
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch (err) {
    console.error("[Webhook Payload] Failed to parse JSON body:", err);
    return new NextResponse("Bad Request", { status: 400 });
  }

  // Fast ACK: Delegate processing to background execution queue
  after(async () => {
    try {
      await processWebhookPayload(payload);
    } catch (bgErr) {
      console.error("[Webhook Background Error]", bgErr);
    }
  });

  return new NextResponse("EVENT_RECEIVED", { status: 200 });
}
