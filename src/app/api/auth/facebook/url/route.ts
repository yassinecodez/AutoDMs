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
      console.warn("[Meta Auth URL] Could not resolve user by email:", err);
    }
  }

  const redirectUri =
    process.env.NODE_ENV === "production" || process.env.VERCEL
      ? "https://autodms-project.vercel.app/api/auth/facebook/callback"
      : "http://localhost:3000/api/auth/facebook/callback";

  const clientId = process.env.META_APP_ID || "954476037671354";
  const scopes = [
    "instagram_basic",
    "instagram_manage_messages",
    "instagram_manage_comments",
    "pages_show_list",
    "pages_read_engagement",
  ].join(",");

  const statePayload = {
    userId: resolvedUserId,
    email: userEmail,
    timestamp: Date.now(),
  };

  const state = Buffer.from(JSON.stringify(statePayload)).toString("base64url");

  // Pure 1-Click Meta OAuth Dialog (No password prompt, uses active browser session)
  const url = `https://www.facebook.com/v24.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(scopes)}&response_type=code&state=${state}`;

  const acceptHeader = request.headers.get("accept") || "";
  if (acceptHeader.includes("application/json")) {
    return NextResponse.json({ url, redirectUri });
  }

  return NextResponse.redirect(url);
}
