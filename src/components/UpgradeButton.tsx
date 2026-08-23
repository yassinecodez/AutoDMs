"use client";

import { useState } from "react";
import { upgradePlanAction } from "@/app/dashboard/settings/actions";
import { Loader2, ArrowUpRight } from "lucide-react";

interface UpgradeButtonProps {
  plan: "FREE" | "PRO" | "BUSINESS";
  current: boolean;
}

export function UpgradeButton({ plan, current }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (current) return;
    setLoading(true);
    try {
      await upgradePlanAction(plan);
    } catch (err) {
      alert("Failed to update plan: " + err);
    } finally {
      setLoading(false);
    }
  };

  if (current) {
    return (
      <button
        disabled
        className="w-full py-2.5 bg-slate-800 text-slate-500 font-bold rounded-xl text-xs cursor-default select-none border border-slate-700/50"
      >
        Current Plan
      </button>
    );
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-violet-600/10 active:scale-95 disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <>
          Upgrade Tier
          <ArrowUpRight className="w-3.5 h-3.5" />
        </>
      )}
    </button>
  );
}
export default UpgradeButton;
