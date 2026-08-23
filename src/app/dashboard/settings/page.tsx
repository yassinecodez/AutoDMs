import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { PLANS } from "@/lib/plans";
import UpgradeButton from "@/components/UpgradeButton";
import { CreditCard, Zap, Sparkles } from "lucide-react";

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

  // Calculate resetting timeframe
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
    <div className="p-6 md:p-8 space-y-8 max-w-5xl">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#F9FAFB] tracking-tight">Billing & limits</h1>
        <p className="text-xs md:text-sm text-[#9CA3AF]">
          Monitor your Direct Message quota consumption and upgrade your subscription tier
        </p>
      </div>

      {/* Usage Meter Card */}
      <div className="p-6 bg-[#111827] border border-[#1F2937] rounded-xl space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[#F9FAFB] flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#00DF81]" />
              SaaS quota meter
            </h2>
            <p className="text-xs text-[#9CA3AF]">
              Usage cycles automatically reset every 30 days.
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#00DF81]/10 border border-[#00DF81]/20 text-[#00DF81] text-xs font-bold w-fit">
            Plan Type: {currentPlanDetails.name}
          </div>
        </div>

        {/* Progress bar container */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-[#9CA3AF]">
              DMs Dispatched: <strong className="text-[#F9FAFB]">{user.dmsCountThisMonth}</strong> / {user.dmsLimit}
            </span>
            <span className="text-[#00DF81]">{usagePercentage}% consumed</span>
          </div>
          
          <div className="w-full h-2.5 bg-[#0B0F17] border border-[#1F2937] rounded-full overflow-hidden">
            <div
              style={{ width: `${usagePercentage}%` }}
              className={`h-full transition-all duration-500 rounded-full ${
                usagePercentage > 85
                  ? "bg-red-500"
                  : usagePercentage > 60
                  ? "bg-amber-500"
                  : "bg-[#00DF81]"
              }`}
            />
          </div>

          <div className="text-[11px] text-slate-500 pt-1 text-right">
            Usage cycle resets in <strong className="text-slate-300">{resetsInDays} days</strong> ({new Date(resetDate).toLocaleDateString()})
          </div>
        </div>
      </div>

      {/* Subscription Pricing Tiers */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[#F9FAFB] flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-[#00DF81]" />
          Subscription plans
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: FREE Starter */}
          <div className={`p-6 bg-[#111827] rounded-xl flex flex-col justify-between h-[380px] border transition-all ${
            user.planType === "FREE"
              ? "border-[#00DF81]/50 ring-1 ring-[#00DF81]/20"
              : "border-[#1F2937] hover:border-slate-700"
          }`}>
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Starter tier</span>
                <h3 className="text-base font-extrabold text-[#F9FAFB]">Free Starter</h3>
                <p className="text-xs text-[#9CA3AF] leading-normal">Basic triggers for content creators.</p>
              </div>
              <div className="space-y-0.5 py-1">
                <p className="text-2xl font-black text-[#F9FAFB]">$0 <span className="text-xs font-normal text-slate-500">/ forever</span></p>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">0 DH per month</p>
              </div>
              <ul className="text-xs space-y-2 text-[#9CA3AF] border-t border-[#1F2937] pt-4">
                <li className="flex items-center gap-2">🟢 150 DMs / month quota</li>
                <li className="flex items-center gap-2">🟢 Link 1 IG Business profile</li>
                <li className="flex items-center gap-2">🟢 Basic Keyword matching</li>
              </ul>
            </div>
            <UpgradeButton plan="FREE" current={user.planType === "FREE"} />
          </div>

          {/* Card 2: Creator PRO */}
          <div className={`p-6 bg-[#111827] rounded-xl flex flex-col justify-between h-[380px] border transition-all relative ${
            user.planType === "PRO"
              ? "border-[#00DF81]/50 ring-1 ring-[#00DF81]/20"
              : "border-[#1F2937] hover:border-slate-700"
          }`}>
            <div className="absolute -top-3 right-6 px-2.5 py-0.5 rounded-full bg-[#00DF81] text-[#000000] font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Sparkles className="w-2.5 h-2.5 fill-black" />
              Most Popular
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#00DF81] tracking-wider">Professional tier</span>
                <h3 className="text-base font-extrabold text-[#F9FAFB]">Creator Pro</h3>
                <p className="text-xs text-[#9CA3AF] leading-normal">High volume triggers & story rewards.</p>
              </div>
              <div className="space-y-0.5 py-1">
                <p className="text-2xl font-black text-[#F9FAFB]">$5 <span className="text-xs font-normal text-slate-500">/ month</span></p>
                <p className="text-[10px] text-[#00DF81] font-semibold uppercase tracking-wider">50 DH per month</p>
              </div>
              <ul className="text-xs space-y-2 text-[#9CA3AF] border-t border-[#1F2937] pt-4">
                <li className="flex items-center gap-2">🟢 3,000 DMs / month quota</li>
                <li className="flex items-center gap-2">🟢 Story Mentions triggers</li>
                <li className="flex items-center gap-2">🟢 Lead Capture & CSV export</li>
              </ul>
            </div>
            <UpgradeButton plan="PRO" current={user.planType === "PRO"} />
          </div>

          {/* Card 3: Business/Agency */}
          <div className={`p-6 bg-[#111827] rounded-xl flex flex-col justify-between h-[380px] border transition-all ${
            user.planType === "BUSINESS"
              ? "border-[#00DF81]/50 ring-1 ring-[#00DF81]/20"
              : "border-[#1F2937] hover:border-slate-700"
          }`}>
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Agency tier</span>
                <h3 className="text-base font-extrabold text-[#F9FAFB]">Business / Agency</h3>
                <p className="text-xs text-[#9CA3AF] leading-normal">Multi-account scale for agencies & brands.</p>
              </div>
              <div className="space-y-0.5 py-1">
                <p className="text-2xl font-black text-[#F9FAFB]">$15 <span className="text-xs font-normal text-slate-500">/ month</span></p>
                <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">150 DH per month</p>
              </div>
              <ul className="text-xs space-y-2 text-[#9CA3AF] border-t border-[#1F2937] pt-4">
                <li className="flex items-center gap-2">🟢 15,000 DMs / month quota</li>
                <li className="flex items-center gap-2">🟢 Link up to 3 IG accounts</li>
                <li className="flex items-center gap-2">🟢 Priority 24/7 Agency support</li>
              </ul>
            </div>
            <UpgradeButton plan="BUSINESS" current={user.planType === "BUSINESS"} />
          </div>
        </div>
      </div>
    </div>
  );
}
