import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { IgAccount } from "@prisma/client";

export const ACTIVE_ACCOUNT_COOKIE = "active_ig_account_id";

/**
 * Retrieves the currently active Instagram workspace account for the user.
 * Looks up the active_ig_account_id cookie, falls back to the user's first connected account.
 */
export async function getActiveAccount(userId: string): Promise<IgAccount | null> {
  const cookieStore = await cookies();
  const activeAccountId = cookieStore.get(ACTIVE_ACCOUNT_COOKIE)?.value;

  const accounts = await getAllUserAccounts(userId);

  if (accounts.length === 0) {
    return null;
  }

  let selected: IgAccount | null = null;
  if (activeAccountId) {
    selected = accounts.find((acc) => acc.id === activeAccountId) || null;
  }

  if (!selected) {
    selected = accounts[0];
  }

  // Monthly reset check for the workspace
  if (selected) {
    const now = new Date();
    const lastReset = selected.usageResetAt ? new Date(selected.usageResetAt) : new Date(0);
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    if (now.getTime() - lastReset.getTime() >= thirtyDaysInMs) {
      try {
        selected = await db.igAccount.update({
          where: { id: selected.id },
          data: {
            dmsCountThisMonth: 0,
            usageResetAt: now,
          },
        });
      } catch (err) {
        console.warn("[activeAccount] Error updating workspace usage reset:", err);
      }
    }
  }

  return selected;
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
