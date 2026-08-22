import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = process.env.META_APP_ID;
  const nextauthUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const redirectUri = `${nextauthUrl}/api/auth/facebook/callback`;
  
  const scopes = [
    "instagram_basic",
    "instagram_manage_comments",
    "instagram_manage_messages",
    "pages_manage_metadata",
    "pages_read_engagement",
  ].join(",");

  const version = process.env.META_API_VERSION || "v24.0";
  const oauthUrl = `https://www.facebook.com/${version}/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(scopes)}&response_type=code`;

  return NextResponse.json({ url: oauthUrl });
}
