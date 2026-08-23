import Link from "next/link";
import { MessageSquare, ArrowRight, Compass, Settings, Zap, Shield, Users, Heart, Send, Check } from "lucide-react";
import PricingSection from "@/components/PricingSection";
import FaqAccordion from "@/components/FaqAccordion";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 font-sans selection:bg-[#00DF81]/30 selection:text-white">
      
      {/* Navigation Header */}
      <header className="sticky top-0 bg-[#0B0F17]/90 backdrop-blur-md border-b border-[#1F2937]/50 z-50 transition-colors">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-black text-white text-base tracking-tight select-none">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00DF81] inline-block animate-pulse" />
            AutoDMs
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          {/* CTA Group */}
          <div className="flex items-center gap-5 text-xs font-semibold">
            <Link href="/login" className="text-slate-300 hover:text-white transition-colors">
              Log in
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 bg-[#00DF81] hover:bg-[#00C770] text-[#000000] font-bold rounded-xl transition-all shadow-md shadow-[#00DF81]/5 active:scale-95"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-28 max-w-6xl mx-auto px-6 text-center space-y-8">
        
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111827] border border-[#1F2937] text-slate-450 text-[10px] font-bold uppercase tracking-wider mx-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00DF81] shrink-0" />
          Official Meta Graph API Tech Provider
        </div>

        {/* Headline */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] text-balance">
            Turn your Instagram comments into sales.
          </h1>
          <p className="text-slate-450 text-sm md:text-base max-w-2xl mx-auto leading-relaxed text-balance">
            When someone comments on your Reel or post, AutoDMs automatically sends them your link, discount code, or guide in direct messages within seconds.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-2.5 max-w-sm mx-auto">
          <Link
            href="/login"
            className="w-full py-3 bg-[#00DF81] hover:bg-[#00C770] text-[#000000] font-extrabold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00DF81]/10 active:scale-95"
          >
            Get started for free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-[10px] text-slate-500">
            No credit card required • Free 150 DMs included
          </p>
        </div>

        {/* Interactive Hero Mockup Card */}
        <div className="pt-10 max-w-3xl mx-auto">
          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row text-left">
            
            {/* Reel Comment Side */}
            <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-[#1F2937] space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[8px] font-bold text-slate-400">Reel</div>
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Instagram Reel comment</span>
              </div>
              
              <div className="space-y-3.5 pt-2">
                {/* User Comment */}
                <div className="flex gap-2.5 items-start">
                  <div className="w-6 h-6 rounded-full bg-[#1F2937] border border-slate-750 flex items-center justify-center font-black text-[9px] text-[#00DF81]">SK</div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-slate-200">@sarah_k</p>
                    <p className="text-xs text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl inline-block">
                      I want the discount! <strong className="text-[#00DF81]">"LINK"</strong>
                    </p>
                  </div>
                </div>

                {/* AutoDMs Public Reply */}
                <div className="flex gap-2.5 items-start pl-6">
                  <div className="w-6 h-6 rounded-full bg-[#00DF81] flex items-center justify-center font-black text-[9px] text-[#000000]">AD</div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-slate-200">your_brand <span className="text-[8px] font-normal text-[#00DF81] border border-[#00DF81]/25 px-1 py-0.5 rounded ml-1 bg-[#00DF81]/5">AutoDMs</span></p>
                    <p className="text-xs text-slate-350 italic">
                      Sent to your DMs! 🚀 Check your inbox.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Message Inbox Side */}
            <div className="flex-1 p-6 space-y-4 bg-zinc-950 flex flex-col justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#00DF81]/15 border border-[#00DF81]/20 flex items-center justify-center text-[8px] font-bold text-[#00DF81]">DM</div>
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Private Inbox</span>
              </div>

              <div className="space-y-3 pt-2">
                {/* Inbox DM Template card preview */}
                <div className="flex gap-2.5 items-start">
                  <div className="w-6 h-6 rounded-full bg-[#00DF81] flex items-center justify-center font-black text-[9px] text-[#000000]">AD</div>
                  
                  <div className="space-y-1.5 flex-1 max-w-[240px]">
                    <div className="bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 text-white rounded-2xl px-3.5 py-2.5 text-xs shadow-sm leading-relaxed">
                      Hey Sarah! Here is your exclusive 20% discount code: <strong className="text-white">SAVE20</strong>. Open website to shop now!
                    </div>
                    
                    {/* Template Button */}
                    <div className="bg-[#111827] border border-slate-800 rounded-xl p-1 shadow-md">
                      <div className="py-1.5 px-3 bg-slate-900 rounded-lg text-center text-[10px] font-black text-[#00DF81] border border-slate-800 cursor-default select-none">
                        👉 Open Website
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* Live Stats Row */}
      <section className="border-t border-[#1F2937]/50 bg-[#111827]/40 py-10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-1">
            <p className="text-3xl font-black text-[#00DF81]">&lt; 2s</p>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Average DM delivery speed</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black text-white">100%</p>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Meta Graph API compliant & safe</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black text-white">0 DH / $0</p>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Free tier to test and start</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-28 max-w-6xl mx-auto px-6 space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-[#00DF81] uppercase tracking-widest">Workflow</span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Three steps to full automation</h2>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="p-6 bg-[#111827] border border-[#1F2937] rounded-2xl space-y-4">
            <span className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-xs text-[#00DF81]">01</span>
            <h3 className="text-base font-extrabold text-white">Pick your trigger word</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Define keywords like <code className="text-[#00DF81] font-mono">LINK</code>, <code className="text-[#00DF81] font-mono">GUIDE</code>, or <code className="text-[#00DF81] font-mono">PRIX</code>. Whenever anyone comments that specific word, AutoDMs starts matching.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 bg-[#111827] border border-[#1F2937] rounded-2xl space-y-4">
            <span className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-xs text-[#00DF81]">02</span>
            <h3 className="text-base font-extrabold text-white">Add your link or promo code</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Paste your website, WhatsApp, discount checkout, or PDF download URL. Write custom human-like variations for public comment replies.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 bg-[#111827] border border-[#1F2937] rounded-2xl space-y-4">
            <span className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-xs text-[#00DF81]">03</span>
            <h3 className="text-base font-extrabold text-white">AutoDMs replies 24/7</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your server processes events automatically in the background. Private messages and public acknowledgments are sent in less than two seconds.
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="features" className="py-20 md:py-28 border-t border-[#1F2937]/30 bg-[#111827]/10">
        <div className="max-w-6xl mx-auto px-6 space-y-16">
          
          {/* Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-[#00DF81] uppercase tracking-widest">Solutions</span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Engineered for absolute reliability</h2>
          </div>

          {/* Use cases grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card 1 */}
            <div className="p-6 bg-[#111827] border border-[#1F2937] rounded-2xl flex items-start gap-4">
              <span className="text-2xl p-2 bg-slate-900 border border-slate-850 rounded-xl shrink-0">🛍️</span>
              <div className="space-y-1.5">
                <h3 className="text-sm font-extrabold text-white">E-commerce & Local Shops</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Send product catalogs, pricing details, and discount checkouts. Capture customer emails automatically inside DMs before delivering access links.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-6 bg-[#111827] border border-[#1F2937] rounded-2xl flex items-start gap-4">
              <span className="text-2xl p-2 bg-slate-900 border border-slate-850 rounded-xl shrink-0">🎁</span>
              <div className="space-y-1.5">
                <h3 className="text-sm font-extrabold text-white">Creators & Influencers</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Auto-deliver your lead magnets, training PDFs, or event tickets. Grow your newsletter lists directly from comment spikes on your Reels.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-6 bg-[#111827] border border-[#1F2937] rounded-2xl flex items-start gap-4">
              <span className="text-2xl p-2 bg-slate-900 border border-slate-850 rounded-xl shrink-0">📲</span>
              <div className="space-y-1.5">
                <h3 className="text-sm font-extrabold text-white">WhatsApp Direct Chat</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Route your audience from Instagram comments straight to a WhatsApp chat thread. Includes pre-filled message texts formatted automatically.
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="p-6 bg-[#111827] border border-[#1F2937] rounded-2xl flex items-start gap-4">
              <span className="text-2xl p-2 bg-slate-900 border border-slate-850 rounded-xl shrink-0">📸</span>
              <div className="space-y-1.5">
                <h3 className="text-sm font-extrabold text-white">Story Mention Rewards</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Acknowledge and thank users whenever they tag your brand in an Instagram Story. Auto-send rewards or discount coupons to encourage user-generated content.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing Section (Interactive Currency Switcher) */}
      <PricingSection />

      {/* FAQ Accordion Section */}
      <FaqAccordion />

      {/* Footer */}
      <footer className="border-t border-[#1F2937]/50 bg-[#0B0F17] py-12 text-slate-500 text-xs">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00DF81]" />
            <span className="font-extrabold text-white text-sm">AutoDMs</span>
          </div>

          <div className="flex gap-6">
            <Link href="/dashboard" className="hover:text-slate-350 transition-colors">Dashboard</Link>
            <a href="#" className="hover:text-slate-350 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-350 transition-colors">Privacy Policy</a>
          </div>

          <div>
            &copy; {new Date().getFullYear()} AutoDMs. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
