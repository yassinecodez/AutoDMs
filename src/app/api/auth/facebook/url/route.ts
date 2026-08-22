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
  
  // Meta OAuth requires the redirect_uri to match the exact domain registered in the App Console (preview branch URLs will fail)
  const isProd = process.env.NODE_ENV === "production";
  const redirectUri = isProd 
    ? "https://autodms-project.vercel.app/api/auth/facebook/callback" 
    : `${nextauthUrl}/api/auth/facebook/callback`;
  
  const scopes = [
    "public_profile",
    "pages_show_list",
    "pages_read_engagement",
    "instagram_basic",
    "instagram_manage_comments",
    "instagram_manage_messages",
  ].join(",");

  const version = process.env.META_API_VERSION || "v24.0";
  const oauthUrl = `https://www.facebook.com/${version}/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(scopes)}&response_type=code`;

  return NextResponse.json({ url: oauthUrl });
}
