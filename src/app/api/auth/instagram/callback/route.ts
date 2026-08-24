import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { encrypt } from "@/lib/crypto";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

function extractUserIdFromState(stateParam: string | null): string | null {
  if (!stateParam) return null;
  try {
    const jsonStr = Buffer.from(stateParam, "base64url").toString("utf-8");
    const parsed = JSON.parse(jsonStr);
    return parsed.userId || null;
  } catch {
    try {
      const jsonStr = Buffer.from(stateParam, "base64").toString("utf-8");
      const parsed = JSON.parse(jsonStr);
      return parsed.userId || null;
    } catch {
      return null;
    }
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const stateParam = searchParams.get("state");

  // 1. Resolve User ID from State or Session
  const session = await getServerSession(authOptions);
  const stateUserId = extractUserIdFromState(stateParam);
  const resolvedUserId = stateUserId || session?.user?.id;

  if (!resolvedUserId) {
    console.error("[Instagram Callback] No authenticated user ID found in state or session.");
    return NextResponse.redirect(
      new URL("/dashboard/accounts?error=UNAUTHORIZED", request.url)
    );
  }

  if (error || !code) {
    console.error("[Instagram Callback] OAuth callback error:", error);
    return NextResponse.redirect(
      new URL(`/dashboard/accounts?error=${encodeURIComponent(error || "NO_CODE")}`, request.url)
    );
  }

  const clientId = process.env.INSTAGRAM_APP_ID || process.env.META_APP_ID || "954476037671354";
  const clientSecret = process.env.INSTAGRAM_APP_SECRET || process.env.META_APP_SECRET || "33f555ff97da5f3b5ba5f88c3ee40e11";
  const redirectUri =
    process.env.NODE_ENV === "production" || process.env.VERCEL
      ? "https://autodms-project.vercel.app/api/auth/instagram/callback"
      : "http://localhost:3000/api/auth/instagram/callback";

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
        userId: resolvedUserId,
        pageId: instagramId,
        pageName: username,
        accessToken: encryptedToken,
      },
      create: {
        userId: resolvedUserId,
        instagramAccountId: instagramId,
        pageId: instagramId,
        pageName: username,
        accessToken: encryptedToken,
      },
    });

    console.log(`[Instagram Callback] Account @${username} linked successfully.`);

    // Revalidate dashboard routes
    revalidatePath("/dashboard/accounts");
    revalidatePath("/dashboard/automations");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/leads");
    revalidatePath("/dashboard/logs");

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
