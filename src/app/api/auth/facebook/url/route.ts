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
      ? "https://autodms-project.vercel.app/api/auth/facebook/callback"
      : "http://localhost:3000/api/auth/facebook/callback";

  const state = Buffer.from(
    JSON.stringify({ userId, timestamp: Date.now() })
  ).toString("base64url");

  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: redirectUri,
    config_id: process.env.META_CONFIG_ID || "3012437062432078",
    response_type: "code",
    state: state,
  });

  const url = `https://www.facebook.com/v24.0/dialog/oauth?${params.toString()}`;

  return NextResponse.json({ url, redirectUri });
}
