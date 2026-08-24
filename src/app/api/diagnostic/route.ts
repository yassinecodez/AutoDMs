import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { inspectAndRefreshAccountToken } from "@/lib/tokenRefresh";
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
      // 1. Deep token inspection via Meta debug_token
      const debugResult = await inspectAndRefreshAccountToken(acc.instagramAccountId);

      // Re-fetch account to get updated tokenExpiresAt timestamp
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

      // Determine Token Status
      let tokenStatus: "HEALTHY" | "EXPIRED" | "MISSING_SCOPES" = "HEALTHY";
      if (!debugResult.isValid) {
        tokenStatus = "EXPIRED";
      } else if (debugResult.missingScopes.length > 0) {
        tokenStatus = "MISSING_SCOPES";
      }

      // Check Webhook Subscribed Apps
      let webhookSubscribed = false;
      let webhookError: string | null = null;

      if (decryptionSuccess && decryptedToken) {
        try {
          const targetId = currentAcc.pageId || currentAcc.instagramAccountId;
          const subRes = await fetch(
            `https://graph.facebook.com/v24.0/${targetId}/subscribed_apps?access_token=${decryptedToken}`
          );
          const subData = await subRes.json();

          if (subRes.ok && Array.isArray(subData.data) && subData.data.length > 0) {
            webhookSubscribed = true;
          } else {
            // Attempt auto-resubscription
            console.log(`[Diagnostic] Re-subscribing page ${targetId} to webhook...`);
            const reSubSuccess = await MetaApi.subscribePageToWebhook(targetId, decryptedToken);
            webhookSubscribed = reSubSuccess;
            if (!reSubSuccess) {
              webhookError = subData.error?.message || "Failed to subscribe page to webhook app";
            }
          }
        } catch (subErr: any) {
          webhookError = subErr.message || "Network error checking webhook subscriptions";
        }
      }

      // Format expiresAt display string
      const expiresAtDisplay = debugResult.isPermanent
        ? "Never (Permanent Page Token)"
        : debugResult.expiresAt
        ? debugResult.expiresAt.toISOString()
        : "Unknown / Expired";

      accountsReport.push({
        id: currentAcc.id,
        handle: `@${currentAcc.pageName}`,
        pageName: currentAcc.pageName,
        pageId: currentAcc.pageId,
        instagramAccountId: currentAcc.instagramAccountId,
        user: acc.user,
        tokenStatus,
        isPermanent: debugResult.isPermanent,
        expiresAt: expiresAtDisplay,
        verifiedScopes: debugResult.scopes,
        missingScopes: debugResult.missingScopes,
        tokenDebug: {
          isValid: debugResult.isValid,
          tokenType: debugResult.type || "UNKNOWN",
          error: debugResult.error || null,
        },
        decryption: {
          success: decryptionSuccess,
          error: decryptionError,
        },
        webhookSubscription: {
          active: webhookSubscribed,
          error: webhookError,
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
