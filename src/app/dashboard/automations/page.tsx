import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import AutomationsManager from "@/components/AutomationsManager";

export default async function AutomationsPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user!.id!;

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
    <div className="p-6 md:p-8 space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Automations Manager</h1>
        <p className="text-slate-400 text-sm">Configure real-time trigger keywords, automated private replies, and algorithms boosters</p>
      </div>

      {/* Main Content */}
      <AutomationsManager 
        initialAutomations={automations} 
        connectedAccounts={connectedAccounts} 
      />
    </div>
  );
}
