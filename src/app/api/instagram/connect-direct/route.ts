import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { encrypt } from "@/lib/crypto";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const rawHandle = body.handle || "";
    const cleanHandle = rawHandle.trim().replace(/^@+/, "").toLowerCase();

    if (!cleanHandle || cleanHandle.length < 2) {
      return NextResponse.json({ error: "Invalid Instagram handle" }, { status: 400 });
    }

    // Resolve Database User
    let verifiedUser = null;
    if (session?.user?.id) {
      verifiedUser = await db.user.findUnique({ where: { id: session.user.id } });
    }
    if (!verifiedUser && session?.user?.email) {
      verifiedUser = await db.user.findUnique({
        where: { email: session.user.email.toLowerCase().trim() },
      });
    }

    if (!verifiedUser) {
      return NextResponse.json({ error: "User record not found" }, { status: 404 });
    }

    // Check account limit
    const existingAccountsCount = await db.igAccount.count({
      where: { userId: verifiedUser.id },
    });

    const maxAllowed = verifiedUser.agencyMaxAccounts || 1;
    const existingSame = await db.igAccount.findFirst({
      where: {
        userId: verifiedUser.id,
        pageName: { equals: cleanHandle, mode: "insensitive" },
      },
    });

    if (existingAccountsCount >= maxAllowed && !existingSame) {
      return NextResponse.json(
        { error: `Account limit reached (${maxAllowed}). Please upgrade your plan to connect more profiles.` },
        { status: 403 }
      );
    }

    // Attempt to fetch public avatar or fallback
    let profilePictureUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanHandle)}&background=7c3aed&color=fff&size=200&bold=true`;
    let instagramId = `ig_${cleanHandle}_${Date.now()}`;

    try {
      const publicLookupRes = await fetch(`https://www.instagram.com/${cleanHandle}/?__a=1&__d=dis`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });
      if (publicLookupRes.ok) {
        const publicData = await publicLookupRes.json();
        const userObj = publicData?.graphql?.user || publicData?.data?.user;
        if (userObj?.profile_pic_url_hd || userObj?.profile_pic_url) {
          profilePictureUrl = userObj.profile_pic_url_hd || userObj.profile_pic_url;
        }
        if (userObj?.id) {
          instagramId = String(userObj.id);
        }
      }
    } catch (lookupErr) {
      console.warn("[Direct Connect] Public lookup skipped:", lookupErr);
    }

    const defaultToken = encrypt(`token_${cleanHandle}_${Date.now()}`);
    const userPlan = verifiedUser.planType || "FREE";
    const userLimit = verifiedUser.dmsLimit || (userPlan === "BUSINESS" ? 15000 : (userPlan === "PRO" ? 3000 : 150));

    let savedAccount;
    if (existingSame) {
      savedAccount = await db.igAccount.update({
        where: { id: existingSame.id },
        data: {
          pageName: cleanHandle,
          profilePictureUrl: profilePictureUrl,
          planType: userPlan,
          dmsLimit: userLimit,
        },
      });
    } else {
      savedAccount = await db.igAccount.create({
        data: {
          userId: verifiedUser.id,
          instagramAccountId: instagramId,
          pageId: `page_${cleanHandle}_${Date.now()}`,
          pageName: cleanHandle,
          profilePictureUrl: profilePictureUrl,
          accessToken: defaultToken,
          planType: userPlan,
          dmsLimit: userLimit,
        },
      });
    }

    revalidatePath("/dashboard/accounts");
    revalidatePath("/dashboard/automations");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/leads");
    revalidatePath("/dashboard/logs");

    const response = NextResponse.json({
      success: true,
      account: {
        id: savedAccount.id,
        handle: `@${cleanHandle}`,
        name: cleanHandle,
        profilePictureUrl: savedAccount.profilePictureUrl,
      },
    });

    // Set active workspace cookie
    response.cookies.set("active_ig_account_id", savedAccount.id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (err: any) {
    console.error("[Direct Connect] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to connect Instagram account" }, { status: 500 });
  }
}
