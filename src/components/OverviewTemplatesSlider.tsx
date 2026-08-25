"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Sparkles,
  Inbox,
  FileText,
  Gift,
  Users,
  Tag,
  ArrowRight,
  ExternalLink,
  Camera,
  Zap,
} from "lucide-react";

export interface TemplateCardData {
  id: string;
  title: string;
  badge: string;
  description: string;
  triggerPill: string;
  actionPill: string;
  triggerType: "comment" | "story" | "dm";
  templateParam: string;
  isCustom?: boolean;
}

const DEFAULT_TEMPLATES: TemplateCardData[] = [
  {
    id: "comment_to_dm",
    title: "Send Link on Keyword",
    badge: "Popular",
    description: "Send direct checkout links or pricing when followers comment on your Reels or Posts.",
    triggerPill: '"PRICE"',
    actionPill: "Shop Link ↗",
    triggerType: "comment",
    templateParam: "comment_to_dm",
  },
  {
    id: "lead_magnet",
    title: "Deliver Lead Magnet",
    badge: "High conversion",
    description: "Capture verified emails and phone numbers before sending free PDFs and guides.",
    triggerPill: '"GUIDE"',
    actionPill: "PDF Guide 📄",
    triggerType: "comment",
    templateParam: "lead_magnet",
  },
  {
    id: "story_mention",
    title: "Reward Story Mentions",
    badge: "Growth",
    description: "Automatically reward followers with discount coupons when they tag you in stories.",
    triggerPill: "@story tag",
    actionPill: "15% Coupon 🎁",
    triggerType: "story",
    templateParam: "story_mention",
  },
  {
    id: "direct_dm",
    title: "Auto-Reply to DMs",
    badge: "Instant reply",
    description: "Send instant automated replies and lead capture forms to direct message inquiries.",
    triggerPill: '"PRICING"',
    actionPill: "Rate Sheet 📄",
    triggerType: "dm",
    templateParam: "direct_dm",
  },
  {
    id: "waitlist",
    title: "Grow VIP Waitlist",
    badge: "Launch",
    description: "Build an exclusive waitlist for your upcoming product launch or VIP community.",
    triggerPill: '"WAITLIST"',
    actionPill: "VIP Pass 🚀",
    triggerType: "comment",
    templateParam: "waitlist",
  },
  {
    id: "flash_sale",
    title: "Flash Sale Promo Code",
    badge: "Flash Sale",
    description: "Trigger exclusive discount codes and checkout links during limited-time promo sales.",
    triggerPill: '"SALE"',
    actionPill: "20% Promo 🏷️",
    triggerType: "comment",
    templateParam: "comment_to_dm",
  },
];

interface OverviewTemplatesSliderProps {
  customTemplates?: Array<{
    id: string;
    name: string;
    triggerSource: string;
    triggerKeyword: string | null;
    replyDmMessage: string;
  }>;
}

export function OverviewTemplatesSlider({ customTemplates = [] }: OverviewTemplatesSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Combine custom templates first (up to 3) + default templates to total 6
  const combinedTemplates: TemplateCardData[] = [
    ...customTemplates.slice(0, 3).map((custom) => {
      const isStory = custom.triggerSource === "STORY_MENTIONS";
      const isDm = custom.triggerSource === "DIRECT_MESSAGES";
      return {
        id: `custom_${custom.id}`,
        title: custom.name,
        badge: "Custom rule",
        description: `Triggered by ${isStory ? "Story tags" : isDm ? "Direct DMs" : `"${custom.triggerKeyword || "any keyword"}"`}.`,
        triggerPill: isStory ? "@story tag" : `"${custom.triggerKeyword?.split(",")[0]?.trim() || "KEYWORD"}"`,
        actionPill: "Direct Reply 📩",
        triggerType: (isStory ? "story" : isDm ? "dm" : "comment") as "comment" | "story" | "dm",
        templateParam: `edit=${custom.id}`,
        isCustom: true,
      };
    }),
    ...DEFAULT_TEMPLATES,
  ].slice(0, 6);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [combinedTemplates.length]);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const cardWidth = container.clientWidth >= 1024 ? container.clientWidth / 3 : container.clientWidth >= 640 ? container.clientWidth / 2 : container.clientWidth;
    const scrollAmount = cardWidth * (direction === "left" ? -1 : 1);
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    setTimeout(checkScroll, 350);
  };

  return (
    <div className="space-y-4">
      {/* Slider Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Start here
        </h2>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/automations?tab=templates"
            className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <span>View all templates</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          {/* Arrow Buttons */}
          <div className="flex items-center gap-1 bg-secondary/80 p-0.5 rounded-lg border border-border">
            <button
              type="button"
              onClick={() => handleScroll("left")}
              disabled={!canScrollLeft}
              className="p-1 rounded-md text-foreground hover:bg-card disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Previous templates"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll("right")}
              disabled={!canScrollRight}
              className="p-1 rounded-md text-foreground hover:bg-card disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Next templates"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Smooth Horizontal Carousel */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-4 sm:gap-5 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {combinedTemplates.map((template) => {
          const isStory = template.triggerType === "story";
          const isDm = template.triggerType === "dm";

          const href = template.isCustom
            ? `/dashboard/automations/builder?edit=${template.id.replace("custom_", "")}`
            : `/dashboard/automations/builder?template=${template.templateParam}`;

          return (
            <div
              key={template.id}
              className="w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] shrink-0 snap-start bg-card hover:bg-zinc-50 dark:hover:bg-[#0D0D0D] border border-border hover:border-zinc-400 dark:hover:border-zinc-700 rounded-2xl p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between min-h-[290px] shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] group select-none"
            >
              <div className="space-y-3.5">
                {/* Card Top */}
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center text-foreground group-hover:border-zinc-400 dark:group-hover:border-zinc-600 transition-colors">
                    {isStory ? (
                      <Sparkles className="w-4 h-4 text-amber-500" strokeWidth={1.75} />
                    ) : isDm ? (
                      <Inbox className="w-4 h-4" strokeWidth={1.75} />
                    ) : (
                      <MessageCircle className="w-4 h-4" strokeWidth={1.75} />
                    )}
                  </div>
                  <span className="bg-secondary border border-border text-foreground text-[11px] px-2.5 py-0.5 rounded-full font-medium">
                    {template.badge}
                  </span>
                </div>

                {/* Title & Description */}
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-foreground truncate" title={template.title}>
                    {template.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {template.description}
                  </p>
                </div>

                {/* Visual Micro-Flow Mockup */}
                <div className="p-2.5 bg-secondary/60 border border-border rounded-xl flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 min-w-0 bg-card px-2.5 py-1 rounded-lg border border-border shadow-xs truncate">
                    {isStory && <Camera className="w-3 h-3 text-amber-500 shrink-0" />}
                    <span className="text-[11px] font-medium text-foreground truncate">{template.triggerPill}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <div className="flex items-center gap-1.5 min-w-0 bg-card px-2.5 py-1 rounded-lg border border-border text-foreground font-medium text-[11px] shadow-xs truncate">
                    <span className="truncate">{template.actionPill}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4">
                <Link
                  href={href}
                  className="w-full h-9 rounded-xl bg-primary text-primary-foreground hover:opacity-90 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <span>Use template</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OverviewTemplatesSlider;
