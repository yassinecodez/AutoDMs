"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ACTIVE_ACCOUNT_COOKIE } from "@/lib/activeAccount";

export async function switchActiveAccountAction(accountId: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_ACCOUNT_COOKIE, accountId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/automations");
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/logs");
  revalidatePath("/dashboard/accounts");
  return { success: true };
}
