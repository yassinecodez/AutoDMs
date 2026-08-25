"use client";

import { useState } from "react";
import {
  Search,
  ArrowRight,
  Loader2,
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
    }, 400);
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
        window.location.href = data.url;
      } else {
        throw new Error("Invalid OAuth response.");
      }
    } catch (err: any) {
      console.error("Connection initiation error:", err);
      window.location.href = "/api/auth/instagram/url";
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="bg-[#0A0A0A] border border-[#222222] rounded-2xl p-6 sm:p-8 space-y-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
      {/* Box Header with High-Contrast Primary CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#222222]">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#141414] border border-[#262626] flex items-center justify-center text-white shrink-0">
            <InstagramIcon className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-white">Connect Professional Account</h2>
            <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
              Link your Instagram Creator or Business profile via official Meta OAuth to enable automated DMs and comment replies.
            </p>
          </div>
        </div>

        {/* Primary High-Contrast Connect Button */}
        <button
          type="button"
          onClick={handleConnect}
          disabled={connecting}
          className="h-10 px-5 rounded-xl bg-white hover:bg-zinc-200 text-black font-medium text-sm inline-flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50 shrink-0"
        >
          {connecting ? (
            <Loader2 className="w-4 h-4 animate-spin text-black" />
          ) : (
            <InstagramIcon className="w-4 h-4 text-black" />
          )}
          <span>Connect with Instagram</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Account Verification Search */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="ig-handle-input" className="text-xs font-semibold text-zinc-300">
            Verify handle permissions
          </label>
          <span className="text-xs text-zinc-500">Optional pre-check</span>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-500 font-medium">
              @
            </span>
            <input
              id="ig-handle-input"
              type="text"
              value={handleInput}
              onChange={(e) => setHandleInput(e.target.value)}
              placeholder="your_brand"
              className="w-full h-10 pl-8 pr-4 bg-[#111111] border border-[#262626] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={searching || !handleInput.trim()}
            className="h-10 px-5 rounded-xl bg-[#181818] hover:bg-[#222222] text-white border border-[#2b2b2b] text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-40 shrink-0"
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
        <div className="p-4 bg-[#111111] border border-white/20 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#181818] border border-[#333333] flex items-center justify-center text-white font-bold text-base shrink-0">
                {foundProfile.username[0].toUpperCase()}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-semibold text-white">@{foundProfile.username}</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs text-emerald-400 font-medium">Ready to Link</span>
                </div>
                <p className="text-xs text-zinc-400">Instagram Professional / Creator Account</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConnect}
              disabled={connecting}
              className="h-10 px-5 rounded-xl bg-white hover:bg-zinc-200 text-black font-medium text-sm inline-flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50 shrink-0"
            >
              {connecting ? (
                <Loader2 className="w-4 h-4 animate-spin text-black" />
              ) : (
                <InstagramIcon className="w-4 h-4 text-black" />
              )}
              <span>Continue with @{foundProfile.username}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountFinder;
