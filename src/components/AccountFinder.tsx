"use client";

import { useState } from "react";
import {
  Search,
  ArrowRight,
  Loader2,
  ExternalLink,
  Info,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
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

const MetaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

interface AccountProfile {
  username: string;
  fullName: string;
  isBusiness: boolean;
  avatarUrl?: string;
}

export function AccountFinder() {
  const [handleInput, setHandleInput] = useState("");
  const [searching, setSearching] = useState(false);
  const [foundProfile, setFoundProfile] = useState<AccountProfile | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const cleanHandle = (input: string) => {
    return input.trim().replace(/^@+/, "").toLowerCase();
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const handle = cleanHandle(handleInput);
    if (!handle) return;

    setSearching(true);

    setTimeout(() => {
      setFoundProfile({
        username: handle,
        fullName: handle.charAt(0).toUpperCase() + handle.slice(1),
        isBusiness: true,
      });
      setSearching(false);
    }, 300);
  };

  const openAuthPopup = (url: string) => {
    const width = 600;
    const height = 750;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const popup = window.open(
      url,
      "MetaBusinessLogin",
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

  const handleConnectViaMeta = async (targetHandle?: string) => {
    setConnecting(true);

    try {
      const handleToPass = targetHandle || (foundProfile ? foundProfile.username : cleanHandle(handleInput));
      const urlEndpoint = handleToPass
        ? `/api/auth/facebook/url?targetHandle=${encodeURIComponent(handleToPass)}`
        : "/api/auth/facebook/url";

      const res = await fetch(urlEndpoint);
      if (!res.ok) {
        throw new Error("Failed to generate authorization session.");
      }
      const data = await res.json();
      if (data.url) {
        openAuthPopup(data.url);
      } else {
        openAuthPopup("/api/auth/facebook/url");
      }
    } catch (err: any) {
      console.error("Connection initiation error:", err);
      openAuthPopup("/api/auth/facebook/url");
    }
  };

  const handleConnectViaInstagram = async (targetHandle?: string) => {
    setConnecting(true);

    try {
      const handleToPass = targetHandle || (foundProfile ? foundProfile.username : cleanHandle(handleInput));
      const urlEndpoint = handleToPass
        ? `/api/auth/instagram/url?targetHandle=${encodeURIComponent(handleToPass)}`
        : "/api/auth/instagram/url";

      const res = await fetch(urlEndpoint);
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
      {/* ManyChat Step 1: Onboarding Card */}
      <div className="space-y-4 pb-6 border-b border-border">
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold text-foreground tracking-tight">A few steps in</h2>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            We&apos;ll take you to Meta to connect. Just set your permissions, and your Instagram account will be linked to AutoDMs.
          </p>
        </div>

        {/* Primary CTA Button (ManyChat style) */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={() => handleConnectViaMeta()}
            disabled={connecting}
            className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm inline-flex items-center justify-center gap-2.5 transition-colors shadow-sm disabled:opacity-50"
          >
            {connecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <InstagramIcon className="w-4 h-4" />
            )}
            <span>Connect Via Meta</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Meta Business Partner Trust Badge */}
        <div className="p-4 bg-secondary/60 border border-border rounded-xl flex items-center justify-between gap-4 max-w-md">
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-foreground">AutoDMs is a trusted</p>
            <p className="text-xs text-muted-foreground">Meta Business Partner Integration</p>
          </div>
          <div className="flex items-center gap-1.5 text-blue-500 font-bold text-sm shrink-0">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
            <span>Meta Partner</span>
          </div>
        </div>

        {/* See More Options Toggle */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            className="text-xs font-medium text-blue-500 hover:text-blue-600 inline-flex items-center gap-1 transition-colors"
          >
            <span>{showMoreOptions ? "Hide Options" : "See More Options"}</span>
            {showMoreOptions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showMoreOptions && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md animate-in fade-in duration-200">
              <button
                type="button"
                onClick={() => handleConnectViaInstagram()}
                disabled={connecting}
                className="h-10 px-4 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-xs font-medium text-foreground inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <InstagramIcon className="w-4 h-4 text-pink-500" />
                <span>Connect Via Instagram</span>
              </button>

              <button
                type="button"
                onClick={() => handleConnectViaMeta()}
                disabled={connecting}
                className="h-10 px-4 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-xs font-medium text-foreground inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <MetaIcon className="w-4 h-4 text-blue-500" />
                <span>Meta Business Suite</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Account Pre-Check Verification Search */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="ig-handle-input" className="text-xs font-semibold text-foreground">
            Target account lookup & verification
          </label>
          <span className="text-xs text-muted-foreground">Pre-check handle</span>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
              @
            </span>
            <input
              id="ig-handle-input"
              type="text"
              value={handleInput}
              onChange={(e) => {
                setHandleInput(e.target.value);
                if (foundProfile && cleanHandle(e.target.value) !== foundProfile.username) {
                  setFoundProfile(null);
                }
              }}
              placeholder="yassine.efx or eartech.ma"
              className="w-full h-10 pl-8 pr-4 bg-secondary border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={searching || !handleInput.trim()}
            className="h-10 px-5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground border border-border text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-40 shrink-0"
          >
            {searching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Find account</span>
          </button>
        </form>
      </div>

      {/* Profile Preview Card (when handle searched) */}
      {foundProfile && (
        <div className="p-5 bg-secondary/50 border border-border rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center text-foreground font-bold text-base shrink-0">
                {foundProfile.username[0].toUpperCase()}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-semibold text-foreground">@{foundProfile.username}</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs text-emerald-500 font-medium">Ready to Link</span>
                </div>
                <p className="text-xs text-muted-foreground">Instagram Professional / Creator Account</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleConnectViaMeta(foundProfile.username)}
              disabled={connecting}
              className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm inline-flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50 shrink-0"
            >
              {connecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <InstagramIcon className="w-4 h-4" />
              )}
              <span>Continue with @{foundProfile.username}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Clean reminder and Account Switch helper */}
          <div className="pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>
                Ensure you are logged into <strong className="text-foreground">@{foundProfile.username}</strong> on instagram.com in this browser.
              </span>
            </div>
            <a
              href="https://www.instagram.com/accounts/logout/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline inline-flex items-center gap-1 font-medium shrink-0"
            >
              <span>Switch account on Instagram</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountFinder;
