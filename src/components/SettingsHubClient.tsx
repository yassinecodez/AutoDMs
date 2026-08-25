"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
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
  // Theme state via next-themes
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Profile Name State
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user.name || "");
  const [savingName, setSavingName] = useState(false);
  const [nameSavedSuccess, setNameSavedSuccess] = useState(false);

  // Feedback State
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
      <div className="space-y-1 pb-6 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your personal profile, appearance, and feedback.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* Card 1 — Personal Profile (Body + Footer Architecture) */}
      {/* ========================================================================= */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
        {/* Card Body */}
        <div className="p-6 space-y-5">
          <div className="space-y-0.5">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-muted-foreground" />
              Profile details
            </h2>
            <p className="text-xs text-muted-foreground">
              Your personal account identity across AutoDMs.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            {/* Avatar & User Details */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-secondary border border-border text-foreground font-semibold text-base flex items-center justify-center shrink-0 shadow-inner">
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
                      className="h-8 px-2.5 bg-secondary border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleSaveName}
                      disabled={savingName}
                      className="h-8 px-3 bg-primary hover:opacity-90 text-primary-foreground font-medium text-xs rounded-lg transition-colors flex items-center gap-1"
                    >
                      {savingName ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNameInput(user.name || "");
                        setIsEditingName(false);
                      }}
                      className="h-8 px-2.5 text-muted-foreground hover:text-foreground text-xs font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {user.name || "AutoDMs Creator"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingName(true)}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1"
                      title="Edit name"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[11px] font-mono text-muted-foreground block">
                User ID: {user.id.slice(0, 8)}...
              </span>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="border-t border-border bg-card-footer px-6 py-3.5 flex items-center justify-between text-xs text-muted-foreground">
          <span>Logged in via Google Authentication</span>
          {nameSavedSuccess ? (
            <span className="inline-flex items-center gap-1 text-emerald-500 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Changes saved
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingName(true)}
              className="font-medium text-foreground hover:underline"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Card 2 — Appearance & Theme (Body + Footer Architecture) */}
      {/* ========================================================================= */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
        {/* Card Body */}
        <div className="p-6 space-y-4">
          <div className="space-y-0.5">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Moon className="w-4 h-4 text-muted-foreground" />
              Appearance
            </h2>
            <p className="text-xs text-muted-foreground">
              Customize how AutoDMs looks and feels on your device.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <div className="inline-flex p-1 rounded-xl bg-secondary border border-border gap-1">
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  mounted && (theme === "dark" || (theme === "system" && resolvedTheme === "dark"))
                    ? "bg-card text-foreground shadow-sm border border-border font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                Dark
              </button>

              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  mounted && (theme === "light" || (theme === "system" && resolvedTheme === "light"))
                    ? "bg-card text-foreground shadow-sm border border-border font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                Light
              </button>

              <button
                type="button"
                onClick={() => setTheme("system")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  mounted && theme === "system"
                    ? "bg-card text-foreground shadow-sm border border-border font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                System
              </button>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="border-t border-border bg-card-footer px-6 py-3.5 text-xs text-muted-foreground">
          Preferences are automatically saved to your browser session.
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Card 3 — Help & Support Feedback (Body + Footer Architecture) */}
      {/* ========================================================================= */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
        <form onSubmit={handleSubmitFeedback}>
          {/* Card Body */}
          <div className="p-6 space-y-4">
            <div className="space-y-0.5">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                Help & Feedback
              </h2>
              <p className="text-xs text-muted-foreground">
                Send a message or feature request directly to our team.
              </p>
            </div>

            <textarea
              rows={3}
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              placeholder="What can we improve or help you with?"
              className="w-full px-3 py-2 bg-secondary border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Card Footer */}
          <div className="border-t border-border bg-card-footer px-6 py-3.5 flex items-center justify-between text-xs">
            {feedbackSuccess ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-500 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Thank you! Your feedback has been sent to our team.
              </span>
            ) : (
              <span className="text-muted-foreground">
                We typically respond within 24 hours.
              </span>
            )}

            <button
              type="submit"
              disabled={sendingFeedback || !feedbackMessage.trim()}
              className="h-9 px-4 bg-primary text-primary-foreground hover:opacity-90 font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-40 shadow-sm"
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
      {/* Card 4 — Danger Zone / Log Out (Body + Footer Architecture) */}
      {/* ========================================================================= */}
      <div className="bg-card border border-red-900/30 rounded-xl overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
        {/* Card Body */}
        <div className="p-6 space-y-1 bg-red-950/5">
          <h2 className="text-base font-semibold text-red-500 flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Log Out
          </h2>
          <p className="text-xs text-muted-foreground">
            Sign out of your active AutoDMs session on this device.
          </p>
        </div>

        {/* Card Footer */}
        <div className="border-t border-red-900/20 bg-red-950/10 px-6 py-3.5 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            You will be redirected to the login screen.
          </span>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="h-9 px-4 bg-card hover:bg-red-500/10 text-red-400 border border-red-500/30 hover:border-red-500/50 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
          >
            Log Out &rarr;
          </button>
        </div>
      </div>

    </div>
  );
}
