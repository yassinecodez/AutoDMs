import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { MetaApi } from "@/lib/meta";

export interface TokenDebugResult {
  isValid: boolean;
  type?: string;
  isPermanent: boolean;
  expiresAt: Date | null;
  scopes: string[];
  missingScopes: string[];
  error?: string;
}

const REQUIRED_SCOPES = [
  "instagram_basic",
  "instagram_manage_messages",
  "instagram_manage_comments",
  "pages_show_list",
];

export async function inspectAndRefreshAccountToken(instagramAccountId: string): Promise<TokenDebugResult> {
  try {
    const igAccount = await db.igAccount.findFirst({
      where: {
        OR: [
          { instagramAccountId: String(instagramAccountId) },
          { pageId: String(instagramAccountId) },
        ],
      },
    });

    if (!igAccount) {
      throw new Error(`Account ${instagramAccountId} not found in database.`);
    }

    const decryptedToken = decrypt(igAccount.accessToken);
    const debugData = await MetaApi.debugToken(decryptedToken);

    if (!debugData?.data) {
      throw new Error(debugData?.error?.message || "Failed to inspect token with Meta API");
    }

    const info = debugData.data;
    const isValid = Boolean(info.is_valid);
    const scopes: string[] = info.scopes || [];
    const missingScopes = REQUIRED_SCOPES.filter((s) => !scopes.includes(s));
    const isPermanent = info.type === "PAGE" || info.expires_at === 0;

    let expiresAt: Date | null = null;
    if (!isPermanent && info.expires_at && info.expires_at > 0) {
      expiresAt = new Date(info.expires_at * 1000);
    }

    // Update database record with fresh expiration details
    await db.igAccount.update({
      where: { id: igAccount.id },
      data: {
        tokenExpiresAt: expiresAt,
      },
    });

    return {
      isValid,
      type: info.type,
      isPermanent,
      expiresAt,
      scopes,
      missingScopes,
    };
  } catch (err: any) {
    console.error(`[Token Inspection Error] for ${instagramAccountId}:`, err);
    return {
      isValid: false,
      isPermanent: false,
      expiresAt: null,
      scopes: [],
      missingScopes: REQUIRED_SCOPES,
      error: err.message || String(err),
    };
  }
}

/**
 * Manually inspects and updates token expiration with Meta debug_token
 */
export async function refreshLongLivedToken(instagramAccountId: string) {
  const result = await inspectAndRefreshAccountToken(instagramAccountId);
  return {
    success: result.isValid,
    tokenExpiresAt: result.expiresAt,
    error: result.error,
  };
}

/**
 * Backwards compatibility helper for automated routines
 */
export async function refreshLongLivedTokenIfNeeded(igAccount: {
  instagramAccountId: string;
  tokenExpiresAt?: Date | null;
}) {
  return await inspectAndRefreshAccountToken(igAccount.instagramAccountId);
}
