"use client";

import { useState } from "react";
import { Loader2, Key } from "lucide-react";
import { manualRefreshTokenAction } from "@/app/dashboard/accounts/actions";

interface RefreshTokenButtonProps {
  instagramAccountId: string;
}

export function RefreshTokenButton({ instagramAccountId }: RefreshTokenButtonProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleRefresh = async () => {
    setLoading(true);
    setStatus("idle");
    setErrorMsg("");

    try {
      await manualRefreshTokenAction(instagramAccountId);
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Failed to refresh token.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1 items-end">
      <button
        onClick={handleRefresh}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-350 font-semibold text-xs border border-slate-700 transition-colors disabled:opacity-50 active:scale-95 shadow-sm"
        title="Refresh Meta Access Token with 60-day extension"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Key className="w-3.5 h-3.5 text-slate-400" />
        )}
        Refresh Token
      </button>
      {status === "success" && (
        <span className="text-[10px] text-emerald-400 font-medium">Token extended 60 days!</span>
      )}
      {status === "error" && (
        <span className="text-[10px] text-red-400 font-medium truncate max-w-[150px]" title={errorMsg}>
          {errorMsg}
        </span>
      )}
    </div>
  );
}
export default RefreshTokenButton;
