"use client";

import { useState, useMemo } from "react";
import {
  MessageCircle,
  Sparkles,
  Inbox,
  FileText,
  Users,
  ArrowRight,
  Zap,
  ShoppingBag,
  Gift,
  Search,
  CheckCircle2,
  ExternalLink,
  Send,
  Camera,
} from "lucide-react";
import Link from "next/link";

interface TemplateItem {
  id: string;
  title: string;
  category: "SELL_EARN" | "CAPTURE_LEADS" | "AUDIENCE_ENGAGEMENT";
  categoryLabel: string;
  tag?: string;
  description: string;
  triggerSource: "COMMENTS" | "STORY_MENTIONS" | "DIRECT_MESSAGES";
  triggerKeyword: string;
  triggerLabel: string;
  actionLabel: string;
  replyMessage: string;
  buttonTitle: string;
  buttonUrl: string;
  enableLeadCapture: boolean;
  icon: any;
}

const TEMPLATES: TemplateItem[] = [
  {
    id: "comment_to_dm",
    title: "Send Link on Keyword",
    category: "SELL_EARN",
    categoryLabel: "Sell & Earn",
    tag: "Most Popular",
    description: "Instantly send your checkout or product link when followers comment on your Reels or Posts.",
    triggerSource: "COMMENTS",
    triggerKeyword: "LINK, BUY, PRICE",
    triggerLabel: 'Comment "LINK"',
    actionLabel: "Send DM + Shop Link",
    replyMessage: "Hey {{username}}! Here is the direct link to the product you saw in the post 🚀 Tap below to view details and order:",
    buttonTitle: "View Product & Order",
    buttonUrl: "https://example.com/product",
    enableLeadCapture: false,
    icon: ShoppingBag,
  },
  {
    id: "lead_magnet",
    title: "Deliver Lead Magnet (PDF / Guide)",
    category: "CAPTURE_LEADS",
    categoryLabel: "Capture Leads",
    tag: "High Conversion",
    description: "Capture emails and phone numbers before delivering high-value free resources and guides.",
    triggerSource: "COMMENTS",
    triggerKeyword: "GUIDE, FREE, PDF",
    triggerLabel: 'Comment "GUIDE"',
    actionLabel: "Capture Email & Send PDF",
    replyMessage: "Hey {{username}}! Drop your email or WhatsApp number below and I'll send you the free guide right away 🎁",
    buttonTitle: "Download Free Guide",
    buttonUrl: "https://example.com/guide.pdf",
    enableLeadCapture: true,
    icon: FileText,
  },
  {
    id: "story_mention",
    title: "Reward Story Mentions",
    category: "AUDIENCE_ENGAGEMENT",
    categoryLabel: "Audience Engagement",
    tag: "Growth",
    description: "Automatically reward followers with a 15% discount coupon code whenever they tag your brand in their stories.",
    triggerSource: "STORY_MENTIONS",
    triggerKeyword: "",
    triggerLabel: "Story Tag / Mention",
    actionLabel: "Send 15% Coupon DM",
    replyMessage: "Thank you for tagging us in your story {{username}}! ❤️ Here is an exclusive 15% OFF discount code for your next order: 'STORY15'",
    buttonTitle: "Use 15% Discount",
    buttonUrl: "https://example.com/shop",
    enableLeadCapture: false,
    icon: Gift,
  },
  {
    id: "direct_dm",
    title: "Auto-Reply to DMs & Pricing Inquiries",
    category: "SELL_EARN",
    categoryLabel: "Sell & Earn",
    description: "Send instant automated pricing packages, FAQs, and WhatsApp consultation links to inbound DMs.",
    triggerSource: "DIRECT_MESSAGES",
    triggerKeyword: "PRICING, COST, SERVICES",
    triggerLabel: 'DM with "PRICING"',
    actionLabel: "Send Consultation Link",
    replyMessage: "Hey {{username}}! Thanks for reaching out about our services. Here is our full pricing sheet and consultation link:",
    buttonTitle: "Book Free Consultation",
    buttonUrl: "https://wa.me/212600000000",
    enableLeadCapture: false,
    icon: Inbox,
  },
  {
    id: "waitlist",
    title: "Grow VIP Waitlist",
    category: "CAPTURE_LEADS",
    categoryLabel: "Capture Leads",
    tag: "Launch",
    description: "Build an exclusive waitlist for your upcoming product launch or event by collecting verified contact details.",
    triggerSource: "COMMENTS",
    triggerKeyword: "WAITLIST, JOIN, ACCESS",
    triggerLabel: 'Comment "WAITLIST"',
    actionLabel: "Collect VIP Contact",
    replyMessage: "You're in! Drop your email or phone number to lock in your VIP early-bird access and special pricing 🚀",
    buttonTitle: "Confirm VIP Spot",
    buttonUrl: "https://example.com/launch",
    enableLeadCapture: true,
    icon: Users,
  },
];

export function TemplatesLibraryClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter((template) => {
      const matchesCategory =
        selectedCategory === "ALL" || template.category === selectedCategory;

      const matchesSearch =
        searchQuery === "" ||
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.triggerKeyword.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Search & Category Filter Bar */}
      <div className="bg-[#0A0A0A] border border-[#222222] rounded-2xl p-3 flex flex-wrap gap-3 items-center justify-between shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates by keyword..."
            className="w-full h-9 pl-9 pr-3 bg-[#111111] border border-[#262626] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
          />
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center bg-[#111111] border border-[#262626] rounded-xl p-1 text-xs font-medium text-zinc-400 overflow-x-auto max-w-full">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              selectedCategory === "ALL" ? "bg-[#222222] text-white shadow-sm" : "hover:text-zinc-200"
            }`}
          >
            All Templates
          </button>
          <button
            onClick={() => setSelectedCategory("SELL_EARN")}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              selectedCategory === "SELL_EARN" ? "bg-[#222222] text-white shadow-sm" : "hover:text-zinc-200"
            }`}
          >
            Sell & Earn
          </button>
          <button
            onClick={() => setSelectedCategory("CAPTURE_LEADS")}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              selectedCategory === "CAPTURE_LEADS" ? "bg-[#222222] text-white shadow-sm" : "hover:text-zinc-200"
            }`}
          >
            Capture Leads
          </button>
          <button
            onClick={() => setSelectedCategory("AUDIENCE_ENGAGEMENT")}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              selectedCategory === "AUDIENCE_ENGAGEMENT" ? "bg-[#222222] text-white shadow-sm" : "hover:text-zinc-200"
            }`}
          >
            Audience Engagement
          </button>
        </div>
      </div>

      {/* Templates 3-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTemplates.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="bg-[#0A0A0A] border border-[#222222] hover:border-zinc-700 hover:bg-[#0D0D0D] rounded-2xl p-6 flex flex-col justify-between space-y-5 transition-all duration-200 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] group"
            >
              <div className="space-y-4">
                {/* Card Top: Icon & Category Tag */}
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#141414] border border-[#262626] flex items-center justify-center text-zinc-300 group-hover:text-white group-hover:border-zinc-500 transition-colors">
                    <Icon className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                  {item.tag ? (
                    <span className="bg-[#181818] border border-[#2b2b2b] text-zinc-300 text-[10px] px-2.5 py-0.5 rounded-full font-medium font-mono">
                      {item.tag}
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-zinc-400 font-mono">
                      {item.categoryLabel}
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-white group-hover:text-white transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Visual Flow Pills (Trigger ➔ Action) */}
                <div className="p-3 bg-[#111111] border border-[#222222] rounded-xl flex items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span className="font-mono text-zinc-300 truncate">{item.triggerLabel}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0095F6] shrink-0" />
                    <span className="font-medium text-white truncate">{item.actionLabel}</span>
                  </div>
                </div>

                {/* Workflow Preview Box */}
                <div className="p-3.5 bg-[#111111] border border-[#222222] rounded-xl space-y-2.5 text-xs">
                  {/* Message Snippet */}
                  <div className="space-y-1">
                    <span className="text-zinc-500 font-medium text-[10px] block font-mono">Direct message reply:</span>
                    <p className="text-[11px] text-zinc-300 line-clamp-2 bg-[#0A0A0A] p-2.5 rounded-lg border border-[#222222] leading-relaxed">
                      "{item.replyMessage}"
                    </p>
                  </div>

                  {/* Button Mockup */}
                  {item.buttonTitle && (
                    <div className="flex items-center justify-center p-2 rounded-lg bg-[#181818] border border-[#262626] text-white text-[11px] font-medium gap-1.5">
                      <ExternalLink className="w-3 h-3 text-zinc-400" />
                      <span>{item.buttonTitle}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Use Template CTA */}
              <div className="pt-2">
                <Link
                  href={`/dashboard/automations/builder?template=${item.id}`}
                  className="w-full h-10 rounded-xl bg-white hover:bg-zinc-200 text-black font-medium text-xs inline-flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <span>Use Template</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TemplatesLibraryClient;
