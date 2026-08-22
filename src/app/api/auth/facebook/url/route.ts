import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const redirectUri = process.env.NODE_ENV === 'production' || process.env.VERCEL ? 'https://autodms-project.vercel.app/api/auth/facebook/callback' : 'http://localhost:3000/api/auth/facebook/callback';
  
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: redirectUri,
    scope: 'public_profile,pages_show_list,pages_read_engagement,instagram_basic,instagram_manage_comments,instagram_manage_messages',
    response_type: 'code',
    auth_type: 'rerequest',
    display: 'popup'
  });

  const url = `https://www.facebook.com/v24.0/dialog/oauth?${params.toString()}`;

  return NextResponse.json({ url, redirectUri });
}
