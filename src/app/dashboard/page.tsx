import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Send,
  Zap,
  Users,
  MessageCircle,
  Sparkles,
  Inbox,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Circle,
  Plus,
  ScrollText,
} from "lucide-react";
import { getActiveAccount } from "@/lib/activeAccount";
import { PLANS } from "@/lib/plans";
import { getCommenterAvatar } from "@/lib/commenterAvatar";
import OverviewTemplatesSlider from "@/components/OverviewTemplatesSlider";

export const dynamic = "force-dynamic";

export default async function DashboardOverview() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId: string = session.user.id;

  const activeAccount = await getActiveAccount(userId);

  // Parallelize metrics and widget queries
  const [
    user,
    accounts,
    automationsCount,
    capturedLeadsCount,
    totalLogsCount,
    deliveredLogsCount,
    recentLogs,
    topAutomations,
  ] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        dmsCountThisMonth: true,
        dmsLimit: true,
        planType: true,
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
        profilePictureUrl: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    db.automation.count({
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
    }),
    db.lead.count({
      where: {
        ...(activeAccount
          ? { igAccountId: activeAccount.id }
          : { igAccount: { userId } }),
      },
    }),
    db.executionLog.count({
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
    }),
    db.executionLog.count({
      where: {
        dmStatus: "SUCCESS",
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
    }),
    db.executionLog.findMany({
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
      orderBy: { timestamp: "desc" },
      take: 4,
      include: {
        automation: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
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
      take: 4,
      select: {
        id: true,
        name: true,
        triggerSource: true,
        triggerKeyword: true,
        triggerScope: true,
        replyDmMessage: true,
        active: true,
        _count: {
          select: { logs: true },
        },
      },
    }),
  ]);

  function formatFirstName(rawName?: string | null, rawEmail?: string | null): string {
    if (rawName && rawName.trim().length > 0) {
      const firstWord = rawName.trim().split(/\s+/)[0];
      if (firstWord) {
        return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
      }
    }
    if (rawEmail && rawEmail.trim().length > 0) {
      const handle = rawEmail.split("@")[0].trim();
      const cleanWord = handle.replace(/[^a-zA-Z]/g, " ").trim().split(/\s+/)[0] || handle;
      if (cleanWord) {
        return cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase();
      }
    }
    return "Creator";
  }

  function formatTimeAgo(dateInput: any) {
    const date = new Date(dateInput);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 30) return "Just now";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  const currentAccount = activeAccount || accounts[0] || null;
  const totalDmsCount = user?.dmsCountThisMonth || deliveredLogsCount || 0;
  const firstName = formatFirstName(
    user?.name || session.user.name,
    user?.email || session.user.email
  );

  const dmsUsed = user?.dmsCountThisMonth || 0;
  const dmsLimit = user?.dmsLimit || 150;
  const usagePercent = Math.min(100, Math.round((dmsUsed / dmsLimit) * 100));
  const planDetails = PLANS[user?.planType || "FREE"] || PLANS.FREE;

  // Checklist calculations
  const step1Done = accounts.length > 0;
  const step2Done = automationsCount > 0;
  const step3Done = totalLogsCount > 0;
  const completedSteps = (step1Done ? 1 : 0) + (step2Done ? 1 : 0) + (step3Done ? 1 : 0);
  const checklistPercent = Math.round((completedSteps / 3) * 100);

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* ========================================================================= */}
      {/* SECTION 1: Personalized First-Name Greeting */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Hello, {firstName}!
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor incoming leads, auto-DMs, and conversation triggers in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {accounts.length === 0 ? (
            <Link
              href="/dashboard/accounts"
              className="h-10 px-4 rounded-xl bg-primary text-primary-foreground hover:opacity-90 font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Connect Instagram profile</span>
            </Link>
          ) : (
            <Link
              href="/dashboard/automations/builder"
              className="h-10 px-4 rounded-xl bg-primary text-primary-foreground hover:opacity-90 font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New automation</span>
            </Link>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: 4-Column Stat Metric Cards */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total DMs Sent */}
        <div className="p-5 bg-card border border-border rounded-2xl space-y-3 shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">DMs sent</span>
            <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-foreground">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground tracking-tight">{totalDmsCount}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Automated direct deliveries</p>
          </div>
        </div>

        {/* Card 2: Active Rules */}
        <div className="p-5 bg-card border border-border rounded-2xl space-y-3 shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Active rules</span>
            <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-foreground">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground tracking-tight">{automationsCount}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Live triggers running</p>
          </div>
        </div>

        {/* Card 3: Captured Leads */}
        <div className="p-5 bg-card border border-border rounded-2xl space-y-3 shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Captured leads</span>
            <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-foreground">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground tracking-tight">{capturedLeadsCount}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Emails & phone numbers</p>
          </div>
        </div>

        {/* Card 4: Quota Usage */}
        <div className="p-5 bg-card border border-border rounded-2xl space-y-3 shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Monthly usage</span>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-secondary border border-border text-foreground">
              {planDetails.name}
            </span>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground tracking-tight">{dmsUsed}</span>
                <span className="text-xs text-muted-foreground">/ {dmsLimit} DMs</span>
              </div>
              <span className="text-xs text-muted-foreground font-medium">{Math.max(0, dmsLimit - dmsUsed)} left</span>
            </div>
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mt-2.5 border border-border">
              <div
                style={{ width: `${usagePercent}%` }}
                className="h-full bg-primary rounded-full transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: 6-Template Arrow Slider ("Start here") */}
      {/* ========================================================================= */}
      <OverviewTemplatesSlider customTemplates={topAutomations} />

      {/* ========================================================================= */}
      {/* SECTION 4: Simplified Operations & Activity Feed */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Operations & Activity
          </h2>
          {completedSteps === 3 && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Pipeline active</span>
            </span>
          )}
        </div>

        {/* If checklist is NOT complete, show getting started card side-by-side with Activity Stream */}
        {completedSteps < 3 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Getting Started Checklist Card */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-5 flex flex-col justify-between shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Getting started</h3>
                    <p className="text-xs text-muted-foreground">Complete setup to launch your Instagram pipeline</p>
                  </div>
                  <span className="text-xs font-medium text-foreground bg-secondary border border-border px-3 py-1 rounded-full">
                    {completedSteps} of 3 completed
                  </span>
                </div>

                {/* Progress track */}
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden border border-border">
                  <div
                    style={{ width: `${checklistPercent}%` }}
                    className="h-full bg-primary rounded-full transition-all duration-300"
                  />
                </div>

                {/* Step Checklist Items */}
                <div className="space-y-3 pt-1">
                  {/* Step 1: Connect Account */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/50 border border-border">
                    <div className="flex items-center gap-3">
                      {step1Done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                      <div>
                        <p className={`text-xs font-medium ${step1Done ? "text-foreground" : "text-muted-foreground"}`}>
                          1. Connect your professional Instagram account
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {step1Done ? `Connected as @${currentAccount?.pageName}` : "Link your Creator or Business account"}
                        </p>
                      </div>
                    </div>
                    {!step1Done && (
                      <Link
                        href="/dashboard/accounts"
                        className="text-xs text-foreground hover:underline font-semibold"
                      >
                        Connect &rarr;
                      </Link>
                    )}
                  </div>

                  {/* Step 2: Create First Rule */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/50 border border-border">
                    <div className="flex items-center gap-3">
                      {step2Done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                      <div>
                        <p className={`text-xs font-medium ${step2Done ? "text-foreground" : "text-muted-foreground"}`}>
                          2. Create your first auto-DM rule
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {step2Done ? `${automationsCount} active automation(s) live` : "Set a trigger keyword and reply message"}
                        </p>
                      </div>
                    </div>
                    {!step2Done && (
                      <Link
                        href="/dashboard/automations/builder"
                        className="text-xs text-foreground hover:underline font-semibold"
                      >
                        Create &rarr;
                      </Link>
                    )}
                  </div>

                  {/* Step 3: Test on Instagram */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/50 border border-border">
                    <div className="flex items-center gap-3">
                      {step3Done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                      <div>
                        <p className={`text-xs font-medium ${step3Done ? "text-foreground" : "text-muted-foreground"}`}>
                          3. Test and send your first DM
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {step3Done ? `${totalLogsCount} total interaction(s) recorded` : "Comment on your post from a test account"}
                        </p>
                      </div>
                    </div>
                    {!step3Done && (
                      <Link
                        href="/dashboard/logs"
                        className="text-xs text-foreground hover:underline font-semibold"
                      >
                        Audit logs &rarr;
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/dashboard/automations/builder"
                  className="w-full h-10 rounded-xl bg-primary text-primary-foreground hover:opacity-90 font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <span>Launch new automation</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right: Live Activity Stream Card */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-5 flex flex-col justify-between shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-secondary border border-border flex items-center justify-center text-foreground">
                      <ScrollText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Recent activity</h3>
                      <p className="text-xs text-muted-foreground">Live webhook interaction stream</p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard/logs"
                    className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                  >
                    <span>View all logs ({totalLogsCount})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {recentLogs.length === 0 ? (
                  <div className="p-8 text-center bg-secondary/30 border border-border rounded-xl space-y-2.5 my-2">
                    <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground mx-auto">
                      <ScrollText className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-foreground">Waiting for interactions</p>
                      <p className="text-[11px] text-muted-foreground max-w-xs mx-auto leading-relaxed">
                        When followers comment your trigger keywords or mention you in stories, live dispatch logs will stream here.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {recentLogs.map((log) => {
                      const isComment = log.triggerSource === "COMMENT" || log.triggerSource === "COMMENTS";
                      const isStory = log.triggerSource === "STORY_MENTION" || log.triggerSource === "STORY_MENTIONS";
                      const avatarUrl = getCommenterAvatar(log.commenterUsername);
                      const initial = (log.commenterUsername ? log.commenterUsername[0] : "U").toUpperCase();
                      const timeAgo = formatTimeAgo(log.timestamp);

                      return (
                        <div
                          key={log.id}
                          className="p-3 bg-secondary/40 hover:bg-secondary/70 border border-border rounded-xl flex items-center justify-between gap-3 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-full overflow-hidden bg-secondary border border-border flex items-center justify-center font-semibold text-xs text-foreground shrink-0 shadow-inner">
                              {avatarUrl ? (
                                <img
                                  src={avatarUrl}
                                  alt={log.commenterUsername}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <span>{initial}</span>
                              )}
                            </div>
                            <div className="min-w-0 space-y-0.5">
                              <p className="text-xs font-semibold text-foreground truncate">
                                @{log.commenterUsername}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {isComment ? (
                                  <span>commented &quot;{log.commentText}&quot;</span>
                                ) : isStory ? (
                                  <span>story mention</span>
                                ) : (
                                  <span>sent DM &quot;{log.commentText}&quot;</span>
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0 text-right">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                              <span className="w-1 h-1 rounded-full bg-emerald-500" />
                              Delivered
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {timeAgo}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Link
                  href="/dashboard/logs"
                  className="w-full h-10 rounded-xl border border-border hover:bg-secondary text-foreground font-medium text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Open live audit feed</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Clean 2-column simplified operational section */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Card: Live Activity Stream */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-5 flex flex-col justify-between shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-secondary border border-border flex items-center justify-center text-foreground">
                      <ScrollText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Recent activity</h3>
                      <p className="text-xs text-muted-foreground">Live webhook interaction stream</p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard/logs"
                    className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                  >
                    <span>View all logs ({totalLogsCount})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {recentLogs.length === 0 ? (
                  <div className="p-8 text-center bg-secondary/30 border border-border rounded-xl space-y-2.5 my-2">
                    <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground mx-auto">
                      <ScrollText className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-foreground">Waiting for interactions</p>
                      <p className="text-[11px] text-muted-foreground max-w-xs mx-auto leading-relaxed">
                        When followers comment your trigger keywords or mention you in stories, live dispatch logs will stream here.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {recentLogs.map((log) => {
                      const isComment = log.triggerSource === "COMMENT" || log.triggerSource === "COMMENTS";
                      const isStory = log.triggerSource === "STORY_MENTION" || log.triggerSource === "STORY_MENTIONS";
                      const avatarUrl = getCommenterAvatar(log.commenterUsername);
                      const initial = (log.commenterUsername ? log.commenterUsername[0] : "U").toUpperCase();
                      const timeAgo = formatTimeAgo(log.timestamp);

                      return (
                        <div
                          key={log.id}
                          className="p-3 bg-secondary/40 hover:bg-secondary/70 border border-border rounded-xl flex items-center justify-between gap-3 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-full overflow-hidden bg-secondary border border-border flex items-center justify-center font-semibold text-xs text-foreground shrink-0 shadow-inner">
                              {avatarUrl ? (
                                <img
                                  src={avatarUrl}
                                  alt={log.commenterUsername}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <span>{initial}</span>
                              )}
                            </div>
                            <div className="min-w-0 space-y-0.5">
                              <p className="text-xs font-semibold text-foreground truncate">
                                @{log.commenterUsername}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {isComment ? (
                                  <span>commented &quot;{log.commentText}&quot;</span>
                                ) : isStory ? (
                                  <span>story mention</span>
                                ) : (
                                  <span>sent DM &quot;{log.commentText}&quot;</span>
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0 text-right">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                              <span className="w-1 h-1 rounded-full bg-emerald-500" />
                              Delivered
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {timeAgo}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Link
                  href="/dashboard/logs"
                  className="w-full h-10 rounded-xl border border-border hover:bg-secondary text-foreground font-medium text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Open live audit feed</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Card: Simplified Active Automations List */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-5 flex flex-col justify-between shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-secondary border border-border flex items-center justify-center text-foreground">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Active automations</h3>
                      <p className="text-xs text-muted-foreground">Running Instagram rules</p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard/automations"
                    className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                  >
                    <span>Manage all ({automationsCount})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {topAutomations.length === 0 ? (
                  <div className="p-8 text-center bg-secondary/30 border border-border rounded-xl space-y-2.5 my-2">
                    <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground mx-auto">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-foreground">No automations created yet</p>
                      <p className="text-[11px] text-muted-foreground max-w-xs mx-auto leading-relaxed">
                        Create your first keyword trigger to automatically send DM responses.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {topAutomations.map((auto) => {
                      const dispatches = auto._count?.logs || 0;
                      return (
                        <div
                          key={auto.id}
                          className="p-3 bg-secondary/40 hover:bg-secondary/70 border border-border rounded-xl flex items-center justify-between gap-3 transition-colors"
                        >
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  auto.active ? "bg-emerald-500" : "bg-zinc-400 dark:bg-zinc-600"
                                }`}
                              />
                              <Link
                                href={`/dashboard/automations/builder?edit=${auto.id}`}
                                className="text-xs font-semibold text-foreground hover:underline truncate"
                                title={auto.name}
                              >
                                {auto.name}
                              </Link>
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate pl-3">
                              {auto.triggerSource === "STORY_MENTIONS" ? (
                                <span>Story mentions & tags</span>
                              ) : auto.triggerSource === "DIRECT_MESSAGES" ? (
                                <span>
                                  DM: <strong className="text-foreground font-medium">&quot;{auto.triggerKeyword || "Any"}&quot;</strong>
                                </span>
                              ) : (
                                <span>
                                  Keyword: <strong className="text-foreground font-medium">&quot;{auto.triggerKeyword || "Any"}&quot;</strong>
                                </span>
                              )}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] font-medium text-muted-foreground">
                              {dispatches} sent
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between gap-3 border-t border-border">
                <Link
                  href="/dashboard/automations/builder"
                  className="h-9 px-4 rounded-xl bg-primary text-primary-foreground hover:opacity-90 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New automation</span>
                </Link>
                <Link
                  href="/dashboard/automations"
                  className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  <span>Manage all rules</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
