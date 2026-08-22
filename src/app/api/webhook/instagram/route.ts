import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { commentQueue } from "@/lib/queue";
import { db } from "@/lib/db";

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

    // Validate that the event payload is for an instagram object subscription
    if (payload.object !== "instagram") {
      return NextResponse.json({ received: true }); // Acknowledge other objects without error
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

          // Fetch the account from db to verify and check if the commenter is the account itself
          const igAccount = await db.igAccount.findUnique({
            where: { instagramAccountId },
            select: { pageName: true }, // We don't need a lot of data, just verify exists
          });

          if (!igAccount) {
            console.warn(`[Webhook] Received comment event for untracked IG Business Account: ${instagramAccountId}`);
            continue;
          }

          console.log(`[Webhook] Enqueuing comment ${commentId} from ${commenterUsername}`);

          // Enqueue comment into BullMQ
          await commentQueue.add("process-comment", {
            commentId,
            commentText,
            commenterUsername,
            instagramAccountId,
          });
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error("[Webhook] Failed to process payload:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
