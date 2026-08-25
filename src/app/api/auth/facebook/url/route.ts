import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    const acceptHeader = request.headers.get("accept") || "";
    if (acceptHeader.includes("application/json")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  let resolvedUserId = session.user.id;
  const userEmail = session.user.email;

  if (userEmail) {
    try {
      const dbUser = await db.user.findUnique({
        where: { email: userEmail.toLowerCase().trim() },
        select: { id: true },
      });
      if (dbUser) {
        resolvedUserId = dbUser.id;
      }
    } catch (err) {
      console.warn("[Meta Business URL] Could not resolve user by email:", err);
    }
  }

  const redirectUri =
    process.env.NODE_ENV === "production" || process.env.VERCEL
      ? "https://autodms-project.vercel.app/api/auth/facebook/callback"
      : "http://localhost:3000/api/auth/facebook/callback";

  const clientId = process.env.META_APP_ID || "954476037671354";
  const configId = process.env.META_CONFIG_ID || "3012437062432078";

  const statePayload = {
    userId: resolvedUserId,
    email: userEmail,
    timestamp: Date.now(),
  };

  const state = Buffer.from(JSON.stringify(statePayload)).toString("base64url");

  // Exact 1-Click Meta Business SSO Dialog (Matching ManyChat)
  const dialogParams = new URLSearchParams({
    client_id: clientId,
    config_id: configId,
    response_type: "code",
    override_default_response_type: "true",
    redirect_uri: redirectUri,
    state: state,
  });

  const dialogUrl = `https://business.facebook.com/dialog/oauth?${dialogParams.toString()}`;
  const url = `https://business.facebook.com/business/loginpage/?next=${encodeURIComponent(dialogUrl)}`;

  const acceptHeader = request.headers.get("accept") || "";
  if (acceptHeader.includes("application/json")) {
    return NextResponse.json({ url, redirectUri });
  }

  return NextResponse.redirect(url);
}
