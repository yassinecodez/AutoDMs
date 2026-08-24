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
        className="h-8 inline-flex items-center gap-1.5 px-2.5 rounded-lg bg-[#18181B] hover:bg-zinc-800 text-zinc-300 font-medium text-xs border border-[#27272A] transition-colors disabled:opacity-50 active:scale-95"
        title="Sync Webhook Subscription with Meta App settings"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <RefreshCw className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.75} />
        )}
        Sync Webhook
      </button>
      {status === "success" && (
        <span className="text-[10px] text-[#00DF81] font-medium">Synced with Meta!</span>
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
