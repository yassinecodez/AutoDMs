import { db } from "@/lib/db";
import { decrypt, encrypt } from "@/lib/crypto";

/**
 * Manually refreshes a long-lived Instagram Page token with Meta API
 */
export async function refreshLongLivedToken(instagramAccountId: string) {
  try {
    const igAccount = await db.igAccount.findFirst({
      where: {
        OR: [
          { instagramAccountId: String(instagramAccountId) },
          { pageId: String(instagramAccountId) }
        ]
      }
    });

    if (!igAccount) {
      throw new Error(`Account with ID ${instagramAccountId} not found in database.`);
    }

    const decryptedToken = decrypt(igAccount.accessToken);
    const refreshUrl = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${decryptedToken}`;

    console.log(`[Token Refresh] Refreshing token for Instagram Account ${igAccount.pageName}...`);
    const res = await fetch(refreshUrl);
    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(data.error?.message || JSON.stringify(data) || "Failed to refresh token with Meta API");
    }

    const newAccessToken = data.access_token;
    const expiresIn = data.expires_in || 5184000; // Default to 60 days
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);
    const encryptedToken = encrypt(newAccessToken);

    await db.igAccount.update({
      where: { id: igAccount.id },
      data: {
        accessToken: encryptedToken,
        tokenExpiresAt,
      },
    });

    console.log(`[Token Refresh] Token refreshed successfully for @${igAccount.pageName}. Expires at: ${tokenExpiresAt}`);
    return { success: true, tokenExpiresAt };
  } catch (err: any) {
    console.error(`[Token Refresh Failed] for ${instagramAccountId}:`, err);
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Automatically triggers token refresh if expiry date is null or within 20 days
 */
export async function refreshLongLivedTokenIfNeeded(igAccount: {
  instagramAccountId: string;
  tokenExpiresAt: Date | null;
}) {
  const now = new Date();
  const thresholdDays = 20;
  const thresholdMs = thresholdDays * 24 * 60 * 60 * 1000;

  let shouldRefresh = false;

  if (!igAccount.tokenExpiresAt) {
    shouldRefresh = true;
  } else {
    const timeUntilExpiry = new Date(igAccount.tokenExpiresAt).getTime() - now.getTime();
    if (timeUntilExpiry < thresholdMs) {
      shouldRefresh = true;
    }
  }

  if (shouldRefresh) {
    console.log(`[Token Auto-Refresh] Token for ${igAccount.instagramAccountId} is expiring within ${thresholdDays} days or null. refreshing...`);
    return await refreshLongLivedToken(igAccount.instagramAccountId);
  }

  return { success: true, skipped: true };
}
