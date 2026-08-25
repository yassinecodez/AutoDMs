import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import AutomationsManager from "@/components/AutomationsManager";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getActiveAccount } from "@/lib/activeAccount";

export const dynamic = "force-dynamic";

export default async function AutomationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId: string = session.user.id;
  const activeAccount = await getActiveAccount(userId);

  const [automations, connectedAccounts] = await Promise.all([
    db.automation.findMany({
      where: {
        userId,
        ...(activeAccount
          ? {
              OR: [
                { igAccountId: activeAccount.id },
                { igAccountId: null },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { logs: true, leads: true },
        },
      },
    }),
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
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Top Bar Layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#222222]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Automations</h1>
            {activeAccount && (
              <span className="text-xs font-medium text-zinc-400 bg-[#141414] border border-[#262626] px-2 py-0.5 rounded-md">
                @{activeAccount.pageName}
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-400">
            Manage your active trigger rules and auto-DM campaigns for this workspace
          </p>
        </div>

        <Link
          href="/dashboard/automations/builder"
          className="bg-white hover:bg-zinc-200 text-black font-medium rounded-lg h-9 px-4 text-sm inline-flex items-center gap-2 transition-colors shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          New automation
        </Link>
      </div>

      {/* Main Manager Client Component */}
      <AutomationsManager
        initialAutomations={automations}
        connectedAccounts={connectedAccounts}
      />
    </div>
  );
}
