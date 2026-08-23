"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createAutomation(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  const userId = session.user.id;

  const name = formData.get("name") as string;
  const triggerType = formData.get("triggerType") as string;
  const triggerKeyword = formData.get("triggerKeyword") as string;
  const replyDmMessage = formData.get("replyDmMessage") as string;
  const replyCommentRaw = formData.get("replyCommentOptions") as string;
  const triggerScope = (formData.get("triggerScope") as string) || "ALL_POSTS";
  const targetMediaIdsRaw = formData.get("targetMediaIds") as string;
  const triggerSource = (formData.get("triggerSource") as string) || "COMMENTS";
  const enableLeadCapture = formData.get("enableLeadCapture") === "true";
  const leadConfirmationDm = formData.get("leadConfirmationDm") as string;

  if (!name || !triggerType || !replyDmMessage) {
    throw new Error("Please fill in all required fields.");
  }

  // Parse public comment options by line
  const replyCommentOptions = replyCommentRaw
    ? replyCommentRaw
        .split("\n")
        .map((opt) => opt.trim())
        .filter((opt) => opt.length > 0)
    : [];

  const targetMediaIds = targetMediaIdsRaw
    ? targetMediaIdsRaw
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id.length > 0)
    : [];

  await db.automation.create({
    data: {
      userId,
      name,
      triggerType,
      triggerKeyword: triggerType === "ALL" ? null : triggerKeyword,
      replyDmMessage,
      replyCommentOptions,
      triggerScope,
      targetMediaIds,
      triggerSource,
      enableLeadCapture,
      leadConfirmationDm: enableLeadCapture ? leadConfirmationDm : null,
      active: true,
    },
  });

  revalidatePath("/dashboard/automations");
  revalidatePath("/dashboard");
}

export async function toggleAutomationActive(id: string, active: boolean) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await db.automation.update({
    where: {
      id,
      userId: session.user.id,
    },
    data: { active },
  });

  revalidatePath("/dashboard/automations");
}

export async function deleteAutomation(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await db.automation.delete({
    where: {
      id,
      userId: session.user.id,
    },
  });

  revalidatePath("/dashboard/automations");
  revalidatePath("/dashboard");
}
