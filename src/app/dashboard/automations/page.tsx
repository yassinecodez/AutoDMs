import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import AutomationsManager from "@/components/AutomationsManager";
import { redirect } from "next/navigation";

export default async function AutomationsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }
  const userId = session.user.id;

  // Fetch automations rules
  const automations = await db.automation.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // Fetch connected accounts
  const connectedAccounts = await db.igAccount.findMany({
    where: { userId },
    select: {
      id: true,
      instagramAccountId: true,
      pageName: true,
    },
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="space-y-0.5 pb-2 border-b border-[#27272A]">
        <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Automations</h1>
        <p className="text-xs text-zinc-400">Configure trigger keywords, direct private replies, and engagement actions</p>
      </div>

      {/* Main Content */}
      <AutomationsManager 
        initialAutomations={automations} 
        connectedAccounts={connectedAccounts} 
      />
    </div>
  );
}
