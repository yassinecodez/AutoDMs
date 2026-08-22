"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
