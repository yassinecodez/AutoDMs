import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MetaApi } from "@/lib/meta";
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
    console.error("Facebook OAuth callback error:", error);
    return NextResponse.redirect(
      new URL(`/dashboard/accounts?error=${encodeURIComponent(error || "NO_CODE")}`, request.url)
    );
  }

  const clientId = process.env.META_APP_ID;
  const clientSecret = process.env.META_APP_SECRET;
  
  // Must match the exact redirect_uri sent during the initial OAuth link generation
  const redirectUri = process.env.NODE_ENV === 'production' || process.env.VERCEL
    ? 'https://autodms-project.vercel.app/api/auth/facebook/callback'
    : 'http://localhost:3000/api/auth/facebook/callback';
  const version = process.env.META_API_VERSION || "v24.0";

  try {
    // 2. Exchange authorization code for short-lived User Access Token
    const exchangeUrl = `https://graph.facebook.com/${version}/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&client_secret=${clientSecret}&code=${code}`;

    const tokenRes = await fetch(exchangeUrl);
    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      console.error("[Facebook Callback] Failed to exchange code for token:", errorText);
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

    // 3. Exchange short-lived token for long-lived User Access Token
    const longLivedUserToken = await MetaApi.getLongLivedUserAccessToken(shortLivedToken);

    // 4. Retrieve Facebook Pages managed by user
    const pages = await MetaApi.getUserPages(longLivedUserToken);

    if (!pages || pages.length === 0) {
      console.warn("[Facebook Callback] No Facebook Pages found for user.");
      return NextResponse.redirect(
        new URL("/dashboard/accounts?error=NO_FACEBOOK_PAGES", request.url)
      );
    }

    let accountsLinkedCount = 0;

    // 5. Query Instagram Business Accounts connected to these Pages
    for (const page of pages) {
      const igBusinessAccount = await MetaApi.getInstagramBusinessAccount(page.id, page.access_token);

      if (igBusinessAccount) {
        // Subscribe this Page to Webhook App events
        const isSubscribed = await MetaApi.subscribePageToWebhook(page.id, page.access_token);
        console.log(`Page ${page.name} subscribed to webhook: ${isSubscribed}`);

        // Encrypt the Page Access Token
        const encryptedToken = encrypt(page.access_token);

        // Save or update account in database
        await db.igAccount.upsert({
          where: { instagramAccountId: igBusinessAccount.id },
          update: {
            pageId: page.id,
            pageName: page.name,
            accessToken: encryptedToken,
          },
          create: {
            userId: userId,
            instagramAccountId: igBusinessAccount.id,
            pageId: page.id,
            pageName: page.name,
            accessToken: encryptedToken,
          },
        });

        accountsLinkedCount++;
      } else {
        console.log(`Page ${page.name} (ID: ${page.id}) has no linked Instagram Business Account.`);
      }
    }

    if (accountsLinkedCount === 0) {
      return NextResponse.redirect(
        new URL("/dashboard/accounts?error=NO_INSTAGRAM_BUSINESS_ACCOUNT", request.url)
      );
    }

    return NextResponse.redirect(
      new URL(`/dashboard/accounts?status=SUCCESS&count=${accountsLinkedCount}`, request.url)
    );
  } catch (err: any) {
    console.error("Facebook OAuth callback processing failed:", err);
    return NextResponse.redirect(
      new URL("/dashboard/accounts?error=TOKEN_EXCHANGE_FAILED", request.url)
    );
  }
}
