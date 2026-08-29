import Link from "next/link";
import { MessageSquare, ArrowRight, Camera, Users, Sparkles, Send, CheckCircle2, ShieldCheck } from "lucide-react";
import LandingNav from "@/components/LandingNav";
import InstagramPreview from "@/components/InstagramPreview";
import PricingSection from "@/components/PricingSection";
import FaqAccordion from "@/components/FaqAccordion";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#000000] text-zinc-100 font-sans selection:bg-white/20 selection:text-white">
      
      {/* Floating Glassmorphic Navigation Bar */}
      <LandingNav />

      {/* Hero Section (Widescreen max-w-[1360px] 60/40 Split Layout) */}
      <section className="w-full max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-12 pt-32 sm:pt-36 pb-20 min-h-[90vh] flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full">
          
          {/* Left Column (7 Columns / 58% Width): Headline, Subtitle, Combined Pill CTA & Metrics */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08] max-w-2xl text-balance">
              Turn Instagram comments into direct sales.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-zinc-400 mt-6 leading-relaxed max-w-xl text-balance">
              When followers comment on your Reels or tag you in stories, AutoDMs instantly delivers your private links, product catalogs, and discount codes right inside their direct messages.
            </p>

            {/* Combined CTA Pill Input Form */}
            <form
              action="/login"
              className="bg-[#111114] border border-[#26262A] rounded-full p-1.5 flex items-center max-w-md mt-8 shadow-xl shadow-black/60 focus-within:border-zinc-500 transition-colors"
            >
              <input
                type="email"
                placeholder="Enter your email address"
                className="bg-transparent text-sm text-white px-4 flex-1 focus:outline-none placeholder:text-zinc-500 min-w-0"
              />
              <button
                type="submit"
                className="bg-white text-black font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-zinc-200 transition-all flex items-center gap-1.5 shrink-0 shadow-md"
              >
                <span>Start Free</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>

            {/* Trust & Metric Bar */}
            <div className="flex flex-wrap items-center gap-6 mt-8 text-xs text-zinc-500 font-mono pt-2">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                100% Meta Compliant
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-zinc-400">
                &lt;2s Average Dispatch
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-zinc-400">
                99.9% Uptime
              </span>
            </div>

          </div>

          {/* Right Column (5 Columns / 42% Width): Backdrop Accent Card & Elevated iPhone */}
          <div id="preview" className="lg:col-span-5 relative flex items-center justify-center w-full">
            {/* Backdrop Accent Frame matching PlutoPay visual depth */}
            <div className="w-full rounded-[44px] bg-gradient-to-br from-zinc-800/80 via-zinc-900/60 to-black border border-white/10 shadow-2xl p-6 sm:p-8 relative flex items-center justify-center">
              {/* Subtle ambient glow behind phone */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-blue-600/10 via-purple-600/10 to-rose-500/10 rounded-[48px] blur-2xl -z-10 opacity-70" />
              
              {/* Elevated iPhone Mockup */}
              <div className="w-full max-w-[340px]">
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

        </div>
      </section>

      {/* SECTION 2: HIGH-CONTRAST FEATURE SHOWCASE ("We Made Automations Easier") */}
      <section id="features" className="py-24 border-t border-[#1F1F1F] bg-[#000000]">
        <div className="w-full max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-12 space-y-12">
          
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              We Made Automations Easier
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Everything you need to automate conversations, capture leads, and boost conversions without complex setup.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            
            {/* Card 1: Comment-to-DM */}
            <div className="p-7 sm:p-8 bg-[#0A0A0A] border border-[#222222] rounded-2xl space-y-5 shadow-sm hover:border-zinc-700 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                {/* Visual Mini Flow Preview */}
                <div className="p-3 bg-[#111114] border border-[#1E1E22] rounded-xl flex items-center justify-between text-xs">
                  <div className="bg-zinc-800 px-2.5 py-1 rounded-lg text-white font-medium">
                    &quot;PRICE&quot;
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
                  <div className="bg-white/10 text-white font-medium px-2.5 py-1 rounded-lg">
                    Link sent! 📩
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <MessageSquare className="w-4 h-4 text-zinc-300" strokeWidth={2} />
                    <h3 className="text-base font-bold text-white">Comment-to-DM Triggers</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    Automatically reply to Reel and post comments with customized links, files, and discount codes in seconds.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Story Mention Rewards */}
            <div className="p-7 sm:p-8 bg-[#0A0A0A] border border-[#222222] rounded-2xl space-y-5 shadow-sm hover:border-zinc-700 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                {/* Visual Mini Flow Preview */}
                <div className="p-3 bg-[#111114] border border-[#1E1E22] rounded-xl flex items-center justify-between text-xs">
                  <div className="bg-zinc-800 px-2.5 py-1 rounded-lg text-white font-medium">
                    @story tag
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
                  <div className="bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium px-2.5 py-1 rounded-lg">
                    15% Code 🎁
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <Camera className="w-4 h-4 text-amber-400" strokeWidth={2} />
                    <h3 className="text-base font-bold text-white">Story Mention Rewards</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    Reward followers who mention your handle in their Instagram stories with automated direct message thank-yous.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Lead Capture & Contact Export */}
            <div className="p-7 sm:p-8 bg-[#0A0A0A] border border-[#222222] rounded-2xl space-y-5 shadow-sm hover:border-zinc-700 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                {/* Visual Mini Flow Preview */}
                <div className="p-3 bg-[#111114] border border-[#1E1E22] rounded-xl flex items-center justify-between text-xs">
                  <div className="bg-zinc-800 px-2.5 py-1 rounded-lg text-white font-medium truncate max-w-[120px]">
                    📧 contact@...
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
                  <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium px-2.5 py-1 rounded-lg">
                    CSV Synced ✓
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <Users className="w-4 h-4 text-emerald-400" strokeWidth={2} />
                    <h3 className="text-base font-bold text-white">Lead Capture & Contact Export</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    Collect verified email addresses and phone numbers right in the DM thread and export directly to CSV.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 3: PRICING SECTION */}
      <PricingSection />

      {/* SECTION 4: FAQ SECTION */}
      <FaqAccordion />

      {/* Footer */}
      <footer className="border-t border-[#1F1F1F] bg-[#000000] py-12 text-xs text-zinc-500">
        <div className="w-full max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 font-semibold text-white text-sm">
            <img src="/logo.png" alt="AutoDMs" className="h-6 w-auto object-contain" />
          </div>
          <div className="text-center md:text-left space-y-1">
            <div>
              © 2026 AutoDMs. Operated by <strong className="text-zinc-300">Yassine Zerouk</strong>. All rights reserved.
            </div>
            <div className="text-zinc-500 text-[11px]">
              BD AL MASSIRA, LOTISSEMENT AL WIAM, LOT N 1,12, Kenitra, Morocco · <a href="mailto:contact@codexity.dev" className="text-zinc-400 hover:underline">contact@codexity.dev</a>
            </div>
          </div>
          <div className="flex items-center gap-6 text-zinc-400 text-xs">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/data-deletion" className="hover:text-white transition-colors">Data Deletion</Link>
            <Link href="/login" className="hover:text-white transition-colors">Log In</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
