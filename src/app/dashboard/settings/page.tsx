import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { PLANS } from "@/lib/plans";
import UpgradeButton from "@/components/UpgradeButton";
import { CreditCard, Zap, Check } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }
  const userId = session.user.id;

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
  const diffTime = resetDate.getTime() - Date.now();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const resetsInDays = daysLeft > 0 ? daysLeft : 0;

  const currentPlanDetails = PLANS[user.planType] || PLANS.FREE;
  const usagePercentage = Math.min(
    Math.round((user.dmsCountThisMonth / user.dmsLimit) * 100),
    100
  );

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div className="space-y-1 pb-4 border-b border-[#222222]">
        <h1 className="text-2xl font-bold text-white tracking-tight">Billing & limits</h1>
        <p className="text-sm text-zinc-400">
          Monitor your Direct Message quota consumption and manage your subscription tier
        </p>
      </div>

      {/* Usage Meter Card */}
      <div className="p-6 bg-[#0A0A0A] border border-[#222222] rounded-2xl space-y-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-zinc-300" />
              SaaS quota meter
            </h2>
            <p className="text-xs text-zinc-400">
              Usage cycles automatically reset every 30 days.
            </p>
          </div>
          <div className="px-3 py-1 rounded-lg bg-[#111111] border border-[#262626] text-white text-xs font-medium w-fit">
            Current tier: {currentPlanDetails.name}
          </div>
        </div>

        {/* Progress bar container */}
        <div className="space-y-2 pt-1">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-zinc-400">
              DMs dispatched: <strong className="text-white font-semibold">{user.dmsCountThisMonth}</strong> / {user.dmsLimit}
            </span>
            <span className="text-zinc-300 font-medium">{usagePercentage}% consumed</span>
          </div>
          
          <div className="w-full h-2 bg-[#111111] border border-[#222222] rounded-full overflow-hidden">
            <div
              style={{ width: `${usagePercentage}%` }}
              className="h-full transition-all duration-300 rounded-full bg-white"
            />
          </div>

          <div className="text-[11px] text-zinc-500 pt-0.5 text-right font-medium">
            Cycle resets in <strong className="text-zinc-300">{resetsInDays} days</strong> ({new Date(resetDate).toLocaleDateString()})
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
                <span className="text-[11px] font-medium text-zinc-400">Starter tier</span>
                <h3 className="text-base font-bold text-white">Free Starter</h3>
                <p className="text-xs text-zinc-400 leading-normal">Basic triggers for content creators.</p>
              </div>
              <div className="space-y-0.5 py-1">
                <p className="text-2xl font-bold text-white tracking-tight">$0 <span className="text-xs font-normal text-zinc-500">/ forever</span></p>
                <p className="text-[10px] text-zinc-500 font-medium">0 DH per month</p>
              </div>
              <ul className="text-xs space-y-2 text-zinc-300 border-t border-[#1F1F1F] pt-4">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" strokeWidth={2} />
                  <span>150 DMs / month quota</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" strokeWidth={2} />
                  <span>Link 1 IG Business profile</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" strokeWidth={2} />
                  <span>Basic keyword matching</span>
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
                <span className="text-[11px] font-medium text-zinc-400">Professional tier</span>
                <h3 className="text-base font-bold text-white">Creator Pro</h3>
                <p className="text-xs text-zinc-400 leading-normal">High volume triggers & story rewards.</p>
              </div>
              <div className="space-y-0.5 py-1">
                <p className="text-2xl font-bold text-white tracking-tight">$5 <span className="text-xs font-normal text-zinc-500">/ month</span></p>
                <p className="text-[10px] text-zinc-400 font-medium">50 DH per month</p>
              </div>
              <ul className="text-xs space-y-2 text-zinc-300 border-t border-[#1F1F1F] pt-4">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" strokeWidth={2} />
                  <span>3,000 DMs / month quota</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" strokeWidth={2} />
                  <span>Story mentions triggers</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" strokeWidth={2} />
                  <span>Lead capture & CSV export</span>
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
                <span className="text-[11px] font-medium text-zinc-400">Agency tier</span>
                <h3 className="text-base font-bold text-white">Business / Agency</h3>
                <p className="text-xs text-zinc-400 leading-normal">Multi-account scale for agencies & brands.</p>
              </div>
              <div className="space-y-0.5 py-1">
                <p className="text-2xl font-bold text-white tracking-tight">$15 <span className="text-xs font-normal text-zinc-500">/ month</span></p>
                <p className="text-[10px] text-zinc-400 font-medium">150 DH per month</p>
              </div>
              <ul className="text-xs space-y-2 text-zinc-300 border-t border-[#1F1F1F] pt-4">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" strokeWidth={2} />
                  <span>15,000 DMs / month quota</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" strokeWidth={2} />
                  <span>Link up to 3 IG accounts</span>
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
