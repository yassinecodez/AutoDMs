import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { refreshLongLivedTokenIfNeeded } from "@/lib/tokenRefresh";
import { MetaApi } from "@/lib/meta";

export async function GET(request: NextRequest) {
  try {
    const rawAccounts = await db.igAccount.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            planType: true,
            dmsCountThisMonth: true,
            dmsLimit: true,
          },
        },
      },
    });

    if (rawAccounts.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No Instagram accounts connected in database.",
        accounts: [],
        timestamp: new Date().toISOString(),
      }, { status: 404 });
    }

    const accountsReport = [];

    for (const acc of rawAccounts) {
      // 1. Proactive auto-refresh check
      await refreshLongLivedTokenIfNeeded(acc);

      // Re-fetch account in case token was refreshed
      const currentAcc = (await db.igAccount.findUnique({ where: { id: acc.id } })) || acc;

      let decryptedToken = "";
      let decryptionSuccess = false;
      let decryptionError: string | null = null;

      try {
        decryptedToken = decrypt(currentAcc.accessToken);
        decryptionSuccess = true;
      } catch (err: any) {
        decryptionError = err.message || "Failed to decrypt token";
      }

      let metaProfile = null;
      let metaProfileError: string | null = null;
      let webhookSubscribed = false;
      let webhookError: string | null = null;

      if (decryptionSuccess && decryptedToken) {
        // 2. Query Meta API to test token validity
        try {
          const profileRes = await fetch(
            `https://graph.facebook.com/v24.0/me?fields=id,name&access_token=${decryptedToken}`
          );
          const profileData = await profileRes.json();

          if (profileRes.ok && !profileData.error) {
            metaProfile = profileData;
          } else {
            // Try Instagram Graph API endpoint fallback
            const igRes = await fetch(
              `https://graph.instagram.com/v24.0/me?fields=id,username&access_token=${decryptedToken}`
            );
            const igData = await igRes.json();
            if (igRes.ok && !igData.error) {
              metaProfile = igData;
            } else {
              metaProfileError = profileData.error?.message || igData.error?.message || "Token verification failed";
            }
          }
        } catch (profErr: any) {
          metaProfileError = profErr.message || "Network error checking Meta profile";
        }

        // 3. Query Webhook Subscribed Apps
        try {
          const subRes = await fetch(
            `https://graph.facebook.com/v24.0/${currentAcc.pageId}/subscribed_apps?access_token=${decryptedToken}`
          );
          const subData = await subRes.json();

          if (subRes.ok && Array.isArray(subData.data) && subData.data.length > 0) {
            webhookSubscribed = true;
          } else {
            // Attempt auto-resubscription
            console.log(`[Diagnostic] Re-subscribing page ${currentAcc.pageId} to webhook...`);
            const reSubSuccess = await MetaApi.subscribePageToWebhook(currentAcc.pageId, decryptedToken);
            webhookSubscribed = reSubSuccess;
            if (!reSubSuccess) {
              webhookError = subData.error?.message || "Failed to subscribe page to webhook app";
            }
          }
        } catch (subErr: any) {
          webhookError = subErr.message || "Network error checking webhook subscriptions";
        }
      }

      // Calculate token expiration days
      let tokenDaysRemaining: number | null = null;
      if (currentAcc.tokenExpiresAt) {
        const diff = new Date(currentAcc.tokenExpiresAt).getTime() - Date.now();
        tokenDaysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      }

      accountsReport.push({
        id: currentAcc.id,
        pageName: currentAcc.pageName,
        pageId: currentAcc.pageId,
        instagramAccountId: currentAcc.instagramAccountId,
        user: acc.user,
        decryption: {
          success: decryptionSuccess,
          error: decryptionError,
        },
        metaConnectivity: {
          connected: !!metaProfile,
          profile: metaProfile,
          error: metaProfileError,
        },
        webhookSubscription: {
          active: webhookSubscribed,
          error: webhookError,
        },
        tokenExpiry: {
          expiresAt: currentAcc.tokenExpiresAt,
          daysRemaining: tokenDaysRemaining,
        },
      });
    }

    const totalActiveAutomations = await db.automation.count({ where: { active: true } });
    const totalLeads = await db.lead.count();

    return NextResponse.json({
      success: true,
      accounts: accountsReport,
      totalActiveAutomations,
      totalLeads,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[Diagnostic Health Check Crash]:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Diagnostic health check crashed: " + (err.message || String(err)),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
