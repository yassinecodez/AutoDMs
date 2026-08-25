import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import ActivityLogsViewer from "@/components/ActivityLogsViewer";
import { getActiveAccount, getAllUserAccounts } from "@/lib/activeAccount";

export const dynamic = "force-dynamic";

export default async function LogsPage() {
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

  const logs = currentAccount
    ? await db.executionLog.findMany({
        where: {
          OR: [
            { igAccountId: currentAccount.id },
            { automation: { igAccountId: currentAccount.id } },
          ],
        },
        orderBy: {
          timestamp: "desc",
        },
        include: {
          automation: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        take: 200,
      })
    : [];

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div className="space-y-1 pb-6 border-b border-border">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Activity logs</h1>
          {currentAccount && (
            <span className="text-xs font-semibold text-foreground bg-secondary border border-border px-2.5 py-0.5 rounded-full">
              @{currentAccount.pageName}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {currentAccount
            ? `Real-time audit stream of incoming comments, story mentions, and DM dispatches for @${currentAccount.pageName}`
            : "Connect an Instagram account to monitor real-time activity."}
        </p>
      </div>

      {/* Interactive Activity Logs Viewer */}
      <ActivityLogsViewer initialLogs={logs} />
    </div>
  );
}
