import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import AutomationBuilderClient from "@/components/AutomationBuilderClient";
import { getActiveAccount } from "@/lib/activeAccount";

export default async function BuilderPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId: string = session.user.id;

  const [activeAccount, connectedAccounts] = await Promise.all([
    getActiveAccount(userId),
    db.igAccount.findMany({
      where: {
        userId,
        NOT: { pageName: "Instagram Account" },
      },
      select: {
        id: true,
        instagramAccountId: true,
        pageName: true,
      },
    }),
  ]);

  return (
    <AutomationBuilderClient
      connectedAccounts={connectedAccounts}
      activeAccountId={activeAccount?.id}
    />
  );
}
