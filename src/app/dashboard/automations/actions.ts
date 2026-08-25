"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getActiveAccount } from "@/lib/activeAccount";

export async function createAutomation(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  const userId = session.user.id;
  const activeAccount = await getActiveAccount(userId);

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
  const formIgAccountId = formData.get("igAccountId") as string;
  const igAccountId = formIgAccountId || activeAccount?.id || null;

  const buttonTitle = formData.get("buttonTitle") as string;
  const buttonUrl = formData.get("buttonUrl") as string;
  const secondaryButtonTitle = formData.get("secondaryButtonTitle") as string;
  const secondaryButtonUrl = formData.get("secondaryButtonUrl") as string;

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
      igAccountId,
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
      buttonTitle: buttonTitle || null,
      buttonUrl: buttonUrl || null,
      secondaryButtonTitle: secondaryButtonTitle || null,
      secondaryButtonUrl: secondaryButtonUrl || null,
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
