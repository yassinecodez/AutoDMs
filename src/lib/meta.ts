const META_API_VERSION = process.env.META_API_VERSION || "v24.0";
const META_API_URL = `https://graph.facebook.com/${META_API_VERSION}`;

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

export class MetaApi {
  /**
   * Exchange short-lived Facebook User Access Token for long-lived User Access Token
   */
  static async getLongLivedUserAccessToken(shortLivedToken: string): Promise<string> {
    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;

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
   * Send Private Reply (DM) to an Instagram Comment
   */
  static async sendPrivateReply(commentId: string, messageText: string, pageAccessToken: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const url = `${META_API_URL}/me/messages?access_token=${pageAccessToken}`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: {
            comment_id: commentId,
          },
          message: {
            text: messageText,
          },
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        return { success: false, error: errorText };
      }

      const data = await res.json();
      return { success: true, messageId: data.message_id };
    } catch (e: any) {
      return { success: false, error: e.message || "Unknown error during DM dispatch" };
    }
  }

  /**
   * Post a public reply comment to an Instagram comment
   */
  static async sendPublicCommentReply(commentId: string, replyText: string, pageAccessToken: string): Promise<{ success: boolean; commentId?: string; error?: string }> {
    const url = `${META_API_URL}/${commentId}/replies?access_token=${pageAccessToken}`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: replyText,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        return { success: false, error: errorText };
      }

      const data = await res.json();
      return { success: true, commentId: data.id };
    } catch (e: any) {
      return { success: false, error: e.message || "Unknown error during public comment reply" };
    }
  }
}
