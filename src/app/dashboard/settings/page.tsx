import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { PLANS } from "@/lib/plans";
import UpgradeButton from "@/components/UpgradeButton";
import { CreditCard, Zap, Shield, Sparkles } from "lucide-react";

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
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Billing & Limits</h1>
        <p className="text-slate-400 text-sm">
          Monitor your Direct Message quota consumption and upgrade your subscription tiers
        </p>
      </div>

      {/* Usage Meter Card */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-violet-400" />
              SaaS Quota Meter
            </h2>
            <p className="text-xs text-slate-400">
              Usage cycles automatically reset every 30 days.
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400 text-xs font-bold w-fit">
            Plan Type: {currentPlanDetails.name}
          </div>
        </div>

        {/* Progress bar container */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-400">
              DMs Dispatched: <strong className="text-white">{user.dmsCountThisMonth}</strong> / {user.dmsLimit}
            </span>
            <span className="text-slate-400">{usagePercentage}% consumed</span>
          </div>
          
          <div className="w-full h-3 bg-slate-950 border border-slate-800/80 rounded-full overflow-hidden">
            <div
              style={{ width: `${usagePercentage}%` }}
              className={`h-full transition-all duration-500 rounded-full ${
                usagePercentage > 85
                  ? "bg-red-500"
                  : usagePercentage > 60
                  ? "bg-amber-500"
                  : "bg-violet-600"
              }`}
            />
          </div>

          <div className="text-[10px] text-slate-500 pt-1 text-right">
            Usage cycle resets in <strong className="text-slate-300">{resetsInDays} days</strong> ({new Date(resetDate).toLocaleDateString()})
          </div>
        </div>
      </div>

      {/* Subscription Pricing Tiers */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-violet-400" />
          Subscription Plans Strategy
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: FREE Starter */}
          <div className={`p-6 rounded-2xl flex flex-col justify-between h-[360px] border transition-all ${
            user.planType === "FREE"
              ? "bg-slate-900 border-violet-500/50 ring-2 ring-violet-500/10"
              : "bg-slate-900/40 border-slate-800/80 hover:border-slate-700"
          }`}>
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Tier Starter</span>
                <h3 className="text-base font-extrabold text-white">Free Starter</h3>
                <p className="text-xs text-slate-400 leading-normal">Basic triggers for content creators.</p>
              </div>
              <div className="space-y-1 py-1">
                <p className="text-2xl font-black text-white">$0 <span className="text-xs font-normal text-slate-500">/ forever</span></p>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">0 DH per month</p>
              </div>
              <ul className="text-xs space-y-2 text-slate-400 border-t border-slate-800/80 pt-4">
                <li className="flex items-center gap-1.5">🟢 150 DMs / month quota</li>
                <li className="flex items-center gap-1.5">🟢 Link 1 IG Business profile</li>
                <li className="flex items-center gap-1.5">🟢 Basic Keyword matching</li>
              </ul>
            </div>
            <UpgradeButton plan="FREE" current={user.planType === "FREE"} />
          </div>

          {/* Card 2: Creator PRO */}
          <div className={`p-6 rounded-2xl flex flex-col justify-between h-[360px] border transition-all relative ${
            user.planType === "PRO"
              ? "bg-slate-900 border-violet-500/50 ring-2 ring-violet-500/10"
              : "bg-slate-900/40 border-slate-850 hover:border-slate-700"
          }`}>
            <div className="absolute -top-3 right-6 px-2.5 py-0.5 rounded-full bg-violet-600 text-white font-bold text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Sparkles className="w-2.5 h-2.5" />
              Creator Choice
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-violet-400 tracking-wider">Tier Professional</span>
                <h3 className="text-base font-extrabold text-white">Creator Pro</h3>
                <p className="text-xs text-slate-400 leading-normal">High volume triggers & story rewards.</p>
              </div>
              <div className="space-y-1 py-1">
                <p className="text-2xl font-black text-white">$5 <span className="text-xs font-normal text-slate-500">/ month</span></p>
                <p className="text-[10px] text-violet-400 font-semibold uppercase tracking-wider">50 DH per month</p>
              </div>
              <ul className="text-xs space-y-2 text-slate-400 border-t border-slate-800/80 pt-4">
                <li className="flex items-center gap-1.5">🟢 3,000 DMs / month quota</li>
                <li className="flex items-center gap-1.5">🟢 Story Mentions triggers</li>
                <li className="flex items-center gap-1.5">🟢 Lead Capture collect features</li>
              </ul>
            </div>
            <UpgradeButton plan="PRO" current={user.planType === "PRO"} />
          </div>

          {/* Card 3: Business/Agency */}
          <div className={`p-6 rounded-2xl flex flex-col justify-between h-[360px] border transition-all ${
            user.planType === "BUSINESS"
              ? "bg-slate-900 border-violet-500/50 ring-2 ring-violet-500/10"
              : "bg-slate-900/40 border-slate-850 hover:border-slate-700"
          }`}>
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-blue-400 tracking-wider">Tier Agency</span>
                <h3 className="text-base font-extrabold text-white">Business / Agency</h3>
                <p className="text-xs text-slate-400 leading-normal">Multi-account scale for agencies & brands.</p>
              </div>
              <div className="space-y-1 py-1">
                <p className="text-2xl font-black text-white">$15 <span className="text-xs font-normal text-slate-500">/ month</span></p>
                <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">150 DH per month</p>
              </div>
              <ul className="text-xs space-y-2 text-slate-400 border-t border-slate-800/80 pt-4">
                <li className="flex items-center gap-1.5">🟢 15,000 DMs / month quota</li>
                <li className="flex items-center gap-1.5">🟢 Link up to 3 IG accounts</li>
                <li className="flex items-center gap-1.5">🟢 Priority 24/7 Agency support</li>
              </ul>
            </div>
            <UpgradeButton plan="BUSINESS" current={user.planType === "BUSINESS"} />
          </div>
        </div>
      </div>
    </div>
  );
}
