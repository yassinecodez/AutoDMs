"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { encrypt } from "@/lib/crypto";

export async function disconnectAccount(accountId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Deletes only if it belongs to the authenticated user
  await db.igAccount.delete({
    where: {
      id: accountId,
      userId: session.user.id,
    },
  });

  revalidatePath("/dashboard/accounts");
  revalidatePath("/dashboard");
}

export async function manualConnectAccount(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  const userId = session.user.id;

  const pageId = (formData.get("pageId") as string)?.trim();
  const instagramId = (formData.get("instagramId") as string)?.trim();
  const username = (formData.get("username") as string)?.trim();
  const accessToken = (formData.get("accessToken") as string)?.trim();

  if (!pageId || !instagramId || !username || !accessToken) {
    throw new Error("All fields are required.");
  }

  const encryptedToken = encrypt(accessToken);

  await db.igAccount.upsert({
    where: { instagramAccountId: instagramId },
    update: {
      pageId,
      pageName: username,
      accessToken: encryptedToken,
    },
    create: {
      userId,
      instagramAccountId: instagramId,
      pageId,
      pageName: username,
      accessToken: encryptedToken,
    },
  });

  revalidatePath("/dashboard/accounts");
  revalidatePath("/dashboard");
}

import { refreshLongLivedToken } from "@/lib/tokenRefresh";

export async function manualRefreshTokenAction(instagramAccountId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const result = await refreshLongLivedToken(instagramAccountId);
  if (!result.success) {
    throw new Error(result.error || "Failed to refresh token.");
  }

  revalidatePath("/dashboard/accounts");
  return { success: true };
}
