import React from "react";
import Link from "next/link";
import { Trash2, ArrowLeft, CheckCircle2, ShieldCheck, Mail } from "lucide-react";

export const metadata = {
  title: "User Data Deletion Instructions | AutoDMs",
  description: "Official instructions for deleting your user data from AutoDMs in accordance with Meta Platform policies.",
};

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Header */}
        <div className="space-y-4 border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-semibold">
            <Trash2 className="w-3.5 h-3.5" />
            <span>Meta Data Deletion Callback & Instructions</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">User Data Deletion Instructions</h1>
          <p className="text-sm text-muted-foreground">
            In accordance with Meta Platform Terms, AutoDMs provides transparent options to request complete deletion of your data.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-4 bg-secondary/30 border border-border rounded-2xl p-6 sm:p-8">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Option 1: Instant Self-Service Deletion via Dashboard</span>
            </h2>
            <p>You can instantly delete all your data and disconnect your Instagram accounts directly from your AutoDMs dashboard:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Log into your AutoDMs account.</li>
              <li>Navigate to <strong>Dashboard ➔ Accounts</strong>.</li>
              <li>Click the <strong>Trash / Disconnect</strong> icon next to any connected Instagram account.</li>
              <li>All associated access tokens, automations, execution logs, and cached profile data will be permanently deleted immediately.</li>
            </ol>
          </section>

          <section className="space-y-4 bg-secondary/30 border border-border rounded-2xl p-6 sm:p-8">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              <span>Option 2: Revoke Access via Facebook / Instagram Settings</span>
            </h2>
            <p>You can remove AutoDMs directly from your Meta / Facebook account settings:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Go to your Facebook Profile <strong>Settings & Privacy ➔ Settings</strong>.</li>
              <li>In the left sidebar, click <strong>Business Integrations</strong> or <strong>Apps and Websites</strong>.</li>
              <li>Locate <strong>AutoDMs</strong> and click <strong>Remove</strong>.</li>
              <li>Check the box to delete all posts, videos, or events AutoDMs may have posted.</li>
              <li>Meta will automatically notify our Data Deletion Callback endpoint, triggering immediate data purge.</li>
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
