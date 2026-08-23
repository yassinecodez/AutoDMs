import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { MessageSquare, ShieldCheck, Camera, Send, Plus, ArrowUpRight, Users, Settings, CreditCard, ChevronRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

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
    failedDmsCount,
    commentsCount,
    storyMentionsCount,
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
      take: 8,
      include: {
        automation: true,
      },
    }),
    db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        dmsCountThisMonth: true,
        dmsLimit: true,
        planType: true,
        usageResetAt: true,
      },
    }),
  ]);

  const totalInteractions = totalDmsCount + failedDmsCount;
  const successRate = totalInteractions > 0 ? Math.round((totalDmsCount / totalInteractions) * 100) : 100;

  const primaryAccount = accounts[0];
  let tokenDaysRemaining = 59;
  if (primaryAccount?.tokenExpiresAt) {
    const diff = new Date(primaryAccount.tokenExpiresAt).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days > 0) tokenDaysRemaining = days;
  }

  const dmsUsed = user?.dmsCountThisMonth || 0;
  const dmsLimit = user?.dmsLimit || 150;
  const quotaPercent = Math.min(Math.round((dmsUsed / dmsLimit) * 100), 100);

  const stats = [
    {
      name: "Comments handled",
      value: commentsCount,
      icon: MessageSquare,
      detail: "Incoming post comments",
    },
    {
      name: "Story mentions rewarded",
      value: storyMentionsCount,
      icon: Camera,
      detail: "Tags in user stories",
    },
    {
      name: "DMs delivered",
      value: totalDmsCount,
      icon: Send,
      detail: "Private replies sent",
    },
    {
      name: "Delivery success rate",
      value: `${successRate}%`,
      icon: ShieldCheck,
      detail: "API dispatch reliability",
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl">
      {/* Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#F9FAFB] tracking-tight">Overview</h1>
          <p className="text-xs md:text-sm text-[#9CA3AF]">Real-time activity and automation metrics</p>
        </div>

        <div className="flex items-center gap-3">
          {primaryAccount ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111827] border border-[#1F2937] text-xs font-semibold text-[#F9FAFB]">
              <span className="w-2 h-2 rounded-full bg-[#00DF81] inline-block animate-pulse" />
              <span>@{primaryAccount.pageName}</span>
              <span className="text-[10px] text-slate-500 font-mono">Live</span>
            </div>
          ) : (
            <Link
              href="/dashboard/accounts"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111827] border border-amber-500/30 text-xs font-semibold text-amber-400"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              Connect Instagram Account
            </Link>
          )}

          <Link
            href="/dashboard/automations/builder"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00DF81] hover:bg-[#00C770] text-[#000000] font-bold rounded-xl text-xs transition-all shadow-md shadow-[#00DF81]/10 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Create automation
          </Link>
        </div>
      </div>

      {/* 4 Stat Metric Cards (Clean & Flat) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="p-5 bg-[#111827] border border-[#1F2937] rounded-xl flex flex-col justify-between h-[120px]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#9CA3AF]">{stat.name}</span>
                <Icon className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-[#F9FAFB] tracking-tight">{stat.value}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{stat.detail}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two-Column Main Content (65% / 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (65% -> 8 cols of 12) */}
        <div className="lg:col-span-8 bg-[#111827] border border-[#1F2937] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1F2937] pb-4">
            <div>
              <h2 className="text-base font-bold text-[#F9FAFB]">Recent actions</h2>
              <p className="text-xs text-[#9CA3AF]">Latest comment-to-DM triggers and deliveries</p>
            </div>
            <Link
              href="/dashboard/logs"
              className="text-xs font-semibold text-[#00DF81] hover:text-[#00C770] flex items-center gap-1 transition-colors"
            >
              View all logs
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#0B0F17] border border-[#1F2937] flex items-center justify-center text-slate-500">
                <MessageSquare className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-[#F9FAFB]">No activity recorded yet</p>
              <p className="text-[11px] text-[#9CA3AF] max-w-xs leading-relaxed">
                When people comment keywords on your posts or tag you in stories, live actions will stream here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[11px] text-[#9CA3AF] border-b border-[#1F2937]">
                    <th className="pb-3 font-semibold">User</th>
                    <th className="pb-3 font-semibold">Source</th>
                    <th className="pb-3 font-semibold">Trigger text</th>
                    <th className="pb-3 font-semibold">Rule name</th>
                    <th className="pb-3 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F2937]/60 text-xs">
                  {recentLogs.map((log) => (
                    <tr key={log.id} className="group hover:bg-[#0B0F17]/40 transition-colors">
                      <td className="py-3 font-medium text-[#F9FAFB]">
                        @{log.commenterUsername}
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#0B0F17] border border-[#1F2937] text-slate-300">
                          {log.triggerSource === "COMMENT" ? "Comment" : log.triggerSource === "STORY_MENTION" ? "Story" : "Direct DM"}
                        </span>
                      </td>
                      <td className="py-3 text-[#9CA3AF] max-w-[160px] truncate font-mono text-[11px]">
                        "{log.commentText}"
                      </td>
                      <td className="py-3 text-[#9CA3AF] max-w-[140px] truncate">
                        {log.automation?.name || "Automation Rule"}
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide ${
                            log.dmStatus === "SUCCESS"
                              ? "bg-[#00DF81]/10 text-[#00DF81] border border-[#00DF81]/20"
                              : log.dmStatus === "LEAD_CAPTURED"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : log.dmStatus === "SKIPPED"
                              ? "bg-slate-800 text-slate-400 border border-slate-700"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
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

        {/* Right Column (35% -> 4 cols of 12) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Account Health Card */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <h2 className="text-xs font-bold text-[#F9FAFB] uppercase tracking-wider">Account health</h2>
              <span className="text-[10px] text-[#00DF81] font-semibold bg-[#00DF81]/10 px-2 py-0.5 rounded border border-[#00DF81]/20">
                Connected
              </span>
            </div>

            {primaryAccount ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-[#0B0F17] border border-[#1F2937] rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-[#111827] border border-[#1F2937] flex items-center justify-center text-slate-400 shrink-0">
                    <InstagramIcon className="w-4 h-4 text-[#00DF81]" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-[#F9FAFB] truncate">@{primaryAccount.pageName}</p>
                    <p className="text-[10px] text-[#9CA3AF] truncate">ID: {primaryAccount.instagramAccountId}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[#9CA3AF]">Meta Token:</span>
                    <span className="text-[#00DF81] font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00DF81] inline-block" />
                      Active ({tokenDaysRemaining}d remaining)
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[#9CA3AF]">Active automations:</span>
                    <span className="text-[#F9FAFB] font-semibold">{activeAutomationsCount} active</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#0B0F17] border border-[#1F2937] rounded-xl text-center space-y-2">
                <p className="text-xs text-[#9CA3AF]">No Instagram profile linked yet</p>
                <Link
                  href="/dashboard/accounts"
                  className="inline-block text-xs font-bold text-[#00DF81] hover:underline"
                >
                  Link Instagram Account &rarr;
                </Link>
              </div>
            )}

            {/* Monthly Quota Mini Bar */}
            <div className="pt-2 border-t border-[#1F2937] space-y-2">
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-[#9CA3AF]">Monthly Quota:</span>
                <span className="text-[#F9FAFB]">{dmsUsed} / {dmsLimit} DMs</span>
              </div>
              <div className="w-full h-1.5 bg-[#0B0F17] rounded-full overflow-hidden border border-[#1F2937]/50">
                <div
                  style={{ width: `${quotaPercent}%` }}
                  className="h-full bg-[#00DF81] rounded-full transition-all"
                />
              </div>
            </div>
          </div>

          {/* Quick Links Card */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 space-y-3">
            <h2 className="text-xs font-bold text-[#F9FAFB] uppercase tracking-wider border-b border-[#1F2937] pb-3">
              Quick shortcuts
            </h2>

            <div className="space-y-1.5">
              <Link
                href="/dashboard/automations"
                className="flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#0B0F17] transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 text-slate-500 group-hover:text-[#00DF81] transition-colors" />
                  <span>Manage automations</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#F9FAFB]" />
              </Link>

              <Link
                href="/dashboard/leads"
                className="flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#0B0F17] transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-slate-500 group-hover:text-[#00DF81] transition-colors" />
                  <span>View leads database</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#F9FAFB]" />
              </Link>

              <Link
                href="/dashboard/settings"
                className="flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#0B0F17] transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-slate-500 group-hover:text-[#00DF81] transition-colors" />
                  <span>Billing & plan settings</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#F9FAFB]" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
