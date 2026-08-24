import Link from "next/link";
import { MessageSquare, ArrowRight, Camera, Users, Zap, Shield, Check } from "lucide-react";
import InstagramPreview from "@/components/InstagramPreview";
import PricingSection from "@/components/PricingSection";
import FaqAccordion from "@/components/FaqAccordion";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#000000] text-zinc-100 font-sans selection:bg-white/20 selection:text-white">
      
      {/* Navigation Header */}
      <header className="sticky top-0 bg-[#000000]/80 backdrop-blur-md border-b border-[#1F1F1F] z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-semibold text-white text-sm tracking-tight select-none">
            <span className="w-2 h-2 rounded-full bg-white inline-block" />
            <span>AutoDMs</span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#preview" className="hover:text-white transition-colors">Preview</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          {/* CTA Group */}
          <div className="flex items-center gap-3 text-xs font-medium">
            <Link href="/login" className="text-zinc-400 hover:text-white transition-colors px-2 py-1">
              Log in
            </Link>
            <Link
              href="/login"
              className="h-8 px-3.5 bg-white hover:bg-zinc-200 text-black font-medium rounded-lg flex items-center transition-colors shadow-sm"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-28 max-w-4xl mx-auto px-6 text-center space-y-7">
        
        {/* Headline */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white max-w-3xl mx-auto leading-[1.08] text-balance">
            Turn Instagram comments into direct sales.
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed text-balance">
            When followers comment on your Reels or tag you in stories, AutoDMs instantly sends them your private link, product catalog, or discount in direct messages.
          </p>
        </div>

        {/* CTA Button */}
        <div className="space-y-2 max-w-xs mx-auto">
          <Link
            href="/login"
            className="w-full h-11 bg-white hover:bg-zinc-200 text-black font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            Start automating free
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </Link>
          <p className="text-xs text-zinc-500">
            No credit card required • Free 150 DMs included
          </p>
        </div>

        {/* Minimalist Inline Proof Bar */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-zinc-400 font-medium">
          <span className="flex items-center gap-1.5 text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            100% Meta API Compliant
          </span>
          <span className="text-zinc-700">•</span>
          <span className="flex items-center gap-1.5 text-zinc-300">
            &lt;2s Average Dispatch
          </span>
          <span className="text-zinc-700">•</span>
          <span className="flex items-center gap-1.5 text-zinc-300">
            99.9% Uptime
          </span>
        </div>

        {/* Authentic 1:1 Instagram iOS Dark Mode Interactive Preview */}
        <div id="preview" className="pt-10 max-w-lg mx-auto">
          <InstagramPreview
            username="your_brand"
            triggerKeyword="PRICE"
            replyDmMessage="Hey Sarah! Here is the direct link to the dress you saw on our Reel. Use code SUMMER20 for 20% off at checkout!"
            publicReplyComment="Just sent you a DM with the direct link! 📩"
            buttonTitle="Shop Dress with 20% Off"
            buttonUrl="https://example.com/shop"
          />
        </div>

      </section>

      {/* Feature Showcase Grid */}
      <section id="features" className="py-20 border-t border-[#1F1F1F] bg-[#000000]">
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Built for Instagram creators & brands</h2>
            <p className="text-zinc-400 text-xs sm:text-sm">Everything you need to automate conversations, capture leads, and boost conversions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 bg-[#0A0A0A] border border-[#222222] rounded-xl space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#111111] border border-[#222222] flex items-center justify-center text-white">
                <MessageSquare className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <h3 className="text-sm font-semibold text-white">Comment-to-DM Triggers</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Automatically reply to Reel and post comments with customized links, files, and discount codes in seconds.
              </p>
            </div>

            <div className="p-6 bg-[#0A0A0A] border border-[#222222] rounded-xl space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#111111] border border-[#222222] flex items-center justify-center text-white">
                <Camera className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <h3 className="text-sm font-semibold text-white">Story Mention Rewards</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Reward followers who mention your handle in their Instagram stories with automated direct message thank-yous.
              </p>
            </div>

            <div className="p-6 bg-[#0A0A0A] border border-[#222222] rounded-xl space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#111111] border border-[#222222] flex items-center justify-center text-white">
                <Users className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <h3 className="text-sm font-semibold text-white">Lead Capture & CSV Export</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Collect verified email addresses and phone numbers right in the DM thread and export directly to CSV.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* FAQ Section */}
      <FaqAccordion />

      {/* Footer */}
      <footer className="border-t border-[#1F1F1F] bg-[#000000] py-8 text-center text-xs text-zinc-500">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            AutoDMs
          </div>
          <p>© 2026 AutoDMs Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-zinc-300 transition-colors">Dashboard</Link>
            <Link href="/login" className="hover:text-zinc-300 transition-colors">Privacy</Link>
            <Link href="/login" className="hover:text-zinc-300 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
