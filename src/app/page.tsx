import Link from "next/link";
import { MessageSquare, ArrowRight, Camera, Users } from "lucide-react";
import LandingNav from "@/components/LandingNav";
import InstagramPreview from "@/components/InstagramPreview";
import PricingSection from "@/components/PricingSection";
import FaqAccordion from "@/components/FaqAccordion";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#000000] text-zinc-100 font-sans selection:bg-white/20 selection:text-white">
      
      {/* Floating Glassmorphic Navigation Bar with Frosted Shield */}
      <LandingNav />

      {/* Hero Section (Widescreen max-w-[1400px] 50/50 Balanced 2-Column Split) */}
      <section className="w-full max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 min-h-[calc(100vh-5rem)] pt-32 pb-20 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
          
          {/* Left Column (50%): Headline, Copy, CTA & Proof */}
          <div className="space-y-8 text-left">
            
            {/* Headline */}
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.06] text-balance">
                Turn Instagram comments into direct sales.
              </h1>
              <p className="text-base sm:text-lg text-zinc-400 mt-6 leading-relaxed max-w-xl text-balance">
                When followers comment on your Reels or tag you in stories, AutoDMs instantly delivers your private link, product catalog, or discount code right inside their direct messages.
              </p>
            </div>

            {/* CTA Area */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 max-w-md">
                <Link
                  href="/login"
                  className="h-12 px-8 bg-white hover:bg-zinc-200 text-black font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-xl shadow-white/5"
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
            <div className="pt-4 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-zinc-400 font-medium">
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

          {/* Right Column (50%): Apple iPhone Mockup Centered with Glow */}
          <div id="preview" className="relative flex items-center justify-center w-full">
            {/* Visual Depth Backdrop Card / Glow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600/20 via-purple-600/15 to-rose-500/10 rounded-[52px] blur-3xl -z-10 opacity-80" />
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
      <section id="features" className="py-24 border-t border-[#1F1F1F] bg-[#000000]">
        <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 space-y-12">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">Built for Instagram creators & brands</h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Everything you need to automate conversations, capture leads, and boost conversions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="p-7 sm:p-8 bg-[#0A0A0A] border border-[#222222] rounded-2xl space-y-4 shadow-sm hover:border-zinc-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#111111] border border-[#222222] flex items-center justify-center text-white">
                <MessageSquare className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <h3 className="text-base font-bold text-white">Comment-to-DM Triggers</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Automatically reply to Reel and post comments with customized links, files, and discount codes in seconds.
              </p>
            </div>

            <div className="p-7 sm:p-8 bg-[#0A0A0A] border border-[#222222] rounded-2xl space-y-4 shadow-sm hover:border-zinc-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#111111] border border-[#222222] flex items-center justify-center text-white">
                <Camera className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <h3 className="text-base font-bold text-white">Story Mention Rewards</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Reward followers who mention your handle in their Instagram stories with automated direct message thank-yous.
              </p>
            </div>

            <div className="p-7 sm:p-8 bg-[#0A0A0A] border border-[#222222] rounded-2xl space-y-4 shadow-sm hover:border-zinc-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#111111] border border-[#222222] flex items-center justify-center text-white">
                <Users className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <h3 className="text-base font-bold text-white">Lead Capture & CSV Export</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
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
      <footer className="border-t border-[#1F1F1F] bg-[#000000] py-12 text-center text-xs text-zinc-500">
        <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 font-semibold text-white text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-white inline-block" />
            AutoDMs
          </div>
          <div>
            © 2026 AutoDMs Inc. 100% Meta Graph API Compliant.
          </div>
          <div className="flex items-center gap-6 text-zinc-400 text-xs">
            <Link href="/login" className="hover:text-white transition-colors">Log In</Link>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
