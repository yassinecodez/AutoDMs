"use client";

import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";

export function SyncWebhookButton() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSync = async () => {
    setLoading(true);
    setStatus("idle");
    setErrorMsg("");

    try {
      const res = await fetch("/api/instagram/subscribe", { method: "POST" });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to sync webhooks.");
      }

      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Sync failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1 items-end">
      <button
        onClick={handleSync}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-350 font-semibold text-xs border border-slate-700 transition-colors disabled:opacity-50 active:scale-95 shadow-sm"
        title="Sync Webhook Subscription with Meta App settings"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
        )}
        Sync Webhook
      </button>
      {status === "success" && (
        <span className="text-[10px] text-emerald-400 font-medium">Synced with Meta!</span>
      )}
      {status === "error" && (
        <span className="text-[10px] text-red-400 font-medium truncate max-w-[150px]" title={errorMsg}>
          {errorMsg}
        </span>
      )}
    </div>
  );
}
export default SyncWebhookButton;
