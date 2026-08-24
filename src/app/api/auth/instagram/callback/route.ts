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
  const errorReason = searchParams.get("error_reason");
  const errorDescription = searchParams.get("error_description");
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
    console.error("[Instagram Callback] OAuth callback error:", error, errorReason, errorDescription);
    const errCode = errorReason === "user_denied" ? "USER_DENIED" : (error || "NO_CODE");
    return NextResponse.redirect(
      new URL(`/dashboard/accounts?error=${encodeURIComponent(errCode)}`, request.url)
    );
  }

  const clientId = process.env.INSTAGRAM_APP_ID || "1041048208692049";
  const clientSecret = process.env.INSTAGRAM_APP_SECRET || "41fed97dd8c8940e7b929984d3f16a5f";
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

    console.log("[Instagram Callback] Exchanging code for short-lived token at api.instagram.com/oauth/access_token...");
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
    console.log("[Instagram Callback] Exchanging short-lived token for long-lived token...");
    const longLivedUrl = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${encodeURIComponent(clientSecret)}&access_token=${encodeURIComponent(shortLivedToken)}`;
    
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
    const expiresIn = typeof longLivedData.expires_in === "number" ? longLivedData.expires_in : 5184000;
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

    // 4. Fetch the Instagram profile info
    console.log("[Instagram Callback] Fetching Instagram profile info...");
    const profileUrl = `https://graph.instagram.com/v24.0/me?fields=id,username,name,account_type,profile_picture_url&access_token=${encodeURIComponent(longLivedToken)}`;
    
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
    const username = profileData.username || profileData.name || "instagram_user";

    if (!instagramId) {
      return NextResponse.redirect(
        new URL("/dashboard/accounts?error=NO_INSTAGRAM_BUSINESS_ACCOUNT", request.url)
      );
    }

    // 4.5 Register Webhook app subscriptions
    try {
      console.log("[Instagram Callback] Subscribing to Instagram Webhooks...");
      const subscribeUrl = `https://graph.instagram.com/v24.0/me/subscribed_apps?subscribed_fields=comments,messages,messaging_postbacks&access_token=${encodeURIComponent(longLivedToken)}`;
      const subscribeRes = await fetch(subscribeUrl, { method: "POST" });
      const subscribeData = await subscribeRes.json();
      console.log("[Instagram Callback] Subscribed apps response:", subscribeData);
    } catch (subErr) {
      console.warn("[Instagram Callback] Subscribed apps warning:", subErr);
    }

    // 5. Encrypt long-lived token and save into IgAccount in database
    const encryptedToken = encrypt(longLivedToken);

    await db.igAccount.upsert({
      where: { instagramAccountId: instagramId },
      update: {
        userId: resolvedUserId,
        pageId: instagramId,
        pageName: username,
        accessToken: encryptedToken,
        tokenExpiresAt: tokenExpiresAt,
      },
      create: {
        userId: resolvedUserId,
        instagramAccountId: instagramId,
        pageId: instagramId,
        pageName: username,
        accessToken: encryptedToken,
        tokenExpiresAt: tokenExpiresAt,
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
