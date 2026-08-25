"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  User as UserIcon,
  Moon,
  Sun,
  Laptop,
  MessageSquare,
  LogOut,
  Loader2,
  Send,
  Edit2,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { updateProfileName, submitFeedbackAction } from "@/app/dashboard/settings/actions";

interface UserData {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

interface SettingsHubClientProps {
  user: UserData;
}

export default function SettingsHubClient({ user }: SettingsHubClientProps) {
  // Section 1: Profile Name State
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user.name || "");
  const [savingName, setSavingName] = useState(false);
  const [nameSavedSuccess, setNameSavedSuccess] = useState(false);

  // Section 2: Theme switcher state
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");

  // Section 3: Feedback state
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

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
      alert("Failed to send feedback: " + err.message);
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
          Manage your personal profile, appearance, and feedback.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* Card 1 — Profile Details */}
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
      {/* Card 2 — Appearance & Theme Switcher */}
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
      {/* Card 3 — Help, Support & Feedback */}
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
                Thank you! Your feedback has been sent to our team.
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
                  Send Feedback
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* Card 4 — Account Actions / Log Out */}
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
