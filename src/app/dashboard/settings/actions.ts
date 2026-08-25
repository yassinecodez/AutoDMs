"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { PLANS } from "@/lib/plans";

export async function upgradePlanAction(plan: "FREE" | "PRO" | "BUSINESS") {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const selectedPlan = PLANS[plan] || PLANS.FREE;

  await db.user.update({
    where: { id: session.user.id },
    data: {
      planType: plan,
      dmsLimit: selectedPlan.dmsLimit,
    },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateProfileName(name: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Name cannot be empty.");
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { name: trimmed },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function submitFeedbackAction(message: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const trimmed = message.trim();
  if (!trimmed) {
    throw new Error("Message cannot be empty.");
  }

  console.log(`[AutoDMs User Feedback] User ${session.user.email} (${session.user.id}): "${trimmed}"`);

  return { success: true };
}
