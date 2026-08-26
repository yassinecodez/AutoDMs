"use client";

import { useState } from "react";
import {
  ArrowRight,
  Loader2,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

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

export function AccountFinder() {
  const [handle, setHandle] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleDirectConnect = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = handle.trim().replace(/^@+/, "");
    if (!clean) {
      setError("Please enter your Instagram username (e.g. yassine.efx)");
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      const res = await fetch("/api/instagram/connect-direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: clean }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to connect account");
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 600);
    } catch (err: any) {
      setError(err.message || "Failed to connect account");
      setConnecting(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
      {/* Direct Connect Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 p-[1.5px] shrink-0">
            <div className="w-full h-full bg-card rounded-[14px] flex items-center justify-center">
              <InstagramIcon className="w-6 h-6 text-foreground" />
            </div>
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold text-foreground tracking-tight">Connect Instagram Account</h2>
            <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
              Enter your Instagram username to link your profile workspace directly without Facebook.
            </p>
          </div>
        </div>
      </div>

      {/* Direct Handle Form */}
      <form onSubmit={handleDirectConnect} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground font-medium text-sm">
            @
          </div>
          <input
            type="text"
            value={handle}
            onChange={(e) => {
              setHandle(e.target.value);
              setError(null);
            }}
            placeholder="yassine.efx or eartech.ma"
            disabled={connecting || success}
            className="w-full h-11 pl-8 pr-4 bg-background border border-border rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={connecting || success || !handle.trim()}
          className="h-11 px-7 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:opacity-95 text-white font-medium text-sm inline-flex items-center justify-center gap-2.5 transition-all shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-50 shrink-0"
        >
          {connecting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : success ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>{success ? "Connected!" : "Connect Profile"}</span>
          {!success && !connecting && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2.5 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Feature Highlights */}
      <div className="pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Direct multi-tenant account isolation with zero personal Facebook linking</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
          <Zap className="w-4 h-4 text-blue-500 shrink-0" />
          <span>Instant workspace activation for comment triggers and DM automations</span>
        </div>
      </div>
    </div>
  );
}

export default AccountFinder;
