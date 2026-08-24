import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Send, CheckCircle2, Users, Zap, Plus, ArrowUpRight, ChevronRight, MessageSquare } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardOverview() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }
  const userId = session.user.id;

  // Concurrent DB Queries
  const [
    accounts,
    activeAutomationsCount,
    totalDmsCount,
    totalLogsCount,
    capturedLeadsCount,
    recentLogs,
    user,
  ] = await Promise.all([
    db.igAccount.findMany({
      where: { userId },
      select: {
        id: true,
        instagramAccountId: true,
        pageName: true,
        tokenExpiresAt: true,
      },
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
      },
    }),
    db.lead.count({
      where: {
        igAccount: { userId },
      },
    }),
    db.executionLog.findMany({
      where: {
        automation: { userId },
      },
      orderBy: {
        timestamp: "desc",
      },
      take: 10,
      include: {
        automation: true,
      },
    }),
    db.user.findUnique({
      where: { id: userId },
      select: {
        dmsCountThisMonth: true,
        dmsLimit: true,
        planType: true,
      },
    }),
  ]);

  const successRate = totalLogsCount > 0 ? Math.round((totalDmsCount / totalLogsCount) * 100) : 100;
  const primaryAccount = accounts[0];
  const dmsUsed = user?.dmsCountThisMonth || 0;
  const dmsLimit = user?.dmsLimit || 150;

  const kpis = [
    {
      title: "Total DMs Delivered",
      value: totalDmsCount.toLocaleString(),
      subtext: `${dmsUsed} of ${dmsLimit} monthly quota`,
      icon: Send,
      href: "/dashboard/logs",
    },
    {
      title: "Success Rate",
      value: `${successRate}%`,
      subtext: "API delivery reliability",
      icon: CheckCircle2,
      trend: "100% uptime",
      href: "/dashboard/logs",
    },
    {
      title: "Captured Leads",
      value: capturedLeadsCount.toLocaleString(),
      subtext: "Emails & phone contacts",
      icon: Users,
      href: "/dashboard/leads",
      badge: "View DB &rarr;",
    },
    {
      title: "Active Automations",
      value: activeAutomationsCount.toLocaleString(),
      subtext: "Real-time trigger rules",
      icon: Zap,
      href: "/dashboard/automations",
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl">
      {/* Top Header Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-[#27272A]">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Overview</h1>
          <p className="text-xs text-zinc-400">Real-time automation activity and contact conversions</p>
        </div>

        <div className="flex items-center gap-3">
          {primaryAccount ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-xs font-medium text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00DF81] animate-pulse" />
              <span>@{primaryAccount.pageName}</span>
              <span className="text-[10px] text-zinc-500 font-mono">Live</span>
            </div>
          ) : (
            <Link
              href="/dashboard/accounts"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#18181B] border border-amber-500/30 text-xs font-medium text-amber-400 hover:border-amber-500/50 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              Connect Instagram Profile
            </Link>
          )}

          <Link
            href="/dashboard/automations/builder"
            className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-[#00DF81] hover:bg-[#00C770] text-[#000000] font-semibold rounded-lg text-xs transition-all active:scale-95 shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            Create automation
          </Link>
        </div>
      </div>

      {/* 4 Compact KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={kpi.title}
              href={kpi.href}
              className="p-4 bg-[#18181B] border border-[#27272A] rounded-xl hover:border-zinc-700 transition-all flex flex-col justify-between h-[115px] group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">{kpi.title}</span>
                <Icon className="w-4 h-4 text-zinc-500 group-hover:text-[#00DF81] transition-colors" strokeWidth={1.75} />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-extrabold text-zinc-100 tracking-tight">{kpi.value}</p>
                  {kpi.badge && (
                    <span className="text-[10px] text-[#00DF81] font-semibold group-hover:underline">
                      {kpi.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 truncate">{kpi.subtext}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Activity Table */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
          <div>
            <h2 className="text-sm font-bold text-zinc-100">Recent execution activity</h2>
            <p className="text-xs text-zinc-400">Live stream of incoming comments, direct messages, and automation triggers</p>
          </div>
          <Link
            href="/dashboard/logs"
            className="text-xs font-semibold text-[#00DF81] hover:text-[#00C770] flex items-center gap-1 transition-colors"
          >
            View all logs
            <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
          </Link>
        </div>

        {recentLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
            <div className="w-9 h-9 rounded-lg bg-[#0F0F0F] border border-[#27272A] flex items-center justify-center text-zinc-500">
              <MessageSquare className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <p className="text-xs font-semibold text-zinc-200">No automation triggers recorded yet</p>
            <p className="text-[11px] text-zinc-500 max-w-xs leading-relaxed">
              When followers comment keywords or tag you in stories, real-time dispatches will stream here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] text-zinc-400 border-b border-[#27272A]">
                  <th className="pb-2.5 font-medium">Time</th>
                  <th className="pb-2.5 font-medium">Source</th>
                  <th className="pb-2.5 font-medium">User</th>
                  <th className="pb-2.5 font-medium">Input message</th>
                  <th className="pb-2.5 font-medium">Matched rule</th>
                  <th className="pb-2.5 font-medium text-right">Status</th>
                  <th className="pb-2.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]/70 text-xs">
                {recentLogs.map((log) => (
                  <tr key={log.id} className="group hover:bg-[#0F0F0F]/50 transition-colors">
                    <td className="py-2.5 text-zinc-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-2.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#0F0F0F] border border-[#27272A] text-zinc-300">
                        {log.triggerSource === "COMMENT" ? "Comment" : log.triggerSource === "STORY_MENTION" ? "Story" : "Direct DM"}
                      </span>
                    </td>
                    <td className="py-2.5 font-medium text-zinc-200">
                      @{log.commenterUsername}
                    </td>
                    <td className="py-2.5 text-zinc-400 max-w-[180px] truncate font-mono text-[11px]" title={log.commentText}>
                      "{log.commentText}"
                    </td>
                    <td className="py-2.5 text-zinc-400 max-w-[140px] truncate">
                      {log.automation?.name || "Automation rule"}
                    </td>
                    <td className="py-2.5 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            log.dmStatus === "SUCCESS"
                              ? "bg-[#00DF81]"
                              : log.dmStatus === "LEAD_CAPTURED"
                              ? "bg-blue-400"
                              : log.dmStatus === "PROCESSING"
                              ? "bg-amber-400 animate-pulse"
                              : log.dmStatus === "SKIPPED"
                              ? "bg-zinc-500"
                              : "bg-red-400"
                          }`}
                        />
                        <span
                          className={
                            log.dmStatus === "SUCCESS"
                              ? "text-[#00DF81]"
                              : log.dmStatus === "LEAD_CAPTURED"
                              ? "text-blue-400"
                              : log.dmStatus === "SKIPPED"
                              ? "text-zinc-500"
                              : "text-red-400"
                          }
                        >
                          {log.dmStatus}
                        </span>
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <Link
                        href="/dashboard/logs"
                        className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
                      >
                        Details
                        <ArrowUpRight className="w-3 h-3 text-zinc-600 group-hover:text-zinc-300" strokeWidth={1.75} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
