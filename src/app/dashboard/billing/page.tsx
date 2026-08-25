import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { PLANS } from "@/lib/plans";
import UpgradeButton from "@/components/UpgradeButton";
import { CreditCard, Zap, Check } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId: string = session.user.id;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      planType: true,
      dmsLimit: true,
      dmsCountThisMonth: true,
      usageResetAt: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const baseDate = user.usageResetAt ? new Date(user.usageResetAt) : new Date();
  const resetDate = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  const resetDateFormatted = resetDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const currentPlanDetails = PLANS[user.planType] || PLANS.FREE;
  const remainingDms = Math.max(0, user.dmsLimit - user.dmsCountThisMonth);
  const usagePercentage = Math.min(
    Math.round((user.dmsCountThisMonth / user.dmsLimit) * 100),
    100
  );

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div className="space-y-1 pb-4 border-b border-[#222222]">
        <h1 className="text-2xl font-bold text-white tracking-tight">Billing & Plans</h1>
        <p className="text-sm text-zinc-400">
          Manage your subscription tier, monthly direct message throughput, and invoices.
        </p>
      </div>

      {/* Monthly Usage Card */}
      <div className="p-6 bg-[#0A0A0A] border border-[#222222] rounded-2xl space-y-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-zinc-300" />
              Monthly usage
            </h2>
            <p className="text-xs text-zinc-400">
              Track your direct message allowance for this billing period.
            </p>
          </div>
          <div className="px-3 py-1 rounded-lg bg-[#111111] border border-[#262626] text-zinc-300 text-xs font-medium w-fit">
            Current plan: <span className="text-white font-semibold">{currentPlanDetails.name}</span>
          </div>
        </div>

        {/* Progress bar container */}
        <div className="space-y-2 pt-1">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-zinc-400">
              <strong className="text-white font-bold">{user.dmsCountThisMonth}</strong> of {user.dmsLimit} DMs sent
            </span>
            <span className="text-zinc-400 font-medium">{remainingDms} remaining</span>
          </div>
          
          <div className="w-full h-2 bg-[#111111] border border-[#222222] rounded-full overflow-hidden">
            <div
              style={{ width: `${usagePercentage}%` }}
              className="h-full transition-all duration-300 rounded-full bg-white"
            />
          </div>

          <div className="text-xs text-zinc-500 pt-0.5 font-normal">
            Resets on {resetDateFormatted} • No hidden overage fees
          </div>
        </div>
      </div>

      {/* Subscription Pricing Tiers */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-zinc-400" />
          Subscription plans
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: FREE Starter */}
          <div className={`p-6 bg-[#0A0A0A] rounded-2xl flex flex-col justify-between h-[380px] border transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] ${
            user.planType === "FREE"
              ? "border-white/40 ring-1 ring-white/20 shadow-xl"
              : "border-[#222222] hover:border-zinc-700 hover:bg-[#0D0D0D]"
          }`}>
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-zinc-400">Free Starter</span>
                <h3 className="text-base font-bold text-white">Free Starter</h3>
                <p className="text-xs text-zinc-400 leading-normal">Essential comment triggers for creators getting started.</p>
              </div>
              <div className="space-y-0.5 py-1">
                <p className="text-2xl font-bold text-white tracking-tight">$0 <span className="text-xs font-normal text-zinc-500">/ month</span></p>
                <p className="text-[10px] text-zinc-500 font-medium">0 DH / month</p>
              </div>
              <ul className="text-xs space-y-2 text-zinc-300 border-t border-[#1F1F1F] pt-4">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" strokeWidth={2} />
                  <span>150 automated DMs per month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" strokeWidth={2} />
                  <span>Connect 1 Instagram profile</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" strokeWidth={2} />
                  <span>Keyword matching for comments & DMs</span>
                </li>
              </ul>
            </div>
            <UpgradeButton plan="FREE" current={user.planType === "FREE"} />
          </div>

          {/* Card 2: Creator PRO */}
          <div className={`p-6 bg-[#0A0A0A] rounded-2xl flex flex-col justify-between h-[380px] border transition-all relative shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] ${
            user.planType === "PRO"
              ? "border-white/40 ring-1 ring-white/20 shadow-xl"
              : "border-[#222222] hover:border-zinc-700 hover:bg-[#0D0D0D]"
          }`}>
            {user.planType !== "PRO" && (
              <span className="absolute -top-2.5 right-5 px-2.5 py-0.5 rounded-full bg-white text-black font-semibold text-[10px] tracking-tight shadow-md">
                Popular
              </span>
            )}

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-zinc-400">Creator Pro</span>
                <h3 className="text-base font-bold text-white">Creator Pro</h3>
                <p className="text-xs text-zinc-400 leading-normal">High-volume growth engine with story rewards & leads.</p>
              </div>
              <div className="space-y-0.5 py-1">
                <p className="text-2xl font-bold text-white tracking-tight">$5 <span className="text-xs font-normal text-zinc-500">/ month</span></p>
                <p className="text-[10px] text-zinc-400 font-medium">50 DH / month</p>
              </div>
              <ul className="text-xs space-y-2 text-zinc-300 border-t border-[#1F1F1F] pt-4">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" strokeWidth={2} />
                  <span>3,000 automated DMs per month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" strokeWidth={2} />
                  <span>Story mentions & Reel triggers</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" strokeWidth={2} />
                  <span>Lead capture with instant CSV export</span>
                </li>
              </ul>
            </div>
            <UpgradeButton plan="PRO" current={user.planType === "PRO"} />
          </div>

          {/* Card 3: Business/Agency */}
          <div className={`p-6 bg-[#0A0A0A] rounded-2xl flex flex-col justify-between h-[380px] border transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] ${
            user.planType === "BUSINESS"
              ? "border-white/40 ring-1 ring-white/20 shadow-xl"
              : "border-[#222222] hover:border-zinc-700 hover:bg-[#0D0D0D]"
          }`}>
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-zinc-400">Business / Agency</span>
                <h3 className="text-base font-bold text-white">Business / Agency</h3>
                <p className="text-xs text-zinc-400 leading-normal">Multi-account scale for agencies and fast-growing brands.</p>
              </div>
              <div className="space-y-0.5 py-1">
                <p className="text-2xl font-bold text-white tracking-tight">$15 <span className="text-xs font-normal text-zinc-500">/ month</span></p>
                <p className="text-[10px] text-zinc-400 font-medium">150 DH / month</p>
              </div>
              <ul className="text-xs space-y-2 text-zinc-300 border-t border-[#1F1F1F] pt-4">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" strokeWidth={2} />
                  <span>15,000 automated DMs per month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" strokeWidth={2} />
                  <span>Connect up to 3 Instagram profiles</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" strokeWidth={2} />
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
