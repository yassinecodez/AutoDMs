import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const redirectUri =
    process.env.NODE_ENV === "production" || process.env.VERCEL
      ? "https://autodms-project.vercel.app/api/auth/instagram/callback"
      : "http://localhost:3000/api/auth/instagram/callback";
  const clientId = process.env.INSTAGRAM_APP_ID || process.env.META_APP_ID || "954476037671354";

  const state = Buffer.from(
    JSON.stringify({ userId, timestamp: Date.now() })
  ).toString("base64url");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments",
    state: state,
  });

  const url = `https://www.instagram.com/oauth/authorize?${params.toString()}`;
  return NextResponse.json({ url, redirectUri });
}
