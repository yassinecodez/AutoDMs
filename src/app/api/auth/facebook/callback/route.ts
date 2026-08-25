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
    return { userId: parsed.userId || null, email: parsed.email || null };
  } catch {
    try {
      const jsonStr = Buffer.from(stateParam, "base64").toString("utf-8");
      const parsed = JSON.parse(jsonStr);
      return { userId: parsed.userId || null, email: parsed.email || null };
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

  if (targetUserId) {
    try {
      verifiedUser = await db.user.findUnique({
        where: { id: targetUserId },
      });
    } catch (e) {
      console.warn("[Meta Callback] Error finding user by ID:", e);
    }
  }

  if (!verifiedUser && userEmail) {
    try {
      verifiedUser = await db.user.findUnique({
        where: { email: userEmail.toLowerCase().trim() },
      });
    } catch (e) {
      console.warn("[Meta Callback] Error finding user by email:", e);
    }
  }

  if (!verifiedUser && session?.user?.id) {
    try {
      verifiedUser = await db.user.findUnique({
        where: { id: session.user.id },
      });
    } catch (e) {
      console.warn("[Meta Callback] Error finding user by session ID:", e);
    }
  }

  if (!verifiedUser) {
    try {
      verifiedUser = await db.user.findFirst({
        orderBy: { createdAt: "desc" },
      });
    } catch (e) {
      console.warn("[Meta Callback] Error finding fallback user:", e);
    }
  }

  if (!verifiedUser) {
    console.error("[Meta Callback] No user record exists in the database to link.");
    return NextResponse.redirect(
      new URL("/dashboard/accounts?error=USER_NOT_FOUND", request.url)
    );
  }

  console.log(`[Meta Callback] Resolved database user: ID=${verifiedUser.id}, Email=${verifiedUser.email}`);

  if (error || !code) {
    console.error("[Meta Callback] OAuth callback error from Meta:", error, errorReason, errorDescription);
    const errCode = errorReason === "user_denied" ? "USER_DENIED" : (error || "NO_CODE");
    return NextResponse.redirect(
      new URL(`/dashboard/accounts?error=${encodeURIComponent(errCode)}`, request.url)
    );
  }

  const sanitizedCode = code.split("#")[0].replace(/_$/, "").trim();
  const clientId = process.env.META_APP_ID || "954476037671354";
  const clientSecret = process.env.META_APP_SECRET || "33f555ff97da5f3b5ba5f88c3ee40e11";
  const version = process.env.META_API_VERSION || "v24.0";
  const redirectUri =
    process.env.NODE_ENV === "production" || process.env.VERCEL
      ? "https://autodms-project.vercel.app/api/auth/facebook/callback"
      : "http://localhost:3000/api/auth/facebook/callback";

  try {
    // 2. Exchange authorization code for short-lived User Access Token
    console.log("[Meta Callback] Exchanging authorization code for user access token...");
    const tokenUrl = `https://graph.facebook.com/${version}/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&client_secret=${clientSecret}&code=${sanitizedCode}`;

    const tokenRes = await fetch(tokenUrl);
    const rawTokenText = await tokenRes.text();
    console.log(`[Meta Callback] Code exchange response [Status: ${tokenRes.status}]: ${rawTokenText}`);

    if (!tokenRes.ok) {
      console.error("[Meta Callback] Code exchange failed:", rawTokenText);
      return NextResponse.redirect(
        new URL("/dashboard/accounts?error=TOKEN_EXCHANGE_FAILED", request.url)
      );
    }

    const tokenData = JSON.parse(rawTokenText);
    const shortLivedToken = tokenData.access_token;

    if (!shortLivedToken) {
      return NextResponse.redirect(
        new URL("/dashboard/accounts?error=NO_ACCESS_TOKEN", request.url)
      );
    }

    // 3. Exchange short-lived token for long-lived User Access Token (60 days)
    console.log("[Meta Callback] Exchanging for long-lived user token...");
    let longLivedUserToken = shortLivedToken;

    try {
      const longLivedUrl = `https://graph.facebook.com/${version}/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${shortLivedToken}`;
      const longLivedRes = await fetch(longLivedUrl);
      const rawLongLivedText = await longLivedRes.text();
      console.log(`[Meta Callback] Long-lived token response [Status: ${longLivedRes.status}]: ${rawLongLivedText}`);

      if (longLivedRes.ok) {
        const longLivedData = JSON.parse(rawLongLivedText);
        if (longLivedData.access_token) {
          longLivedUserToken = longLivedData.access_token;
        }
      }
    } catch (llErr) {
      console.warn("[Meta Callback] Could not upgrade to long-lived token, using short-lived token:", llErr);
    }

    // 4. Query all user-selected pages and linked Instagram accounts
    console.log("[Meta Callback] Fetching user pages and linked Instagram Business accounts...");
    const accountsUrl = `https://graph.facebook.com/${version}/me/accounts?fields=id,name,access_token,instagram_business_account{id,username,name,profile_picture_url}&limit=100&access_token=${encodeURIComponent(
      longLivedUserToken
    )}`;

    const accountsRes = await fetch(accountsUrl);
    const rawAccountsText = await accountsRes.text();
    console.log(`[Meta Callback] Accounts endpoint response [Status: ${accountsRes.status}]: ${rawAccountsText}`);

    if (!accountsRes.ok) {
      console.error("[Meta Callback] Failed to fetch accounts:", rawAccountsText);
      return NextResponse.redirect(
        new URL("/dashboard/accounts?error=FAILED_TO_FETCH_PAGES", request.url)
      );
    }

    const accountsData = JSON.parse(rawAccountsText);
    const pages = accountsData.data || [];

    if (pages.length === 0) {
      console.warn("[Meta Callback] No Facebook Pages found for user.");
      return NextResponse.redirect(
        new URL("/dashboard/accounts?error=NO_FACEBOOK_PAGES", request.url)
      );
    }

    let accountsLinkedCount = 0;
    let primaryConnectedAccount: any = null;

    // 5. Iterate through all returned pages and import linked Instagram accounts
    for (const page of pages) {
      const ig = page.instagram_business_account;

      if (ig && ig.id) {
        const instagramId = String(ig.id);
        const username = ig.username || ig.name || page.name;
        const profilePictureUrl = ig.profile_picture_url || null;
        const encryptedToken = encrypt(page.access_token);
        const normalizedUsername = username.toLowerCase().trim();

        console.log(`[Meta Callback] Found Instagram Business Account: @${username} (ID: ${instagramId}) on Page ${page.name} (ID: ${page.id})`);

        // Subscribe Facebook Page / Instagram to Webhook Events
        try {
          console.log(`[Meta Callback] Subscribing Page ${page.id} to Webhooks...`);
          const subUrl = `https://graph.facebook.com/${version}/${page.id}/subscribed_apps`;
          const subRes = await fetch(subUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              subscribed_fields: "feed,messages,mention,comments",
              access_token: page.access_token,
            }),
          });
          const subText = await subRes.text();
          console.log(`[Meta Callback] Subscribed apps response for Page ${page.id}:`, subText);
        } catch (subErr) {
          console.warn(`[Meta Callback] Webhook subscription warning for Page ${page.id}:`, subErr);
        }

        // Strict Deduplication & Upsert into db.igAccount
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

        let savedAcc: any = null;

        if (existingAccounts.length > 0) {
          const existing = existingAccounts[0];
          console.log(`[Meta Callback] Updating existing account @${username} (ID: ${existing.id})...`);

          savedAcc = await db.igAccount.update({
            where: { id: existing.id },
            data: {
              instagramAccountId: instagramId,
              pageId: String(page.id),
              pageName: username,
              profilePictureUrl: profilePictureUrl || existing.profilePictureUrl,
              accessToken: encryptedToken,
              tokenExpiresAt: null, // Page tokens do not expire
            },
          });

          if (existingAccounts.length > 1) {
            const duplicateIds = existingAccounts.slice(1).map((a) => a.id);
            await db.automation.updateMany({
              where: { igAccountId: { in: duplicateIds } },
              data: { igAccountId: existing.id },
            });
            await db.lead.updateMany({
              where: { igAccountId: { in: duplicateIds } },
              data: { igAccountId: existing.id },
            });
            await db.igAccount.deleteMany({
              where: { id: { in: duplicateIds } },
            });
          }
        } else {
          console.log(`[Meta Callback] Creating new account @${username}...`);
          savedAcc = await db.igAccount.create({
            data: {
              userId: verifiedUser.id,
              instagramAccountId: instagramId,
              pageId: String(page.id),
              pageName: username,
              profilePictureUrl: profilePictureUrl,
              accessToken: encryptedToken,
              tokenExpiresAt: null,
            },
          });
        }

        if (!primaryConnectedAccount) {
          primaryConnectedAccount = savedAcc;
        }

        accountsLinkedCount++;
      } else {
        console.log(`[Meta Callback] Page ${page.name} (ID: ${page.id}) has no connected Instagram Business Account.`);
      }
    }

    // Clean up any legacy placeholder accounts
    await db.igAccount.deleteMany({
      where: {
        userId: verifiedUser.id,
        pageName: "Instagram Account",
      },
    });

    if (accountsLinkedCount === 0) {
      console.warn("[Meta Callback] No Instagram Business Account connected to any of the user's Facebook Pages.");
      return NextResponse.redirect(
        new URL("/dashboard/accounts?error=NO_INSTAGRAM_BUSINESS_ACCOUNT", request.url)
      );
    }

    // 6. Revalidate dashboard routes
    revalidatePath("/dashboard/accounts");
    revalidatePath("/dashboard/automations");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/leads");
    revalidatePath("/dashboard/logs");

    const response = NextResponse.redirect(
      new URL(`/dashboard/accounts?status=SUCCESS&count=${accountsLinkedCount}`, request.url)
    );

    // 7. Set newly connected account as active workspace cookie
    if (primaryConnectedAccount?.id) {
      response.cookies.set("active_ig_account_id", primaryConnectedAccount.id, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
    }

    return response;
  } catch (err: any) {
    console.error("[Meta Callback] Unexpected error during OAuth callback:", err);
    return NextResponse.redirect(
      new URL(`/dashboard/accounts?error=TOKEN_EXCHANGE_FAILED&details=${encodeURIComponent(err.message || "UNEXPECTED_ERROR")}`, request.url)
    );
  }
}
