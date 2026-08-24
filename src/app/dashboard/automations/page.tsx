import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import AutomationsManager from "@/components/AutomationsManager";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AutomationsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }
  const userId = session.user.id;

  const [automations, connectedAccounts] = await Promise.all([
    db.automation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { logs: true, leads: true },
        },
      },
    }),
    db.igAccount.findMany({
      where: { userId },
      select: {
        id: true,
        instagramAccountId: true,
        pageName: true,
      },
    }),
  ]);

  return (
    <div className="p-6 md:p-10 space-y-6 max-w-6xl mx-auto">
      {/* Top Bar Layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#222222]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Automations</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            Manage your active trigger rules and auto-DM campaigns
          </p>
        </div>

        <Link
          href="/dashboard/automations/builder"
          className="bg-white hover:bg-zinc-200 text-black font-medium rounded-lg h-9 px-4 text-sm inline-flex items-center gap-2 transition-colors shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          New Automation
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
