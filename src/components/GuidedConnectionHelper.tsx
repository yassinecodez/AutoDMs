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
      const res = await fetch("/api/auth/facebook/url");
      if (!res.ok) {
        throw new Error("Failed to get authorization URL");
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        window.location.href = "/api/auth/facebook/url";
      }
    } catch (err) {
      console.error("Connect retry error:", err);
      window.location.href = "/api/auth/facebook/url";
    } finally {
      setLoading(false);
    }
  };

  if (dismissed) return null;

  // 1. Success Banner
  if (statusParam === "SUCCESS" || statusParam === "success") {
    return (
      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-foreground rounded-2xl flex items-start justify-between gap-3 shadow-sm animate-in fade-in duration-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Instagram Profile Connected Successfully</h3>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Your Instagram profile is now linked via official Meta Business consent. Webhooks for comments and direct messages are active in real-time.
            </p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
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
      <div className="p-5 bg-red-500/10 border border-red-500/20 text-foreground rounded-2xl flex items-start justify-between gap-3 shadow-sm animate-in fade-in duration-200">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Instagram Authorization Incomplete</h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
              {errorParam === "USER_DENIED"
                ? "The connection request was cancelled. To enable automatic DM replies, please approve the requested permissions."
                : errorParam === "NO_INSTAGRAM_BUSINESS_ACCOUNT"
                ? "No Instagram Business or Creator account was found connected to your selected Facebook Page. Please ensure your Instagram account is linked to your Facebook Page."
                : "Meta was unable to complete the authorization handshake. Click below to reconnect your profile."}
            </p>
            {detailsParam && (
              <p className="text-[11px] font-normal text-red-500 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-lg">
                Details: {detailsParam}
              </p>
            )}
            <div className="pt-1">
              <button
                onClick={() => handleConnectAgain()}
                disabled={loading}
                className="h-9 px-4 rounded-xl bg-primary text-primary-foreground hover:opacity-90 font-medium text-xs inline-flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                Try Connecting Again
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
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
