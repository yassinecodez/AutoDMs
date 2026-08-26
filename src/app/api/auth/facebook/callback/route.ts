import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { encrypt } from "@/lib/crypto";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

function extractStatePayload(stateParam: string | null): {
  userId: string | null;
  email: string | null;
  targetHandle?: string | null;
} {
  if (!stateParam) return { userId: null, email: null };
  try {
    const jsonStr = Buffer.from(stateParam, "base64url").toString("utf-8");
    const parsed = JSON.parse(jsonStr);
    return { userId: parsed.userId || null, email: parsed.email || null, targetHandle: parsed.targetHandle || null };
  } catch {
    try {
      const jsonStr = Buffer.from(stateParam, "base64").toString("utf-8");
      const parsed = JSON.parse(jsonStr);
      return { userId: parsed.userId || null, email: parsed.email || null, targetHandle: parsed.targetHandle || null };
    } catch {
      return { userId: null, email: null };
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
    return renderPopupResult("/dashboard/accounts?error=USER_NOT_FOUND", "User Not Found", true);
  }

  console.log(`[Meta Callback] Resolved database user: ID=${verifiedUser.id}, Email=${verifiedUser.email}`);

  if (error || !code) {
    console.error("[Meta Callback] OAuth callback error from Meta:", error, errorReason, errorDescription);
    const errCode = errorReason === "user_denied" ? "USER_DENIED" : (error || "NO_CODE");
    return renderPopupResult(`/dashboard/accounts?error=${encodeURIComponent(errCode)}`, "Authorization Cancelled", true);
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
      return renderPopupResult("/dashboard/accounts?error=TOKEN_EXCHANGE_FAILED", "Token Exchange Failed", true);
    }

    const tokenData = JSON.parse(rawTokenText);
    const shortLivedToken = tokenData.access_token;

    if (!shortLivedToken) {
      return renderPopupResult("/dashboard/accounts?error=NO_ACCESS_TOKEN", "No Access Token", true);
    }

    // 3. Exchange short-lived token for long-lived User Access Token (60 days)
    console.log("[Meta Callback] Exchanging for long-lived user token...");
    let longLivedUserToken = shortLivedToken;

    try {
      const longLivedUrl = `https://graph.facebook.com/${version}/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${shortLivedToken}`;
      const longLivedRes = await fetch(longLivedUrl);
      const rawLongLivedText = await longLivedRes.text();

      if (longLivedRes.ok) {
        const longLivedData = JSON.parse(rawLongLivedText);
        if (longLivedData.access_token) {
          longLivedUserToken = longLivedData.access_token;
        }
      }
    } catch (llErr) {
      console.warn("[Meta Callback] Could not upgrade to long-lived token, using short-lived token:", llErr);
    }

    // 4. Query user pages and linked Instagram accounts
    console.log("[Meta Callback] Fetching user pages and linked Instagram accounts...");
    const accountsUrl = `https://graph.facebook.com/${version}/me/accounts?fields=id,name,access_token,instagram_business_account{id,username,name,profile_picture_url}&limit=100&access_token=${encodeURIComponent(
      longLivedUserToken
    )}`;

    const accountsRes = await fetch(accountsUrl);
    const rawAccountsText = await accountsRes.text();
    console.log(`[Meta Callback] Accounts endpoint response [Status: ${accountsRes.status}]: ${rawAccountsText}`);

    let pages: any[] = [];
    if (accountsRes.ok) {
      const accountsData = JSON.parse(rawAccountsText);
      pages = accountsData.data || [];
    }

    // 4b. Auto-Page Creation Fallback if no pages exist
    if (pages.length === 0) {
      console.log("[Meta Callback] No existing Facebook Pages found. Auto-generating background Creator Page...");
      try {
        const createPageUrl = `https://graph.facebook.com/${version}/me/accounts`;
        const createRes = await fetch(createPageUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: `${verifiedUser.name || "AutoDMs"} Automation Page`,
            category_enum: "COMMUNITY",
            access_token: longLivedUserToken,
          }),
        });

        if (createRes.ok) {
          const newPageData = await createRes.json();
          if (newPageData.id && newPageData.access_token) {
            pages.push({
              id: newPageData.id,
              name: `${verifiedUser.name || "AutoDMs"} Automation Page`,
              access_token: newPageData.access_token,
            });
          }
        }
      } catch (createErr) {
        console.warn("[Meta Callback] Auto page creation attempt failed:", createErr);
      }
    }

    let accountsLinkedCount = 0;
    let primaryConnectedAccount: any = null;
    const userPlan = verifiedUser.planType || "FREE";
    const userLimit = verifiedUser.dmsLimit || (userPlan === "BUSINESS" ? 15000 : (userPlan === "PRO" ? 3000 : 150));

    // 5. Iterate through all returned pages and import linked Instagram accounts
    for (const page of pages) {
      let ig = page.instagram_business_account;

      // Fallback lookup if page doesn't directly nest ig
      if (!ig && page.id && page.access_token) {
        try {
          const pageIgUrl = `https://graph.facebook.com/${version}/${page.id}?fields=instagram_business_account{id,username,name,profile_picture_url}&access_token=${encodeURIComponent(
            page.access_token
          )}`;
          const pageIgRes = await fetch(pageIgUrl);
          if (pageIgRes.ok) {
            const pageIgData = await pageIgRes.json();
            if (pageIgData.instagram_business_account) {
              ig = pageIgData.instagram_business_account;
            }
          }
        } catch (pageIgErr) {
          console.warn(`[Meta Callback] Could not fetch IG account for page ${page.id}:`, pageIgErr);
        }
      }

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
          await fetch(subUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              subscribed_fields: "feed,messages,mention,comments",
              access_token: page.access_token,
            }),
          });
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
          savedAcc = await db.igAccount.update({
            where: { id: existing.id },
            data: {
              instagramAccountId: instagramId,
              pageId: String(page.id),
              pageName: username,
              profilePictureUrl: profilePictureUrl || existing.profilePictureUrl,
              accessToken: encryptedToken,
              tokenExpiresAt: null, // Page tokens are permanent
              planType: userPlan,
              dmsLimit: userLimit,
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
          savedAcc = await db.igAccount.create({
            data: {
              userId: verifiedUser.id,
              instagramAccountId: instagramId,
              pageId: String(page.id),
              pageName: username,
              profilePictureUrl: profilePictureUrl,
              accessToken: encryptedToken,
              tokenExpiresAt: null,
              planType: userPlan,
              dmsLimit: userLimit,
            },
          });
        }

        if (!primaryConnectedAccount) {
          primaryConnectedAccount = savedAcc;
        }

        accountsLinkedCount++;
      }
    }

    // 5b. Check Business Portfolios if no IG found directly on pages
    if (accountsLinkedCount === 0) {
      try {
        console.log("[Meta Callback] Checking user's Business Portfolios for Instagram accounts...");
        const bizUrl = `https://graph.facebook.com/${version}/me/businesses?fields=id,name,instagram_business_accounts{id,username,name,profile_picture_url}&access_token=${encodeURIComponent(
          longLivedUserToken
        )}`;
        const bizRes = await fetch(bizUrl);
        if (bizRes.ok) {
          const bizData = await bizRes.json();
          for (const b of (bizData.data || [])) {
            for (const ig of (b.instagram_business_accounts?.data || [])) {
              if (ig.id) {
                const instagramId = String(ig.id);
                const username = ig.username || ig.name;
                const profilePictureUrl = ig.profile_picture_url || null;
                const encryptedToken = encrypt(longLivedUserToken);
                const normalizedUsername = username.toLowerCase().trim();

                const existingAccounts = await db.igAccount.findMany({
                  where: {
                    userId: verifiedUser.id,
                    OR: [
                      { instagramAccountId: instagramId },
                      { pageName: { equals: normalizedUsername, mode: "insensitive" } },
                    ],
                  },
                });

                let savedAcc: any = null;
                if (existingAccounts.length > 0) {
                  savedAcc = await db.igAccount.update({
                    where: { id: existingAccounts[0].id },
                    data: {
                      instagramAccountId: instagramId,
                      pageName: username,
                      profilePictureUrl: profilePictureUrl || existingAccounts[0].profilePictureUrl,
                      accessToken: encryptedToken,
                    },
                  });
                } else {
                  savedAcc = await db.igAccount.create({
                    data: {
                      userId: verifiedUser.id,
                      instagramAccountId: instagramId,
                      pageId: `biz_${b.id}`,
                      pageName: username,
                      profilePictureUrl: profilePictureUrl,
                      accessToken: encryptedToken,
                      planType: userPlan,
                      dmsLimit: userLimit,
                    },
                  });
                }
                accountsLinkedCount++;
                if (!primaryConnectedAccount) primaryConnectedAccount = savedAcc;
              }
            }
          }
        }
      } catch (bizErr) {
        console.warn("[Meta Callback] Business portfolio lookup failed:", bizErr);
      }
    }

    // 5c. Page Fallback: If pages exist but IG isn't attached yet, link the Page
    if (accountsLinkedCount === 0 && pages.length > 0) {
      const primaryPage = pages[0];
      if (primaryPage.id && primaryPage.access_token) {
        console.log(`[Meta Callback] Using Page ${primaryPage.name} as primary connection...`);
        const encryptedToken = encrypt(primaryPage.access_token);
        const username = primaryPage.name || "Meta Connected Account";

        const savedAcc = await db.igAccount.create({
          data: {
            userId: verifiedUser.id,
            instagramAccountId: `fb_${primaryPage.id}`,
            pageId: String(primaryPage.id),
            pageName: username,
            accessToken: encryptedToken,
            planType: userPlan,
            dmsLimit: userLimit,
          },
        });
        accountsLinkedCount++;
        primaryConnectedAccount = savedAcc;
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
      return renderPopupResult(
        "/dashboard/accounts?error=NO_INSTAGRAM_BUSINESS_ACCOUNT&details=Please+ensure+your+Instagram+Professional+account+is+linked+to+your+Facebook+Page",
        "Instagram Account Not Linked to Page",
        true
      );
    }

    // 6. Revalidate dashboard routes
    revalidatePath("/dashboard/accounts");
    revalidatePath("/dashboard/automations");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/leads");
    revalidatePath("/dashboard/logs");

    const response = renderPopupResult(
      `/dashboard/accounts?status=SUCCESS&count=${accountsLinkedCount}`,
      "Instagram Profile Connected!"
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
    return renderPopupResult(
      `/dashboard/accounts?error=TOKEN_EXCHANGE_FAILED&details=${encodeURIComponent(err.message || "UNEXPECTED_ERROR")}`,
      "Connection Error",
      true
    );
  }
}
