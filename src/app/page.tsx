import Link from "next/link";
import { MessageSquare, ArrowRight, Camera, Users, Zap, Shield, Check, Sparkles } from "lucide-react";
import LandingNav from "@/components/LandingNav";
import InstagramPreview from "@/components/InstagramPreview";
import PricingSection from "@/components/PricingSection";
import FaqAccordion from "@/components/FaqAccordion";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#000000] text-zinc-100 font-sans selection:bg-white/20 selection:text-white">
      
      {/* Floating Glassmorphic Navigation Bar */}
      <LandingNav />

      {/* Hero Section (2-Column Split Layout) */}
      <section className="pt-32 sm:pt-40 pb-20 md:pb-28 max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column (7 cols): Headline, Copy, CTA & Trust Bar */}
          <div className="lg:col-span-7 space-y-7 text-left">
            
            {/* Top Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs font-medium text-zinc-300 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              <span>Official Meta Instagram Graph API</span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.08] text-balance">
                Turn Instagram comments into direct sales.
              </h1>
              <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-xl text-balance">
                When followers comment on your Reels or tag you in stories, AutoDMs instantly delivers your private link, product catalog, or discount code right inside their direct messages.
              </p>
            </div>

            {/* CTA Area */}
            <div className="space-y-3 pt-1">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-md">
                <Link
                  href="/login"
                  className="h-12 px-6 bg-white hover:bg-zinc-200 text-black font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-white/5"
                >
                  <span>Start automating free</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
              </div>
              <p className="text-xs text-zinc-500">
                No credit card required • Free 150 DMs included
              </p>
            </div>

            {/* Minimalist Inline Proof Bar */}
            <div className="pt-3 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-zinc-400 font-medium">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
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

          </div>

          {/* Right Column (5 cols): Authentic Apple iPhone Mockup with Accent Backdrop Glow */}
          <div id="preview" className="lg:col-span-5 relative flex items-center justify-center">
            {/* Visual Depth Backdrop Card / Glow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600/20 via-purple-600/15 to-rose-500/10 rounded-[52px] blur-2xl -z-10 opacity-75" />
            <div className="w-full max-w-[360px]">
              <InstagramPreview
                username="your_brand"
                triggerKeyword="PRICE"
                replyDmMessage="Hey Sarah! Here is the direct link to the dress you saw on our Reel. Use code SUMMER20 for 20% off at checkout!"
                publicReplyComment="Just sent you a DM with the direct link! 📩"
                buttonTitle="Shop Dress with 20% Off"
                buttonUrl="https://example.com/shop"
              />
            </div>
          </div>

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
            <div className="p-6 bg-[#0A0A0A] border border-[#222222] rounded-xl space-y-3 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-[#111111] border border-[#222222] flex items-center justify-center text-white">
                <MessageSquare className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <h3 className="text-sm font-semibold text-white">Comment-to-DM Triggers</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Automatically reply to Reel and post comments with customized links, files, and discount codes in seconds.
              </p>
            </div>

            <div className="p-6 bg-[#0A0A0A] border border-[#222222] rounded-xl space-y-3 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-[#111111] border border-[#222222] flex items-center justify-center text-white">
                <Camera className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <h3 className="text-sm font-semibold text-white">Story Mention Rewards</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Reward followers who mention your handle in their Instagram stories with automated direct message thank-yous.
              </p>
            </div>

            <div className="p-6 bg-[#0A0A0A] border border-[#222222] rounded-xl space-y-3 shadow-sm">
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
            <span className="w-2 h-2 rounded-full bg-white inline-block" />
            AutoDMs
          </div>
          <div>
            © 2026 AutoDMs Inc. 100% Meta Graph API Compliant.
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <Link href="/login" className="hover:text-white transition-colors">Log In</Link>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
