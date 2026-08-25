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

function renderPopupResult(targetUrl: string, title = "Instagram Connected!", isError = false) {
  const html = `<!DOCTYPE html>
<html>
  <head><title>${title}</title></head>
  <body style="background:#09090b;color:#fff;font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;padding:20px;box-sizing:border-box;">
    <div style="text-align:center;max-width:360px;">
      <h3 style="font-size:16px;margin:0 0 8px 0;color:${isError ? '#ef4444' : '#10b981'};">${title}</h3>
      <p style="font-size:13px;color:#a1a1aa;margin:0;">Returning to AutoDMs...</p>
    </div>
    <script>
      setTimeout(function() {
        try {
          if (window.opener && !window.opener.closed) {
            window.opener.location.href = "${targetUrl}";
            window.close();
          } else {
            window.location.href = "${targetUrl}";
          }
        } catch(e) {
          window.location.href = "${targetUrl}";
        }
      }, 500);
    </script>
  </body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorReason = searchParams.get("error_reason");
  const errorDescription = searchParams.get("error_description");
  const stateParam = searchParams.get("state");

  // 1. User ID Resolution from Session or State
  const session = await getServerSession(authOptions);
  const statePayload = extractStatePayload(stateParam);

  let verifiedUserId: string | null = null;
  let verifiedUser: any = null;

  if (session?.user?.id) {
    try {
      verifiedUser = await db.user.findUnique({
        where: { id: session.user.id },
      });
      if (verifiedUser) verifiedUserId = verifiedUser.id;
    } catch (e) {
      console.warn("[Instagram Callback] Error resolving user from session ID:", e);
    }
  }

  if (!verifiedUser && session?.user?.email) {
    try {
      verifiedUser = await db.user.findUnique({
        where: { email: session.user.email.toLowerCase().trim() },
      });
      if (verifiedUser) verifiedUserId = verifiedUser.id;
    } catch (e) {
      console.warn("[Instagram Callback] Error resolving user from session email:", e);
    }
  }

  if (!verifiedUser && statePayload.userId) {
    try {
      verifiedUser = await db.user.findUnique({
        where: { id: statePayload.userId },
      });
      if (verifiedUser) verifiedUserId = verifiedUser.id;
    } catch (e) {
      console.warn("[Instagram Callback] Error resolving user from state userId:", e);
    }
  }

  if (!verifiedUser && statePayload.email) {
    try {
      verifiedUser = await db.user.findUnique({
        where: { email: statePayload.email.toLowerCase().trim() },
      });
      if (verifiedUser) verifiedUserId = verifiedUser.id;
    } catch (e) {
      console.warn("[Instagram Callback] Error resolving user from state email:", e);
    }
  }

  if (!verifiedUser || !verifiedUserId) {
    console.error("[Instagram Callback] User session resolution failed. Redirecting to login.");
    return renderPopupResult("/login?error=SESSION_EXPIRED", "Session Expired", true);
  }

  if (error || !code) {
    console.error("[Instagram Callback] OAuth error:", error, errorReason, errorDescription);
    const errCode = errorReason === "user_denied" ? "USER_DENIED" : (error || "NO_CODE");
    return renderPopupResult(
      `/dashboard/accounts?error=${encodeURIComponent(errCode)}&details=${encodeURIComponent(errorDescription || "User denied authorization")}`,
      "Authorization Denied",
      true
    );
  }

  const sanitizedCode = code.split("#")[0].replace(/_$/, "").trim();
  const clientId = process.env.INSTAGRAM_APP_ID || "1041048208692049";
  const clientSecret = process.env.INSTAGRAM_APP_SECRET || "41fed97dd8c8940e7b929984d3f16a5f";
  const redirectUri =
    process.env.NODE_ENV === "production" || process.env.VERCEL
      ? "https://autodms-project.vercel.app/api/auth/instagram/callback"
      : "http://localhost:3000/api/auth/instagram/callback";

  try {
    // 2. Exchange authorization code for short-lived User Access Token
    console.log("[Instagram Callback] Exchanging code for access token...");
    const tokenUrl = "https://api.instagram.com/oauth/access_token";

    const formBody = new URLSearchParams();
    formBody.append("client_id", clientId);
    formBody.append("client_secret", clientSecret);
    formBody.append("grant_type", "authorization_code");
    formBody.append("redirect_uri", redirectUri);
    formBody.append("code", sanitizedCode);

    const tokenRes = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formBody.toString(),
    });

    const rawTokenText = await tokenRes.text();
    console.log(`[Instagram Callback] Token exchange response [Status: ${tokenRes.status}]: ${rawTokenText}`);

    if (!tokenRes.ok) {
      console.error("[Instagram Callback] Code exchange failed:", rawTokenText);
      return renderPopupResult(
        `/dashboard/accounts?error=TOKEN_EXCHANGE_FAILED&details=${encodeURIComponent(rawTokenText)}`,
        "Token Exchange Failed",
        true
      );
    }

    const tokenData = JSON.parse(rawTokenText);
    const shortLivedToken = tokenData.access_token;
    const igUserId = tokenData.user_id ? String(tokenData.user_id) : undefined;

    if (!shortLivedToken) {
      return renderPopupResult("/dashboard/accounts?error=NO_ACCESS_TOKEN", "No Access Token", true);
    }

    // 3. Immediately query profile with short-lived token
    let instagramId = igUserId ? String(igUserId) : "";
    let username = "";
    let profilePictureUrl: string | null = null;

    try {
      const pUrl = `https://graph.instagram.com/me?fields=id,username,name,account_type,profile_picture_url&access_token=${encodeURIComponent(shortLivedToken)}`;
      const pRes = await fetch(pUrl);
      if (pRes.ok) {
        const pData = await pRes.json();
        if (pData.username) username = String(pData.username).trim().toLowerCase();
        if (pData.id) instagramId = String(pData.id);
        if (pData.profile_picture_url) profilePictureUrl = pData.profile_picture_url;
      }
    } catch (pErr) {
      console.warn("[Instagram Callback] Short-lived profile fetch error:", pErr);
    }

    // 4. Upgrade to long-lived token (60 days)
    console.log("[Instagram Callback] Upgrading to 60-day long-lived token...");
    let longLivedToken = shortLivedToken;
    let tokenExpiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

    try {
      const longLivedUrl = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${encodeURIComponent(clientSecret)}&access_token=${encodeURIComponent(shortLivedToken)}`;
      const longLivedRes = await fetch(longLivedUrl);
      const rawLongLivedText = await longLivedRes.text();

      if (longLivedRes.ok) {
        const longLivedData = JSON.parse(rawLongLivedText);
        if (longLivedData.access_token) {
          longLivedToken = longLivedData.access_token;
          if (longLivedData.expires_in) {
            tokenExpiresAt = new Date(Date.now() + Number(longLivedData.expires_in) * 1000);
          }
        }
      }
    } catch (llErr) {
      console.warn("[Instagram Callback] Token upgrade error:", llErr);
    }

    // 5. Query profile with long-lived token if username not yet found
    if (!username) {
      const endpointsToTry = [
        `https://graph.instagram.com/v24.0/me?fields=id,username,name,profile_picture_url&access_token=${encodeURIComponent(longLivedToken)}`,
        `https://graph.instagram.com/me?fields=id,username,name,profile_picture_url&access_token=${encodeURIComponent(longLivedToken)}`,
        `https://graph.instagram.com/${instagramId}?fields=id,username,name,profile_picture_url&access_token=${encodeURIComponent(longLivedToken)}`,
      ];

      for (const ep of endpointsToTry) {
        try {
          const res = await fetch(ep);
          if (res.ok) {
            const data = await res.json();
            if (data.username) username = String(data.username).trim().toLowerCase();
            if (data.profile_picture_url) profilePictureUrl = data.profile_picture_url;
            if (data.id) instagramId = String(data.id);
            if (username) break;
          }
        } catch (e) {
          // ignore
        }
      }
    }

    if (!instagramId) {
      instagramId = String(igUserId || `ig_${Date.now()}`);
    }

    if (!username && statePayload.targetHandle) {
      username = statePayload.targetHandle.trim().replace(/^@+/, "").toLowerCase();
    }

    if (!username) {
      username = `instagram_user_${instagramId.slice(-6)}`;
    }

    console.log(`[Instagram Callback] Dynamically saved handle: @${username} (ID: ${instagramId})`);

    // 6. Universal Database Persistence
    const encryptedToken = encrypt(longLivedToken);
    const pageIdValue = `ig_${instagramId}`;
    const normalizedUsername = username.toLowerCase().trim();
    const userPlan = verifiedUser.planType || "FREE";
    const userLimit = verifiedUser.dmsLimit || (userPlan === "BUSINESS" ? 15000 : (userPlan === "PRO" ? 3000 : 150));

    let savedAccount: any = null;
    try {
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
            planType: userPlan,
            dmsLimit: userLimit,
          },
        });

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
        savedAccount = await db.igAccount.create({
          data: {
            userId: verifiedUserId,
            instagramAccountId: instagramId,
            pageId: pageIdValue,
            pageName: username,
            profilePictureUrl: profilePictureUrl,
            accessToken: encryptedToken,
            tokenExpiresAt: tokenExpiresAt,
            planType: userPlan,
            dmsLimit: userLimit,
          },
        });
      }
    } catch (prismaError: any) {
      console.error("[Instagram Callback] Persistence error:", prismaError);
      return renderPopupResult(
        `/dashboard/accounts?error=DATABASE_ERROR&details=${encodeURIComponent(prismaError.code || "UPSERT_FAILED")}`,
        "Database Error",
        true
      );
    }

    // 7. Revalidate dashboard paths
    revalidatePath("/dashboard/accounts");
    revalidatePath("/dashboard/automations");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/leads");
    revalidatePath("/dashboard/logs");

    const response = renderPopupResult(
      "/dashboard/accounts?status=SUCCESS",
      `@${username} Connected!`
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
    console.error("[Instagram Callback] Unexpected error:", err);
    return renderPopupResult(
      `/dashboard/accounts?error=TOKEN_EXCHANGE_FAILED&details=${encodeURIComponent(err.message || "UNEXPECTED_ERROR")}`,
      "Handshake Error",
      true
    );
  }
}
