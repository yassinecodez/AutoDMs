import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { PLANS } from "@/lib/plans";
import UpgradeButton from "@/components/UpgradeButton";
import { CreditCard, Zap, Check, Users } from "lucide-react";
import { getActiveAccount, getAllUserAccounts } from "@/lib/activeAccount";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId: string = session.user.id;

  const [user, activeAccount, allAccounts] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        planType: true,
        agencyMaxAccounts: true,
        dmsLimit: true,
        dmsCountThisMonth: true,
        usageResetAt: true,
      },
    }),
    getActiveAccount(userId),
    getAllUserAccounts(userId),
  ]);

  if (!user) {
    redirect("/login");
  }

  const currentWorkspace = activeAccount || allAccounts[0] || null;
  const workspaceDmsCount = currentWorkspace ? currentWorkspace.dmsCountThisMonth : user.dmsCountThisMonth;
  const workspaceDmsLimit = currentWorkspace ? currentWorkspace.dmsLimit : (user.planType === "BUSINESS" ? 15000 : (user.planType === "PRO" ? 3000 : 150));

  const baseDate = currentWorkspace?.usageResetAt ? new Date(currentWorkspace.usageResetAt) : (user.usageResetAt ? new Date(user.usageResetAt) : new Date());
  const resetDate = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  const resetDateFormatted = resetDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const maxAllowedAccounts = user.planType === "BUSINESS" ? 3 : 1;
  const currentPlanDetails = PLANS[user.planType] || PLANS.FREE;
  const remainingDms = Math.max(0, workspaceDmsLimit - workspaceDmsCount);
  const usagePercentage = Math.min(
    Math.round((workspaceDmsCount / workspaceDmsLimit) * 100),
    100
  );

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div className="space-y-1 pb-4 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Billing & Plans</h1>
        <p className="text-sm text-muted-foreground">
          Manage your subscription tier, workspace direct message throughput, and multi-profile agency slots.
        </p>
      </div>

      {/* Grid: Monthly Workspace Usage & Multi-Account Agency Meter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Active Workspace Monthly Usage */}
        <div className="p-6 bg-card border border-border rounded-2xl space-y-4 shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-muted-foreground" />
                Workspace usage
              </h2>
              <p className="text-xs text-muted-foreground">
                {currentWorkspace ? `@${currentWorkspace.pageName} monthly DM quota` : "Current workspace allowance"}
              </p>
            </div>
            <div className="px-3 py-1 rounded-lg bg-secondary border border-border text-foreground text-xs font-semibold">
              {currentPlanDetails.name}
            </div>
          </div>

          {/* Progress bar container */}
          <div className="space-y-2 pt-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-muted-foreground">
                <strong className="text-foreground font-bold">{workspaceDmsCount}</strong> of {workspaceDmsLimit} DMs
              </span>
              <span className="text-muted-foreground font-medium">{remainingDms} remaining</span>
            </div>
            
            <div className="w-full h-2 bg-secondary border border-border rounded-full overflow-hidden">
              <div
                style={{ width: `${usagePercentage}%` }}
                className="h-full transition-all duration-300 rounded-full bg-primary"
              />
            </div>

            <div className="text-xs text-muted-foreground pt-0.5 font-normal">
              Resets on {resetDateFormatted} • No hidden overage fees
            </div>
          </div>
        </div>

        {/* Card 2: Connected Instagram Profiles (Agency Slots) */}
        <div className="p-6 bg-card border border-border rounded-2xl space-y-4 shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Users className="w-4 h-4 text-muted-foreground" />
                Connected profiles
              </h2>
              <p className="text-xs text-muted-foreground">
                {user.planType === "BUSINESS"
                  ? "Agency Plan: Multi-account capacity (up to 3 profiles)"
                  : "Single profile connected. Upgrade to Agency for up to 3."}
              </p>
            </div>
            <div className="px-3 py-1 rounded-lg bg-secondary border border-border text-foreground text-xs font-semibold">
              {allAccounts.length} / {maxAllowedAccounts} {maxAllowedAccounts === 1 ? "Slot" : "Slots"}
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-muted-foreground">
                <strong className="text-foreground font-bold">{allAccounts.length}</strong> active profiles
              </span>
              <span className="text-muted-foreground font-medium">
                {Math.max(0, maxAllowedAccounts - allAccounts.length)} slots available
              </span>
            </div>

            <div className="w-full h-2 bg-secondary border border-border rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(100, Math.round((allAccounts.length / maxAllowedAccounts) * 100))}%` }}
                className="h-full transition-all duration-300 rounded-full bg-primary"
              />
            </div>

            <div className="text-xs text-muted-foreground pt-0.5 font-normal">
              {user.planType === "BUSINESS" ? "Agency license active" : "Upgrade to Business/Agency to link 3 accounts"}
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Pricing Tiers */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-muted-foreground" />
          Subscription plans
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: FREE Starter */}
          <div className={`p-6 bg-card rounded-2xl flex flex-col justify-between h-[380px] border transition-all shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] ${
            user.planType === "FREE"
              ? "border-zinc-900 dark:border-white/40 ring-1 ring-zinc-900/20 dark:ring-white/20 shadow-md"
              : "border-border hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-[#0D0D0D]"
          }`}>
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground">Free Starter</span>
                <h3 className="text-base font-bold text-foreground">Free Starter</h3>
                <p className="text-xs text-muted-foreground leading-normal">Essential comment triggers for creators getting started.</p>
              </div>
              <div className="space-y-0.5 py-1">
                <p className="text-2xl font-bold text-foreground tracking-tight">$0 <span className="text-xs font-normal text-muted-foreground">/ month</span></p>
                <p className="text-[10px] text-muted-foreground font-medium">0 DH / month</p>
              </div>
              <ul className="text-xs space-y-2 text-muted-foreground border-t border-border pt-4">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-foreground shrink-0" strokeWidth={2} />
                  <span>150 automated DMs per month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-foreground shrink-0" strokeWidth={2} />
                  <span>Connect 1 Instagram profile</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-foreground shrink-0" strokeWidth={2} />
                  <span>Keyword matching for comments & DMs</span>
                </li>
              </ul>
            </div>
            <UpgradeButton plan="FREE" current={user.planType === "FREE"} />
          </div>

          {/* Card 2: Creator PRO */}
          <div className={`p-6 bg-card rounded-2xl flex flex-col justify-between h-[380px] border transition-all relative shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] ${
            user.planType === "PRO"
              ? "border-zinc-900 dark:border-white/40 ring-1 ring-zinc-900/20 dark:ring-white/20 shadow-md"
              : "border-border hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-[#0D0D0D]"
          }`}>
            {user.planType !== "PRO" && (
              <span className="absolute -top-2.5 right-5 px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground font-semibold text-[10px] tracking-tight shadow-md">
                Popular
              </span>
            )}

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground">Creator Pro</span>
                <h3 className="text-base font-bold text-foreground">Creator Pro</h3>
                <p className="text-xs text-muted-foreground leading-normal">High-volume growth engine with story rewards & leads.</p>
              </div>
              <div className="space-y-0.5 py-1">
                <p className="text-2xl font-bold text-foreground tracking-tight">$5 <span className="text-xs font-normal text-muted-foreground">/ month</span></p>
                <p className="text-[10px] text-muted-foreground font-medium">50 DH / month</p>
              </div>
              <ul className="text-xs space-y-2 text-muted-foreground border-t border-border pt-4">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-foreground shrink-0" strokeWidth={2} />
                  <span>3,000 automated DMs per month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-foreground shrink-0" strokeWidth={2} />
                  <span>Connect 1 Instagram profile</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-foreground shrink-0" strokeWidth={2} />
                  <span>Story mentions & Reel triggers</span>
                </li>
              </ul>
            </div>
            <UpgradeButton plan="PRO" current={user.planType === "PRO"} />
          </div>

          {/* Card 3: Business/Agency */}
          <div className={`p-6 bg-card rounded-2xl flex flex-col justify-between h-[380px] border transition-all shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] ${
            user.planType === "BUSINESS"
              ? "border-zinc-900 dark:border-white/40 ring-1 ring-zinc-900/20 dark:ring-white/20 shadow-md"
              : "border-border hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-[#0D0D0D]"
          }`}>
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground">Business / Agency</span>
                <h3 className="text-base font-bold text-foreground">Business / Agency</h3>
                <p className="text-xs text-muted-foreground leading-normal">Multi-account scale for agencies and fast-growing brands.</p>
              </div>
              <div className="space-y-0.5 py-1">
                <p className="text-2xl font-bold text-foreground tracking-tight">$15 <span className="text-xs font-normal text-muted-foreground">/ month</span></p>
                <p className="text-[10px] text-muted-foreground font-medium">150 DH / month</p>
              </div>
              <ul className="text-xs space-y-2 text-muted-foreground border-t border-border pt-4">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-foreground shrink-0" strokeWidth={2} />
                  <span>15,000 automated DMs per month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-foreground shrink-0" strokeWidth={2} />
                  <span>Connect up to 3 Instagram profiles</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-foreground shrink-0" strokeWidth={2} />
                  <span>Priority 24/7 Agency support</span>
                </li>
              </ul>
            </div>
            <UpgradeButton plan="BUSINESS" current={user.planType === "BUSINESS"} />
          </div>
        </div>
      </div>
    </div>
  );
}
