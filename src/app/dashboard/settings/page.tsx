import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { PLANS } from "@/lib/plans";
import UpgradeButton from "@/components/UpgradeButton";
import { CreditCard, Zap, Sparkles, Check } from "lucide-react";

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

  const resetDate = new Date(user.usageResetAt);
  resetDate.setDate(resetDate.getDate() + 30);
  const diffTime = resetDate.getTime() - Date.now();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const resetsInDays = daysLeft > 0 ? daysLeft : 0;

  const currentPlanDetails = PLANS[user.planType] || PLANS.FREE;
  const usagePercentage = Math.min(
    Math.round((user.dmsCountThisMonth / user.dmsLimit) * 100),
    100
  );

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="space-y-0.5 pb-2 border-b border-[#27272A]">
        <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Billing & limits</h1>
        <p className="text-xs text-zinc-400">
          Monitor your Direct Message quota consumption and manage your subscription tier
        </p>
      </div>

      {/* Usage Meter Card */}
      <div className="p-5 bg-[#18181B] border border-[#27272A] rounded-xl space-y-3.5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h2 className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#00DF81]" />
              SaaS Quota Meter
            </h2>
            <p className="text-[11px] text-zinc-400">
              Usage cycles automatically reset every 30 days.
            </p>
          </div>
          <div className="px-2.5 py-1 rounded-md bg-[#0F0F0F] border border-[#27272A] text-[#00DF81] text-xs font-semibold w-fit">
            Current Tier: {currentPlanDetails.name}
          </div>
        </div>

        {/* Progress bar container */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-zinc-400">
              DMs Dispatched: <strong className="text-zinc-100">{user.dmsCountThisMonth}</strong> / {user.dmsLimit}
            </span>
            <span className="text-[#00DF81] font-semibold">{usagePercentage}% consumed</span>
          </div>
          
          <div className="w-full h-2 bg-[#0F0F0F] border border-[#27272A] rounded-full overflow-hidden">
            <div
              style={{ width: `${usagePercentage}%` }}
              className={`h-full transition-all duration-300 rounded-full ${
                usagePercentage > 85
                  ? "bg-red-500"
                  : usagePercentage > 60
                  ? "bg-amber-500"
                  : "bg-[#00DF81]"
              }`}
            />
          </div>

          <div className="text-[10px] text-zinc-500 pt-0.5 text-right font-mono">
            Cycle resets in <strong className="text-zinc-300">{resetsInDays} days</strong> ({new Date(resetDate).toLocaleDateString()})
          </div>
        </div>
      </div>

      {/* Subscription Pricing Tiers */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
          <CreditCard className="w-4 h-4 text-zinc-400" />
          Subscription plans
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: FREE Starter */}
          <div className={`p-6 bg-[#18181B] rounded-xl flex flex-col justify-between h-[370px] border transition-all ${
            user.planType === "FREE"
              ? "border-[#00DF81]/60 ring-1 ring-[#00DF81]/20"
              : "border-[#27272A] hover:border-zinc-700"
          }`}>
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Starter tier</span>
                <h3 className="text-base font-bold text-zinc-100">Free Starter</h3>
                <p className="text-xs text-zinc-400 leading-normal">Basic triggers for content creators.</p>
              </div>
              <div className="space-y-0.5 py-1">
                <p className="text-2xl font-black text-zinc-100">$0 <span className="text-xs font-normal text-zinc-500">/ forever</span></p>
                <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">0 DH per month</p>
              </div>
              <ul className="text-xs space-y-2 text-zinc-400 border-t border-[#27272A] pt-4">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00DF81] shrink-0" strokeWidth={2} />
                  <span>150 DMs / month quota</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00DF81] shrink-0" strokeWidth={2} />
                  <span>Link 1 IG Business profile</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00DF81] shrink-0" strokeWidth={2} />
                  <span>Basic Keyword matching</span>
                </li>
              </ul>
            </div>
            <UpgradeButton plan="FREE" current={user.planType === "FREE"} />
          </div>

          {/* Card 2: Creator PRO */}
          <div className={`p-6 bg-[#18181B] rounded-xl flex flex-col justify-between h-[370px] border transition-all relative ${
            user.planType === "PRO"
              ? "border-[#00DF81]/60 ring-1 ring-[#00DF81]/20"
              : "border-[#27272A] hover:border-zinc-700"
          }`}>
            <div className="absolute -top-3 right-6 px-2.5 py-0.5 rounded-full bg-[#00DF81] text-[#000000] font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Sparkles className="w-2.5 h-2.5 fill-black" />
              Most Popular
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#00DF81] tracking-wider">Professional tier</span>
                <h3 className="text-base font-bold text-zinc-100">Creator Pro</h3>
                <p className="text-xs text-zinc-400 leading-normal">High volume triggers & story rewards.</p>
              </div>
              <div className="space-y-0.5 py-1">
                <p className="text-2xl font-black text-zinc-100">$5 <span className="text-xs font-normal text-zinc-500">/ month</span></p>
                <p className="text-[10px] text-[#00DF81] font-semibold uppercase tracking-wider">50 DH per month</p>
              </div>
              <ul className="text-xs space-y-2 text-zinc-400 border-t border-[#27272A] pt-4">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00DF81] shrink-0" strokeWidth={2} />
                  <span>3,000 DMs / month quota</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00DF81] shrink-0" strokeWidth={2} />
                  <span>Story Mentions triggers</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00DF81] shrink-0" strokeWidth={2} />
                  <span>Lead Capture & CSV export</span>
                </li>
              </ul>
            </div>
            <UpgradeButton plan="PRO" current={user.planType === "PRO"} />
          </div>

          {/* Card 3: Business/Agency */}
          <div className={`p-6 bg-[#18181B] rounded-xl flex flex-col justify-between h-[370px] border transition-all ${
            user.planType === "BUSINESS"
              ? "border-[#00DF81]/60 ring-1 ring-[#00DF81]/20"
              : "border-[#27272A] hover:border-zinc-700"
          }`}>
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Agency tier</span>
                <h3 className="text-base font-bold text-zinc-100">Business / Agency</h3>
                <p className="text-xs text-zinc-400 leading-normal">Multi-account scale for agencies & brands.</p>
              </div>
              <div className="space-y-0.5 py-1">
                <p className="text-2xl font-black text-zinc-100">$15 <span className="text-xs font-normal text-zinc-500">/ month</span></p>
                <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">150 DH per month</p>
              </div>
              <ul className="text-xs space-y-2 text-zinc-400 border-t border-[#27272A] pt-4">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00DF81] shrink-0" strokeWidth={2} />
                  <span>15,000 DMs / month quota</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00DF81] shrink-0" strokeWidth={2} />
                  <span>Link up to 3 IG accounts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#00DF81] shrink-0" strokeWidth={2} />
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
