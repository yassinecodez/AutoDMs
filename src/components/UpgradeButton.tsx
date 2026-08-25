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
    } catch (err: any) {
      alert("Failed to update plan: " + err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  if (current) {
    return (
      <button
        disabled
        className="w-full h-10 bg-secondary text-muted-foreground font-medium rounded-lg text-sm cursor-default select-none border border-border"
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
          ? "bg-primary text-primary-foreground hover:opacity-90"
          : "bg-secondary text-foreground hover:bg-secondary/80 border border-border"
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
