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
        className="w-full h-9 bg-[#0F0F0F] text-zinc-500 font-semibold rounded-lg text-xs cursor-default select-none border border-[#27272A]"
      >
        Current Plan
      </button>
    );
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="w-full h-9 bg-[#00DF81] hover:bg-[#00C770] text-[#000000] font-semibold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
      ) : (
        <>
          Upgrade Tier
          <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
        </>
      )}
    </button>
  );
}
export default UpgradeButton;
