import React from "react";
import Link from "next/link";
import { FileText, ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Terms of Service | AutoDMs",
  description: "Terms of Service and Acceptable Use Policy for AutoDMs.",
};

export default function TermsOfServicePage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-semibold">
            <FileText className="w-3.5 h-3.5" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">Last updated: August 26, 2026</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By creating an account or using AutoDMs (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">2. Description of Service</h2>
            <p>
              AutoDMs is a software-as-a-service (SaaS) platform that enables authorized Instagram Business and Creator account owners to automate direct messaging, comment responses, and lead capture workflows in accordance with Meta Platform Policies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">3. User Responsibilities & Compliance</h2>
            <p>You agree that when using AutoDMs, you will strictly adhere to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Meta&apos;s Terms of Service and Community Guidelines.</li>
              <li>Applicable anti-spam regulations (CAN-SPAM Act, GDPR, etc.).</li>
              <li>You will not use AutoDMs to send unsolicited commercial spam, harass users, or distribute deceptive content.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">4. Account Ownership & Termination</h2>
            <p>
              You maintain full ownership of your Instagram account and content. You may terminate your AutoDMs account at any time by disconnecting your Instagram account in your dashboard or by requesting data deletion.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">5. Limitation of Liability</h2>
            <p>
              AutoDMs provides the platform on an &quot;as is&quot; and &quot;as available&quot; basis. We are not responsible for any actions taken by Meta or Instagram regarding your social media accounts.
            </p>
          </section>

          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="text-lg font-semibold text-foreground">6. Legal Entity & Contact Information</h2>
            <p>
              AutoDMs is legally owned and operated by <strong className="text-foreground">Yassine Zerouk</strong>.
            </p>
            <p className="text-xs text-muted-foreground">
              Address: BD AL MASSIRA, LOTISSEMENT AL WIAM, LOT N 1,12, Kenitra, Morocco<br />
              Email: <a href="mailto:contact@codexity.dev" className="text-blue-500 hover:underline">contact@codexity.dev</a><br />
              Official Website: <a href="https://codexity.dev" className="text-blue-500 hover:underline">https://codexity.dev</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
