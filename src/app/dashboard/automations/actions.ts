"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getActiveAccount } from "@/lib/activeAccount";

export interface CreateAutomationInput {
  name: string;
  triggerType: string;
  triggerKeyword?: string | null;
  replyDmMessage: string;
  replyCommentOptions?: string[];
  triggerScope?: string;
  targetMediaIds?: string[];
  triggerSource?: string;
  enableLeadCapture?: boolean;
  leadConfirmationDm?: string | null;
  igAccountId?: string | null;
  requireFollow?: boolean;
  followPromptMessage?: string | null;
  buttonTitle?: string | null;
  buttonUrl?: string | null;
  secondaryButtonTitle?: string | null;
  secondaryButtonUrl?: string | null;
}

export async function createAutomation(input: FormData | CreateAutomationInput) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  const userId = session.user.id;
  const activeAccount = await getActiveAccount(userId);

  let name: string;
  let triggerType: string;
  let triggerKeyword: string | null = null;
  let replyDmMessage: string;
  let replyCommentOptions: string[] = [];
  let triggerScope: string = "ALL_POSTS";
  let targetMediaIds: string[] = [];
  let triggerSource: string = "COMMENTS";
  let enableLeadCapture: boolean = false;
  let leadConfirmationDm: string | null = null;
  let igAccountId: string | null = null;
  let requireFollow: boolean = false;
  let followPromptMessage: string | null = null;
  let buttonTitle: string | null = null;
  let buttonUrl: string | null = null;
  let secondaryButtonTitle: string | null = null;
  let secondaryButtonUrl: string | null = null;

  if (input instanceof FormData) {
    name = input.get("name") as string;
    triggerType = input.get("triggerType") as string;
    triggerKeyword = input.get("triggerKeyword") as string;
    replyDmMessage = input.get("replyDmMessage") as string;
    const replyCommentRaw = input.get("replyCommentOptions") as string;
    triggerScope = (input.get("triggerScope") as string) || "ALL_POSTS";
    const targetMediaIdsRaw = input.get("targetMediaIds") as string;
    triggerSource = (input.get("triggerSource") as string) || "COMMENTS";
    enableLeadCapture = input.get("enableLeadCapture") === "true";
    leadConfirmationDm = input.get("leadConfirmationDm") as string;
    const formIgAccountId = input.get("igAccountId") as string;
    igAccountId = formIgAccountId || activeAccount?.id || null;
    requireFollow = input.get("requireFollow") === "true";
    followPromptMessage = input.get("followPromptMessage") as string;
    buttonTitle = input.get("buttonTitle") as string;
    buttonUrl = input.get("buttonUrl") as string;
    secondaryButtonTitle = input.get("secondaryButtonTitle") as string;
    secondaryButtonUrl = input.get("secondaryButtonUrl") as string;

    replyCommentOptions = replyCommentRaw
      ? replyCommentRaw
          .split("\n")
          .map((opt) => opt.trim())
          .filter((opt) => opt.length > 0)
      : [];

    targetMediaIds = targetMediaIdsRaw
      ? targetMediaIdsRaw
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id.length > 0)
      : [];
  } else {
    name = input.name;
    triggerType = input.triggerType;
    triggerKeyword = input.triggerKeyword || null;
    replyDmMessage = input.replyDmMessage;
    replyCommentOptions = input.replyCommentOptions || [];
    triggerScope = input.triggerScope || "ALL_POSTS";
    targetMediaIds = input.targetMediaIds || [];
    triggerSource = input.triggerSource || "COMMENTS";
    enableLeadCapture = Boolean(input.enableLeadCapture);
    leadConfirmationDm = input.leadConfirmationDm || null;
    igAccountId = input.igAccountId || activeAccount?.id || null;
    requireFollow = Boolean(input.requireFollow);
    followPromptMessage = input.followPromptMessage || null;
    buttonTitle = input.buttonTitle || null;
    buttonUrl = input.buttonUrl || null;
    secondaryButtonTitle = input.secondaryButtonTitle || null;
    secondaryButtonUrl = input.secondaryButtonUrl || null;
  }

  if (!name || !triggerType || !replyDmMessage) {
    throw new Error("Please fill in all required fields.");
  }

  if (!igAccountId && activeAccount?.id) {
    igAccountId = activeAccount.id;
  }

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
      requireFollow,
      followPromptMessage: requireFollow ? followPromptMessage : null,
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
  revalidatePath("/dashboard");
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
