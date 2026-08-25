"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Check, Loader2, Sparkles, X } from "lucide-react";

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

interface OnboardingModalProps {
  hasConnectedAccounts: boolean;
}

export function OnboardingModal({ hasConnectedAccounts }: OnboardingModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Show modal if user has 0 connected accounts and has not explicitly dismissed it in this browser session
    if (!hasConnectedAccounts) {
      const dismissed = localStorage.getItem("autodms_onboarding_dismissed");
      if (!dismissed) {
        setIsOpen(true);
      }
    }
  }, [hasConnectedAccounts]);

  const handleDismiss = () => {
    localStorage.setItem("autodms_onboarding_dismissed", "true");
    setIsOpen(false);
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/instagram/url");
      if (!res.ok) {
        throw new Error("Failed to get authorization URL");
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        window.location.href = "/api/auth/instagram/url";
      }
    } catch (err) {
      console.error("Connect error:", err);
      window.location.href = "/api/auth/instagram/url";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0A0A0A] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl shadow-black/90 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-[#141414] transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-purple-600/20 border border-white/10 flex items-center justify-center text-white shadow-inner">
            <InstagramIcon className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#161616] border border-[#262626] text-xs font-medium text-zinc-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick setup</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Connect your Instagram account
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Link your Creator or Business profile to start automating comments, story rewards, and DMs.
            </p>
          </div>
        </div>

        {/* Benefits List */}
        <div className="space-y-2.5 p-4 rounded-2xl bg-[#111111] border border-[#222222] text-xs text-zinc-300">
          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={2.5} />
            <span>1-Click official Meta OAuth authorization</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={2.5} />
            <span>Automate Reels, post comments, and story rewards</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={2.5} />
            <span>100% Meta API compliant with zero setup delay</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-3 pt-1">
          <button
            type="button"
            onClick={handleConnect}
            disabled={loading}
            className="w-full h-11 bg-white hover:bg-zinc-200 text-black font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-black" />
            ) : (
              <>
                <span>Connect Instagram Account</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="w-full h-9 text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Skip for now
          </button>
        </div>

      </div>
    </div>
  );
}

export default OnboardingModal;
