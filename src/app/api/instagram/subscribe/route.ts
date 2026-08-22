import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // Find the connected Instagram account for this user
    const igAccount = await db.igAccount.findFirst({
      where: { userId },
    });

    if (!igAccount) {
      return NextResponse.json({ error: "No connected Instagram accounts found." }, { status: 400 });
    }

    // Decrypt the token
    const decryptedToken = decrypt(igAccount.accessToken);

    // Call Webhook app subscription handshake
    console.log("[Instagram Sync Webhook] Registering App Webhook Subscriptions manually...");
    const subscribeUrl = `https://graph.instagram.com/v24.0/me/subscribed_apps?subscribed_fields=comments,messages,messaging_postbacks&access_token=${decryptedToken}`;
    
    const res = await fetch(subscribeUrl, { method: "POST" });
    const data = await res.json();
    
    console.log("[Instagram Sync Webhook] Sync response:", data);

    if (!res.ok || data.error) {
      const errMsg = data.error?.message || "Failed to trigger webhook handshake with Meta";
      return NextResponse.json({ error: errMsg }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("[Instagram Sync Webhook] Internal Server Error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
