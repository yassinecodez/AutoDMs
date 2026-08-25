import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { IgAccount } from "@prisma/client";

export const ACTIVE_ACCOUNT_COOKIE = "active_ig_account_id";

/**
 * Retrieves the currently active Instagram account for the user.
 * Looks up the active_ig_account_id cookie, falls back to the user's first connected account.
 */
export async function getActiveAccount(userId: string): Promise<IgAccount | null> {
  const cookieStore = await cookies();
  const activeAccountId = cookieStore.get(ACTIVE_ACCOUNT_COOKIE)?.value;

  const accounts = await getAllUserAccounts(userId);

  if (accounts.length === 0) {
    return null;
  }

  if (activeAccountId) {
    const matched = accounts.find((acc) => acc.id === activeAccountId);
    if (matched) return matched;
  }

  return accounts[0];
}

/**
 * Retrieves all valid connected Instagram accounts for the user.
 */
export async function getAllUserAccounts(userId: string): Promise<IgAccount[]> {
  const rawAccounts = await db.igAccount.findMany({
    where: {
      userId,
    },
    orderBy: { createdAt: "desc" },
  });

  return rawAccounts.filter(
    (acc, index, self) =>
      index === self.findIndex((t) => t.pageName?.toLowerCase() === acc.pageName?.toLowerCase())
  );
}
