import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";

export async function GET(request: NextRequest) {
  try {
    // 1. Fetch the first IgAccount from the database
    const igAccount = await db.igAccount.findFirst();
    if (!igAccount) {
      return NextResponse.json(
        { error: "No Instagram account connected in database" },
        { status: 404 }
      );
    }

    // 2. Decrypt the access token
    let decryptedToken = "";
    try {
      decryptedToken = decrypt(igAccount.accessToken);
    } catch (err: any) {
      return NextResponse.json(
        { error: "Failed to decrypt access token: " + err.message },
        { status: 500 }
      );
    }

    // 3. Verify the token with Instagram Graph API
    console.log("[Diagnostics] Verifying Instagram token...");
    const meRes = await fetch("https://graph.instagram.com/v24.0/me?fields=id,username", {
      headers: { Authorization: `Bearer ${decryptedToken}` },
    });
    const meData = await meRes.json();

    // 4. Force Meta account-level webhook subscription
    console.log("[Diagnostics] Forcing app subscription registration...");
    const subRes = await fetch(
      "https://graph.instagram.com/v24.0/me/subscribed_apps?subscribed_fields=comments,messages,messaging_postbacks",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${decryptedToken}` },
      }
    );
    const subData = await subRes.json();

    // 5. Fetch all active automations from database
    const activeAutomations = await db.automation.findMany({
      where: { active: true },
    });

    return NextResponse.json({
      status: "ok",
      instagramProfile: meData,
      webhookSubscription: subData,
      activeAutomations,
    });
  } catch (err: any) {
    console.error("[Diagnostics Endpoint Error]:", err);
    return NextResponse.json(
      { error: "Diagnostics crashed: " + (err.message || String(err)) },
      { status: 500 }
    );
  }
}
