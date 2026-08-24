"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  X,
  ShieldAlert,
  Loader2,
} from "lucide-react";

interface GuidedConnectionHelperProps {
  errorParam?: string;
  statusParam?: string;
  countParam?: string;
  hasConnectedAccounts: boolean;
}

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export function GuidedConnectionHelper({
  errorParam,
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
              Your Instagram Creator / Business profile is now linked. Webhook events for comments and direct messages are actively listened to in real-time.
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
  if (errorParam === "TOKEN_EXCHANGE_FAILED" || errorParam === "USER_DENIED" || errorParam === "NO_CODE") {
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
                : "Instagram was unable to complete the authorization token exchange. Please retry connecting your professional account."}
            </p>
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

  // 3. Single Creator/Business Requirement Reminder (when general error or explicit request)
  if (errorParam && errorParam !== "SUCCESS") {
    return (
      <div className="p-5 bg-[#0A0A0A] border border-amber-500/30 rounded-2xl space-y-4 shadow-sm animate-in fade-in duration-200">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-800/50 flex items-center justify-center text-amber-400 shrink-0">
              <InstagramIcon className="w-5 h-5 text-amber-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white">Creator or Business Account Required</h3>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
                Instagram DM and comment automations require a professional account.
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

        {/* Single Pure Instagram Requirement Card */}
        <div className="p-4 bg-[#111111] border border-[#222222] rounded-xl flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-[#181818] border border-[#333333] flex items-center justify-center text-xs text-white font-medium shrink-0 mt-0.5">
            ✓
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-white">Switch to Professional Account</p>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Ensure your Instagram profile is switched to a <strong className="text-zinc-200">Creator</strong> or <strong className="text-zinc-200">Business</strong> account in <em>Instagram App &rarr; Settings &rarr; Account type & tools</em>.
            </p>
          </div>
        </div>

        <div className="pt-1 flex items-center gap-3">
          <button
            onClick={handleConnectAgain}
            disabled={loading}
            className="h-9 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-medium text-xs inline-flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            <span>Connect Instagram Profile</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default GuidedConnectionHelper;
