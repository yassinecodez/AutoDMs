"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PLANS } from "@/lib/plans";
import { revalidatePath } from "next/cache";

export async function upgradePlanAction(planType: "FREE" | "PRO" | "BUSINESS") {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;
  const selectedPlan = PLANS[planType];

  if (!selectedPlan) {
    throw new Error("Invalid plan selection");
  }

  await db.user.update({
    where: { id: userId },
    data: {
      planType: planType,
      dmsLimit: selectedPlan.dmsLimit,
    }
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
}
