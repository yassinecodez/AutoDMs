import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const signedRequest = formData.get("signed_request") as string;

    const confirmationCode = `del_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const statusUrl = `https://autodms-project.vercel.app/data-deletion?code=${confirmationCode}`;

    // Return the exact JSON format required by Meta Data Deletion Callback
    return NextResponse.json({
      url: statusUrl,
      confirmation_code: confirmationCode,
    });
  } catch (err) {
    const fallbackCode = `del_${Date.now()}`;
    return NextResponse.json({
      url: `https://autodms-project.vercel.app/data-deletion?code=${fallbackCode}`,
      confirmation_code: fallbackCode,
    });
  }
}

export async function GET() {
  return NextResponse.redirect(new URL("/data-deletion", "https://autodms-project.vercel.app"));
}
