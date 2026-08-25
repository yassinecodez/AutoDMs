"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import {
  User as UserIcon,
  CreditCard,
  Camera,
  Moon,
  Sun,
  Laptop,
  MessageSquare,
  LogOut,
  Check,
  Zap,
  Plus,
  Trash2,
  Loader2,
  Send,
  Edit2,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { updateProfileName, submitFeedbackAction } from "@/app/dashboard/settings/actions";
import { switchActiveAccountAction } from "@/app/actions/switchAccount";
import { disconnectAccount } from "@/app/dashboard/accounts/actions";
import UpgradeButton from "@/components/UpgradeButton";
import { PLANS } from "@/lib/plans";

interface IgAccountItem {
  id: string;
  instagramAccountId: string;
  pageName: string;
  profilePictureUrl: string | null;
  createdAt: any;
}

interface UserData {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  planType: string;
  dmsLimit: number;
  dmsCountThisMonth: number;
  usageResetAt: any;
}

interface SettingsHubClientProps {
  user: UserData;
  accounts: IgAccountItem[];
  activeAccountId?: string;
}

export default function SettingsHubClient({
  user,
  accounts,
  activeAccountId,
}: SettingsHubClientProps) {
  // Section 1: Profile Name State
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user.name || "");
  const [savingName, setSavingName] = useState(false);
  const [nameSavedSuccess, setNameSavedSuccess] = useState(false);

  // Section 3: Account switching/disconnect state
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  // Section 4: Theme switcher state
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");

  // Section 5: Feedback state
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Formatting calculations
  const baseDate = user.usageResetAt ? new Date(user.usageResetAt) : new Date();
  const resetDate = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  const resetDateFormatted = resetDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const currentPlanDetails = PLANS[user.planType] || PLANS.FREE;
  const remainingDms = Math.max(0, user.dmsLimit - user.dmsCountThisMonth);
  const usagePercentage = Math.min(
    Math.round((user.dmsCountThisMonth / user.dmsLimit) * 100),
    100
  );

  const initial = (user.name ? user.name[0] : user.email[0]).toUpperCase();

  // Save Profile Name Handler
  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setSavingName(true);
    try {
      await updateProfileName(nameInput);
      setIsEditingName(false);
      setNameSavedSuccess(true);
      setTimeout(() => setNameSavedSuccess(false), 3000);
    } catch (err: any) {
      alert("Failed to update name: " + err.message);
    } finally {
      setSavingName(false);
    }
  };

  // Switch Active Instagram Workspace
  const handleSwitchAccount = async (id: string) => {
    setSwitchingId(id);
    try {
      await switchActiveAccountAction(id);
    } catch (err: any) {
      alert("Failed to switch workspace: " + err.message);
    } finally {
      setSwitchingId(null);
    }
  };

  // Disconnect Instagram Account
  const handleDisconnect = async (id: string, pageName: string) => {
    if (!confirm(`Are you sure you want to disconnect @${pageName}? Active automations on this account will be paused.`)) {
      return;
    }
    setDisconnectingId(id);
    try {
      await disconnectAccount(id);
    } catch (err: any) {
      alert("Failed to disconnect account: " + err.message);
    } finally {
      setDisconnectingId(null);
    }
  };

  // Submit Feedback Handler
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;
    setSendingFeedback(true);
    try {
      await submitFeedbackAction(feedbackMessage);
      setFeedbackMessage("");
      setFeedbackSuccess(true);
      setTimeout(() => setFeedbackSuccess(false), 5000);
    } catch (err: any) {
      alert("Failed to send message: " + err.message);
    } finally {
      setSendingFeedback(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 pb-16">
      
      {/* ========================================================================= */}
      {/* Header */}
      {/* ========================================================================= */}
      <div className="space-y-1 pb-6 border-b border-[#222222]">
        <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-sm text-zinc-400">
          Manage your profile, active Instagram accounts, billing subscription, appearance, and feedback.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* Section 1 — Profile Details */}
      {/* ========================================================================= */}
      <div className="bg-[#0A0A0A] border border-[#1F1F23] rounded-xl p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] space-y-5">
        <div className="flex items-center justify-between border-b border-[#18181B] pb-4">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-zinc-400" />
              Profile details
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Your personal account identity across AutoDMs
            </p>
          </div>
          {nameSavedSuccess && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Saved successfully
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          {/* Avatar & User Details */}
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full overflow-hidden bg-[#161618] border border-[#26262A] text-white font-semibold text-base flex items-center justify-center shrink-0 shadow-inner">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span>{initial}</span>
              )}
            </div>

            <div className="space-y-1 min-w-0">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Enter your name"
                    className="h-8 px-2.5 bg-[#141414] border border-[#262626] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    disabled={savingName}
                    className="h-8 px-3 bg-white hover:bg-zinc-200 text-black font-medium text-xs rounded-lg transition-colors flex items-center gap-1"
                  >
                    {savingName ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNameInput(user.name || "");
                      setIsEditingName(false);
                    }}
                    className="h-8 px-2.5 text-zinc-400 hover:text-white text-xs font-medium"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">
                    {user.name || "AutoDMs Creator"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                    title="Edit name"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-zinc-400">{user.email}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] font-mono text-zinc-600 block">
              User ID: {user.id.slice(0, 8)}...
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Section 2 — Plan & Subscription */}
      {/* ========================================================================= */}
      <div className="bg-[#0A0A0A] border border-[#1F1F23] rounded-xl p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] space-y-6">
        <div className="flex items-center justify-between border-b border-[#18181B] pb-4">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-zinc-400" />
              Plan & monthly allowance
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Direct message throughput and active subscription tier
            </p>
          </div>
          <div className="px-3 py-1 rounded-lg bg-[#111111] border border-[#262626] text-zinc-300 text-xs font-medium">
            Active plan: <span className="text-white font-semibold">{currentPlanDetails.name}</span>
          </div>
        </div>

        {/* Usage Progress Meter */}
        <div className="space-y-2.5 p-4 rounded-xl bg-[#111111] border border-[#1F1F23]">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-zinc-400">
              <strong className="text-white font-bold">{user.dmsCountThisMonth}</strong> of {user.dmsLimit} DMs sent
            </span>
            <span className="text-zinc-400 font-medium">{remainingDms} remaining</span>
          </div>
          
          <div className="w-full h-2 bg-[#181818] border border-[#262626] rounded-full overflow-hidden">
            <div
              style={{ width: `${usagePercentage}%` }}
              className="h-full transition-all duration-300 rounded-full bg-white"
            />
          </div>

          <div className="text-xs text-zinc-500 pt-0.5">
            Resets on {resetDateFormatted} • No hidden overage fees
          </div>
        </div>

        {/* 3-Tier Subscription Grid */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Available subscription tiers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Free Starter */}
            <div className={`p-5 rounded-xl border flex flex-col justify-between space-y-4 ${
              user.planType === "FREE"
                ? "bg-[#111111] border-white/40 ring-1 ring-white/20"
                : "bg-[#0C0C0E] border-[#222222] hover:border-zinc-700"
            }`}>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-white">Free Starter</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Essential comment triggers</p>
                </div>
                <div>
                  <span className="text-xl font-bold text-white">$0</span>
                  <span className="text-xs text-zinc-500"> / month</span>
                </div>
                <ul className="text-xs text-zinc-400 space-y-1.5 border-t border-[#1C1C1E] pt-3">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-zinc-300" /> 150 DMs / month</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-zinc-300" /> 1 Instagram profile</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-zinc-300" /> Basic keyword matching</li>
                </ul>
              </div>
              <UpgradeButton plan="FREE" current={user.planType === "FREE"} />
            </div>

            {/* Creator Pro */}
            <div className={`p-5 rounded-xl border flex flex-col justify-between space-y-4 relative ${
              user.planType === "PRO"
                ? "bg-[#111111] border-white/40 ring-1 ring-white/20"
                : "bg-[#0C0C0E] border-[#222222] hover:border-zinc-700"
            }`}>
              {user.planType !== "PRO" && (
                <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-white text-black font-semibold text-[10px] shadow-sm">
                  Popular
                </span>
              )}
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-white">Creator Pro</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">High volume growth & story rewards</p>
                </div>
                <div>
                  <span className="text-xl font-bold text-white">$5</span>
                  <span className="text-xs text-zinc-500"> / month (50 DH)</span>
                </div>
                <ul className="text-xs text-zinc-400 space-y-1.5 border-t border-[#1C1C1E] pt-3">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-zinc-300" /> 3,000 DMs / month</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-zinc-300" /> Story mention triggers</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-zinc-300" /> Lead capture & CSV export</li>
                </ul>
              </div>
              <UpgradeButton plan="PRO" current={user.planType === "PRO"} />
            </div>

            {/* Business / Agency */}
            <div className={`p-5 rounded-xl border flex flex-col justify-between space-y-4 ${
              user.planType === "BUSINESS"
                ? "bg-[#111111] border-white/40 ring-1 ring-white/20"
                : "bg-[#0C0C0E] border-[#222222] hover:border-zinc-700"
            }`}>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-white">Business / Agency</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Multi-account scale for agencies</p>
                </div>
                <div>
                  <span className="text-xl font-bold text-white">$15</span>
                  <span className="text-xs text-zinc-500"> / month (150 DH)</span>
                </div>
                <ul className="text-xs text-zinc-400 space-y-1.5 border-t border-[#1C1C1E] pt-3">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-zinc-300" /> 15,000 DMs / month</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-zinc-300" /> Up to 3 Instagram profiles</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-zinc-300" /> Priority 24/7 Agency support</li>
                </ul>
              </div>
              <UpgradeButton plan="BUSINESS" current={user.planType === "BUSINESS"} />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Section 3 — Connected Instagram Workspaces */}
      {/* ========================================================================= */}
      <div className="bg-[#0A0A0A] border border-[#1F1F23] rounded-xl p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] space-y-5">
        <div className="flex items-center justify-between border-b border-[#18181B] pb-4">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-zinc-400" />
              Connected Instagram workspaces
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Profiles linked to this AutoDMs workspace for comment, story, and DM automation.
            </p>
          </div>
          <span className="text-xs font-medium text-zinc-400 bg-[#111111] border border-[#222222] px-2.5 py-1 rounded-md">
            {accounts.length} connected
          </span>
        </div>

        {accounts.length === 0 ? (
          <div className="p-8 border border-dashed border-[#262626] rounded-xl text-center space-y-3">
            <p className="text-sm font-medium text-white">No Instagram accounts connected</p>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Link your professional Creator or Business account to start automating DMs and story rewards.
            </p>
            <Link
              href="/dashboard/accounts"
              className="inline-flex items-center gap-1.5 px-4 h-9 bg-white hover:bg-zinc-200 text-black font-medium text-xs rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Connect Instagram account
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {accounts.map((acc) => {
              const isActive = acc.id === activeAccountId || (accounts.length === 1 && !activeAccountId);
              const isSwitching = switchingId === acc.id;
              const isDisconnecting = disconnectingId === acc.id;

              return (
                <div
                  key={acc.id}
                  className="flex items-center justify-between p-3.5 bg-[#111111] border border-[#1F1F23] rounded-xl hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-[#181818] border border-[#262626] flex items-center justify-center shrink-0">
                      {acc.profilePictureUrl ? (
                        <img
                          src={acc.profilePictureUrl}
                          alt={acc.pageName}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-white">
                          {acc.pageName[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="space-y-0.5 truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white truncate">
                          @{acc.pageName}
                        </span>
                        {isActive && (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium px-2 py-0.5 rounded-md shrink-0">
                            Active workspace
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 font-mono">
                        ID: {acc.instagramAccountId}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!isActive && (
                      <button
                        type="button"
                        onClick={() => handleSwitchAccount(acc.id)}
                        disabled={isSwitching}
                        className="px-3 h-8 bg-[#181818] hover:bg-[#222222] text-zinc-300 hover:text-white border border-[#2B2B2B] text-xs font-medium rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                      >
                        {isSwitching ? <Loader2 className="w-3 h-3 animate-spin" /> : "Switch to this workspace"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDisconnect(acc.id, acc.pageName)}
                      disabled={isDisconnecting}
                      className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent rounded-lg transition-colors"
                      title="Disconnect Instagram profile"
                    >
                      {isDisconnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="pt-2">
              <Link
                href="/dashboard/accounts"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Connect another Instagram profile &rarr;
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* Section 4 — Appearance & Theme Switcher */}
      {/* ========================================================================= */}
      <div className="bg-[#0A0A0A] border border-[#1F1F23] rounded-xl p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] space-y-4">
        <div className="border-b border-[#18181B] pb-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Moon className="w-4 h-4 text-zinc-400" />
            Appearance & theme
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Customize how AutoDMs looks and feels on your device.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <div className="inline-flex p-1 rounded-xl bg-[#111111] border border-[#222222] gap-1">
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                theme === "dark"
                  ? "bg-[#222222] text-white shadow-sm border border-zinc-700/50"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              Dark
            </button>

            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                theme === "light"
                  ? "bg-[#222222] text-white shadow-sm border border-zinc-700/50"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              Light
            </button>

            <button
              type="button"
              onClick={() => setTheme("system")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                theme === "system"
                  ? "bg-[#222222] text-white shadow-sm border border-zinc-700/50"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              System
            </button>
          </div>

          <span className="text-xs text-zinc-500">
            {theme === "dark" ? "High-contrast Vercel dark mode enabled" : theme === "light" ? "Clean light mode" : "Follows operating system preferences"}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Section 5 — Help, Support & Feedback */}
      {/* ========================================================================= */}
      <div className="bg-[#0A0A0A] border border-[#1F1F23] rounded-xl p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] space-y-4">
        <div className="border-b border-[#18181B] pb-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-zinc-400" />
            Help & Feedback
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Send a direct message or feature request to the AutoDMs team.
          </p>
        </div>

        <form onSubmit={handleSubmitFeedback} className="space-y-3 pt-1">
          <textarea
            rows={3}
            value={feedbackMessage}
            onChange={(e) => setFeedbackMessage(e.target.value)}
            placeholder="What can we improve or help you with?"
            className="w-full px-3 py-2 bg-[#111111] border border-[#262626] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors resize-none leading-relaxed"
          />

          <div className="flex items-center justify-between">
            {feedbackSuccess ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Thank you! Your message has been sent to our team.
              </span>
            ) : (
              <span className="text-[11px] text-zinc-500">
                We typically respond within 24 hours.
              </span>
            )}

            <button
              type="submit"
              disabled={sendingFeedback || !feedbackMessage.trim()}
              className="h-9 px-4 bg-white hover:bg-zinc-200 text-black font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-40 shadow-sm"
            >
              {sendingFeedback ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Send message
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* Section 6 — Log Out */}
      {/* ========================================================================= */}
      <div className="bg-[#0A0A0A] border border-red-950/40 rounded-xl p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h2 className="text-sm font-semibold text-white">Log out of session</h2>
          <p className="text-xs text-zinc-400">
            Log out of your active AutoDMs account on this device.
          </p>
        </div>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="bg-[#111111] hover:bg-red-950/20 text-zinc-300 hover:text-red-400 border border-zinc-800 hover:border-red-500/30 rounded-lg h-10 px-4 text-sm font-medium transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>

    </div>
  );
}
