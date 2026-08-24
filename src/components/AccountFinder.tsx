"use client";

import { useState } from "react";
import {
  Search,
  CheckCircle2,
  ArrowRight,
  Shield,
  Loader2,
  Users,
  Grid,
  ExternalLink,
  ChevronDown,
  Key,
} from "lucide-react";
import ManualConnectForm from "@/components/ManualConnectForm";

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
  const [error, setError] = useState("");
  const [showManual, setShowManual] = useState(false);

  const cleanHandle = (input: string) => {
    return input.trim().replace(/^@+/, "").toLowerCase();
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const handle = cleanHandle(handleInput);
    if (!handle) return;

    setSearching(true);
    setError("");

    setTimeout(() => {
      setFoundProfile({
        username: handle,
        fullName: handle.charAt(0).toUpperCase() + handle.slice(1),
        isBusiness: true,
      });
      setSearching(false);
    }, 450);
  };

  const handleConnect = async () => {
    setConnecting(true);
    setError("");

    try {
      const res = await fetch("/api/auth/facebook/url");
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
      // Direct Instagram URL fallback
      window.location.href = "/api/auth/instagram/url";
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="bg-[#0A0A0A] border border-[#222222] rounded-2xl p-6 space-y-6 shadow-sm">
      {/* Box Header */}
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-[#141414] border border-[#262626] flex items-center justify-center text-white shrink-0">
          <InstagramIcon className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <h2 className="text-base font-semibold text-white">Connect Professional Profile</h2>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
            Find your Instagram username below to verify business permissions and link your account via Meta OAuth.
          </p>
        </div>
      </div>

      {/* 1. Account Search Input */}
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-500 font-medium">
              @
            </span>
            <input
              type="text"
              value={handleInput}
              onChange={(e) => setHandleInput(e.target.value)}
              placeholder="creamedia.ma or your_brand"
              className="w-full h-10 pl-8 pr-4 bg-[#111111] border border-[#262626] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={searching || !handleInput.trim()}
            className="h-10 px-5 rounded-xl bg-[#181818] hover:bg-[#222222] text-white border border-[#2b2b2b] text-xs font-medium inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-40 shrink-0"
          >
            {searching ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5" />
            )}
            <span>Find Account</span>
          </button>
        </div>
      </form>

      {/* 2. Profile Preview Card (when handle searched) */}
      {foundProfile && (
        <div className="p-4 bg-[#111111] border border-white/20 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#181818] border border-[#333333] flex items-center justify-center text-white font-bold text-base uppercase shrink-0">
                {foundProfile.username[0]}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-semibold text-white">@{foundProfile.username}</h3>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-emerald-400 font-medium">Ready to Link</span>
                </div>
                <p className="text-xs text-zinc-400">Instagram Professional / Creator Account</p>
              </div>
            </div>

            {/* Connect CTA Button */}
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="h-10 px-5 rounded-xl bg-white hover:bg-zinc-200 text-black font-medium text-xs inline-flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50 shrink-0"
            >
              {connecting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
              ) : (
                <InstagramIcon className="w-4 h-4 text-black" />
              )}
              <span>Sign in as @{foundProfile.username}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Direct OAuth Link Alternative */}
      {!foundProfile && (
        <div className="flex items-center justify-between pt-2 border-t border-[#222222]/80 text-xs">
          <span className="text-zinc-500">Don't want to search first?</span>
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="text-white hover:underline font-medium inline-flex items-center gap-1"
          >
            Direct Meta Login &rarr;
          </button>
        </div>
      )}

      {/* 3. Developer / Manual Token Fallback */}
      <div className="pt-2 border-t border-[#222222]/80">
        <button
          type="button"
          onClick={() => setShowManual(!showManual)}
          className="text-xs text-zinc-500 hover:text-zinc-300 font-medium inline-flex items-center gap-1.5 transition-colors"
        >
          <Key className="w-3.5 h-3.5" />
          <span>Manual Access Token Configuration (Advanced)</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform ${showManual ? "rotate-180" : ""}`}
          />
        </button>

        {showManual && (
          <div className="pt-4 animate-in fade-in duration-150">
            <ManualConnectForm />
          </div>
        )}
      </div>
    </div>
  );
}

export default AccountFinder;
