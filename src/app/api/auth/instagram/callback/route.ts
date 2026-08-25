import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log("[Instagram Callback] Legacy endpoint called, redirecting to Meta Business Login...");
  const { searchParams } = new URL(request.url);
  const targetHandle = searchParams.get("targetHandle") || searchParams.get("handle") || undefined;
  
  const targetUrl = targetHandle
    ? `/api/auth/facebook/url?targetHandle=${encodeURIComponent(targetHandle)}`
    : "/api/auth/facebook/url";

  return NextResponse.redirect(new URL(targetUrl, request.url));
}
