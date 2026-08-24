"use client";

import { useState } from "react";
import {
  CheckCircle2,
  RefreshCw,
  X,
  ShieldAlert,
  Loader2,
} from "lucide-react";

interface GuidedConnectionHelperProps {
  errorParam?: string;
  detailsParam?: string;
  statusParam?: string;
  countParam?: string;
  hasConnectedAccounts: boolean;
}

export function GuidedConnectionHelper({
  errorParam,
  detailsParam,
  statusParam,
  countParam,
  hasConnectedAccounts,
}: GuidedConnectionHelperProps) {
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConnectAgain = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/instagram/url");
      if (!res.ok) {
        throw new Error("Failed to get authorization URL");
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Connect retry error:", err);
      window.location.href = "/api/auth/instagram/url";
    } finally {
      setLoading(false);
    }
  };

  if (dismissed) return null;

  // 1. Success Banner
  if (statusParam === "SUCCESS" || statusParam === "success") {
    return (
      <div className="p-4 bg-[#0A0A0A] border border-emerald-500/30 text-white rounded-2xl flex items-start justify-between gap-3 shadow-sm animate-in fade-in duration-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Instagram Profile Connected Successfully</h3>
            <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
              Your Instagram profile is now linked. Webhook events for comments and direct messages are active in real-time.
            </p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-zinc-500 hover:text-white transition-colors p-1"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // 2. Token Exchange / Permissions Banner
  if (errorParam && errorParam !== "SUCCESS" && errorParam !== "success") {
    return (
      <div className="p-5 bg-[#0A0A0A] border border-red-500/30 text-white rounded-2xl flex items-start justify-between gap-3 shadow-sm animate-in fade-in duration-200">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-950/60 border border-red-800/50 flex items-center justify-center text-red-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-white">Instagram Authorization Incomplete</h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
              {errorParam === "USER_DENIED"
                ? "The connection request was cancelled. To enable automatic DM replies, please approve the requested permissions."
                : "Instagram was unable to complete the authorization handshake. Click below to reconnect your profile."}
            </p>
            {detailsParam && (
              <p className="text-[11px] font-mono text-red-400 bg-red-950/30 border border-red-900/40 px-2.5 py-1 rounded-lg">
                Reason: {detailsParam}
              </p>
            )}
            <div className="pt-1">
              <button
                onClick={handleConnectAgain}
                disabled={loading}
                className="h-9 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-medium text-xs inline-flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                Try Connecting Again
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-zinc-500 hover:text-white transition-colors p-1"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return null;
}

export default GuidedConnectionHelper;
