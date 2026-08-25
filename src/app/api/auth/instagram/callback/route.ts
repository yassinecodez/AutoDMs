import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { encrypt } from "@/lib/crypto";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

function extractStatePayload(stateParam: string | null): {
  userId: string | null;
  email: string | null;
} {
  if (!stateParam) return { userId: null, email: null };
  try {
    const jsonStr = Buffer.from(stateParam, "base64url").toString("utf-8");
    const parsed = JSON.parse(jsonStr);
    return {
      userId: parsed.userId || null,
      email: parsed.email || null,
    };
  } catch {
    try {
      const jsonStr = Buffer.from(stateParam, "base64").toString("utf-8");
      const parsed = JSON.parse(jsonStr);
      return {
        userId: parsed.userId || null,
        email: parsed.email || null,
      };
    } catch {
      return { userId: null, email: null };
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

  // 1. Resolve and verify User ID from State, Email, or Session
  const session = await getServerSession(authOptions);
  const statePayload = extractStatePayload(stateParam);
  const targetUserId = statePayload.userId || session?.user?.id;
  const userEmail = statePayload.email || session?.user?.email;

  let verifiedUser = null;

  // Try finding by target ID
  if (targetUserId) {
    try {
      verifiedUser = await db.user.findUnique({
        where: { id: targetUserId },
      });
    } catch (e) {
      console.warn("[Instagram Callback] Error finding user by ID:", e);
    }
  }

  // Try finding by Email
  if (!verifiedUser && userEmail) {
    try {
      verifiedUser = await db.user.findUnique({
        where: { email: userEmail.toLowerCase().trim() },
      });
    } catch (e) {
      console.warn("[Instagram Callback] Error finding user by email:", e);
    }
  }

  // Try finding by session user ID
  if (!verifiedUser && session?.user?.id) {
    try {
      verifiedUser = await db.user.findUnique({
        where: { id: session.user.id },
      });
    } catch (e) {
      console.warn("[Instagram Callback] Error finding user by session ID:", e);
    }
  }

  // Fallback: Use the most active / recent registered user
  if (!verifiedUser) {
    try {
      verifiedUser = await db.user.findFirst({
        orderBy: { createdAt: "desc" },
      });
    } catch (e) {
      console.warn("[Instagram Callback] Error finding fallback user:", e);
    }
  }

  if (!verifiedUser) {
    console.error("[Instagram Callback] No user record exists in the database to link with Instagram.");
    return NextResponse.redirect(
      new URL("/dashboard/accounts?error=USER_NOT_FOUND", request.url)
    );
  }

  console.log(`[Instagram Callback] Resolved database user: ID=${verifiedUser.id}, Email=${verifiedUser.email}`);

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
    // 3. Exchange authorization code for short-lived User Access Token
    const formData = new URLSearchParams();
    formData.append("client_id", clientId);
    formData.append("client_secret", clientSecret);
    formData.append("grant_type", "authorization_code");
    formData.append("redirect_uri", redirectUri);
    formData.append("code", sanitizedCode);

    console.log("[Instagram Callback] Exchanging code for access token with Meta...", {
      clientId,
      redirectUri,
      codeSnippet: sanitizedCode.substring(0, 10) + "...",
    });

    let tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    let rawTokenText = await tokenRes.text();
    console.log(`[Instagram Callback] Meta token response [Status: ${tokenRes.status}]: ${rawTokenText}`);

    let usedSecret = clientSecret;

    // Retry with META_APP_SECRET if first attempt failed with secret validation error
    if (!tokenRes.ok && process.env.META_APP_SECRET && process.env.META_APP_SECRET !== clientSecret) {
      console.log("[Instagram Callback] Retrying token exchange with alternative secret (META_APP_SECRET)...");
      const fallbackFormData = new URLSearchParams();
      fallbackFormData.append("client_id", clientId);
      fallbackFormData.append("client_secret", process.env.META_APP_SECRET);
      fallbackFormData.append("grant_type", "authorization_code");
      fallbackFormData.append("redirect_uri", redirectUri);
      fallbackFormData.append("code", sanitizedCode);

      const retryRes = await fetch("https://api.instagram.com/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: fallbackFormData.toString(),
      });

      const retryText = await retryRes.text();
      console.log(`[Instagram Callback] Retry token response [Status: ${retryRes.status}]: ${retryText}`);
      if (retryRes.ok) {
        tokenRes = retryRes;
        rawTokenText = retryText;
        usedSecret = process.env.META_APP_SECRET;
      }
    }

    if (!tokenRes.ok) {
      console.error("[Meta Token Exchange Error]", {
        status: tokenRes.status,
        response: rawTokenText,
      });
      let errMsg = "EXCHANGE_FAILED";
      try {
        const errObj = JSON.parse(rawTokenText);
        errMsg = errObj.error_message || errObj.message || errObj.error_type || "EXCHANGE_FAILED";
      } catch {}
      return NextResponse.redirect(
        new URL(`/dashboard/accounts?error=TOKEN_EXCHANGE_FAILED&details=${encodeURIComponent(errMsg)}`, request.url)
      );
    }

    let tokenData: any;
    try {
      tokenData = JSON.parse(rawTokenText);
    } catch (e) {
      console.error("[Instagram Callback] Invalid JSON from token endpoint:", rawTokenText);
      return NextResponse.redirect(
        new URL("/dashboard/accounts?error=TOKEN_EXCHANGE_FAILED&details=INVALID_JSON", request.url)
      );
    }

    const shortLivedToken = tokenData.access_token;
    const igUserId = tokenData.user_id;

    if (!shortLivedToken) {
      console.error("[Instagram Callback] No access_token in Meta response:", tokenData);
      return NextResponse.redirect(
        new URL("/dashboard/accounts?error=TOKEN_EXCHANGE_FAILED&details=NO_ACCESS_TOKEN", request.url)
      );
    }

    // 4. Exchange short-lived token for long-lived (60-day) token
    console.log("[Instagram Callback] Exchanging short-lived token for long-lived token...");
    let longLivedToken = shortLivedToken;
    let expiresIn = 5184000; // 60 days fallback

    try {
      const longLivedUrl = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${encodeURIComponent(usedSecret)}&access_token=${encodeURIComponent(shortLivedToken)}`;
      const longLivedRes = await fetch(longLivedUrl);
      const rawLongLivedText = await longLivedRes.text();
      console.log(`[Instagram Callback] Long-lived token response [Status: ${longLivedRes.status}]: ${rawLongLivedText}`);

      if (longLivedRes.ok) {
        const longLivedData = JSON.parse(rawLongLivedText);
        if (longLivedData.access_token) {
          longLivedToken = longLivedData.access_token;
        }
        if (typeof longLivedData.expires_in === "number") {
          expiresIn = longLivedData.expires_in;
        }
      }
    } catch (longLivedErr) {
      console.warn("[Instagram Callback] Error requesting long-lived token, continuing with short-lived token:", longLivedErr);
    }

    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

    // 5. Fetch Instagram profile info dynamically from Meta API
    console.log("[Instagram Callback] Fetching Instagram profile info...");
    let instagramId = String(igUserId || "");
    let username = "";
    let profilePictureUrl: string | null = null;

    try {
      const profileUrl = `https://graph.instagram.com/v24.0/me?fields=id,username,name,profile_picture_url&access_token=${encodeURIComponent(longLivedToken)}`;
      const profileRes = await fetch(profileUrl);
      const rawProfileText = await profileRes.text();
      console.log(`[Instagram Callback] Profile endpoint response [Status: ${profileRes.status}]: ${rawProfileText}`);

      if (profileRes.ok) {
        const profileData = JSON.parse(rawProfileText);
        console.log("[Meta /me Raw Profile]:", JSON.stringify(profileData));
        if (profileData.id) instagramId = String(profileData.id);
        if (profileData.username) username = profileData.username;
        else if (profileData.name) username = profileData.name;
        else if (profileData.id) username = profileData.id;
        if (profileData.profile_picture_url) profilePictureUrl = profileData.profile_picture_url;
      } else {
        const fallbackUrl = `https://graph.instagram.com/me?fields=id,username,name,profile_picture_url&access_token=${encodeURIComponent(longLivedToken)}`;
        const fallbackRes = await fetch(fallbackUrl);
        const fallbackText = await fallbackRes.text();
        console.log(`[Instagram Callback] Profile fallback response [Status: ${fallbackRes.status}]: ${fallbackText}`);
        if (fallbackRes.ok) {
          const fallbackData = JSON.parse(fallbackText);
          console.log("[Meta /me Raw Profile Fallback]:", JSON.stringify(fallbackData));
          if (fallbackData.id) instagramId = String(fallbackData.id);
          if (fallbackData.username) username = fallbackData.username;
          else if (fallbackData.name) username = fallbackData.name;
          else if (fallbackData.id) username = fallbackData.id;
          if (fallbackData.profile_picture_url) profilePictureUrl = fallbackData.profile_picture_url;
        }
      }
    } catch (profileErr) {
      console.warn("[Instagram Callback] Error fetching profile details, using user_id from token:", profileErr);
    }

    if (!instagramId) {
      instagramId = String(igUserId || `ig_${Date.now()}`);
    }

    if (!username) {
      username = `ig_${instagramId}`;
    }

    console.log(`[Instagram Callback] Resolved authenticated handle: @${username} (ID: ${instagramId})`);

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

    // 7. Strict Account Deduplication and Persistence Logic
    const encryptedToken = encrypt(longLivedToken);
    const pageIdValue = `ig_${instagramId}`;
    const normalizedUsername = username.toLowerCase().trim();

    let savedAccount: any = null;
    try {
      // Find ANY existing account for this user matching instagramAccountId OR pageName (case-insensitive)
      const existingAccounts = await db.igAccount.findMany({
        where: {
          userId: verifiedUser.id,
          OR: [
            { instagramAccountId: instagramId },
            { pageName: { equals: normalizedUsername, mode: "insensitive" } },
            { pageName: { equals: username } },
          ],
        },
        orderBy: { createdAt: "asc" },
      });

      if (existingAccounts.length > 0) {
        const primary = existingAccounts[0];
        console.log(`[Instagram Callback] Existing account matched for @${username} (ID: ${primary.id}). Updating in place...`);

        savedAccount = await db.igAccount.update({
          where: { id: primary.id },
          data: {
            instagramAccountId: instagramId,
            pageId: pageIdValue,
            pageName: username,
            profilePictureUrl: profilePictureUrl || primary.profilePictureUrl,
            accessToken: encryptedToken,
            tokenExpiresAt: tokenExpiresAt,
          },
        });

        // If there were extra duplicate records, merge & clean them up
        if (existingAccounts.length > 1) {
          const duplicateIds = existingAccounts.slice(1).map((a) => a.id);
          console.log(`[Instagram Callback] Merging duplicate account IDs:`, duplicateIds);

          await db.automation.updateMany({
            where: { igAccountId: { in: duplicateIds } },
            data: { igAccountId: primary.id },
          });

          await db.lead.updateMany({
            where: { igAccountId: { in: duplicateIds } },
            data: { igAccountId: primary.id },
          });

          await db.igAccount.deleteMany({
            where: { id: { in: duplicateIds } },
          });
        }
      } else {
        console.log(`[Instagram Callback] No existing account found for @${username}. Creating new record...`);
        savedAccount = await db.igAccount.create({
          data: {
            userId: verifiedUser.id,
            instagramAccountId: instagramId,
            pageId: pageIdValue,
            pageName: username,
            profilePictureUrl: profilePictureUrl,
            accessToken: encryptedToken,
            tokenExpiresAt: tokenExpiresAt,
          },
        });
      }

      // Delete any leftover placeholder accounts
      await db.igAccount.deleteMany({
        where: {
          userId: verifiedUser.id,
          pageName: "Instagram Account",
        },
      });

      console.log(`[Instagram Callback] Successfully saved @${username} (Account ID: ${savedAccount.id}) for user ${verifiedUser.id}`);
    } catch (prismaError: any) {
      console.error("[Instagram Callback] Prisma persistence error:", {
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

    const response = NextResponse.redirect(
      new URL("/dashboard/accounts?status=SUCCESS", request.url)
    );

    if (savedAccount?.id) {
      response.cookies.set("active_ig_account_id", savedAccount.id, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
    }

    return response;
  } catch (err: any) {
    console.error("[Instagram Callback] Unexpected error during OAuth callback:", err);
    return NextResponse.redirect(
      new URL(`/dashboard/accounts?error=TOKEN_EXCHANGE_FAILED&details=${encodeURIComponent(err.message || "UNEXPECTED_ERROR")}`, request.url)
    );
  }
}
