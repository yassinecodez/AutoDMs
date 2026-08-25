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
    const fields = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count";

    // 3. Query all available Instagram & Meta media endpoints
    const endpointsToTry = [
      `https://graph.instagram.com/v24.0/me/media?fields=${fields}&limit=30&access_token=${decryptedToken}`,
      `https://graph.instagram.com/me/media?fields=${fields}&limit=30&access_token=${decryptedToken}`,
      `https://graph.facebook.com/v24.0/${igAccountId}/media?fields=${fields}&limit=30&access_token=${decryptedToken}`,
      `https://graph.facebook.com/v24.0/me/media?fields=${fields}&limit=30&access_token=${decryptedToken}`,
    ];

    let rawList: any[] = [];
    let lastError: any = null;

    for (const url of endpointsToTry) {
      try {
        const res = await fetch(url);
        const data = await res.json();
        if (res.ok && Array.isArray(data.data) && data.data.length > 0) {
          rawList = data.data;
          break;
        } else if (data.error) {
          lastError = data.error;
        }
      } catch (fetchErr) {
        lastError = fetchErr;
      }
    }

    if (rawList.length === 0 && lastError) {
      console.warn("[Instagram Media API] Notice from API:", lastError);
    }

    // Format list into clean typed items
    const formattedMedia = rawList.map((item: any) => ({
      id: item.id,
      caption: item.caption || `Post from @${igAccount.pageName}`,
      thumbnail: item.thumbnail_url || item.media_url || "",
      mediaUrl: item.media_url || item.thumbnail_url || "",
      permalink: item.permalink || `https://www.instagram.com/${igAccount.pageName}/`,
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
        profilePictureUrl: igAccount.profilePictureUrl,
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
