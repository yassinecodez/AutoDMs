"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Check,
  ChevronRight,
  RefreshCw,
  X,
  ExternalLink,
  ShieldAlert,
  Loader2,
} from "lucide-react";

interface GuidedConnectionHelperProps {
  errorParam?: string;
  statusParam?: string;
  countParam?: string;
  hasConnectedAccounts: boolean;
}

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
      <div className="p-4 bg-[#0A0A0A] border border-emerald-500/30 text-white rounded-xl flex items-start justify-between gap-3 shadow-sm animate-in fade-in duration-200">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Instagram Profile Linked Successfully</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {countParam
                ? `Successfully connected ${countParam} Instagram Business account(s). Webhook subscriptions are active.`
                : "Your professional account is now connected and ready for automated comment and DM triggers."}
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

  // 2. Setup Required Banner (NO_INSTAGRAM_BUSINESS_ACCOUNT, NO_FACEBOOK_PAGES, or 0 accounts connected)
  const isNoBusinessAccount =
    errorParam === "NO_INSTAGRAM_BUSINESS_ACCOUNT" ||
    errorParam === "NO_FACEBOOK_PAGES";

  const isTokenError =
    errorParam === "TOKEN_EXCHANGE_FAILED" ||
    errorParam === "NO_CODE";

  if (isNoBusinessAccount || (errorParam && !isTokenError)) {
    return (
      <div className="p-5 bg-[#0A0A0A] border border-amber-500/30 rounded-xl space-y-4 shadow-sm animate-in fade-in duration-200">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-800/50 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Account Setup Required</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {errorParam === "NO_FACEBOOK_PAGES"
                  ? "Meta returned 0 Facebook Pages for your login. Follow the 3 steps below to ensure your Instagram account is linked to a Facebook Page."
                  : "We found your Facebook Page, but no linked Instagram Business or Creator account was detected."}
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

        {/* 3-Step Guided Checklist */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {/* Step 1 */}
          <div className="p-3.5 bg-[#111111] border border-[#222222] rounded-lg space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <span className="w-5 h-5 rounded-full bg-[#181818] border border-[#333333] flex items-center justify-center text-[10px] text-zinc-300">
                1
              </span>
              <span>Creator / Business</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Switch your Instagram profile to a <strong className="text-zinc-200">Creator</strong> or <strong className="text-zinc-200">Business</strong> account in <em>Settings &rarr; Account type</em>.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 bg-[#111111] border border-[#222222] rounded-lg space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <span className="w-5 h-5 rounded-full bg-[#181818] border border-[#333333] flex items-center justify-center text-[10px] text-zinc-300">
                2
              </span>
              <span>Link Facebook Page</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Connect your profile to a Facebook Page you manage in <em>Edit Profile &rarr; Page</em>.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 bg-[#111111] border border-[#222222] rounded-lg space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <span className="w-5 h-5 rounded-full bg-[#181818] border border-[#333333] flex items-center justify-center text-[10px] text-zinc-300">
                3
              </span>
              <span>Allow Message Access</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Enable <strong className="text-zinc-200">"Allow access to messages"</strong> in <em>Settings &rarr; Message controls &rarr; Connected tools</em>.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={handleConnectAgain}
            disabled={loading}
            className="h-9 px-4 rounded-lg bg-white hover:bg-zinc-200 text-black font-medium text-xs flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            Try Connecting Again
          </button>
        </div>
      </div>
    );
  }

  // 3. Token Exchange Failed Banner
  if (isTokenError) {
    return (
      <div className="p-4 bg-[#0A0A0A] border border-red-500/30 text-white rounded-xl flex items-start justify-between gap-3 shadow-sm animate-in fade-in duration-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-800/50 flex items-center justify-center text-red-400 shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-white">Authentication Failed</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Meta was unable to exchange the authorization code. Please ensure you have accepted all required permissions during Facebook/Instagram login.
            </p>
            <div className="pt-2">
              <button
                onClick={handleConnectAgain}
                disabled={loading}
                className="h-8 px-3 rounded-lg bg-white hover:bg-zinc-200 text-black font-medium text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
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
