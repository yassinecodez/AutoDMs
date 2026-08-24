import Link from "next/link";
import { MessageSquare, ArrowRight, Zap, Shield, Users, Heart, Send, Check, Camera, Clock, BarChart3, ChevronRight } from "lucide-react";
import PricingSection from "@/components/PricingSection";
import FaqAccordion from "@/components/FaqAccordion";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0F0F0F] text-zinc-100 font-sans selection:bg-[#00DF81]/25 selection:text-white">
      
      {/* Navigation Header */}
      <header className="sticky top-0 bg-[#0F0F0F]/90 backdrop-blur-md border-b border-[#27272A] z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-zinc-100 text-sm tracking-tight select-none">
            <span className="w-2 h-2 rounded-full bg-[#00DF81] inline-block shadow-[0_0_8px_rgba(0,223,129,0.6)]" />
            <span>AutoDMs</span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-zinc-400">
            <a href="#features" className="hover:text-zinc-200 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-zinc-200 transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-zinc-200 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-zinc-200 transition-colors">FAQ</a>
          </nav>

          {/* CTA Group */}
          <div className="flex items-center gap-4 text-xs font-medium">
            <Link href="/login" className="text-zinc-400 hover:text-zinc-200 transition-colors">
              Log in
            </Link>
            <Link
              href="/login"
              className="h-8 px-3.5 bg-[#00DF81] hover:bg-[#00C770] text-[#000000] font-semibold rounded-lg flex items-center transition-all active:scale-95 shadow-sm"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-28 max-w-6xl mx-auto px-6 text-center space-y-8">
        
        {/* Top Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181B] border border-[#27272A] text-zinc-400 text-[10px] font-semibold uppercase tracking-wider mx-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00DF81]" />
          Official Meta Graph API Tech Provider
        </div>

        {/* Headline */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-zinc-100 tracking-tight leading-[1.08] text-balance">
            Convert Instagram Comments & Story Mentions into Direct Sales
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed text-balance">
            When followers comment on your Reels or tag you in stories, AutoDMs instantly sends them your private link, product catalog, or discount in direct messages.
          </p>
        </div>

        {/* Action Button */}
        <div className="space-y-2 max-w-xs mx-auto">
          <Link
            href="/login"
            className="w-full h-11 bg-[#00DF81] hover:bg-[#00C770] text-[#000000] font-semibold rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
          >
            Start automating free
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </Link>
          <p className="text-[11px] text-zinc-500">
            No credit card required • Free 150 DMs included
          </p>
        </div>

        {/* Social Proof Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-6 text-center">
          <div className="p-3 bg-[#18181B] border border-[#27272A] rounded-xl">
            <p className="text-lg font-bold text-zinc-100">100%</p>
            <p className="text-[11px] text-zinc-400">Meta API Compliant</p>
          </div>
          <div className="p-3 bg-[#18181B] border border-[#27272A] rounded-xl">
            <p className="text-lg font-bold text-zinc-100">&lt;2s</p>
            <p className="text-[11px] text-zinc-400">Average DM Dispatch</p>
          </div>
          <div className="p-3 bg-[#18181B] border border-[#27272A] rounded-xl">
            <p className="text-lg font-bold text-zinc-100">5x</p>
            <p className="text-[11px] text-zinc-400">Engagement Boost</p>
          </div>
          <div className="p-3 bg-[#18181B] border border-[#27272A] rounded-xl">
            <p className="text-lg font-bold text-zinc-100">99.9%</p>
            <p className="text-[11px] text-zinc-400">Uptime Reliability</p>
          </div>
        </div>

        {/* Interactive Live Demo Widget */}
        <div className="pt-8 max-w-4xl mx-auto text-left">
          <div className="bg-[#18181B] border border-[#27272A] rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            
            {/* Reel Comment Side */}
            <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-[#27272A] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[8px] font-bold text-zinc-400">Reel</div>
                  <span className="text-[10px] font-semibold text-zinc-300 uppercase tracking-wider">Instagram Reel</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">1.2M views</span>
              </div>
              
              <div className="space-y-3 pt-2">
                {/* User Comment */}
                <div className="flex gap-2.5 items-start">
                  <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-[9px] text-zinc-300">SK</div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-semibold text-zinc-300">@sarah_k</p>
                    <p className="text-xs text-zinc-100 bg-[#0F0F0F] border border-[#27272A] px-3 py-1.5 rounded-lg inline-block">
                      Where can I buy this dress? <strong className="text-[#00DF81]">"PRICE"</strong>
                    </p>
                  </div>
                </div>

                {/* AutoDMs Public Reply */}
                <div className="flex gap-2.5 items-start pl-6">
                  <div className="w-6 h-6 rounded-full bg-[#00DF81] flex items-center justify-center font-bold text-[9px] text-black">AD</div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-semibold text-zinc-300">your_brand <span className="text-[8px] font-medium text-[#00DF81] border border-[#00DF81]/25 px-1 py-0.2 rounded ml-1 bg-[#00DF81]/5">AutoDMs</span></p>
                    <p className="text-xs text-zinc-400 italic">
                      Just sent you a DM with the product link and discount code! 📩
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Message Inbox Side */}
            <div className="flex-1 p-6 space-y-4 bg-black flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#00DF81]/15 flex items-center justify-center text-[8px] font-bold text-[#00DF81]">DM</div>
                  <span className="text-[10px] font-semibold text-zinc-300 uppercase tracking-wider">Direct Message</span>
                </div>
                <span className="text-[10px] text-[#00DF81] font-semibold">Delivered (0.8s)</span>
              </div>

              <div className="space-y-2 pt-2">
                <div className="p-3 bg-[#18181B] border border-[#27272A] rounded-xl space-y-2 text-xs">
                  <p className="font-semibold text-zinc-200">Hey Sarah! ✨</p>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Here is the direct link to the dress you saw on our Reel. Use code <strong className="text-[#00DF81]">SUMMER20</strong> for 20% off at checkout!
                  </p>
                  <div className="pt-1">
                    <div className="py-1.5 px-3 bg-zinc-800 text-center font-semibold text-xs text-[#00DF81] rounded-lg border border-zinc-700 select-none">
                      👉 Shop Dress with 20% Off
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-zinc-500 font-mono text-center">
                Automated via official Meta Instagram Graph API
              </p>
            </div>

          </div>
        </div>

      </section>

      {/* Feature Showcase Grid */}
      <section id="features" className="py-20 border-t border-[#27272A] bg-[#0F0F0F]">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-[#00DF81] uppercase tracking-widest">Capabilities</span>
            <h2 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Built for modern Instagram growth</h2>
            <p className="text-zinc-400 text-xs md:text-sm">Everything you need to automate conversations, capture leads, and boost engagement.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[#18181B] border border-[#27272A] rounded-xl space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#0F0F0F] border border-[#27272A] flex items-center justify-center text-[#00DF81]">
                <MessageSquare className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <h3 className="text-base font-bold text-zinc-100">Comment-to-DM Triggers</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Automatically reply to comments with personalized links, discounts, and files within seconds of posting.
              </p>
            </div>

            <div className="p-6 bg-[#18181B] border border-[#27272A] rounded-xl space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#0F0F0F] border border-[#27272A] flex items-center justify-center text-[#00DF81]">
                <Camera className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <h3 className="text-base font-bold text-zinc-100">Story Mention Rewards</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Reward followers who tag you in their stories with instant coupon codes, building viral brand advocacy.
              </p>
            </div>

            <div className="p-6 bg-[#18181B] border border-[#27272A] rounded-xl space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#0F0F0F] border border-[#27272A] flex items-center justify-center text-[#00DF81]">
                <Users className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <h3 className="text-base font-bold text-zinc-100">2-Step Lead Capture</h3>
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
      <footer className="border-t border-[#27272A] bg-[#0F0F0F] py-8 text-center text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00DF81]" />
            AutoDMs
          </div>
          <p>© 2026 AutoDMs. All rights reserved. Meta Graph API Tech Provider.</p>
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
