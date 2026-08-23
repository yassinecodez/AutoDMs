import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import AutomationBuilderClient from "@/components/AutomationBuilderClient";

export default async function BuilderPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }
  const userId = session.user.id;

  const connectedAccounts = await db.igAccount.findMany({
    where: { userId },
    select: {
      id: true,
      instagramAccountId: true,
      pageName: true,
    },
  });

  return (
    <AutomationBuilderClient connectedAccounts={connectedAccounts} />
  );
}
