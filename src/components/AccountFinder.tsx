"use client";

import { useState } from "react";
import {
  ArrowRight,
  Loader2,
  ShieldCheck,
  Zap,
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
  const [connectingIg, setConnectingIg] = useState(false);
  const [connectingMeta, setConnectingMeta] = useState(false);

  const openAuthPopup = (url: string, name: string) => {
    const width = 600;
    const height = 750;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const popup = window.open(
      url,
      name,
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
    );

    const checkPopup = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(checkPopup);
        setConnectingIg(false);
        setConnectingMeta(false);
        window.location.reload();
      }
    }, 1000);
  };

  const handleDirectInstagramConnect = async () => {
    setConnectingIg(true);
    try {
      const res = await fetch("/api/auth/instagram/url");
      const data = await res.json();
      if (data.url) {
        openAuthPopup(data.url, "InstagramDirectLogin");
      } else {
        openAuthPopup("/api/auth/instagram/url", "InstagramDirectLogin");
      }
    } catch (err: any) {
      console.error("Direct Instagram initiation error:", err);
      openAuthPopup("/api/auth/instagram/url", "InstagramDirectLogin");
    }
  };

  const handleMetaBusinessConnect = async () => {
    setConnectingMeta(true);
    try {
      const res = await fetch("/api/auth/facebook/url");
      const data = await res.json();
      if (data.url) {
        openAuthPopup(data.url, "MetaBusinessLogin");
      } else {
        openAuthPopup("/api/auth/facebook/url", "MetaBusinessLogin");
      }
    } catch (err: any) {
      console.error("Meta Business initiation error:", err);
      openAuthPopup("/api/auth/facebook/url", "MetaBusinessLogin");
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
      {/* Clean Connect Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 p-[1.5px] shrink-0">
            <div className="w-full h-full bg-card rounded-[14px] flex items-center justify-center">
              <InstagramIcon className="w-6 h-6 text-foreground" />
            </div>
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold text-foreground tracking-tight">Connect Instagram Account</h2>
            <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
              Connect your account directly via Instagram or link via Meta Business Suite.
            </p>
          </div>
        </div>

        {/* Dual Connect Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          {/* Direct Instagram CTA */}
          <button
            type="button"
            onClick={handleDirectInstagramConnect}
            disabled={connectingIg || connectingMeta}
            className="h-11 px-6 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:opacity-95 text-white font-medium text-sm inline-flex items-center justify-center gap-2.5 transition-all shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-50"
          >
            {connectingIg ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <InstagramIcon className="w-4 h-4" />
            )}
            <span>Direct Instagram Login</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Meta Business Suite CTA */}
          <button
            type="button"
            onClick={handleMetaBusinessConnect}
            disabled={connectingIg || connectingMeta}
            className="h-11 px-5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-medium text-sm inline-flex items-center justify-center gap-2 border border-border transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {connectingMeta ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-blue-500" />
            )}
            <span>Meta Business</span>
          </button>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>AES-256 encrypted token storage with automatic token refresh</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
          <Zap className="w-4 h-4 text-blue-500 shrink-0" />
          <span>Real-time post triggers, comment automations, and instant DM dispatch</span>
        </div>
      </div>
    </div>
  );
}

export default AccountFinder;
