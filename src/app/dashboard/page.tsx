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
} from "lucide-react";
import { getActiveAccount } from "@/lib/activeAccount";
import { PLANS } from "@/lib/plans";

export const dynamic = "force-dynamic";

export default async function DashboardOverview() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId: string = session.user.id;

  const activeAccount = await getActiveAccount(userId);

  // Parallelize metrics queries
  const [
    user,
    accounts,
    automationsCount,
    capturedLeadsCount,
    totalLogsCount,
    deliveredLogsCount,
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
      tag: "High conversion",
      description: "Automatically reward followers with coupon codes or links when they mention you in stories.",
      icon: Sparkles,
      href: "/dashboard/automations/builder?template=story_mention",
    },
    {
      id: "dms",
      title: "Respond to all your DMs",
      tag: "Instant reply",
      description: "Send instant automated replies and lead capture forms to direct message inquiries.",
      icon: Inbox,
      href: "/dashboard/automations/builder?template=direct_dm",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* ========================================================================= */}
      {/* SECTION 1: Personalized First-Name Greeting */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#222222]">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Hello, {firstName}!
          </h1>
          <p className="text-sm text-zinc-400">
            Monitor incoming leads, auto-DMs, and conversation triggers in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {accounts.length === 0 ? (
            <Link
              href="/dashboard/accounts"
              className="h-10 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Connect Instagram profile</span>
            </Link>
          ) : (
            <Link
              href="/dashboard/automations/builder"
              className="h-10 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
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
            <p className="text-xs text-zinc-500 mt-0.5">Automated direct deliveries</p>
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
            <p className="text-xs text-zinc-500 mt-0.5">Live triggers running</p>
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
            <p className="text-xs text-zinc-500 mt-0.5">Emails & phone numbers</p>
          </div>
        </div>

        {/* Card 4: Quota Usage */}
        <div className="p-5 bg-[#0A0A0A] border border-[#222222] rounded-2xl space-y-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:border-zinc-700 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Monthly usage</span>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#161616] border border-[#262626] text-zinc-300">
              {planDetails.name}
            </span>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white tracking-tight">{dmsUsed}</span>
                <span className="text-xs text-zinc-500">/ {dmsLimit} DMs</span>
              </div>
              <span className="text-xs text-zinc-400 font-medium">{Math.max(0, dmsLimit - dmsUsed)} left</span>
            </div>
            <div className="w-full h-1.5 bg-[#141414] rounded-full overflow-hidden mt-2.5 border border-[#222222]">
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
          <h2 className="text-base font-semibold text-zinc-100">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {quickTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <Link
                key={template.id}
                href={template.href}
                className="bg-[#0A0A0A] hover:bg-[#0D0D0D] border border-[#222222] hover:border-zinc-700 rounded-2xl p-6 transition-all duration-200 cursor-pointer group flex flex-col justify-between min-h-[200px] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#141414] border border-[#262626] flex items-center justify-center text-zinc-300 group-hover:text-white group-hover:border-zinc-500 transition-colors">
                      <Icon className="w-5 h-5" strokeWidth={1.75} />
                    </div>
                    {template.tag && (
                      <span className="bg-[#181818] border border-[#2b2b2b] text-zinc-300 text-xs px-2.5 py-0.5 rounded-full font-medium">
                        {template.tag}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-semibold text-white group-hover:text-white transition-colors">
                      {template.title}
                    </h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      {template.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex items-center text-xs font-medium text-zinc-400 group-hover:text-white transition-colors">
                  <span>Use template</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 transform group-hover:translate-x-1 transition-transform stroke-[2.5]" />
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
        <h2 className="text-base font-semibold text-zinc-100">
          Your next steps
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Card: Setup Progress Checklist */}
          <div className="bg-[#0A0A0A] border border-[#222222] rounded-2xl p-6 space-y-5 flex flex-col justify-between shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">Getting started</h3>
                  <p className="text-xs text-zinc-400">Complete setup to launch your Instagram pipeline</p>
                </div>
                <span className="text-xs font-medium text-zinc-300 bg-[#141414] border border-[#222222] px-3 py-1 rounded-full">
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
              <div className="space-y-3 pt-1">
                {/* Step 1: Connect Account */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#111111] border border-[#1f1f1f]">
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
                      <p className="text-xs text-zinc-500">
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
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#111111] border border-[#1f1f1f]">
                  <div className="flex items-center gap-3">
                    {step2Done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-zinc-600 shrink-0" />
                    )}
                    <div>
                      <p className={`text-xs font-medium ${step2Done ? "text-zinc-200" : "text-zinc-400"}`}>
                        2. Create your first auto-DM rule
                      </p>
                      <p className="text-xs text-zinc-500">
                        {step2Done ? `${automationsCount} active automation(s) live` : "Set a trigger keyword and reply message"}
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

                {/* Step 3: Test on Instagram */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#111111] border border-[#1f1f1f]">
                  <div className="flex items-center gap-3">
                    {step3Done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-zinc-600 shrink-0" />
                    )}
                    <div>
                      <p className={`text-xs font-medium ${step3Done ? "text-zinc-200" : "text-zinc-400"}`}>
                        3. Test and send your first DM
                      </p>
                      <p className="text-xs text-zinc-500">
                        {step3Done ? `${totalLogsCount} total interaction(s) recorded` : "Comment on your post from a test account"}
                      </p>
                    </div>
                  </div>
                  {!step3Done && (
                    <Link
                      href="/dashboard/logs"
                      className="text-xs text-white hover:underline font-medium"
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
                className="w-full h-10 rounded-xl bg-white hover:bg-zinc-200 text-black font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <span>Launch new automation</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Card: How AutoDMs Works Explanation */}
          <div className="bg-[#0A0A0A] border border-[#222222] rounded-2xl p-6 space-y-5 flex flex-col justify-between shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">How comment-to-DM works</h3>
                <p className="text-xs text-zinc-400">Three automated steps to convert engagement into revenue</p>
              </div>

              <div className="space-y-3 pt-1">
                <div className="p-3.5 rounded-xl bg-[#111111] border border-[#1f1f1f] flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#181818] border border-[#282828] flex items-center justify-center text-xs font-semibold text-white shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-white">Follower comments on your post or reel</p>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      You publish content asking followers to comment a keyword (e.g. "LINK" or "PRICE").
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#111111] border border-[#1f1f1f] flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#181818] border border-[#282828] flex items-center justify-center text-xs font-semibold text-white shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-white">AutoDMs delivers instant DM & public reply</p>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Our official Meta webhook triggers within seconds to send the DM and leave a public reply comment.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#111111] border border-[#1f1f1f] flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#181818] border border-[#282828] flex items-center justify-center text-xs font-semibold text-white shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-white">Capture contacts and track conversions</p>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Followers receive direct buttons to your website, store, or lead capture forms automatically.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/dashboard/automations?tab=templates"
                className="w-full h-10 rounded-xl border border-[#262626] hover:bg-[#111111] text-zinc-200 font-medium text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <span>Browse starter templates</span>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
