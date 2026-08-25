"use client";

import { useState } from "react";
import {
  Search,
  ArrowRight,
  Loader2,
  ExternalLink,
  Info,
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

  const handleConnect = async (targetHandle?: string) => {
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
        window.location.href = data.url;
      } else {
        window.location.href = "/api/auth/instagram/url";
      }
    } catch (err: any) {
      console.error("Connection initiation error:", err);
      window.location.href = "/api/auth/instagram/url";
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
      {/* Box Header with High-Contrast Primary CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-secondary border border-border flex items-center justify-center text-foreground shrink-0">
            <InstagramIcon className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-foreground">Connect Professional Account</h2>
            <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
              Link your Instagram Creator or Business profile directly via official Instagram consent to enable automated DMs and comment replies.
            </p>
          </div>
        </div>

        {/* Primary High-Contrast Connect Button */}
        <button
          type="button"
          onClick={() => handleConnect()}
          disabled={connecting}
          className="h-10 px-5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 font-medium text-sm inline-flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50 shrink-0"
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

      {/* Account Verification Search */}
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
              placeholder="eartech.ma"
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
              onClick={() => handleConnect(foundProfile.username)}
              disabled={connecting}
              className="h-10 px-5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 font-medium text-sm inline-flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50 shrink-0"
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
