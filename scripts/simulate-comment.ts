import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const META_APP_SECRET = process.env.META_APP_SECRET || "33f555ff97da5f3b5ba5f88c3ee40e11";
const WEBHOOK_URL = "http://localhost:3000/api/webhook/instagram";

const prisma = new PrismaClient();

async function run() {
  console.log("--------------------------------------------------");
  console.log("🚀 Starting Instagram Webhook Simulation Script...");
  console.log("--------------------------------------------------");

  const commentId = "mock_comment_" + Date.now();
  const commenterUsername = "test_user_gemini";
  const commentText = "GEMINI";
  const igBusinessId = "instagram_business_account_id_123";

  // 1. Create a mock entry in IgAccount database so the webhook doesn't ignore the account
  console.log("🔹 Pre-authenticating target account in database...");
  try {
    // We try to upsert a mock user and mock account for testing
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: "test-creator@autodms.com",
          password: "mock_password_not_used",
          name: "Test Creator",
        },
      });
    }

    await prisma.igAccount.upsert({
      where: { instagramAccountId: igBusinessId },
      update: {},
      create: {
        userId: user.id,
        instagramAccountId: igBusinessId,
        pageId: "mock_page_id_123",
        pageName: "Mock FB Page",
        accessToken: "mock_encrypted_access_token",
      },
    });
    console.log("✅ Mock Instagram Account registered successfully.");
  } catch (err: any) {
    console.warn("⚠️ Database connection failed or target table missing:", err.message);
    console.log("   (Skipping DB pre-injection. Webhook will proceed but may log account-untracked warning.)\n");
  }

  // 2. Build the webhook event payload
  const payload = {
    object: "instagram",
    entry: [
      {
        id: igBusinessId,
        time: Math.floor(Date.now() / 1000),
        changes: [
          {
            field: "comments",
            value: {
              id: commentId,
              text: commentText,
              from: {
                id: "commenter_id_999",
                username: commenterUsername,
              },
              media: {
                id: "media_id_777",
                media_product_type: "REEL",
              },
            },
          },
        ],
      },
    ],
  };

  const payloadString = JSON.stringify(payload);

  // 3. Compute HMAC-SHA256 signature using META_APP_SECRET
  const signature = crypto
    .createHmac("sha256", META_APP_SECRET)
    .update(payloadString)
    .digest("hex");

  const signatureHeader = `sha256=${signature}`;

  console.log(`🔹 Payload: ${payloadString}`);
  console.log(`🔹 Calculated HMAC Signature: ${signatureHeader}`);

  // 4. Send HTTP POST request to local webhook
  console.log(`\n🔹 Sending HTTP POST request to ${WEBHOOK_URL}...`);
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Hub-Signature-256": signatureHeader,
      },
      body: payloadString,
    });

    console.log(`✅ Response Status Code: ${res.status}`);
    const responseBody = await res.text();
    console.log(`✅ Response Body: ${responseBody}`);

    if (res.status === 200) {
      console.log("\n🎉 Webhook event received and acknowledged successfully!");
      console.log("⏱️ Waiting 3 seconds for BullMQ background worker to process queue job...");
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // 5. Query execution log to confirm processing
      try {
        const log = await prisma.executionLog.findFirst({
          where: { commentId },
        });

        if (log) {
          console.log("\n--------------------------------------------------");
          console.log("🎉 SUCCESS: ExecutionLog matched and found in database!");
          console.log(`🔸 Log ID: ${log.id}`);
          console.log(`🔸 Commenter: @${log.commenterUsername}`);
          console.log(`🔸 Text: "${log.commentText}"`);
          console.log(`🔸 DM Reply Status: ${log.dmStatus}`);
          console.log(`🔸 Public Comment Status: ${log.commentStatus}`);
          console.log("--------------------------------------------------");
        } else {
          console.log("\n❌ Queue worker processed but no ExecutionLog found for comment ID: " + commentId);
          console.log("   (Check if Redis queue worker instance is running alongside your server.)");
        }
      } catch (err: any) {
        console.log("\n⚠️ Could not query ExecutionLog from database: " + err.message);
      }
    } else {
      console.error("\n❌ Webhook delivery failed: server returned status " + res.status);
    }
  } catch (err: any) {
    console.error("\n❌ HTTP Connection to local Next.js server failed: " + err.message);
    console.log("   Please make sure your Next.js server is running by executing 'npm run dev' first.");
  } finally {
    await prisma.$disconnect();
  }
}

run();
