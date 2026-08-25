import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Lock, FileText, Globe } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | AutoDMs",
  description: "Official Privacy Policy and Data Handling Terms for AutoDMs and Meta Platform Integration.",
};

export default function PrivacyPolicyPage() {
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
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Meta Platform Compliance Policy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: August 26, 2026</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">1. Introduction & Overview</h2>
            <p>
              AutoDMs (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) provides Instagram automation, direct messaging, and comment management tools for creators, businesses, and agencies. We are committed to protecting the privacy of our users and ensuring full transparency regarding data collection, processing, and security in compliance with Meta Platform Terms, GDPR, and CCPA.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">2. Information We Collect</h2>
            <p>To provide our automation services, AutoDMs requests and accesses specific data via the official Meta Graph API:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-foreground">Account Information:</strong> Instagram user ID, username, profile name, and profile picture URL.
              </li>
              <li>
                <strong className="text-foreground">Authentication Tokens:</strong> OAuth access tokens granted through Meta Business Login to interact with the Instagram Graph API on your behalf.
              </li>
              <li>
                <strong className="text-foreground">Media & Publications:</strong> Post IDs, reel IDs, permalinks, thumbnails, captions, and timestamp data required to configure specific post triggers.
              </li>
              <li>
                <strong className="text-foreground">Messaging & Comment Data:</strong> Inbound comment text, commenter username, direct message trigger requests, and delivery status logs.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">3. How We Use Your Information</h2>
            <p>We use the data collected strictly for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Executing automated direct message deliveries when triggered by user comments.</li>
              <li>Publishing automated public replies to Instagram comments based on your configured workflows.</li>
              <li>Displaying analytics, usage metrics, and execution logs in your AutoDMs dashboard.</li>
              <li>Ensuring account security and monitoring platform performance.</li>
            </ul>
            <p className="font-medium text-foreground">
              We never sell, rent, or monetize your personal data or your audience&apos;s data to third parties or advertisers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">4. Data Storage & Security</h2>
            <p>
              All access tokens and sensitive credentials are encrypted using industry-standard AES-256 encryption before storage. All communications between AutoDMs, your browser, and Meta servers are encrypted in transit using TLS 1.3 (HTTPS).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">5. Data Retention & Deletion</h2>
            <p>
              We retain your data only for as long as your account remains active. You can disconnect your Instagram account or request complete data deletion at any time by visiting our dedicated{" "}
              <Link href="/data-deletion" className="text-blue-500 hover:underline font-medium">
                Data Deletion Instructions Page
              </Link>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">6. Contact Us</h2>
            <p>
              If you have any questions or concerns regarding our privacy practices, you can contact our privacy team at{" "}
              <a href="mailto:yassinzarouk08@gmail.com" className="text-blue-500 hover:underline">
                yassinzarouk08@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
