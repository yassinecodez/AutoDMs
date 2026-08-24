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
        className="w-full h-10 bg-[#111111] text-zinc-500 font-medium rounded-lg text-sm cursor-default select-none border border-[#222222]"
      >
        Current Plan
      </button>
    );
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className={`w-full h-10 font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 ${
        plan === "PRO"
          ? "bg-white hover:bg-zinc-200 text-black"
          : "bg-[#111111] hover:bg-[#181818] text-white border border-[#262626]"
      }`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
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
