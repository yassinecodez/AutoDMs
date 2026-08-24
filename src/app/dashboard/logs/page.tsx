import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import ActivityLogsViewer from "@/components/ActivityLogsViewer";

export default async function LogsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }
  const userId = session.user.id;

  const logs = await db.executionLog.findMany({
    where: {
      automation: {
        userId,
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
    <div className="p-6 md:p-10 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-0.5 pb-6 border-b border-[#222222]">
        <h1 className="text-2xl font-bold tracking-tight text-white">Activity Logs</h1>
        <p className="text-sm text-zinc-400 mt-0.5">
          Real-time audit stream of incoming comments, story mentions, and DM dispatches
        </p>
      </div>

      {/* Interactive Activity Logs Viewer */}
      <ActivityLogsViewer initialLogs={logs} />
    </div>
  );
}
