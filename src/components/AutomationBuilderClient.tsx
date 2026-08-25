"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Plus, Send, ChevronRight, ChevronLeft, MessageSquare, Trash2, Camera, Sparkles, Image as ImageIcon, Video, Film, Check, ExternalLink } from "lucide-react";
import { createAutomation } from "@/app/dashboard/automations/actions";
import Link from "next/link";
import InstagramPreview from "@/components/InstagramPreview";
import PostPickerModal, { InstagramMediaItem } from "@/components/PostPickerModal";

interface IgAccount {
  id: string;
  instagramAccountId: string;
  pageName: string;
}

interface AutomationBuilderProps {
  connectedAccounts: IgAccount[];
  activeAccountId?: string;
}

export default function AutomationBuilderClient({
  connectedAccounts,
  activeAccountId,
}: AutomationBuilderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateParam = searchParams.get("template");

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSavedDot, setIsSavedDot] = useState(true);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Core Automation States
  const [ruleName, setRuleName] = useState("Instagram Comment-to-DM");
  const [triggerSource, setTriggerSource] = useState<"COMMENTS" | "STORY_MENTIONS" | "DIRECT_MESSAGES">("COMMENTS");
  const [triggerScope, setTriggerScope] = useState<"ALL_POSTS" | "SPECIFIC_POSTS">("ALL_POSTS");
  const [targetMediaIds, setTargetMediaIds] = useState<string[]>([]);
  const [postUrlInput, setPostUrlInput] = useState("");
  
  const [triggerType, setTriggerType] = useState<"KEYWORD" | "ALL">("KEYWORD");
  const [matchMode, setMatchMode] = useState<"CONTAINS" | "EXACT">("CONTAINS");
  const [triggerKeyword, setTriggerKeyword] = useState("LINK, PRICE, INFO");
  
  const [replyDmMessage, setReplyDmMessage] = useState("Hey {{username}}! Here is the direct link you requested: https://example.com/shop 🚀 Let me know if you need anything!");
  const [enableLeadCapture, setEnableLeadCapture] = useState(false);
  const [leadConfirmationDm, setLeadConfirmationDm] = useState("Thanks {{username}}! I've sent the details to your contact info. You can also access directly here: https://example.com/guide 🎁");

  // Rich Interactive Buttons States
  const [enableButtons, setEnableButtons] = useState(true);
  const [buttonTitle, setButtonTitle] = useState("Get Direct Access");
  const [buttonUrl, setButtonUrl] = useState("https://example.com/shop");
  const [secondaryButtonTitle, setSecondaryButtonTitle] = useState("");
  const [secondaryButtonUrl, setSecondaryButtonUrl] = useState("");

  // Growth Gate: Follow-to-Unlock
  const [requireFollow, setRequireFollow] = useState(false);
  const [followPromptMessage, setFollowPromptMessage] = useState(
    "Hey {{username}}! Follow our profile first to unlock your private link 🚀"
  );

  // Apply template on mount if template query param is present
  useEffect(() => {
    if (!templateParam) return;

    if (templateParam === "comment_to_dm" || templateParam === "send_link") {
      setRuleName("Send Product Link on Comment");
      setTriggerSource("COMMENTS");
      setTriggerScope("ALL_POSTS");
      setTriggerType("KEYWORD");
      setMatchMode("CONTAINS");
      setTriggerKeyword("LINK, BUY, PRICE");
      setReplyDmMessage("Hey {{username}}! Here is the direct link to the product you saw in the post 🚀 Tap below to view details and order:");
      setButtonTitle("View Product & Order");
      setButtonUrl("https://example.com/product");
      setEnableButtons(true);
      setEnableLeadCapture(false);
    } else if (templateParam === "lead_magnet") {
      setRuleName("Deliver Lead Magnet (PDF / Guide)");
      setTriggerSource("COMMENTS");
      setTriggerScope("ALL_POSTS");
      setTriggerType("KEYWORD");
      setMatchMode("CONTAINS");
      setTriggerKeyword("GUIDE, FREE, PDF");
      setReplyDmMessage("Hey {{username}}! Drop your email or WhatsApp number below and I'll send you the free guide right away 🎁");
      setEnableLeadCapture(true);
      setLeadConfirmationDm("Thanks {{username}}! Here is your free download link: https://example.com/guide.pdf 🚀");
      setButtonTitle("Download Free Guide");
      setButtonUrl("https://example.com/guide.pdf");
      setEnableButtons(true);
    } else if (templateParam === "story_mention") {
      setRuleName("Reward Story Mentions (15% OFF)");
      setTriggerSource("STORY_MENTIONS");
      setTriggerScope("ALL_POSTS");
      setTriggerType("ALL");
      setTriggerKeyword("");
      setReplyDmMessage("Thank you for tagging us in your story {{username}}! ❤️ Here is an exclusive 15% OFF discount code for your next order: 'STORY15'");
      setButtonTitle("Use 15% Discount");
      setButtonUrl("https://example.com/shop");
      setEnableButtons(true);
      setEnableLeadCapture(false);
    } else if (templateParam === "direct_dm") {
      setRuleName("Auto-Reply to Inbound DMs & Pricing");
      setTriggerSource("DIRECT_MESSAGES");
      setTriggerScope("ALL_POSTS");
      setTriggerType("KEYWORD");
      setMatchMode("CONTAINS");
      setTriggerKeyword("PRICING, COST, SERVICES");
      setReplyDmMessage("Hey {{username}}! Thanks for reaching out about our services. Here is our full pricing sheet and consultation link:");
      setButtonTitle("Book Free Consultation");
      setButtonUrl("https://wa.me/212600000000");
      setEnableButtons(true);
      setEnableLeadCapture(false);
    } else if (templateParam === "waitlist") {
      setRuleName("Grow VIP Waitlist");
      setTriggerSource("COMMENTS");
      setTriggerScope("ALL_POSTS");
      setTriggerType("KEYWORD");
      setMatchMode("CONTAINS");
      setTriggerKeyword("WAITLIST, JOIN, ACCESS");
      setReplyDmMessage("You're in! Drop your email or phone number to lock in your VIP early-bird access and special pricing 🚀");
      setEnableLeadCapture(true);
      setLeadConfirmationDm("Confirmed! You're on the VIP waitlist {{username}}. We will notify you first when doors open ✨");
      setButtonTitle("VIP Launch Details");
      setButtonUrl("https://example.com/launch");
      setEnableButtons(true);
    }
  }, [templateParam]);

  const [leavePublicReply, setLeavePublicReply] = useState(true);
  const [replyCommentOptions, setReplyCommentOptions] = useState<string[]>([
    "Just sent you a DM with the direct link! 📩",
    "Sent! Let me know if you received it 🚀",
    "Check your messages! Just sent over the details ✨",
    "Sent to your DMs! Check message requests if needed 💬"
  ]);
  const [newCommentOption, setNewCommentOption] = useState("");

  // Media items list
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);

  // Flash saved dot animation on changes to simulate auto-saves
  useEffect(() => {
    setIsSavedDot(false);
    const t = setTimeout(() => setIsSavedDot(true), 400);
    return () => clearTimeout(t);
  }, [
    ruleName,
    triggerSource,
    triggerScope,
    targetMediaIds,
    triggerType,
    triggerKeyword,
    replyDmMessage,
    enableButtons,
    buttonTitle,
    buttonUrl,
    secondaryButtonTitle,
    secondaryButtonUrl,
    requireFollow,
    followPromptMessage,
    enableLeadCapture,
    leadConfirmationDm,
    leavePublicReply,
    replyCommentOptions,
  ]);

  // Fetch Instagram Media
  useEffect(() => {
    async function fetchMedia() {
      if (connectedAccounts.length === 0) return;
      setMediaLoading(true);
      try {
        const res = await fetch("/api/instagram/media");
        if (res.ok) {
          const data = await res.json();
          if (data.media) {
            setMediaItems(data.media);
          }
        }
      } catch (err) {
        console.error("Failed to fetch IG media:", err);
      } finally {
        setMediaLoading(false);
      }
    }
    fetchMedia();
  }, [connectedAccounts]);

  const handleNext = () => {
    if (step < 4) {
      setDirection(1);
      setStep((p) => (p + 1) as any);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setDirection(-1);
      setStep((p) => (p - 1) as any);
    }
  };

  const handleToggleMediaSelect = (mediaId: string) => {
    setTargetMediaIds((prev) =>
      prev.includes(mediaId) ? prev.filter((id) => id !== mediaId) : [...prev, mediaId]
    );
  };

  const addCommentOption = () => {
    if (!newCommentOption.trim()) return;
    setReplyCommentOptions((prev) => [...prev, newCommentOption.trim()]);
    setNewCommentOption("");
  };

  const removeCommentOption = (index: number) => {
    setReplyCommentOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGoLive = async () => {
    setLoading(true);
    setError("");

    try {
      const activeAccount =
        connectedAccounts.find((a) => a.id === activeAccountId) ||
        connectedAccounts[0] ||
        null;

      await createAutomation({
        name: ruleName.trim() || "Instagram Comment-to-DM",
        triggerType: triggerType,
        triggerKeyword: triggerType === "KEYWORD" ? triggerKeyword.trim() : null,
        replyDmMessage: replyDmMessage.trim(),
        replyCommentOptions: leavePublicReply ? replyCommentOptions : [],
        triggerScope: triggerScope,
        targetMediaIds: triggerScope === "SPECIFIC_POSTS" ? targetMediaIds : [],
        triggerSource: triggerSource,
        enableLeadCapture: enableLeadCapture,
        leadConfirmationDm: enableLeadCapture ? leadConfirmationDm.trim() : null,
        buttonTitle: enableButtons && buttonTitle.trim() ? buttonTitle.trim() : null,
        buttonUrl: enableButtons && buttonUrl.trim() ? buttonUrl.trim() : null,
        secondaryButtonTitle: enableButtons && secondaryButtonTitle.trim() ? secondaryButtonTitle.trim() : null,
        secondaryButtonUrl: enableButtons && secondaryButtonUrl.trim() ? secondaryButtonUrl.trim() : null,
        requireFollow: requireFollow,
        followPromptMessage: requireFollow && followPromptMessage.trim() ? followPromptMessage.trim() : null,
        igAccountId: activeAccount?.id || null,
      });

      router.push("/dashboard/automations");
    } catch (err: any) {
      setError(err?.message || "Failed to publish automation rule.");
    } finally {
      setLoading(false);
    }
  };

  const activeAccount =
    connectedAccounts.find((a) => a.id === activeAccountId) ||
    connectedAccounts[0] ||
    null;
  const username = activeAccount?.pageName || "yourbrand";
  const firstKeyword = triggerKeyword.split(",")[0]?.trim() || "LINK";

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      
      {/* Header */}
      <header className="h-14 px-4 sm:px-6 bg-card border-b border-border flex items-center justify-between shrink-0 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/automations"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
            Automations
          </Link>
          <span className="text-muted-foreground">/</span>
          <input
            type="text"
            value={ruleName}
            onChange={(e) => setRuleName(e.target.value)}
            className="bg-transparent border-b border-transparent hover:border-border focus:border-foreground font-semibold text-sm text-foreground focus:outline-none px-1.5 py-0.5 max-w-[280px] truncate"
            title="Click to rename rule"
          />
        </div>

        <button
          onClick={handleGoLive}
          disabled={loading}
          className="h-10 px-5 bg-primary text-primary-foreground hover:opacity-90 font-medium rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
          ) : (
            "Go live"
          )}
        </button>
      </header>

      {/* Main Grid Layout (7 cols Form / 5 cols iPhone Preview) */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PANEL: 4-Step Interactive Configuration */}
        <div className="lg:col-span-7 bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] space-y-6">
          
          {/* Connected Timeline Stepper */}
          <div className="mb-2 shrink-0">
            <div className="relative flex items-center justify-between px-2">
              {/* Background horizontal connecting track */}
              <div className="absolute left-6 right-6 top-3.5 h-[2px] bg-secondary -z-0" />
              
              {/* Active progress track */}
              <div
                className="absolute left-6 top-3.5 h-[2px] bg-primary transition-all duration-300 -z-0"
                style={{ width: `${Math.max(0, Math.min(100, ((step - 1) / 3) * 100))}%` }}
              />

              {[
                { num: 1, name: "Trigger" },
                { num: 2, name: "Keywords" },
                { num: 3, name: "Direct reply" },
                { num: 4, name: "Public reply" },
              ].map((s) => {
                const isCurrent = step === s.num;
                const isCompleted = s.num < step;

                return (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => setStep(s.num as any)}
                    className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 ${
                        isCurrent
                          ? "bg-primary text-primary-foreground shadow-md ring-4 ring-primary/10"
                          : isCompleted
                          ? "bg-secondary text-foreground font-semibold"
                          : "bg-secondary border border-border text-muted-foreground group-hover:border-zinc-400 group-hover:text-foreground"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      ) : (
                        <span>{s.num}</span>
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium mt-2 transition-colors ${
                        isCurrent
                          ? "text-foreground font-semibold"
                          : isCompleted
                          ? "text-foreground"
                          : "text-muted-foreground group-hover:text-foreground"
                      }`}
                    >
                      {s.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Step Content */}
          <div className="flex-1 flex flex-col justify-start">
            {error && (
              <p className="text-red-500 text-xs mb-4">{error}</p>
            )}

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                initial={{ opacity: 0, y: direction * 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -direction * 8 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="space-y-5"
              >
                
                {/* STEP 1: TRIGGER SOURCE & POST SELECTION */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-0.5">
                      <h2 className="text-sm font-semibold text-foreground">Step 1: When someone interacts with...</h2>
                      <p className="text-xs text-muted-foreground">Select which Instagram touchpoint activates this automation rule.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: "COMMENTS", title: "Comments", desc: "Post & Reel comments", icon: MessageSquare },
                        { id: "STORY_MENTIONS", title: "Story Mentions", desc: "Tagged in stories", icon: Camera },
                        { id: "DIRECT_MESSAGES", title: "Direct DMs", desc: "Inbound direct messages", icon: Send },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSelected = triggerSource === item.id;
                        return (
                          <div
                            key={item.id}
                            onClick={() => setTriggerSource(item.id as any)}
                            className={`p-4 border rounded-2xl cursor-pointer transition-all duration-200 flex flex-col justify-between min-h-[114px] select-none ${
                              isSelected
                                ? "border-zinc-400 dark:border-zinc-500 bg-secondary/80 shadow-xs dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
                                : "border-border bg-card hover:border-zinc-400 dark:hover:border-zinc-700 hover:bg-secondary/40"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-colors ${
                                isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-muted-foreground border-border"
                              }`}>
                                <Icon className="w-4 h-4" strokeWidth={1.75} />
                              </div>
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                                isSelected ? "border-zinc-400 dark:border-zinc-500 bg-secondary" : "border-border bg-transparent"
                              }`}>
                                {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
                              </div>
                            </div>
                            <div className="mt-2.5">
                              <p className="text-xs font-semibold text-foreground">{item.title}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{item.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {triggerSource === "COMMENTS" && (
                      <div className="space-y-3 pt-3 border-t border-border">
                        <label className="text-xs font-medium text-foreground block">Target publications</label>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div
                            onClick={() => setTriggerScope("ALL_POSTS")}
                            className={`p-3.5 border rounded-xl cursor-pointer transition-colors ${
                              triggerScope === "ALL_POSTS"
                                ? "border-zinc-400 dark:border-zinc-500 bg-secondary/80 shadow-xs"
                                : "border-border bg-card hover:border-zinc-400 dark:hover:border-zinc-700"
                            }`}
                          >
                            <p className="text-xs font-medium text-foreground">All current & future posts</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Applies across all profile publications</p>
                          </div>

                          <div
                            onClick={() => setTriggerScope("SPECIFIC_POSTS")}
                            className={`p-3.5 border rounded-xl cursor-pointer transition-colors ${
                              triggerScope === "SPECIFIC_POSTS"
                                ? "border-zinc-400 dark:border-zinc-500 bg-secondary/80 shadow-xs"
                                : "border-border bg-card hover:border-zinc-400 dark:hover:border-zinc-700"
                            }`}
                          >
                            <p className="text-xs font-medium text-foreground">Specific posts or reels</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Select specific media thumbnails</p>
                          </div>
                        </div>

                        {triggerScope === "SPECIFIC_POSTS" && (
                          <div className="space-y-3 pt-2">
                            {/* Selected Posts Preview Cards */}
                            {targetMediaIds.length > 0 ? (
                              <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-foreground">
                                    Selected Publications ({targetMediaIds.length})
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setIsPickerOpen(true)}
                                      className="text-xs font-medium text-foreground hover:underline flex items-center gap-1"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      Change / Add More
                                    </button>
                                    <span className="text-muted-foreground">•</span>
                                    <button
                                      type="button"
                                      onClick={() => setTargetMediaIds([])}
                                      className="text-xs text-muted-foreground hover:text-red-500 transition-colors"
                                    >
                                      Clear
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[190px] overflow-y-auto pr-1">
                                  {targetMediaIds.map((mediaId) => {
                                    const mediaItem = mediaItems.find((m) => m.id === mediaId);
                                    const thumbnail = mediaItem?.thumbnail || mediaItem?.thumbnail_url || mediaItem?.media_url;
                                    const isVideo = mediaItem?.type === "VIDEO" || mediaItem?.media_type === "VIDEO";
                                    const caption = mediaItem?.caption || "Instagram publication";

                                    return (
                                      <div
                                        key={mediaId}
                                        className="p-2.5 bg-secondary/50 border border-border rounded-xl flex items-center justify-between gap-3 group hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                                      >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                          <div className="relative w-11 h-11 rounded-lg bg-secondary border border-border overflow-hidden shrink-0">
                                            {thumbnail ? (
                                              <img
                                                src={thumbnail}
                                                alt="Post thumbnail"
                                                className="w-full h-full object-cover"
                                                crossOrigin="anonymous"
                                              />
                                            ) : (
                                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                <ImageIcon className="w-4 h-4" />
                                              </div>
                                            )}
                                            {isVideo && (
                                              <div className="absolute bottom-0.5 right-0.5 p-0.5 rounded bg-black/80 text-[7px] text-white">
                                                <Video className="w-2.5 h-2.5" />
                                              </div>
                                            )}
                                          </div>
                                          <div className="min-w-0 space-y-0.5">
                                            <p className="text-xs font-medium text-foreground truncate max-w-[140px]">
                                              {caption}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-medium">
                                              ID: {mediaId.slice(-8)}
                                            </p>
                                          </div>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => handleToggleMediaSelect(mediaId)}
                                          className="p-1 text-muted-foreground hover:text-red-500 transition-colors rounded"
                                          title="Remove"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              /* Empty Trigger Callout */
                              <div className="border border-dashed border-border rounded-xl p-5 text-center space-y-3 bg-secondary/20">
                                <div className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center mx-auto text-muted-foreground">
                                  <ImageIcon className="w-4 h-4" />
                                </div>
                                <div className="space-y-0.5">
                                  <p className="text-xs font-medium text-foreground">No publications selected</p>
                                  <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                                    Pick the specific Reels or Posts from your Instagram feed where comments will trigger this rule.
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setIsPickerOpen(true)}
                                  className="h-8 px-3.5 bg-primary text-primary-foreground hover:opacity-90 font-medium rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors shadow-sm"
                                >
                                  <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                                  Select Post or Reel
                                </button>
                              </div>
                            )}

                            {/* Optional Direct URL Input */}
                            <div className="pt-1">
                              <input
                                type="text"
                                placeholder="Or paste Instagram post URL (optional)..."
                                value={postUrlInput}
                                onChange={(e) => setPostUrlInput(e.target.value)}
                                className="w-full h-9 px-3 bg-secondary border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 2: TRIGGER KEYWORD INPUT */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-0.5">
                      <h2 className="text-sm font-semibold text-foreground">Step 2: Trigger keywords & condition</h2>
                      <p className="text-xs text-muted-foreground">Specify what words followers must say to receive your response.</p>
                    </div>

                    {triggerSource === "STORY_MENTIONS" ? (
                      <div className="p-5 bg-secondary/50 border border-border rounded-xl text-center space-y-2">
                        <Camera className="w-5 h-5 text-foreground mx-auto" strokeWidth={1.75} />
                        <p className="text-xs font-medium text-foreground">No keywords required for Story Mentions</p>
                        <p className="text-[11px] text-muted-foreground max-w-xs mx-auto leading-relaxed">
                          Whenever someone mentions you in their Instagram story, AutoDMs automatically sends your reply.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div
                            onClick={() => setTriggerType("KEYWORD")}
                            className={`p-3.5 border rounded-xl cursor-pointer transition-colors ${
                              triggerType === "KEYWORD"
                                ? "border-zinc-400 dark:border-zinc-500 bg-secondary/80 shadow-xs"
                                : "border-border bg-card hover:border-zinc-400 dark:hover:border-zinc-700"
                            }`}
                          >
                            <p className="text-xs font-medium text-foreground">Specific keywords</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Triggers on matched phrases</p>
                          </div>

                          <div
                            onClick={() => setTriggerType("ALL")}
                            className={`p-3.5 border rounded-xl cursor-pointer transition-colors ${
                              triggerType === "ALL"
                                ? "border-zinc-400 dark:border-zinc-500 bg-secondary/80 shadow-xs"
                                : "border-border bg-card hover:border-zinc-400 dark:hover:border-zinc-700"
                            }`}
                          >
                            <p className="text-xs font-medium text-foreground">All messages / comments</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Responds to every interaction</p>
                          </div>
                        </div>

                        {triggerType === "KEYWORD" && (
                          <div className="space-y-3 pt-2 border-t border-border">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-medium text-foreground">Keyword phrases (comma-separated)</label>
                              <div className="flex items-center gap-1.5 text-[10px]">
                                <button
                                  type="button"
                                  onClick={() => setMatchMode("CONTAINS")}
                                  className={`px-2 py-0.5 rounded ${matchMode === "CONTAINS" ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground"}`}
                                >
                                  Contains
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setMatchMode("EXACT")}
                                  className={`px-2 py-0.5 rounded ${matchMode === "EXACT" ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground"}`}
                                >
                                  Exact match
                                </button>
                              </div>
                            </div>

                            <input
                              type="text"
                              value={triggerKeyword}
                              onChange={(e) => setTriggerKeyword(e.target.value)}
                              placeholder="e.g. LINK, PRICE, CODE, INFO"
                              className="w-full h-10 px-3 bg-secondary border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                            />

                            {/* Tag Chips */}
                            <div className="flex flex-wrap gap-1.5">
                              {triggerKeyword.split(",").map((k) => k.trim()).filter((k) => k.length > 0).map((chip, idx) => (
                                <span key={idx} className="px-2 py-0.5 rounded bg-secondary border border-border text-foreground font-medium text-[10px]">
                                  #{chip.toLowerCase()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 3: PRIVATE DM RESPONSE & BUTTON BUILDER */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-0.5">
                      <h2 className="text-sm font-semibold text-foreground">Step 3: Direct Message reply & interactive buttons</h2>
                      <p className="text-xs text-muted-foreground">Craft the automated DM sent directly to the follower&apos;s inbox.</p>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <label className="font-medium text-foreground">Message copy</label>
                          <button
                            type="button"
                            onClick={() => setReplyDmMessage((p) => p + " {{username}}")}
                            className="text-[10px] font-semibold text-foreground hover:underline"
                          >
                            + Insert @username
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          value={replyDmMessage}
                          onChange={(e) => setReplyDmMessage(e.target.value)}
                          placeholder="Hey {{username}}! Here is your download link..."
                          className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors leading-relaxed resize-none"
                        />
                      </div>

                      {/* Interactive Button Attachment */}
                      <div className="p-3.5 bg-secondary/50 border border-border rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-foreground">Interactive Web URL Buttons</p>
                            <p className="text-[10px] text-muted-foreground">Adds clickable action buttons below the DM card</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEnableButtons(!enableButtons)}
                            className={`w-9 h-5 rounded-full transition-colors relative ${enableButtons ? "bg-primary" : "bg-zinc-300 dark:bg-zinc-700"}`}
                          >
                            <span className={`w-3.5 h-3.5 rounded-full bg-background absolute top-0.5 transition-transform ${enableButtons ? "right-1" : "left-1"}`} />
                          </button>
                        </div>

                        {enableButtons && (
                          <div className="space-y-3 pt-2 border-t border-border">
                            <div className="grid grid-cols-2 gap-2.5">
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                                  <span>Button title</span>
                                  <span>{buttonTitle.length}/20</span>
                                </div>
                                <input
                                  type="text"
                                  maxLength={20}
                                  value={buttonTitle}
                                  onChange={(e) => setButtonTitle(e.target.value)}
                                  placeholder="e.g. Shop Now"
                                  className="w-full h-9 px-3 bg-card border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] text-muted-foreground font-medium block">Destination URL</span>
                                <input
                                  type="text"
                                  value={buttonUrl}
                                  onChange={(e) => setButtonUrl(e.target.value)}
                                  placeholder="https://example.com"
                                  className="w-full h-9 px-3 bg-card border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5 pt-1">
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                                  <span>Secondary button (optional)</span>
                                  <span>{secondaryButtonTitle.length}/20</span>
                                </div>
                                <input
                                  type="text"
                                  maxLength={20}
                                  value={secondaryButtonTitle}
                                  onChange={(e) => setSecondaryButtonTitle(e.target.value)}
                                  placeholder="e.g. WhatsApp"
                                  className="w-full h-9 px-3 bg-card border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] text-muted-foreground font-medium block">Secondary URL</span>
                                <input
                                  type="text"
                                  value={secondaryButtonUrl}
                                  onChange={(e) => setSecondaryButtonUrl(e.target.value)}
                                  placeholder="https://wa.me/..."
                                  className="w-full h-9 px-3 bg-card border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Growth Gate: Require Follow Before Link */}
                      <div className="p-3.5 bg-secondary/50 border border-border rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-foreground">Require follow before receiving link</p>
                            <p className="text-[10px] text-muted-foreground">
                              Encourage commenters to follow your profile before unlocking their private link or discount.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setRequireFollow(!requireFollow)}
                            className={`w-9 h-5 rounded-full transition-colors relative ${requireFollow ? "bg-primary" : "bg-zinc-300 dark:bg-zinc-700"}`}
                          >
                            <span className={`w-3.5 h-3.5 rounded-full bg-background absolute top-0.5 transition-transform ${requireFollow ? "right-1" : "left-1"}`} />
                          </button>
                        </div>

                        {requireFollow && (
                          <div className="space-y-1.5 pt-2 border-t border-border">
                            <label className="text-[10px] font-medium text-foreground block">
                              Follow prompt message (sent to non-followers)
                            </label>
                            <textarea
                              rows={2}
                              value={followPromptMessage}
                              onChange={(e) => setFollowPromptMessage(e.target.value)}
                              placeholder="Hey {{username}}! Please follow our profile first to unlock your private link 🚀"
                              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors leading-relaxed resize-none"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: PUBLIC REPLIES & LEAD CAPTURE */}
                {step === 4 && (
                  <div className="space-y-4">
                    <div className="space-y-0.5">
                      <h2 className="text-sm font-semibold text-foreground">Step 4: Public reply & lead capture</h2>
                      <p className="text-xs text-muted-foreground">Configure comment replies and optional email capture.</p>
                    </div>

                    <div className="space-y-3">
                      {/* Lead Capture Toggle */}
                      <div className="p-3.5 bg-secondary/50 border border-border rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-foreground">Collect Email or Phone Leads First?</p>
                            <p className="text-[10px] text-muted-foreground">Captures contacts before delivering resource link</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEnableLeadCapture(!enableLeadCapture)}
                            className={`w-9 h-5 rounded-full transition-colors relative ${enableLeadCapture ? "bg-primary" : "bg-zinc-300 dark:bg-zinc-700"}`}
                          >
                            <span className={`w-3.5 h-3.5 rounded-full bg-background absolute top-0.5 transition-transform ${enableLeadCapture ? "right-1" : "left-1"}`} />
                          </button>
                        </div>

                        {enableLeadCapture && (
                          <div className="space-y-1.5 pt-2 border-t border-border">
                            <label className="text-[10px] font-medium text-foreground block">Step 2 Confirmation DM (After Contact Provided)</label>
                            <textarea
                              rows={2}
                              value={leadConfirmationDm}
                              onChange={(e) => setLeadConfirmationDm(e.target.value)}
                              className="w-full px-3 py-1.5 bg-card border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                            />
                          </div>
                        )}
                      </div>

                      {/* Public Comments Reply */}
                      {triggerSource === "COMMENTS" && (
                        <div className="p-3.5 bg-secondary/50 border border-border rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-medium text-foreground">Post Public Comment Reply</p>
                              <p className="text-[10px] text-muted-foreground">Boosts post ranking with randomized responses</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setLeavePublicReply(!leavePublicReply)}
                              className={`w-9 h-5 rounded-full transition-colors relative ${leavePublicReply ? "bg-primary" : "bg-zinc-300 dark:bg-zinc-700"}`}
                            >
                              <span className={`w-3.5 h-3.5 rounded-full bg-background absolute top-0.5 transition-transform ${leavePublicReply ? "right-1" : "left-1"}`} />
                            </button>
                          </div>

                          {leavePublicReply && (
                            <div className="space-y-2 pt-2 border-t border-border">
                              <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
                                {replyCommentOptions.map((opt, idx) => (
                                  <div key={idx} className="flex items-center justify-between gap-2 p-1.5 px-2 bg-card border border-border rounded-lg text-[11px] text-foreground">
                                    <span className="truncate">&quot;{opt}&quot;</span>
                                    <button
                                      type="button"
                                      onClick={() => removeCommentOption(idx)}
                                      className="text-muted-foreground hover:text-red-500 transition-colors"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>

                              <div className="flex gap-2 pt-1">
                                <input
                                  type="text"
                                  placeholder="Add reply variation..."
                                  value={newCommentOption}
                                  onChange={(e) => setNewCommentOption(e.target.value)}
                                  className="flex-1 h-9 px-3 bg-card border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                                />
                                <button
                                  type="button"
                                  onClick={addCommentOption}
                                  className="px-3 h-9 bg-secondary hover:bg-secondary/80 text-foreground font-medium rounded-lg text-xs transition-colors border border-border"
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Stepper Footer Controls */}
          <div className="flex items-center justify-between pt-5 border-t border-border shrink-0">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="h-10 px-4 border border-border hover:bg-secondary text-foreground font-medium rounded-xl text-sm flex items-center gap-1.5 transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            {step < 4 ? (
              <button
                onClick={handleNext}
                className="h-10 px-5 bg-primary text-primary-foreground hover:opacity-90 font-medium rounded-xl text-sm flex items-center gap-1.5 transition-colors shadow-sm"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleGoLive}
                disabled={loading}
                className="h-10 px-5 bg-primary text-primary-foreground hover:opacity-90 font-medium rounded-xl text-sm flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" /> : "Go live"}
              </button>
            )}
          </div>

        </div>

        {/* RIGHT PANEL: Authentic 1:1 Instagram iOS Dark Mode Preview */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 flex flex-col items-center justify-center">
          <InstagramPreview
            username={username}
            triggerKeyword={firstKeyword}
            replyDmMessage={replyDmMessage}
            publicReplyComment={replyCommentOptions[0] || "Just sent you a DM with the direct link! 📩"}
            buttonTitle={enableButtons ? buttonTitle : ""}
            buttonUrl={buttonUrl}
            secondaryButtonTitle={enableButtons ? secondaryButtonTitle : ""}
            secondaryButtonUrl={secondaryButtonUrl}
          />
        </div>

      </div>

      {/* Visual Instagram Post & Reel Picker Modal */}
      <PostPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        mediaItems={mediaItems}
        selectedMediaIds={targetMediaIds}
        onSelectMediaIds={setTargetMediaIds}
        isLoading={mediaLoading}
      />

    </div>
  );
}
