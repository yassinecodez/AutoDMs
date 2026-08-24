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

  // 1. Resolve and strictly verify User ID from State or Session
  const session = await getServerSession(authOptions);
  const stateUserId = extractUserIdFromState(stateParam);
  let resolvedUserId = stateUserId || session?.user?.id;

  if (!resolvedUserId) {
    console.error("[Instagram Callback] No authenticated user ID found in state or session.");
    return NextResponse.redirect(
      new URL("/dashboard/accounts?error=UNAUTHORIZED", request.url)
    );
  }

  let verifiedUser = await db.user.findUnique({
    where: { id: resolvedUserId },
  });

  if (!verifiedUser && session?.user?.id) {
    resolvedUserId = session.user.id;
    verifiedUser = await db.user.findUnique({
      where: { id: resolvedUserId },
    });
  }

  if (!verifiedUser) {
    console.error(`[Instagram Callback] Target user ID '${resolvedUserId}' was not found in the database.`);
    return NextResponse.redirect(
      new URL("/dashboard/accounts?error=USER_NOT_FOUND", request.url)
    );
  }

  if (error || !code) {
    console.error("[Instagram Callback] OAuth callback error from Meta:", error, errorReason, errorDescription);
    const errCode = errorReason === "user_denied" ? "USER_DENIED" : (error || "NO_CODE");
    return NextResponse.redirect(
      new URL(`/dashboard/accounts?error=${encodeURIComponent(errCode)}`, request.url)
    );
  }

  // 2. Sanitize authorization code (remove `#_` hash fragment appended by Instagram)
  const sanitizedCode = code.split("#")[0].replace(/_$/, "").trim();

  const clientId = process.env.INSTAGRAM_APP_ID || "1041048208692049";
  const clientSecret = process.env.INSTAGRAM_APP_SECRET || "41fed97dd8c8940e7b929984d3f16a5f";
  const redirectUri =
    process.env.NODE_ENV === "production" || process.env.VERCEL
      ? "https://autodms-project.vercel.app/api/auth/instagram/callback"
      : "http://localhost:3000/api/auth/instagram/callback";

  try {
    // 3. Exchange authorization code for short-lived User Access Token (application/x-www-form-urlencoded)
    const formData = new URLSearchParams();
    formData.append("client_id", clientId);
    formData.append("client_secret", clientSecret);
    formData.append("grant_type", "authorization_code");
    formData.append("redirect_uri", redirectUri);
    formData.append("code", sanitizedCode);

    console.log("[Instagram Callback] Exchanging sanitized code for access token with Meta...", {
      clientId,
      redirectUri,
      codeSnippet: sanitizedCode.substring(0, 10) + "...",
    });

    const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const rawTokenText = await tokenRes.text();
    console.log(`[Instagram Callback] Meta token response [Status: ${tokenRes.status}]: ${rawTokenText}`);

    if (!tokenRes.ok) {
      console.error("[Instagram Callback] Failed to exchange code with Meta:", rawTokenText);
      return NextResponse.redirect(
        new URL("/dashboard/accounts?error=TOKEN_EXCHANGE_FAILED", request.url)
      );
    }

    let tokenData: any;
    try {
      tokenData = JSON.parse(rawTokenText);
    } catch (e) {
      console.error("[Instagram Callback] Invalid JSON from token endpoint:", rawTokenText);
      return NextResponse.redirect(
        new URL("/dashboard/accounts?error=TOKEN_EXCHANGE_FAILED", request.url)
      );
    }

    const shortLivedToken = tokenData.access_token;
    const igUserId = tokenData.user_id;

    if (!shortLivedToken) {
      console.error("[Instagram Callback] No access_token in Meta response:", tokenData);
      return NextResponse.redirect(
        new URL("/dashboard/accounts?error=TOKEN_EXCHANGE_FAILED", request.url)
      );
    }

    // 4. Exchange short-lived token for long-lived (60-day) token
    console.log("[Instagram Callback] Exchanging short-lived token for long-lived token...");
    const longLivedUrl = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${encodeURIComponent(clientSecret)}&access_token=${encodeURIComponent(shortLivedToken)}`;
    
    const longLivedRes = await fetch(longLivedUrl);
    const rawLongLivedText = await longLivedRes.text();
    console.log(`[Instagram Callback] Long-lived token response [Status: ${longLivedRes.status}]: ${rawLongLivedText}`);

    let longLivedToken = shortLivedToken;
    let expiresIn = 5184000; // 60 days fallback

    if (longLivedRes.ok) {
      try {
        const longLivedData = JSON.parse(rawLongLivedText);
        if (longLivedData.access_token) {
          longLivedToken = longLivedData.access_token;
        }
        if (typeof longLivedData.expires_in === "number") {
          expiresIn = longLivedData.expires_in;
        }
      } catch (parseErr) {
        console.warn("[Instagram Callback] Error parsing long-lived token response:", parseErr);
      }
    } else {
      console.warn("[Instagram Callback] Long-lived token exchange returned non-200, continuing with short-lived token.");
    }

    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

    // 5. Fetch Instagram profile info
    console.log("[Instagram Callback] Fetching Instagram profile info...");
    const profileUrl = `https://graph.instagram.com/v24.0/me?fields=id,username,name,account_type,profile_picture_url&access_token=${encodeURIComponent(longLivedToken)}`;
    
    const profileRes = await fetch(profileUrl);
    const rawProfileText = await profileRes.text();
    console.log(`[Instagram Callback] Profile endpoint response [Status: ${profileRes.status}]: ${rawProfileText}`);

    let instagramId = String(igUserId || "");
    let username = "instagram_user";

    if (profileRes.ok) {
      try {
        const profileData = JSON.parse(rawProfileText);
        if (profileData.id) instagramId = String(profileData.id);
        if (profileData.username || profileData.name) {
          username = profileData.username || profileData.name;
        }
      } catch (err) {
        console.warn("[Instagram Callback] Error parsing profile response:", err);
      }
    }

    if (!instagramId) {
      console.error("[Instagram Callback] Could not determine Instagram ID from profile response or user_id.");
      return NextResponse.redirect(
        new URL("/dashboard/accounts?error=NOT_BUSINESS_ACCOUNT", request.url)
      );
    }

    // 6. Register Webhook app subscriptions
    try {
      console.log("[Instagram Callback] Subscribing to Instagram Webhooks...");
      const subscribeUrl = `https://graph.instagram.com/v24.0/me/subscribed_apps?subscribed_fields=comments,messages,messaging_postbacks&access_token=${encodeURIComponent(longLivedToken)}`;
      const subscribeRes = await fetch(subscribeUrl, { method: "POST" });
      const subText = await subscribeRes.text();
      console.log("[Instagram Callback] Subscribed apps response:", subText);
    } catch (subErr) {
      console.warn("[Instagram Callback] Subscribed apps warning:", subErr);
    }

    // 7. Encrypt token and upsert IgAccount in database
    const encryptedToken = encrypt(longLivedToken);
    const pageIdValue = `ig_${instagramId}`;

    try {
      await db.igAccount.upsert({
        where: { instagramAccountId: instagramId },
        update: {
          userId: verifiedUser.id,
          pageId: pageIdValue,
          pageName: username,
          accessToken: encryptedToken,
          tokenExpiresAt: tokenExpiresAt,
        },
        create: {
          userId: verifiedUser.id,
          instagramAccountId: instagramId,
          pageId: pageIdValue,
          pageName: username,
          accessToken: encryptedToken,
          tokenExpiresAt: tokenExpiresAt,
        },
      });
      console.log(`[Instagram Callback] Successfully connected @${username} (ID: ${instagramId}) for user ${verifiedUser.id}`);
    } catch (prismaError: any) {
      console.error("[Instagram Callback] Prisma upsert error:", {
        message: prismaError.message,
        code: prismaError.code,
        meta: prismaError.meta,
      });
      return NextResponse.redirect(
        new URL(`/dashboard/accounts?error=DATABASE_ERROR&details=${encodeURIComponent(prismaError.code || "UPSERT_FAILED")}`, request.url)
      );
    }

    // 8. Revalidate dashboard routes
    revalidatePath("/dashboard/accounts");
    revalidatePath("/dashboard/automations");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/leads");
    revalidatePath("/dashboard/logs");

    return NextResponse.redirect(
      new URL("/dashboard/accounts?status=SUCCESS&count=1", request.url)
    );
  } catch (err: any) {
    console.error("[Instagram Callback] Unexpected error during OAuth callback:", err);
    return NextResponse.redirect(
      new URL("/dashboard/accounts?error=TOKEN_EXCHANGE_FAILED", request.url)
    );
  }
}
