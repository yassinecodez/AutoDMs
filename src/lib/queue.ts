import { Queue, Worker, Job } from "bullmq";
import { db } from "./db";
import { MetaApi } from "./meta";
import { decrypt } from "./crypto";
import { getRedisConnection } from "./redis";

export const QUEUE_NAME = "instagram-comment-queue";

// Create queue instance
export const commentQueue = new Queue(QUEUE_NAME, {
  connection: getRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export interface CommentJobData {
  commentId: string;
  commentText: string;
  commenterUsername: string;
  instagramAccountId: string; // Recipient IG Business Account ID
}

let worker: Worker | null = null;

export function startWorker() {
  if (worker) {
    return worker;
  }

  worker = new Worker(
    QUEUE_NAME,
    async (job: Job<CommentJobData>) => {
      const { commentId, commentText, commenterUsername, instagramAccountId } = job.data;

      console.log(`[Worker] Processing comment ${commentId} ("${commentText}") from user "${commenterUsername}"`);

      // 1. Deduplication: Check if comment was already processed
      const existingLog = await db.executionLog.findUnique({
        where: { commentId },
      });

      if (existingLog) {
        console.log(`[Worker] Comment ${commentId} has already been processed. Skipping.`);
        return { skipped: true, reason: "Deduplicated" };
      }

      // 2. Fetch linked Instagram Account
      const igAccount = await db.igAccount.findUnique({
        where: { instagramAccountId },
        include: { user: true },
      });

      if (!igAccount) {
        console.error(`[Worker] No Instagram Account found in db for ID: ${instagramAccountId}`);
        return { error: "Account not found" };
      }

      // Decrypt page access token
      let pageAccessToken = "";
      try {
        pageAccessToken = decrypt(igAccount.accessToken);
      } catch (err: any) {
        console.error(`[Worker] Failed to decrypt access token for account ${instagramAccountId}:`, err);
        return { error: "Token decryption failed" };
      }

      // 3. Match rules
      // Get all active automations for the creator (user)
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
        console.log(`[Worker] No active automation rule matched comment text: "${commentText}"`);
        // Log skipped interaction
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
        return { matched: false };
      }

      console.log(`[Worker] Matched automation "${matchedAutomation.name}" (ID: ${matchedAutomation.id})`);

      // 4. Execute Actions (Private DM & Public Comment Reply)
      let dmStatus = "SKIPPED";
      let dmError: string | null = null;
      let commentStatus = "SKIPPED";
      let commentError: string | null = null;

      // A. Send Private Reply (DM)
      console.log(`[Worker] Sending private reply to comment ${commentId}`);
      const dmResult = await MetaApi.sendPrivateReply(
        commentId,
        matchedAutomation.replyDmMessage,
        pageAccessToken
      );

      if (dmResult.success) {
        dmStatus = "SUCCESS";
        console.log(`[Worker] Private DM reply sent successfully. Message ID: ${dmResult.messageId}`);
      } else {
        dmStatus = "FAILED";
        dmError = dmResult.error || "Failed to send private reply";
        console.error(`[Worker] DM delivery failed:`, dmError);
      }

      // B. Send Public Comment Reply (Randomized option if available)
      if (
        matchedAutomation.replyCommentOptions &&
        matchedAutomation.replyCommentOptions.length > 0
      ) {
        const options = matchedAutomation.replyCommentOptions;
        const randomReply = options[Math.floor(Math.random() * options.length)];

        console.log(`[Worker] Sending public comment reply: "${randomReply}"`);
        const commentResult = await MetaApi.sendPublicCommentReply(
          commentId,
          randomReply,
          pageAccessToken
        );

        if (commentResult.success) {
          commentStatus = "SUCCESS";
          console.log(`[Worker] Public comment reply sent successfully. Reply ID: ${commentResult.commentId}`);
        } else {
          commentStatus = "FAILED";
          commentError = commentResult.error || "Failed to send public comment reply";
          console.error(`[Worker] Public comment reply failed:`, commentError);
        }
      } else {
        console.log(`[Worker] No public comment reply options configured for automation. Skipping.`);
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

      return {
        matched: true,
        automationId: matchedAutomation.id,
        dmStatus,
        commentStatus,
      };
    },
    {
      connection: getRedisConnection(),
      concurrency: 5,
      limiter: {
        max: 5,
        duration: 1000,
      },
    }
  );

  worker.on("failed", (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed with error:`, err);
  });

  worker.on("error", (err) => {
    console.error(`[Worker] Critical worker error:`, err);
  });

  console.log(`[Worker] Instagram comment process worker started successfully.`);
  return worker;
}
