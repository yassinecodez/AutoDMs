import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import AutomationsManager from "@/components/AutomationsManager";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getActiveAccount, getAllUserAccounts } from "@/lib/activeAccount";

interface PageProps {
  searchParams: Promise<{
    tab?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function AutomationsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId: string = session.user.id;
  const [activeAccount, connectedAccounts] = await Promise.all([
    getActiveAccount(userId),
    getAllUserAccounts(userId),
  ]);

  const currentAccount = activeAccount || connectedAccounts[0] || null;

  const automations = currentAccount
    ? await db.automation.findMany({
        where: {
          igAccountId: currentAccount.id,
        },
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { logs: true, leads: true },
          },
        },
      })
    : [];

  const defaultTab = params.tab === "templates" ? "TEMPLATES" : "MY_RULES";

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Top Bar Layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Automations</h1>
            {currentAccount && (
              <span className="text-xs font-semibold text-foreground bg-secondary border border-border px-2.5 py-0.5 rounded-full">
                @{currentAccount.pageName}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {currentAccount
              ? `Manage active trigger rules and launch pre-built recipes on @${currentAccount.pageName}`
              : "Connect an Instagram account to create and run automation rules."}
          </p>
        </div>

        <Link
          href="/dashboard/automations/builder"
          className="h-10 px-5 bg-primary text-primary-foreground hover:opacity-90 font-medium rounded-xl text-sm inline-flex items-center gap-2 transition-colors shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span>New automation</span>
        </Link>
      </div>

      {/* Main Manager Client Component */}
      <AutomationsManager
        initialAutomations={automations}
        connectedAccounts={connectedAccounts.map((a) => ({
          id: a.id,
          instagramAccountId: a.instagramAccountId,
          pageName: a.pageName,
        }))}
        defaultTab={defaultTab}
      />
    </div>
  );
}
