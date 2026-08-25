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

  const { searchParams } = new URL(request.url);
  const targetHandle = searchParams.get("targetHandle") || searchParams.get("handle") || undefined;
  const cleanTargetHandle = targetHandle ? targetHandle.trim().replace(/^@+/, "").toLowerCase() : undefined;

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
    targetHandle: cleanTargetHandle,
    timestamp: Date.now(),
  };

  const state = Buffer.from(JSON.stringify(statePayload)).toString("base64url");

  // Meta Business Login for Instagram (Using business.facebook.com endpoint)
  const params = new URLSearchParams({
    client_id: clientId,
    config_id: configId,
    redirect_uri: redirectUri,
    response_type: "code",
    extras: JSON.stringify({ setup: { channel: "IG_API_ONBOARDING" } }),
    state: state,
  });

  const url = `https://business.facebook.com/v24.0/dialog/oauth?${params.toString()}`;

  const acceptHeader = request.headers.get("accept") || "";
  if (acceptHeader.includes("application/json")) {
    return NextResponse.json({ url, redirectUri, targetHandle: cleanTargetHandle });
  }

  return NextResponse.redirect(url);
}
