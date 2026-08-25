import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { encrypt } from "@/lib/crypto";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

function extractStatePayload(stateParam: string | null): {
  userId: string | null;
  email: string | null;
  targetHandle: string | null;
} {
  if (!stateParam) return { userId: null, email: null, targetHandle: null };
  try {
    const jsonStr = Buffer.from(stateParam, "base64url").toString("utf-8");
    const parsed = JSON.parse(jsonStr);
    return {
      userId: parsed.userId || null,
      email: parsed.email || null,
      targetHandle: parsed.targetHandle || null,
    };
  } catch {
    try {
      const jsonStr = Buffer.from(stateParam, "base64").toString("utf-8");
      const parsed = JSON.parse(jsonStr);
      return {
        userId: parsed.userId || null,
        email: parsed.email || null,
        targetHandle: parsed.targetHandle || null,
      };
    } catch {
      return { userId: null, email: null, targetHandle: null };
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

  // 1. Exact User ID Resolution from Session or State
  const session = await getServerSession(authOptions);
  const statePayload = extractStatePayload(stateParam);

  let verifiedUserId: string | null = null;
  let verifiedUser: any = null;

  // First priority: active authenticated session
  if (session?.user?.id) {
    try {
      verifiedUser = await db.user.findUnique({
        where: { id: session.user.id },
      });
      if (verifiedUser) verifiedUserId = verifiedUser.id;
    } catch (e) {
      console.warn("[Instagram Callback] Error checking session.user.id:", e);
    }
  }

  if (!verifiedUser && session?.user?.email) {
    try {
      verifiedUser = await db.user.findUnique({
        where: { email: session.user.email.toLowerCase().trim() },
      });
      if (verifiedUser) verifiedUserId = verifiedUser.id;
    } catch (e) {
      console.warn("[Instagram Callback] Error checking session.user.email:", e);
    }
  }

  // Second priority: state parameter payload
  if (!verifiedUser && statePayload.userId) {
    try {
      verifiedUser = await db.user.findUnique({
        where: { id: statePayload.userId },
      });
      if (verifiedUser) verifiedUserId = verifiedUser.id;
    } catch (e) {
      console.warn("[Instagram Callback] Error checking statePayload.userId:", e);
    }
  }

  if (!verifiedUser && statePayload.email) {
    try {
      verifiedUser = await db.user.findUnique({
        where: { email: statePayload.email.toLowerCase().trim() },
      });
      if (verifiedUser) verifiedUserId = verifiedUser.id;
    } catch (e) {
      console.warn("[Instagram Callback] Error checking statePayload.email:", e);
    }
  }

  if (!verifiedUser || !verifiedUserId) {
    console.error("[Instagram Callback] No authenticated user found in session or state payload.");
    return NextResponse.redirect(
      new URL("/dashboard/accounts?error=USER_NOT_FOUND", request.url)
    );
  }

  console.log(`[Instagram Callback] Bound to verified database user: ID=${verifiedUserId}, Email=${verifiedUser.email}`);

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

    // 5. Fetch Instagram profile info dynamically
    console.log("[Instagram Callback] Fetching Instagram profile info...");
    let instagramId = String(igUserId || "");
    let username = "";
    let profilePictureUrl: string | null = null;

    try {
      // 1. Try me endpoint without version prefix
      const profileUrl = `https://graph.instagram.com/me?fields=id,username,account_type,name,profile_picture_url&access_token=${encodeURIComponent(longLivedToken)}`;
      const profileRes = await fetch(profileUrl);
      const rawProfileText = await profileRes.text();
      console.log(`[Instagram Callback] Profile endpoint response [Status: ${profileRes.status}]: ${rawProfileText}`);

      if (profileRes.ok) {
        const profileData = JSON.parse(rawProfileText);
        console.log("[Meta /me Raw Profile]:", JSON.stringify(profileData));
        if (profileData.id) instagramId = String(profileData.id);
        if (profileData.username) username = String(profileData.username).trim();
        else if (profileData.name) username = String(profileData.name).trim();
        if (profileData.profile_picture_url) profilePictureUrl = profileData.profile_picture_url;
      }

      // 2. Fallback: Try v24.0 me endpoint
      if (!username) {
        const v24Url = `https://graph.instagram.com/v24.0/me?fields=id,username,name,profile_picture_url&access_token=${encodeURIComponent(longLivedToken)}`;
        const v24Res = await fetch(v24Url);
        const rawV24Text = await v24Res.text();
        console.log(`[Instagram Callback] v24 me endpoint response: ${rawV24Text}`);
        if (v24Res.ok) {
          const v24Data = JSON.parse(rawV24Text);
          if (v24Data.id) instagramId = String(v24Data.id);
          if (v24Data.username) username = String(v24Data.username).trim();
          else if (v24Data.name) username = String(v24Data.name).trim();
          if (v24Data.profile_picture_url) profilePictureUrl = v24Data.profile_picture_url;
        }
      }

      // 3. Fallback: Query by user ID endpoint
      if (!username && (instagramId || igUserId)) {
        const targetId = instagramId || String(igUserId);
        const idUrl = `https://graph.instagram.com/${targetId}?fields=id,username,account_type,name,profile_picture_url&access_token=${encodeURIComponent(longLivedToken)}`;
        const idRes = await fetch(idUrl);
        const rawIdText = await idRes.text();
        console.log(`[Instagram Callback] ID profile response [Status: ${idRes.status}]: ${rawIdText}`);
        if (idRes.ok) {
          const idData = JSON.parse(rawIdText);
          console.log("[Meta ID Raw Profile]:", JSON.stringify(idData));
          if (idData.username) username = String(idData.username).trim();
          else if (idData.name) username = String(idData.name).trim();
          if (idData.profile_picture_url) profilePictureUrl = idData.profile_picture_url;
        }
      }
    } catch (profileErr) {
      console.warn("[Instagram Callback] Error fetching profile details:", profileErr);
    }

    if (!instagramId) {
      instagramId = String(igUserId || `ig_${Date.now()}`);
    }

    // If username is still not returned by Meta API, use targetHandle from state, or verified user's name
    if (!username) {
      if (statePayload.targetHandle) {
        username = statePayload.targetHandle.trim();
      } else if (verifiedUser.name && !verifiedUser.name.includes("@")) {
        username = verifiedUser.name.trim();
      } else {
        username = `ig_${instagramId}`;
      }
    }

    console.log(`[Instagram Callback] Resolved authenticated handle: @${username} (ID: ${instagramId}) for user ${verifiedUserId}`);

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

    // 7. Strict Account Persistence Logic (Bound directly to verifiedUserId)
    const encryptedToken = encrypt(longLivedToken);
    const pageIdValue = `ig_${instagramId}`;
    const normalizedUsername = username.toLowerCase().trim();

    let savedAccount: any = null;
    try {
      // Find existing account for this user matching instagramAccountId OR pageName (case-insensitive)
      const existingAccounts = await db.igAccount.findMany({
        where: {
          userId: verifiedUserId,
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
        console.log(`[Instagram Callback] Updating account @${username} (ID: ${primary.id}) for user ${verifiedUserId}...`);

        savedAccount = await db.igAccount.update({
          where: { id: primary.id },
          data: {
            userId: verifiedUserId,
            instagramAccountId: instagramId,
            pageId: pageIdValue,
            pageName: username,
            profilePictureUrl: profilePictureUrl || primary.profilePictureUrl,
            accessToken: encryptedToken,
            tokenExpiresAt: tokenExpiresAt,
          },
        });

        // Merge any duplicate records
        if (existingAccounts.length > 1) {
          const duplicateIds = existingAccounts.slice(1).map((a) => a.id);
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
        // Also check if this instagramAccountId is currently bound to another user/record in DB
        const existingWithSameId = await db.igAccount.findUnique({
          where: { instagramAccountId: instagramId },
        });

        if (existingWithSameId) {
          console.log(`[Instagram Callback] Reassigning existing account @${username} (ID: ${existingWithSameId.id}) to active user ${verifiedUserId}...`);
          savedAccount = await db.igAccount.update({
            where: { id: existingWithSameId.id },
            data: {
              userId: verifiedUserId,
              pageId: pageIdValue,
              pageName: username,
              profilePictureUrl: profilePictureUrl || existingWithSameId.profilePictureUrl,
              accessToken: encryptedToken,
              tokenExpiresAt: tokenExpiresAt,
            },
          });
        } else {
          console.log(`[Instagram Callback] Creating new account record @${username} for user ${verifiedUserId}...`);
          savedAccount = await db.igAccount.create({
            data: {
              userId: verifiedUserId,
              instagramAccountId: instagramId,
              pageId: pageIdValue,
              pageName: username,
              profilePictureUrl: profilePictureUrl,
              accessToken: encryptedToken,
              tokenExpiresAt: tokenExpiresAt,
            },
          });
        }
      }

      console.log("[Account Saved in DB]:", savedAccount.id, savedAccount.pageName, savedAccount.userId);
    } catch (prismaError: any) {
      console.error("[Instagram Callback] Prisma persistence error:", prismaError);
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
