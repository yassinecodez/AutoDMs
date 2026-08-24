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

export const dynamic = "force-dynamic";

export default async function DashboardOverview() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }
  const userId = session.user.id;

  const [
    accounts,
    automationsCount,
    totalLogsCount,
    totalDmsCount,
    capturedLeadsCount,
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
      where: { userId },
    }),
    db.executionLog.count({
      where: {
        automation: { userId },
      },
    }),
    db.executionLog.count({
      where: {
        automation: { userId },
        dmStatus: "SUCCESS",
      },
    }),
    db.lead.count({
      where: {
        igAccount: { userId },
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

  const primaryAccount = accounts[0];
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
            {primaryAccount ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#111111] border border-[#222222] font-medium text-zinc-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  @{primaryAccount.pageName}
                  <span className="text-zinc-500">•</span>
                  <span className="text-emerald-400">Connected</span>
                </span>
                <Link
                  href="/dashboard/logs"
                  className="text-zinc-400 hover:text-white transition-colors underline-offset-4 hover:underline ml-1"
                >
                  View Activity Logs &rarr;
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#111111] border border-amber-900/40 text-amber-300 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  No Instagram account connected
                </span>
                <span className="text-zinc-600">•</span>
                <Link
                  href="/dashboard/accounts"
                  className="text-white hover:text-zinc-300 font-medium transition-colors underline-offset-4 hover:underline"
                >
                  Connect Profile &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/dashboard/automations/builder"
            className="inline-flex items-center gap-2 h-10 px-4 bg-white hover:bg-zinc-200 text-black font-medium rounded-lg text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            New automation
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: "Quick Automations" (Starter Templates Grid) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
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
                      <span className="bg-[#181818] border border-[#2b2b2b] text-zinc-300 text-[10px] px-2.5 py-0.5 rounded-full font-medium font-mono">
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
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Your next steps
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Card: Setup Progress Checklist */}
          <div className="bg-[#0A0A0A] border border-[#222222] rounded-2xl p-6 space-y-5 flex flex-col justify-between shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Getting Started</h3>
                  <p className="text-xs text-zinc-400">Complete setup to launch your Instagram pipeline</p>
                </div>
                <span className="text-xs font-medium text-zinc-400 bg-[#141414] border border-[#222222] px-2.5 py-1 rounded-full">
                  {completedSteps} of 3 completed
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#181818] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-white h-full transition-all duration-500 rounded-full"
                  style={{ width: `${checklistPercent}%` }}
                />
              </div>

              {/* Checklist Items */}
              <div className="space-y-3 pt-2">
                {/* Step 1: Connect Account */}
                <div className="flex items-start justify-between p-3 rounded-lg bg-[#111111]/70 border border-[#222222]/80">
                  <div className="flex items-start gap-3">
                    {step1Done ? (
                      <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`text-xs font-medium ${step1Done ? "text-zinc-200 line-through" : "text-white"}`}>
                        Connect Instagram Business Account
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {step1Done
                          ? `Connected as @${primaryAccount?.pageName}`
                          : "Link your Meta Facebook Page & Instagram account"}
                      </p>
                    </div>
                  </div>
                  {!step1Done && (
                    <Link
                      href="/dashboard/accounts"
                      className="text-xs font-medium text-white hover:underline shrink-0 ml-2"
                    >
                      Connect &rarr;
                    </Link>
                  )}
                </div>

                {/* Step 2: Create Automation */}
                <div className="flex items-start justify-between p-3 rounded-lg bg-[#111111]/70 border border-[#222222]/80">
                  <div className="flex items-start gap-3">
                    {step2Done ? (
                      <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`text-xs font-medium ${step2Done ? "text-zinc-200 line-through" : "text-white"}`}>
                        Create your first Automation rule
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {step2Done
                          ? `${automationsCount} active automation${automationsCount > 1 ? "s" : ""} configured`
                          : "Set keyword triggers, instant DMs, and public replies"}
                      </p>
                    </div>
                  </div>
                  {!step2Done && (
                    <Link
                      href="/dashboard/automations/builder"
                      className="text-xs font-medium text-white hover:underline shrink-0 ml-2"
                    >
                      Build &rarr;
                    </Link>
                  )}
                </div>

                {/* Step 3: Test Live */}
                <div className="flex items-start justify-between p-3 rounded-lg bg-[#111111]/70 border border-[#222222]/80">
                  <div className="flex items-start gap-3">
                    {step3Done ? (
                      <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`text-xs font-medium ${step3Done ? "text-zinc-200 line-through" : "text-white"}`}>
                        Test on a live Reel or Post
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {step3Done
                          ? `${totalLogsCount} total dispatches recorded`
                          : "Leave a test comment on your Instagram post to verify delivery"}
                      </p>
                    </div>
                  </div>
                  {step3Done ? (
                    <Link
                      href="/dashboard/logs"
                      className="text-xs font-medium text-zinc-400 hover:text-white shrink-0 ml-2"
                    >
                      Logs &rarr;
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard/logs"
                      className="text-xs font-medium text-zinc-400 hover:text-white shrink-0 ml-2"
                    >
                      View stream &rarr;
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Card: Monthly Plan & DM Usage */}
          <div className="bg-[#0A0A0A] border border-[#222222] rounded-2xl p-6 space-y-5 flex flex-col justify-between shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Monthly DM Usage</h3>
                  <p className="text-xs text-zinc-400">Current cycle automation dispatches</p>
                </div>
                <span className="text-xs font-semibold text-white bg-[#141414] border border-[#262626] px-2.5 py-1 rounded-md">
                  {planDetails.name}
                </span>
              </div>

              {/* Quota Progress */}
              <div className="space-y-2 pt-1">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-2xl font-bold text-white tracking-tight">
                    {dmsUsed.toLocaleString()}
                    <span className="text-sm font-normal text-zinc-500 ml-1.5">
                      / {dmsLimit.toLocaleString()} DMs
                    </span>
                  </span>
                  <span className="text-xs font-medium text-zinc-400">
                    {usagePercent}% used
                  </span>
                </div>

                <div className="w-full bg-[#181818] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      usagePercent >= 90
                        ? "bg-red-500"
                        : usagePercent >= 75
                        ? "bg-amber-500"
                        : "bg-white"
                    }`}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>

                <p className="text-[11px] text-zinc-500 pt-1">
                  Usage resets automatically every 30 days. No hidden overage charges.
                </p>
              </div>

              {/* Key Quick Stats */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-[#111111] border border-[#222222]">
                  <p className="text-[11px] text-zinc-500 font-medium">Delivered DMs</p>
                  <p className="text-lg font-bold text-white mt-0.5">{totalDmsCount.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-[#111111] border border-[#222222]">
                  <p className="text-[11px] text-zinc-500 font-medium">Captured Leads</p>
                  <p className="text-lg font-bold text-white mt-0.5">{capturedLeadsCount.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/dashboard/settings"
                className="w-full inline-flex items-center justify-center gap-1.5 h-10 bg-white hover:bg-zinc-200 text-black font-medium rounded-lg text-xs transition-colors shadow-sm"
              >
                Upgrade Plan &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
