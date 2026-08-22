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
    // Fetch the connected Instagram account for this user
    const igAccount = await db.igAccount.findFirst({
      where: { userId },
    });

    if (!igAccount) {
      return NextResponse.json({ media: [] });
    }

    // Decrypt the token
    const decryptedToken = decrypt(igAccount.accessToken);

    // Call Instagram Graph API to retrieve recent media
    const mediaUrl = `https://graph.instagram.com/v24.0/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=${decryptedToken}`;
    
    const res = await fetch(mediaUrl);
    if (!res.ok) {
      const errorText = await res.text();
      console.error("[Instagram Media API] Failed to fetch media from Meta:", errorText);
      return NextResponse.json({ error: "Failed to fetch media from Meta" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ media: data.data || [] });
  } catch (err: any) {
    console.error("[Instagram Media API] Internal Server Error:", err);
    return NextResponse.json({ error: err.message || "Failed to retrieve media items" }, { status: 500 });
  }
}
