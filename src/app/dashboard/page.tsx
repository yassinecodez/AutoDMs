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
      {/* SECTION 1.5: 4-Column Stat Metric Cards */}
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
      {/* SECTION 2: "Quick Automations" (Starter Templates Grid) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Start here
          </h2>
          <Link
            href="/dashboard/automations"
            className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
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
                className="bg-card hover:bg-zinc-50 dark:hover:bg-[#0D0D0D] border border-border hover:border-zinc-300 dark:hover:border-zinc-700 rounded-2xl p-6 transition-all duration-200 cursor-pointer group flex flex-col justify-between min-h-[200px] shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-foreground group-hover:border-zinc-400 dark:group-hover:border-zinc-500 transition-colors">
                      <Icon className="w-5 h-5" strokeWidth={1.75} />
                    </div>
                    {template.tag && (
                      <span className="bg-secondary border border-border text-foreground text-xs px-2.5 py-0.5 rounded-full font-medium">
                        {template.tag}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                      {template.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {template.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex items-center text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
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
        <h2 className="text-base font-semibold text-foreground">
          Your next steps
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Card: Setup Progress Checklist */}
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

          {/* Right Card: How AutoDMs Works Explanation */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5 flex flex-col justify-between shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">How comment-to-DM works</h3>
                <p className="text-xs text-muted-foreground">Three automated steps to convert engagement into revenue</p>
              </div>

              <div className="space-y-3 pt-1">
                <div className="p-3.5 rounded-xl bg-secondary/50 border border-border flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-secondary border border-border flex items-center justify-center text-xs font-semibold text-foreground shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-foreground">Follower comments on your post or reel</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      You publish content asking followers to comment a keyword (e.g. &quot;LINK&quot; or &quot;PRICE&quot;).
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-secondary/50 border border-border flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-secondary border border-border flex items-center justify-center text-xs font-semibold text-foreground shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-foreground">AutoDMs delivers instant DM & public reply</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Our official Meta webhook triggers within seconds to send the DM and leave a public reply comment.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-secondary/50 border border-border flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-secondary border border-border flex items-center justify-center text-xs font-semibold text-foreground shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-foreground">Capture contacts and track conversions</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Followers receive direct buttons to your website, store, or lead capture forms automatically.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/dashboard/automations?tab=templates"
                className="w-full h-10 rounded-xl border border-border hover:bg-secondary text-foreground font-medium text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <span>Browse starter templates</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
