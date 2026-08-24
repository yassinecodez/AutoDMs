const META_API_VERSION = process.env.META_API_VERSION || "v24.0";
const META_API_URL = `https://graph.facebook.com/${META_API_VERSION}`;
const INSTAGRAM_API_URL = `https://graph.instagram.com/${META_API_VERSION}`;

export class MetaTokenExpiredError extends Error {
  public code: number;
  constructor(message: string, code = 190) {
    super(message);
    this.name = "MetaTokenExpiredError";
    this.code = code;
  }
}

export class MetaRateLimitError extends Error {
  public code: number;
  constructor(message: string, code: number) {
    super(message);
    this.name = "MetaRateLimitError";
    this.code = code;
  }
}

export interface MetaDispatchResult {
  success: boolean;
  messageId?: string;
  commentId?: string;
  status: "SUCCESS" | "FAILED" | "SKIPPED";
  reason?: string;
  error?: string;
  errorCode?: number;
}

interface ExchangeTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  tasks: string[];
}

interface IgBusinessAccount {
  id: string;
  username?: string;
  name?: string;
}

/**
 * Validates and sanitizes a button URL. Returns null if not valid https:// or http:// link.
 */
export function sanitizeButtonUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return trimmed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Truncates and sanitizes button title to maximum 20 characters (Meta Generic Template limit)
 */
export function sanitizeButtonTitle(title: string | null | undefined): string {
  if (!title) return "";
  return title.trim().slice(0, 20);
}

/**
 * Formats a message payload, safely building Generic Template buttons or falling back to text.
 */
export function buildMessagePayload(matchedAutomation: any, resolvedUsername: string): any {
  const dmText = matchedAutomation.replyDmMessage
    ? matchedAutomation.replyDmMessage.replace(/\{\{username\}\}/g, resolvedUsername)
    : "Hello!";

  const primaryTitle = sanitizeButtonTitle(matchedAutomation.buttonTitle);
  const primaryUrl = sanitizeButtonUrl(matchedAutomation.buttonUrl);

  if (primaryTitle && primaryUrl) {
    const buttons: any[] = [
      {
        type: "web_url",
        url: primaryUrl,
        title: primaryTitle,
      }
    ];

    const secondaryTitle = sanitizeButtonTitle(matchedAutomation.secondaryButtonTitle);
    const secondaryUrl = sanitizeButtonUrl(matchedAutomation.secondaryButtonUrl);
    if (secondaryTitle && secondaryUrl) {
      buttons.push({
        type: "web_url",
        url: secondaryUrl,
        title: secondaryTitle,
      });
    }

    return {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: (matchedAutomation.name || "AutoDMs").slice(0, 80),
              subtitle: dmText.slice(0, 80),
              buttons: buttons,
            }
          ]
        }
      }
    };
  }

  // Fallback to clean plain-text message
  return { text: dmText };
}

/**
 * Helper to parse Meta Graph API errors
 */
function parseMetaError(data: any): {
  isTokenExpired: boolean;
  is24hWindow: boolean;
  isRateLimit: boolean;
  errorCode?: number;
  errorMessage: string;
} {
  const errorObj = data?.error || {};
  const code = typeof errorObj.code === "number" ? errorObj.code : undefined;
  const subcode = typeof errorObj.error_subcode === "number" ? errorObj.error_subcode : undefined;
  const rawMsg = errorObj.message || (typeof data === "string" ? data : JSON.stringify(data));
  const msgLower = String(rawMsg).toLowerCase();

  const isTokenExpired =
    code === 190 ||
    code === 10 ||
    msgLower.includes("session has expired") ||
    msgLower.includes("invalid oauth access token");

  const is24hWindow =
    code === 551 ||
    subcode === 2534037 ||
    msgLower.includes("24 hour") ||
    msgLower.includes("24-hour") ||
    msgLower.includes("not available right now") ||
    msgLower.includes("outside of the permitted window") ||
    msgLower.includes("cannot message this user");

  const isRateLimit =
    code === 4 ||
    code === 17 ||
    code === 32 ||
    code === 613 ||
    msgLower.includes("rate limit") ||
    msgLower.includes("too many calls");

  return {
    isTokenExpired,
    is24hWindow,
    isRateLimit,
    errorCode: code,
    errorMessage: rawMsg,
  };
}

export class MetaApi {
  /**
   * Exchange short-lived Facebook User Access Token for long-lived User Access Token
   */
  static async getLongLivedUserAccessToken(shortLivedToken: string): Promise<string> {
    const appId = process.env.META_APP_ID || process.env.INSTAGRAM_APP_ID;
    const appSecret = process.env.META_APP_SECRET || process.env.INSTAGRAM_APP_SECRET;

    if (!appId || !appSecret) {
      throw new Error("META_APP_ID and META_APP_SECRET must be configured");
    }

    const url = `${META_API_URL}/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;

    const res = await fetch(url);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to exchange token: ${errorText}`);
    }

    const data = (await res.json()) as ExchangeTokenResponse;
    return data.access_token;
  }

  /**
   * Fetch Pages managed by the user using the long-lived User Access Token.
   * Page tokens returned from this call are also long-lived.
   */
  static async getUserPages(longLivedUserToken: string): Promise<FacebookPage[]> {
    const url = `${META_API_URL}/me/accounts?fields=id,name,access_token,tasks&limit=100&access_token=${longLivedUserToken}`;

    const res = await fetch(url);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch pages: ${errorText}`);
    }

    const data = await res.json();
    return (data.data || []) as FacebookPage[];
  }

  /**
   * Fetch the connected Instagram Business Account ID and details for a given Facebook Page.
   */
  static async getInstagramBusinessAccount(pageId: string, pageAccessToken: string): Promise<IgBusinessAccount | null> {
    const url = `${META_API_URL}/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`;

    const res = await fetch(url);
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Failed to get Instagram Business Account for Page ${pageId}:`, errorText);
      return null;
    }

    const data = await res.json();
    if (!data.instagram_business_account) {
      return null;
    }

    const igId = data.instagram_business_account.id;

    // Fetch details like username and name for the Instagram account
    const detailUrl = `${META_API_URL}/${igId}?fields=username,name&access_token=${pageAccessToken}`;
    const detailRes = await fetch(detailUrl);
    if (detailRes.ok) {
      const detailData = await detailRes.json();
      return {
        id: igId,
        username: detailData.username,
        name: detailData.name,
      };
    }

    return { id: igId };
  }

  /**
   * Subscribe Facebook Page to the Webhook App
   */
  static async subscribePageToWebhook(pageId: string, pageAccessToken: string): Promise<boolean> {
    const url = `${META_API_URL}/${pageId}/subscribed_apps`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscribed_fields: "feed,messages,mention,comments",
        access_token: pageAccessToken,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Failed to subscribe Page ${pageId} to app:`, errorText);
      return false;
    }

    const data = await res.json();
    return data.success === true;
  }

  /**
   * Debugs and inspects access token validity, scopes, and expiration with Meta API
   */
  static async debugToken(inputToken: string, appAccessToken?: string): Promise<any> {
    const appId = process.env.META_APP_ID || process.env.INSTAGRAM_APP_ID;
    const appSecret = process.env.META_APP_SECRET || process.env.INSTAGRAM_APP_SECRET;
    const token = appAccessToken || (appId && appSecret ? `${appId}|${appSecret}` : inputToken);
    const url = `${META_API_URL}/debug_token?input_token=${inputToken}&access_token=${token}`;
    const res = await fetch(url);
    return await res.json();
  }

  /**
   * Send Private Reply (DM) to an Instagram Comment with error boundaries
   */
  static async sendPrivateReply(
    commentId: string,
    messagePayload: any,
    pageAccessToken: string
  ): Promise<MetaDispatchResult> {
    const url = `${INSTAGRAM_API_URL}/me/messages`;

    const payload = typeof messagePayload === "string" ? { text: messagePayload } : messagePayload;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${pageAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: {
            comment_id: commentId,
          },
          message: payload,
        }),
      });

      const data = await res.json();

      if (res.ok && !data.error) {
        return {
          success: true,
          status: "SUCCESS",
          messageId: data.message_id || data.id,
        };
      }

      const { isTokenExpired, is24hWindow, isRateLimit, errorCode, errorMessage } = parseMetaError(data);

      if (isTokenExpired) {
        console.error(`[Meta API Token Expired] Code ${errorCode}: ${errorMessage}`);
        return {
          success: false,
          status: "FAILED",
          reason: "META_TOKEN_EXPIRED",
          errorCode: errorCode || 190,
          error: errorMessage,
        };
      }

      if (is24hWindow) {
        console.warn(`[Meta API 24h Window] Outside 24h window for comment ${commentId}: ${errorMessage}`);
        return {
          success: false,
          status: "SKIPPED",
          reason: "USER_UNREACHABLE_24H_WINDOW",
          errorCode: errorCode || 551,
          error: errorMessage,
        };
      }

      if (isRateLimit) {
        console.warn(`[Meta API Rate Limit] Code ${errorCode}: ${errorMessage}`);
        return {
          success: false,
          status: "FAILED",
          reason: "META_RATE_LIMIT",
          errorCode,
          error: errorMessage,
        };
      }

      return {
        success: false,
        status: "FAILED",
        errorCode,
        error: errorMessage,
      };
    } catch (e: any) {
      return {
        success: false,
        status: "FAILED",
        error: e.message || "Unknown network error during private reply dispatch",
      };
    }
  }

  /**
   * Send Direct Message to an Instagram Recipient ID with error boundaries
   */
  static async sendDirectMessage(
    recipientId: string,
    messagePayload: any,
    pageAccessToken: string
  ): Promise<MetaDispatchResult> {
    const url = `${INSTAGRAM_API_URL}/me/messages`;

    const payload = typeof messagePayload === "string" ? { text: messagePayload } : messagePayload;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${pageAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: {
            id: recipientId,
          },
          message: payload,
        }),
      });

      const data = await res.json();

      if (res.ok && !data.error) {
        return {
          success: true,
          status: "SUCCESS",
          messageId: data.message_id || data.id,
        };
      }

      const { isTokenExpired, is24hWindow, isRateLimit, errorCode, errorMessage } = parseMetaError(data);

      if (isTokenExpired) {
        console.error(`[Meta API Token Expired] Code ${errorCode}: ${errorMessage}`);
        return {
          success: false,
          status: "FAILED",
          reason: "META_TOKEN_EXPIRED",
          errorCode: errorCode || 190,
          error: errorMessage,
        };
      }

      if (is24hWindow) {
        console.warn(`[Meta API 24h Window] Outside 24h window for user ${recipientId}: ${errorMessage}`);
        return {
          success: false,
          status: "SKIPPED",
          reason: "USER_UNREACHABLE_24H_WINDOW",
          errorCode: errorCode || 551,
          error: errorMessage,
        };
      }

      if (isRateLimit) {
        console.warn(`[Meta API Rate Limit] Code ${errorCode}: ${errorMessage}`);
        return {
          success: false,
          status: "FAILED",
          reason: "META_RATE_LIMIT",
          errorCode,
          error: errorMessage,
        };
      }

      return {
        success: false,
        status: "FAILED",
        errorCode,
        error: errorMessage,
      };
    } catch (e: any) {
      return {
        success: false,
        status: "FAILED",
        error: e.message || "Unknown network error during direct message dispatch",
      };
    }
  }

  /**
   * Post a public reply comment to an Instagram comment with error boundaries
   */
  static async sendPublicCommentReply(
    commentId: string,
    replyText: string,
    pageAccessToken: string
  ): Promise<MetaDispatchResult> {
    const url = `${INSTAGRAM_API_URL}/${commentId}/replies`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${pageAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: replyText,
        }),
      });

      const data = await res.json();

      if (res.ok && !data.error) {
        return {
          success: true,
          status: "SUCCESS",
          commentId: data.id,
        };
      }

      const { isTokenExpired, isRateLimit, errorCode, errorMessage } = parseMetaError(data);

      if (isTokenExpired) {
        console.error(`[Meta API Token Expired] Code ${errorCode}: ${errorMessage}`);
        return {
          success: false,
          status: "FAILED",
          reason: "META_TOKEN_EXPIRED",
          errorCode: errorCode || 190,
          error: errorMessage,
        };
      }

      if (isRateLimit) {
        console.warn(`[Meta API Rate Limit] Code ${errorCode}: ${errorMessage}`);
        return {
          success: false,
          status: "FAILED",
          reason: "META_RATE_LIMIT",
          errorCode,
          error: errorMessage,
        };
      }

      return {
        success: false,
        status: "FAILED",
        errorCode,
        error: errorMessage,
      };
    } catch (e: any) {
      return {
        success: false,
        status: "FAILED",
        error: e.message || "Unknown error during public comment reply",
      };
    }
  }
}
