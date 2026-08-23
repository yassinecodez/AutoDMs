import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { MessageSquare, ShieldCheck, Calendar, Camera, Send } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardOverview() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }
  const userId = session.user.id;

  // 1. Fetch DB Stats concurrently
  const [
    accountsCount,
    activeAutomationsCount,
    totalDmsCount,
    failedDmsCount,
    commentsCount,
    storyMentionsCount,
    recentLogs,
  ] = await Promise.all([
    db.igAccount.count({
      where: { userId },
    }),
    db.automation.count({
      where: { userId, active: true },
    }),
    db.executionLog.count({
      where: {
        automation: { userId },
        dmStatus: "SUCCESS",
      },
    }),
    db.executionLog.count({
      where: {
        automation: { userId },
        dmStatus: "FAILED",
      },
    }),
    db.executionLog.count({
      where: {
        automation: { userId },
        triggerSource: "COMMENT",
      },
    }),
    db.executionLog.count({
      where: {
        automation: { userId },
        triggerSource: "STORY_MENTION",
      },
    }),
    db.executionLog.findMany({
      where: {
        automation: { userId },
      },
      orderBy: {
        timestamp: "desc",
      },
      take: 10, // Latest 10 deliveries
      include: {
        automation: true,
      },
    }),
  ]);

  const totalInteractions = totalDmsCount + failedDmsCount;
  const successRate = totalInteractions > 0 ? Math.round((totalDmsCount / totalInteractions) * 100) : 100;

  const stats = [
    {
      name: "Comments Triggered",
      value: commentsCount,
      icon: MessageSquare,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      name: "Story Mentions Rewarded",
      value: storyMentionsCount,
      icon: Camera,
      color: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    },
    {
      name: "DMs Delivered",
      value: totalDmsCount,
      icon: Send,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      name: "Delivery Success Rate",
      value: `${successRate}%`,
      icon: ShieldCheck,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Overview</h1>
          <p className="text-slate-400 text-sm">Monitor comment automation volume and server logs</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 w-fit mt-2 md:mt-0">
          <Calendar className="w-4 h-4 text-violet-400" />
          <span>Real-time Sync Active</span>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between shadow-sm"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-400">{stat.name}</p>
                <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl border ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent logs */}
        <div className="lg:col-span-2 p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white">Recent Automation Actions</h2>
            <Link href="/dashboard/logs" className="text-xs font-semibold text-violet-400 hover:text-violet-300">
              View All Logs
            </Link>
          </div>

          {recentLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-sm">
              <MessageSquare className="w-12 h-12 text-slate-700 mb-3" />
              <p>No actions logged yet.</p>
              <p className="text-xs text-slate-600 mt-1">Configure automations and comment triggers to start tracking.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs text-slate-400 border-b border-slate-800">
                    <th className="pb-3 font-semibold">User</th>
                    <th className="pb-3 font-semibold">Source</th>
                    <th className="pb-3 font-semibold">Trigger text</th>
                    <th className="pb-3 font-semibold">Rule</th>
                    <th className="pb-3 font-semibold">DM Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-sm">
                  {recentLogs.map((log) => (
                    <tr key={log.id} className="group">
                      <td className="py-3 font-medium text-slate-200">@{log.commenterUsername}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          log.triggerSource === "COMMENT"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : log.triggerSource === "STORY_MENTION"
                            ? "bg-pink-500/10 text-pink-400 border-pink-500/20"
                            : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                        }`}>
                          {log.triggerSource === "COMMENT" ? "Comment" : log.triggerSource === "STORY_MENTION" ? "Story" : "Direct DM"}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400 max-w-xs truncate">"{log.commentText}"</td>
                      <td className="py-3 text-slate-400">{log.automation?.name || "Deleted Rule"}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            log.dmStatus === "SUCCESS"
                              ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20"
                              : log.dmStatus === "SKIPPED"
                              ? "bg-slate-800/40 text-slate-400 border border-slate-700/20"
                              : "bg-red-950/40 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {log.dmStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Integration Instructions */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-4">Integration Details</h2>
          <div className="space-y-4 text-sm text-slate-400">
            <p className="leading-relaxed">
              To trigger automations, set up a webhook in your Meta Developer console pointed to:
            </p>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-mono text-xs break-all selection:bg-violet-500/30">
              {process.env.NEXTAUTH_URL || "https://autodms-project.vercel.app"}/api/webhook/instagram
            </div>
            <div className="space-y-2 pt-2">
              <h3 className="font-semibold text-slate-300 text-xs uppercase tracking-wider">Required Webhook Fields:</h3>
              <ul className="list-disc pl-4 space-y-1 text-xs">
                <li><code className="text-violet-400">comments</code></li>
                <li><code className="text-violet-400">messages</code></li>
              </ul>
            </div>
            <div className="p-3 bg-violet-950/20 border border-violet-500/20 rounded-xl text-xs text-violet-300">
              <strong>Tip:</strong> You must connect your Instagram Business Account first under the <strong>Meta Accounts</strong> tab to listen to live webhook feed comments.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
