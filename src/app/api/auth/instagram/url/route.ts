import { NextResponse } from "next/server";

export async function GET() {
  const redirectUri = "https://autodms-project.vercel.app/api/auth/instagram/callback";
  const clientId = process.env.INSTAGRAM_APP_ID || "1041048208692049";
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments",
  });

  const url = `https://www.instagram.com/oauth/authorize?${params.toString()}`;
  return NextResponse.json({ url, redirectUri });
}
