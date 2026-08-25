"use client";

import { useState } from "react";
import {
  ArrowRight,
  Loader2,
  ShieldCheck,
  Zap,
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
  const [connecting, setConnecting] = useState(false);

  const openAuthPopup = (url: string) => {
    const width = 600;
    const height = 750;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const popup = window.open(
      url,
      "InstagramLogin",
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
    );

    const checkPopup = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(checkPopup);
        setConnecting(false);
        window.location.reload();
      }
    }, 1000);
  };

  const handleConnect = async () => {
    setConnecting(true);

    try {
      const res = await fetch("/api/auth/instagram/url");
      if (!res.ok) {
        throw new Error("Failed to generate authorization session.");
      }
      const data = await res.json();
      if (data.url) {
        openAuthPopup(data.url);
      } else {
        openAuthPopup("/api/auth/instagram/url");
      }
    } catch (err: any) {
      console.error("Connection initiation error:", err);
      openAuthPopup("/api/auth/instagram/url");
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
      {/* Clean Direct Connect Header */}
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
              Connect your Instagram account directly on Instagram. 1-click authorization links your Instagram profile to AutoDMs.
            </p>
          </div>
        </div>

        {/* Primary CTA Button */}
        <button
          type="button"
          onClick={handleConnect}
          disabled={connecting}
          className="h-11 px-7 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm inline-flex items-center justify-center gap-2.5 transition-all shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-50 shrink-0"
        >
          {connecting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <InstagramIcon className="w-4 h-4" />
          )}
          <span>Connect with Instagram</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Feature Highlights */}
      <div className="pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Pure Instagram OAuth with end-to-end encrypted token storage</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
          <Zap className="w-4 h-4 text-blue-500 shrink-0" />
          <span>Automatic real-time DM automations and comment triggers</span>
        </div>
      </div>
    </div>
  );
}

export default AccountFinder;
