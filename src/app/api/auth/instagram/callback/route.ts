import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { encrypt } from "@/lib/crypto";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  // 1. Authenticate user session
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const userId = session.user.id;

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    console.error("Instagram OAuth callback error:", error);
    return NextResponse.redirect(
      new URL(`/dashboard/accounts?error=${encodeURIComponent(error || "NO_CODE")}`, request.url)
    );
  }

  const clientId = process.env.INSTAGRAM_APP_ID || "1041048208692049";
  const clientSecret = process.env.INSTAGRAM_APP_SECRET || "41fed97dd8c8940e7b929984d3f16a5f";
  const redirectUri = "https://autodms-project.vercel.app/api/auth/instagram/callback";

  try {
    // 2. Exchange authorization code for short-lived User Access Token
    const exchangeBody = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code: code,
    });

    console.log("[Instagram Callback] Exchanging code for short-lived token...");
    const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      body: exchangeBody,
    });

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      console.error("[Instagram Callback] Failed to exchange code:", errorText);
      return NextResponse.redirect(
        new URL("/dashboard/accounts?error=TOKEN_EXCHANGE_FAILED", request.url)
      );
    }

    const tokenData = await tokenRes.json();
    const shortLivedToken = tokenData.access_token;
    if (!shortLivedToken) {
      return NextResponse.redirect(
        new URL("/dashboard/accounts?error=TOKEN_EXCHANGE_FAILED", request.url)
      );
    }

    // 3. Exchange short-lived token for long-lived (60-day) token
    console.log("[Instagram Callback] Exchanging for long-lived token...");
    const longLivedUrl = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${clientSecret}&access_token=${shortLivedToken}`;
    
    const longLivedRes = await fetch(longLivedUrl);
    if (!longLivedRes.ok) {
      const errorText = await longLivedRes.text();
      console.error("[Instagram Callback] Failed to get long-lived token:", errorText);
      return NextResponse.redirect(
        new URL("/dashboard/accounts?error=TOKEN_EXCHANGE_FAILED", request.url)
      );
    }

    const longLivedData = await longLivedRes.json();
    const longLivedToken = longLivedData.access_token;

    // 4. Fetch the Instagram profile info
    console.log("[Instagram Callback] Fetching profile info...");
    const profileUrl = `https://graph.instagram.com/v24.0/me?fields=id,username,profile_picture_url&access_token=${longLivedToken}`;
    
    const profileRes = await fetch(profileUrl);
    if (!profileRes.ok) {
      const errorText = await profileRes.text();
      console.error("[Instagram Callback] Failed to fetch profile:", errorText);
      return NextResponse.redirect(
        new URL("/dashboard/accounts?error=NO_INSTAGRAM_BUSINESS_ACCOUNT", request.url)
      );
    }

    const profileData = await profileRes.json();
    const instagramId = profileData.id;
    const username = profileData.username;

    if (!instagramId) {
      return NextResponse.redirect(
        new URL("/dashboard/accounts?error=NO_INSTAGRAM_BUSINESS_ACCOUNT", request.url)
      );
    }

    // 4.5 Call Webhook app subscription handshake
    try {
      console.log("[Instagram Callback] Registering App Webhook Subscriptions...");
      const subscribeUrl = `https://graph.instagram.com/v24.0/me/subscribed_apps?subscribed_fields=comments,messages,messaging_postbacks&access_token=${longLivedToken}`;
      const subscribeRes = await fetch(subscribeUrl, { method: "POST" });
      const subscribeData = await subscribeRes.json();
      console.log("[Instagram Callback] Subscription handshake response:", subscribeData);
    } catch (subErr) {
      console.error("[Instagram Callback] Subscription handshake failed, continuing anyway:", subErr);
    }

    // 5. Encrypt long-lived token and save/update the IgAccount in database
    const encryptedToken = encrypt(longLivedToken);

    await db.igAccount.upsert({
      where: { instagramAccountId: instagramId },
      update: {
        pageId: instagramId,
        pageName: username,
        accessToken: encryptedToken,
      },
      create: {
        userId: userId,
        instagramAccountId: instagramId,
        pageId: instagramId,
        pageName: username,
        accessToken: encryptedToken,
      },
    });

    console.log(`[Instagram Callback] Account @${username} linked successfully.`);
    return NextResponse.redirect(
      new URL("/dashboard/accounts?status=SUCCESS&count=1", request.url)
    );
  } catch (err: any) {
    console.error("[Instagram Callback] OAuth callback processing failed:", err);
    return NextResponse.redirect(
      new URL("/dashboard/accounts?error=TOKEN_EXCHANGE_FAILED", request.url)
    );
  }
}
