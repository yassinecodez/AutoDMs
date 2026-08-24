import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // 1. Fetch connected Instagram account for this user
    const igAccount = await db.igAccount.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!igAccount) {
      return NextResponse.json({
        media: [],
        message: "No connected Instagram account found.",
      });
    }

    // 2. Decrypt token
    const decryptedToken = decrypt(igAccount.accessToken);
    const igAccountId = igAccount.instagramAccountId;

    // 3. Query Meta Graph API (or Instagram Graph API fallback)
    const fields = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count";
    let mediaUrl = `https://graph.facebook.com/v24.0/${igAccountId}/media?fields=${fields}&limit=30&access_token=${decryptedToken}`;

    let res = await fetch(mediaUrl);
    let data = await res.json();

    // Fallback to Instagram Graph endpoint if Facebook node call fails
    if (!res.ok || data.error) {
      console.warn("[Instagram Media API] Facebook endpoint fallback to Instagram node:", data.error?.message);
      mediaUrl = `https://graph.instagram.com/v24.0/me/media?fields=${fields}&limit=30&access_token=${decryptedToken}`;
      res = await fetch(mediaUrl);
      data = await res.json();
    }

    if (!res.ok || data.error) {
      console.error("[Instagram Media API] Meta API Error:", data.error);
      return NextResponse.json({
        media: [],
        error: data.error?.message || "Failed to fetch Instagram media from Meta API.",
      }, { status: res.status >= 400 ? res.status : 500 });
    }

    const rawList = Array.isArray(data.data) ? data.data : [];

    // Format list into clean typed items
    const formattedMedia = rawList.map((item: any) => ({
      id: item.id,
      caption: item.caption || "",
      thumbnail: item.thumbnail_url || item.media_url || "",
      mediaUrl: item.media_url || item.thumbnail_url || "",
      permalink: item.permalink || "",
      type: item.media_type || "IMAGE",
      likeCount: item.like_count ?? 0,
      commentCount: item.comments_count ?? 0,
      timestamp: item.timestamp || new Date().toISOString(),
    }));

    return NextResponse.json({
      media: formattedMedia,
      account: {
        id: igAccount.id,
        pageName: igAccount.pageName,
        instagramAccountId: igAccount.instagramAccountId,
      },
    });
  } catch (err: any) {
    console.error("[Instagram Media API] Server Error:", err);
    return NextResponse.json(
      { media: [], error: err.message || "Failed to retrieve media items" },
      { status: 500 }
    );
  }
}
