import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  MessageCircle,
  Sparkles,
  Inbox,
  CheckCircle2,
  Circle,
  ArrowRight,
  ChevronRight,
  Send,
  Zap,
  Users,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PLANS } from "@/lib/plans";
import { getActiveAccount } from "@/lib/activeAccount";

export const dynamic = "force-dynamic";

export default async function DashboardOverview() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId: string = session.user.id;

  const activeAccount = await getActiveAccount(userId);

  const [
    accounts,
    automationsCount,
    totalLogsCount,
    totalDmsCount,
    capturedLeadsCount,
    user,
  ] = await Promise.all([
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
        tokenExpiresAt: true,
      },
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
        dmStatus: "SUCCESS",
      },
    }),
    db.lead.count({
      where: {
        ...(activeAccount ? { igAccountId: activeAccount.id } : { igAccount: { userId } }),
      },
    }),
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
  ]);

  const currentAccount = activeAccount || accounts[0];
  const userName =
    user?.name ||
    session.user.name ||
    user?.email?.split("@")[0] ||
    session.user.email?.split("@")[0] ||
    "Creator";

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

  const quickTemplates = [
    {
      id: "comments",
      title: "Auto-DM links from comments",
      tag: "Popular",
      description: "Send links, discounts, or prices when followers comment on your Reels or Posts.",
      icon: MessageCircle,
      href: "/dashboard/automations/builder?template=comment_to_dm",
    },
    {
      id: "stories",
      title: "Generate leads with stories",
      description: "Automatically reward followers with coupon codes or links when they mention you in stories.",
      icon: Sparkles,
      href: "/dashboard/automations/builder?template=story_mention",
    },
    {
      id: "dms",
      title: "Respond to all your DMs",
      description: "Send instant automated replies and lead capture forms to direct message inquiries.",
      icon: Inbox,
      href: "/dashboard/automations/builder?template=direct_dm",
    },
  ];

  return (
    <div className="p-6 md:p-10 space-y-10 max-w-6xl mx-auto">
      {/* ========================================================================= */}
      {/* SECTION 1: Personalized Greeting & Channel Status */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#222222]">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Hello, {userName}!
          </h1>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            {currentAccount ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#111111] border border-[#222222] font-medium text-zinc-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  @{currentAccount.pageName}
                  <span className="text-zinc-500">•</span>
                  <span className="text-emerald-400">Connected</span>
                </span>
                <span className="text-zinc-500 hidden sm:inline">Active workspace</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>No Instagram account linked</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {accounts.length === 0 ? (
            <Link
              href="/dashboard/accounts"
              className="h-10 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-medium text-xs flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Connect Instagram profile</span>
            </Link>
          ) : (
            <Link
              href="/dashboard/automations/builder"
              className="h-10 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-medium text-xs flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New automation</span>
            </Link>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1.5: 4-Column Stat Metric Cards */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total DMs Sent */}
        <div className="p-5 bg-[#0A0A0A] border border-[#222222] rounded-2xl space-y-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:border-zinc-700 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">DMs sent</span>
            <div className="w-8 h-8 rounded-lg bg-[#141414] border border-[#262626] flex items-center justify-center text-zinc-300">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">{totalDmsCount}</div>
            <p className="text-[11px] text-zinc-500 mt-0.5">Automated direct deliveries</p>
          </div>
        </div>

        {/* Card 2: Active Rules */}
        <div className="p-5 bg-[#0A0A0A] border border-[#222222] rounded-2xl space-y-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:border-zinc-700 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Active rules</span>
            <div className="w-8 h-8 rounded-lg bg-[#141414] border border-[#262626] flex items-center justify-center text-zinc-300">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">{automationsCount}</div>
            <p className="text-[11px] text-zinc-500 mt-0.5">Live triggers running</p>
          </div>
        </div>

        {/* Card 3: Captured Leads */}
        <div className="p-5 bg-[#0A0A0A] border border-[#222222] rounded-2xl space-y-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:border-zinc-700 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Captured leads</span>
            <div className="w-8 h-8 rounded-lg bg-[#141414] border border-[#262626] flex items-center justify-center text-zinc-300">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">{capturedLeadsCount}</div>
            <p className="text-[11px] text-zinc-500 mt-0.5">Emails & phone numbers</p>
          </div>
        </div>

        {/* Card 4: Quota Usage */}
        <div className="p-5 bg-[#0A0A0A] border border-[#222222] rounded-2xl space-y-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:border-zinc-700 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Monthly quota</span>
            <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-[#161616] border border-[#262626] text-zinc-300">
              {planDetails.name}
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white tracking-tight">{dmsUsed}</span>
              <span className="text-xs text-zinc-500">/{dmsLimit}</span>
            </div>
            <div className="w-full h-1.5 bg-[#141414] rounded-full overflow-hidden mt-2 border border-[#222222]">
              <div
                style={{ width: `${usagePercent}%` }}
                className="h-full bg-white rounded-full transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: "Quick Automations" (Starter Templates Grid) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-zinc-400">
            Start here
          </h2>
          <Link
            href="/dashboard/automations"
            className="text-xs font-medium text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            View all rules ({automationsCount})
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <Link
                key={template.id}
                href={template.href}
                className="bg-[#0A0A0A] hover:bg-[#0D0D0D] border border-[#222222] hover:border-zinc-700 rounded-2xl p-6 transition-all duration-200 cursor-pointer group flex flex-col justify-between min-h-[180px] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#141414] border border-[#262626] flex items-center justify-center text-zinc-300 group-hover:text-white group-hover:border-zinc-500 transition-colors">
                      <Icon className="w-5 h-5" strokeWidth={1.75} />
                    </div>
                    {template.tag && (
                      <span className="bg-[#181818] border border-[#2b2b2b] text-zinc-300 text-[10px] px-2.5 py-0.5 rounded-full font-medium">
                        {template.tag}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-white group-hover:text-white transition-colors">
                      {template.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {template.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 flex items-center text-xs font-medium text-zinc-400 group-hover:text-white transition-colors">
                  <span>Use template</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 transform group-hover:translate-x-1 transition-transform stroke-[2.5]" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: "Your Next Steps" (2-Column Grid) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold text-zinc-400">
          Your next steps
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Card: Setup Progress Checklist */}
          <div className="bg-[#0A0A0A] border border-[#222222] rounded-2xl p-6 space-y-5 flex flex-col justify-between shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Getting started</h3>
                  <p className="text-xs text-zinc-400">Complete setup to launch your Instagram pipeline</p>
                </div>
                <span className="text-xs font-medium text-zinc-400 bg-[#141414] border border-[#222222] px-2.5 py-1 rounded-full">
                  {completedSteps} of 3 completed
                </span>
              </div>

              {/* Progress track */}
              <div className="w-full h-1.5 bg-[#141414] rounded-full overflow-hidden border border-[#222222]">
                <div
                  style={{ width: `${checklistPercent}%` }}
                  className="h-full bg-white rounded-full transition-all duration-300"
                />
              </div>

              {/* Step Checklist Items */}
              <div className="space-y-3 pt-2">
                {/* Step 1: Connect Account */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#111111] border border-[#1f1f1f]">
                  <div className="flex items-center gap-3">
                    {step1Done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-zinc-600 shrink-0" />
                    )}
                    <div>
                      <p className={`text-xs font-medium ${step1Done ? "text-zinc-200" : "text-zinc-400"}`}>
                        1. Connect your professional Instagram account
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {step1Done ? `Connected as @${currentAccount?.pageName}` : "Link your Creator or Business account"}
                      </p>
                    </div>
                  </div>
                  {!step1Done && (
                    <Link
                      href="/dashboard/accounts"
                      className="text-xs text-white hover:underline font-medium"
                    >
                      Connect &rarr;
                    </Link>
                  )}
                </div>

                {/* Step 2: Create First Rule */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#111111] border border-[#1f1f1f]">
                  <div className="flex items-center gap-3">
                    {step2Done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-zinc-600 shrink-0" />
                    )}
                    <div>
                      <p className={`text-xs font-medium ${step2Done ? "text-zinc-200" : "text-zinc-400"}`}>
                        2. Create your first automation rule
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {step2Done ? `${automationsCount} active rules configured` : "Choose a template or build custom keywords"}
                      </p>
                    </div>
                  </div>
                  {!step2Done && (
                    <Link
                      href="/dashboard/automations/builder"
                      className="text-xs text-white hover:underline font-medium"
                    >
                      Create &rarr;
                    </Link>
                  )}
                </div>

                {/* Step 3: Test Real-Time Trigger */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#111111] border border-[#1f1f1f]">
                  <div className="flex items-center gap-3">
                    {step3Done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-zinc-600 shrink-0" />
                    )}
                    <div>
                      <p className={`text-xs font-medium ${step3Done ? "text-zinc-200" : "text-zinc-400"}`}>
                        3. Trigger your first real-time DM
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {step3Done ? `${totalDmsCount} DMs successfully delivered` : "Leave a test comment on your post to test AutoDMs"}
                      </p>
                    </div>
                  </div>
                  {step3Done && (
                    <Link
                      href="/dashboard/logs"
                      className="text-xs text-zinc-400 hover:text-white font-medium"
                    >
                      View logs &rarr;
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1F1F1F] flex items-center justify-between text-xs text-zinc-500">
              <span>All steps completed?</span>
              <Link
                href="/dashboard/automations"
                className="text-white hover:underline font-medium"
              >
                Manage automations &rarr;
              </Link>
            </div>
          </div>

          {/* Right Card: Quick Automation Builder Card */}
          <div className="bg-[#0A0A0A] border border-[#222222] rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#141414] border border-[#262626] flex items-center justify-center text-zinc-300">
                <Zap className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">Create custom automation</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Design complex triggers with multiple keyword variants, specific post targets, story mention rewards, and lead capture forms.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/dashboard/automations/builder"
                className="w-full h-10 bg-white hover:bg-zinc-200 text-black font-medium rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Open automation builder</span>
              </Link>
              <Link
                href="/dashboard/templates"
                className="w-full h-10 bg-[#111111] hover:bg-[#161616] text-zinc-300 hover:text-white border border-[#262626] font-medium rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <span>Browse template library</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
