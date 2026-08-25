import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import ActivityLogsViewer from "@/components/ActivityLogsViewer";
import { getActiveAccount } from "@/lib/activeAccount";

export const dynamic = "force-dynamic";

export default async function LogsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId: string = session.user.id;
  const activeAccount = await getActiveAccount(userId);

  const logs = await db.executionLog.findMany({
    where: {
      automation: {
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
  });

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div className="space-y-1 pb-6 border-b border-[#222222]">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">Activity logs</h1>
          {activeAccount && (
            <span className="text-xs font-medium text-zinc-400 bg-[#141414] border border-[#262626] px-2 py-0.5 rounded-md">
              @{activeAccount.pageName}
            </span>
          )}
        </div>
        <p className="text-sm text-zinc-400">
          Real-time audit stream of incoming comments, story mentions, and DM dispatches for this workspace
        </p>
      </div>

      {/* Interactive Activity Logs Viewer */}
      <ActivityLogsViewer initialLogs={logs} />
    </div>
  );
}
