"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Plus, Sparkles, Send, ChevronRight, ChevronLeft, MessageSquare, Video, Info, Heart, Trash2, Globe, Camera, Layers } from "lucide-react";
import { createAutomation } from "@/app/dashboard/automations/actions";
import Link from "next/link";

interface IgAccount {
  id: string;
  instagramAccountId: string;
  pageName: string;
}

interface AutomationBuilderProps {
  connectedAccounts: IgAccount[];
}

export default function AutomationBuilderClient({ connectedAccounts }: AutomationBuilderProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSavedDot, setIsSavedDot] = useState(true);

  // Core Automation States
  const [ruleName, setRuleName] = useState("Instagram Comment-to-DM");
  const [triggerSource, setTriggerSource] = useState<"COMMENTS" | "STORY_MENTIONS" | "DIRECT_MESSAGES">("COMMENTS");
  const [triggerScope, setTriggerScope] = useState<"ALL_POSTS" | "SPECIFIC_POSTS">("ALL_POSTS");
  const [targetMediaIds, setTargetMediaIds] = useState<string[]>([]);
  const [postUrlInput, setPostUrlInput] = useState("");
  
  const [triggerType, setTriggerType] = useState<"KEYWORD" | "ALL">("KEYWORD");
  const [matchMode, setMatchMode] = useState<"CONTAINS" | "EXACT">("CONTAINS");
  const [triggerKeyword, setTriggerKeyword] = useState("LINK, GUIDE, INFO");
  
  const [replyDmMessage, setReplyDmMessage] = useState("Hey {{username}}! Here is your download link: https://example.com/guide 🚀 Let me know if you have any questions!");
  const [enableLeadCapture, setEnableLeadCapture] = useState(false);
  const [leadConfirmationDm, setLeadConfirmationDm] = useState("Thanks {{username}}! I've sent the PDF to your email. You can also download it directly here: https://example.com/free-training.pdf 🎁");

  // Rich Interactive Buttons States
  const [enableButtons, setEnableButtons] = useState(false);
  const [buttonTitle, setButtonTitle] = useState("👉 Get Access");
  const [buttonUrl, setButtonUrl] = useState("https://example.com/guide");
  const [secondaryButtonTitle, setSecondaryButtonTitle] = useState("");
  const [secondaryButtonUrl, setSecondaryButtonUrl] = useState("");

  const [leavePublicReply, setLeavePublicReply] = useState(true);
  const [replyCommentOptions, setReplyCommentOptions] = useState<string[]>([
    "Just sent you a DM! Check your inbox 📩",
    "Sent! Let me know if you got it 🚀",
    "Check your messages! Just sent over the details ✨",
    "Sent to your DMs! Let me know what you think 🔥",
    "Just sent it your way! Check message requests if you don't see it 💬"
  ]);
  const [newCommentOption, setNewCommentOption] = useState("");

  // iPhone Mockup View Control
  const [activeTab, setActiveTab] = useState<"POST" | "COMMENTS" | "DM">("POST");

  // Media items list
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState("");

  // Automatically update iPhone preview tab depending on current wizard step
  useEffect(() => {
    if (step === 1) {
      setActiveTab("POST");
    } else if (step === 2 || step === 4) {
      setActiveTab("COMMENTS");
    } else if (step === 3) {
      setActiveTab("DM");
    }
  }, [step]);

  // Flash saved dot animation on changes to simulate auto-saves
  useEffect(() => {
    setIsSavedDot(false);
    const t = setTimeout(() => setIsSavedDot(true), 500);
    return () => clearTimeout(t);
  }, [ruleName, triggerSource, triggerScope, targetMediaIds, triggerType, triggerKeyword, replyDmMessage, enableLeadCapture, leadConfirmationDm, leavePublicReply, replyCommentOptions, enableButtons, buttonTitle, buttonUrl, secondaryButtonTitle, secondaryButtonUrl]);

  // Fetch Instagram posts if target is SPECIFIC_POSTS and media list is empty
  useEffect(() => {
    if (triggerScope === "SPECIFIC_POSTS" && mediaItems.length === 0) {
      const fetchMedia = async () => {
        setMediaLoading(true);
        setMediaError("");
        try {
          const res = await fetch("/api/instagram/media");
          if (!res.ok) {
            throw new Error("Failed to load Instagram posts.");
          }
          const data = await res.json();
          setMediaItems(data.media || []);
        } catch (err: any) {
          setMediaError(err.message || "Failed to load posts from profile.");
        } finally {
          setMediaLoading(false);
        }
      };
      fetchMedia();
    }
  }, [triggerScope, mediaItems.length]);

  const handleNext = () => {
    if (step < 4) {
      setDirection(1);
      setStep((prev) => (prev + 1) as any);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setDirection(-1);
      setStep((prev) => (prev - 1) as any);
    }
  };

  const handleToggleMediaSelect = (mediaId: string) => {
    setTargetMediaIds((prev) =>
      prev.includes(mediaId) ? prev.filter((id) => id !== mediaId) : [...prev, mediaId]
    );
  };

  const addCommentOption = () => {
    if (newCommentOption.trim().length > 0) {
      setReplyCommentOptions((prev) => [...prev, newCommentOption.trim()]);
      setNewCommentOption("");
    }
  };

  const removeCommentOption = (index: number) => {
    setReplyCommentOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGoLive = async () => {
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("name", ruleName || "Instagram Comment-to-DM");
    formData.append("triggerSource", triggerSource);
    formData.append("triggerScope", triggerSource === "COMMENTS" ? triggerScope : "ALL_POSTS");
    formData.append("triggerType", triggerSource === "STORY_MENTIONS" ? "ALL" : triggerType === "ALL" ? "ALL" : matchMode === "EXACT" ? "EXACT" : "KEYWORD");
    formData.append("triggerKeyword", triggerSource === "STORY_MENTIONS" ? "" : triggerKeyword);
    formData.append("enableLeadCapture", String(enableLeadCapture));
    formData.append("replyDmMessage", replyDmMessage);
    formData.append("leadConfirmationDm", enableLeadCapture ? leadConfirmationDm : "");
    formData.append("replyCommentOptions", triggerSource === "COMMENTS" && leavePublicReply ? replyCommentOptions.join("\n") : "");
    formData.append("targetMediaIds", triggerScope === "SPECIFIC_POSTS" && triggerSource === "COMMENTS" ? targetMediaIds.join(",") : "");
    
    // Buttons Fields
    formData.append("buttonTitle", enableButtons ? buttonTitle : "");
    formData.append("buttonUrl", enableButtons ? buttonUrl : "");
    formData.append("secondaryButtonTitle", enableButtons ? secondaryButtonTitle : "");
    formData.append("secondaryButtonUrl", enableButtons ? secondaryButtonUrl : "");

    try {
      await createAutomation(formData);
      router.push("/dashboard/automations");
    } catch (err: any) {
      setError(err.message || "Failed to publish automation rule.");
      setLoading(false);
    }
  };

  const selectedMediaItem = mediaItems.find((item) => targetMediaIds.includes(item.id));
  const activePostImage = selectedMediaItem?.thumbnail_url || selectedMediaItem?.media_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60";

  return (
    <div className="flex flex-col h-screen bg-[#0F0F0F] text-zinc-100 overflow-hidden font-sans selection:bg-[#00DF81]/25 selection:text-white">
      
      {/* Sleek Minimalist Header */}
      <header className="h-14 px-6 bg-[#0F0F0F] border-b border-[#27272A] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/automations"
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors font-medium"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
            Automations
          </Link>
          <span className="text-zinc-600">/</span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              className="bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-[#00DF81] font-semibold text-xs text-zinc-100 focus:outline-none px-1 py-0.5 max-w-[200px] truncate"
              title="Click to rename rule"
            />
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
              <span className={`w-1.5 h-1.5 rounded-full ${isSavedDot ? "bg-[#00DF81]" : "bg-zinc-600"}`} />
              <span>{isSavedDot ? "Draft saved" : "Saving..."}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleGoLive}
          disabled={loading}
          className="h-9 px-4 bg-[#00DF81] hover:bg-[#00C770] text-[#000000] font-semibold rounded-lg text-xs transition-all active:scale-95 shadow-sm disabled:opacity-50 flex items-center gap-1.5"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 fill-black" />
              Go live
            </>
          )}
        </button>
      </header>

      {/* Main 50/50 Split Builder Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* LEFT PANEL: 4-Step Interactive Configuration */}
        <div className="flex-1 lg:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto border-r border-[#27272A] bg-[#0F0F0F]">
          
          {/* Step Pill Indicators */}
          <div className="grid grid-cols-4 gap-2 mb-6 shrink-0">
            {[
              { num: 1, name: "Trigger" },
              { num: 2, name: "Keywords" },
              { num: 3, name: "Private DM" },
              { num: 4, name: "Public Reply" },
            ].map((s) => (
              <button
                key={s.num}
                onClick={() => setStep(s.num as any)}
                className={`p-2 rounded-lg border text-left transition-all ${
                  step === s.num
                    ? "bg-[#18181B] border-[#00DF81]/60 text-zinc-100 shadow-sm"
                    : s.num < step
                    ? "bg-[#18181B]/50 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    : "bg-[#0F0F0F] border-zinc-800/60 text-zinc-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-500">0{s.num}</span>
                  {s.num < step && <span className="text-[10px] text-[#00DF81] font-bold">✓</span>}
                </div>
                <p className="text-[11px] font-medium truncate mt-0.5">{s.name}</p>
              </button>
            ))}
          </div>

          {/* Form Step Content with Slide Animation */}
          <div className="flex-1 flex flex-col justify-start">
            {error && (
              <div className="mb-4 p-3 text-xs text-red-400 bg-red-950/20 border border-red-500/20 rounded-lg">
                {error}
              </div>
            )}

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                initial={{ opacity: 0, y: direction * 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -direction * 10 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="space-y-5"
              >
                
                {/* STEP 1: TRIGGER SOURCE & POST SELECTION */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-0.5">
                      <h2 className="text-base font-bold text-zinc-100">Step 1: When someone interacts with...</h2>
                      <p className="text-xs text-zinc-400">Select which Instagram touchpoint triggers this automation flow.</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { id: "COMMENTS", title: "Comments", desc: "Post & Reel comments", icon: MessageSquare },
                        { id: "STORY_MENTIONS", title: "Story Mentions", desc: "Tagged in user stories", icon: Camera },
                        { id: "DIRECT_MESSAGES", title: "Direct DMs", desc: "Inbound inbox messages", icon: Send },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSelected = triggerSource === item.id;
                        return (
                          <div
                            key={item.id}
                            onClick={() => setTriggerSource(item.id as any)}
                            className={`p-3.5 border rounded-xl cursor-pointer transition-all flex flex-col justify-between h-[105px] ${
                              isSelected
                                ? "border-[#00DF81] bg-[#18181B] shadow-sm"
                                : "border-[#27272A] bg-[#18181B]/40 hover:border-zinc-700 hover:bg-[#18181B]/70"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <Icon className={`w-4 h-4 ${isSelected ? "text-[#00DF81]" : "text-zinc-500"}`} strokeWidth={1.75} />
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#00DF81]" />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-zinc-100">{item.title}</p>
                              <p className="text-[10px] text-zinc-400 mt-0.5 leading-tight">{item.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {triggerSource === "COMMENTS" && (
                      <div className="space-y-3 pt-3 border-t border-[#27272A]">
                        <label className="text-xs font-semibold text-zinc-300 block">Target publications</label>
                        
                        <div className="grid grid-cols-2 gap-2.5">
                          <div
                            onClick={() => setTriggerScope("ALL_POSTS")}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              triggerScope === "ALL_POSTS"
                                ? "border-[#00DF81] bg-[#18181B]"
                                : "border-[#27272A] bg-[#18181B]/30 hover:border-zinc-700"
                            }`}
                          >
                            <p className="text-xs font-bold text-zinc-200">All current & future posts</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">Applies across all profile publications</p>
                          </div>

                          <div
                            onClick={() => setTriggerScope("SPECIFIC_POSTS")}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              triggerScope === "SPECIFIC_POSTS"
                                ? "border-[#00DF81] bg-[#18181B]"
                                : "border-[#27272A] bg-[#18181B]/30 hover:border-zinc-700"
                            }`}
                          >
                            <p className="text-xs font-bold text-zinc-200">Specific posts or reels</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">Select specific media thumbnails</p>
                          </div>
                        </div>

                        {triggerScope === "SPECIFIC_POSTS" && (
                          <div className="space-y-2 pt-2">
                            <input
                              type="text"
                              placeholder="Paste Instagram post URL (optional)..."
                              value={postUrlInput}
                              onChange={(e) => setPostUrlInput(e.target.value)}
                              className="w-full px-3 py-2 bg-[#18181B] border border-[#27272A] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#00DF81] text-zinc-100 placeholder-zinc-500"
                            />

                            {mediaLoading && (
                              <div className="flex items-center justify-center py-4 text-xs text-zinc-500 gap-2">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00DF81]" />
                                Loading feed thumbnails...
                              </div>
                            )}

                            {!mediaLoading && mediaItems.length > 0 && (
                              <div className="grid grid-cols-4 gap-2 max-h-[140px] overflow-y-auto pr-1">
                                {mediaItems.map((item) => {
                                  const isSelected = targetMediaIds.includes(item.id);
                                  const img = item.thumbnail_url || item.media_url;
                                  return (
                                    <div
                                      key={item.id}
                                      onClick={() => handleToggleMediaSelect(item.id)}
                                      className={`relative aspect-square bg-zinc-900 border rounded-lg overflow-hidden cursor-pointer transition-all ${
                                        isSelected
                                          ? "border-[#00DF81] ring-2 ring-[#00DF81]/20"
                                          : "border-zinc-800 hover:border-zinc-700"
                                      }`}
                                    >
                                      {img && <img src={img} alt="Post" className="w-full h-full object-cover" />}
                                      {isSelected && (
                                        <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#00DF81] text-black flex items-center justify-center text-[8px] font-bold">✓</div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
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
                      <h2 className="text-base font-bold text-zinc-100">Step 2: Trigger keywords & condition</h2>
                      <p className="text-xs text-zinc-400">Specify what words followers must say to receive your response.</p>
                    </div>

                    {triggerSource === "STORY_MENTIONS" ? (
                      <div className="p-5 bg-[#18181B] border border-[#27272A] rounded-xl text-center space-y-2">
                        <Camera className="w-6 h-6 text-[#00DF81] mx-auto" strokeWidth={1.75} />
                        <p className="text-xs font-bold text-zinc-200">No keywords required for Story Mentions</p>
                        <p className="text-[11px] text-zinc-400 max-w-xs mx-auto leading-relaxed">
                          Whenever someone mentions you in their Instagram story, AutoDMs automatically rewards them with your DM response.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2.5">
                          <div
                            onClick={() => setTriggerType("KEYWORD")}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              triggerType === "KEYWORD"
                                ? "border-[#00DF81] bg-[#18181B]"
                                : "border-[#27272A] bg-[#18181B]/30 hover:border-zinc-700"
                            }`}
                          >
                            <p className="text-xs font-bold text-zinc-200">Specific keywords</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">Triggers on matched phrases</p>
                          </div>

                          <div
                            onClick={() => setTriggerType("ALL")}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              triggerType === "ALL"
                                ? "border-[#00DF81] bg-[#18181B]"
                                : "border-[#27272A] bg-[#18181B]/30 hover:border-zinc-700"
                            }`}
                          >
                            <p className="text-xs font-bold text-zinc-200">All messages / comments</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">Responds to every interaction</p>
                          </div>
                        </div>

                        {triggerType === "KEYWORD" && (
                          <div className="space-y-3 pt-2 border-t border-[#27272A]">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-semibold text-zinc-300">Keyword phrases (comma-separated)</label>
                              <div className="flex items-center gap-1.5 text-[10px]">
                                <button
                                  type="button"
                                  onClick={() => setMatchMode("CONTAINS")}
                                  className={`px-2 py-0.5 rounded ${matchMode === "CONTAINS" ? "bg-zinc-800 text-zinc-100 font-semibold" : "text-zinc-500"}`}
                                >
                                  Contains
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setMatchMode("EXACT")}
                                  className={`px-2 py-0.5 rounded ${matchMode === "EXACT" ? "bg-zinc-800 text-zinc-100 font-semibold" : "text-zinc-500"}`}
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
                              className="w-full px-3 py-2 bg-[#18181B] border border-[#27272A] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#00DF81] text-zinc-100 placeholder-zinc-500"
                            />

                            {/* Tag Chips */}
                            <div className="flex flex-wrap gap-1.5">
                              {triggerKeyword.split(",").map((k) => k.trim()).filter((k) => k.length > 0).map((chip, idx) => (
                                <span key={idx} className="px-2 py-0.5 rounded bg-[#18181B] border border-zinc-700 text-[#00DF81] font-mono text-[10px] font-semibold">
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
                      <h2 className="text-base font-bold text-zinc-100">Step 3: Direct Message reply & interactive buttons</h2>
                      <p className="text-xs text-zinc-400">Craft the automated DM sent directly to the follower's inbox.</p>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <label className="font-semibold text-zinc-300">Message copy</label>
                          <button
                            type="button"
                            onClick={() => setReplyDmMessage((p) => p + " {{username}}")}
                            className="text-[10px] font-semibold text-[#00DF81] hover:underline"
                          >
                            + Insert @username
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          value={replyDmMessage}
                          onChange={(e) => setReplyDmMessage(e.target.value)}
                          placeholder="Hey {{username}}! Here is your download link..."
                          className="w-full px-3 py-2 bg-[#18181B] border border-[#27272A] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#00DF81] text-zinc-100 placeholder-zinc-500 leading-relaxed resize-none"
                        />
                      </div>

                      {/* Interactive Button Attachment */}
                      <div className="p-3.5 bg-[#18181B] border border-[#27272A] rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-zinc-200">Interactive Web URL Buttons</p>
                            <p className="text-[10px] text-zinc-400">Adds clickable action buttons below the DM card</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEnableButtons(!enableButtons)}
                            className={`w-9 h-5 rounded-full transition-colors relative ${enableButtons ? "bg-[#00DF81]" : "bg-zinc-700"}`}
                          >
                            <span className={`w-3.5 h-3.5 rounded-full bg-black absolute top-0.5 transition-transform ${enableButtons ? "right-1" : "left-1"}`} />
                          </button>
                        </div>

                        {enableButtons && (
                          <div className="space-y-3 pt-2 border-t border-[#27272A]">
                            <div className="grid grid-cols-2 gap-2.5">
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
                                  <span>Button title</span>
                                  <span>{buttonTitle.length}/20</span>
                                </div>
                                <input
                                  type="text"
                                  maxLength={20}
                                  value={buttonTitle}
                                  onChange={(e) => setButtonTitle(e.target.value)}
                                  placeholder="e.g. 👉 Get Access"
                                  className="w-full px-3 py-1.5 bg-[#0F0F0F] border border-[#27272A] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#00DF81] text-zinc-100"
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] text-zinc-400 font-medium block">Destination URL</span>
                                <input
                                  type="text"
                                  value={buttonUrl}
                                  onChange={(e) => setButtonUrl(e.target.value)}
                                  placeholder="https://example.com"
                                  className="w-full px-3 py-1.5 bg-[#0F0F0F] border border-[#27272A] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#00DF81] text-zinc-100 font-mono"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5 pt-1">
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
                                  <span>Secondary button (opt)</span>
                                  <span>{secondaryButtonTitle.length}/20</span>
                                </div>
                                <input
                                  type="text"
                                  maxLength={20}
                                  value={secondaryButtonTitle}
                                  onChange={(e) => setSecondaryButtonTitle(e.target.value)}
                                  placeholder="e.g. 📲 Chat WhatsApp"
                                  className="w-full px-3 py-1.5 bg-[#0F0F0F] border border-[#27272A] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#00DF81] text-zinc-100"
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] text-zinc-400 font-medium block">Secondary URL</span>
                                <input
                                  type="text"
                                  value={secondaryButtonUrl}
                                  onChange={(e) => setSecondaryButtonUrl(e.target.value)}
                                  placeholder="https://wa.me/..."
                                  className="w-full px-3 py-1.5 bg-[#0F0F0F] border border-[#27272A] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#00DF81] text-zinc-100 font-mono"
                                />
                              </div>
                            </div>
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
                      <h2 className="text-base font-bold text-zinc-100">Step 4: Public reply & 2-step lead capture</h2>
                      <p className="text-xs text-zinc-400">Configure algorithm booster comment replies and email capture.</p>
                    </div>

                    <div className="space-y-3">
                      {/* Lead Capture Toggle */}
                      <div className="p-3.5 bg-[#18181B] border border-[#27272A] rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-zinc-200">Collect Email or Phone Leads First?</p>
                            <p className="text-[10px] text-zinc-400">Captures contacts before delivering resource link</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEnableLeadCapture(!enableLeadCapture)}
                            className={`w-9 h-5 rounded-full transition-colors relative ${enableLeadCapture ? "bg-[#00DF81]" : "bg-zinc-700"}`}
                          >
                            <span className={`w-3.5 h-3.5 rounded-full bg-black absolute top-0.5 transition-transform ${enableLeadCapture ? "right-1" : "left-1"}`} />
                          </button>
                        </div>

                        {enableLeadCapture && (
                          <div className="space-y-1.5 pt-2 border-t border-[#27272A]">
                            <label className="text-[10px] font-semibold text-zinc-300 block">Step 2 Confirmation DM (After Email Provided)</label>
                            <textarea
                              rows={2}
                              value={leadConfirmationDm}
                              onChange={(e) => setLeadConfirmationDm(e.target.value)}
                              className="w-full px-3 py-1.5 bg-[#0F0F0F] border border-[#27272A] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#00DF81] text-zinc-100 placeholder-zinc-500"
                            />
                          </div>
                        )}
                      </div>

                      {/* Public Comments Reply */}
                      {triggerSource === "COMMENTS" && (
                        <div className="p-3.5 bg-[#18181B] border border-[#27272A] rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-zinc-200">Post Public Comment Reply</p>
                              <p className="text-[10px] text-zinc-400">Boosts post ranking with randomized responses</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setLeavePublicReply(!leavePublicReply)}
                              className={`w-9 h-5 rounded-full transition-colors relative ${leavePublicReply ? "bg-[#00DF81]" : "bg-zinc-700"}`}
                            >
                              <span className={`w-3.5 h-3.5 rounded-full bg-black absolute top-0.5 transition-transform ${leavePublicReply ? "right-1" : "left-1"}`} />
                            </button>
                          </div>

                          {leavePublicReply && (
                            <div className="space-y-2 pt-2 border-t border-[#27272A]">
                              <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
                                {replyCommentOptions.map((opt, idx) => (
                                  <div key={idx} className="flex items-center justify-between gap-2 p-1.5 px-2 bg-[#0F0F0F] border border-[#27272A] rounded-lg text-[11px] text-zinc-300">
                                    <span className="truncate">"{opt}"</span>
                                    <button
                                      type="button"
                                      onClick={() => removeCommentOption(idx)}
                                      className="text-zinc-500 hover:text-red-400 transition-colors"
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
                                  className="flex-1 px-3 py-1.5 bg-[#0F0F0F] border border-[#27272A] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#00DF81] text-zinc-100"
                                />
                                <button
                                  type="button"
                                  onClick={addCommentOption}
                                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-lg text-xs transition-colors"
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
          <div className="flex items-center justify-between pt-5 mt-5 border-t border-[#27272A] shrink-0">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="h-9 px-3.5 border border-[#27272A] hover:bg-[#18181B] text-zinc-300 font-medium rounded-lg text-xs flex items-center gap-1 transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back
            </button>

            {step < 4 ? (
              <button
                onClick={handleNext}
                className="h-9 px-4 bg-zinc-100 hover:bg-white text-zinc-900 font-semibold rounded-lg text-xs flex items-center gap-1 transition-colors shadow-sm"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleGoLive}
                disabled={loading}
                className="h-9 px-4 bg-[#00DF81] hover:bg-[#00C770] text-[#000000] font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-sm disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "🚀 Go live"}
              </button>
            )}
          </div>

        </div>

        {/* RIGHT PANEL: OLED iPhone Preview Frame */}
        <div className="flex-1 lg:w-1/2 bg-[#0A0A0A] p-6 flex flex-col items-center justify-center border-l border-[#27272A] overflow-y-auto">
          
          {/* iOS Device Shell */}
          <div className="w-[280px] h-[540px] bg-black border-[5px] border-[#27272A] rounded-[38px] overflow-hidden shadow-2xl flex flex-col relative text-zinc-100 text-[11px]">
            
            {/* Dynamic Island / Speaker */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-2.5 rounded-full bg-zinc-900 z-20" />

            {/* Simulated Status Bar */}
            <div className="h-4 bg-black shrink-0" />

            {/* Tab switch panel inside device */}
            <div className="grid grid-cols-3 bg-zinc-950 border-b border-[#27272A] text-center text-[9px] font-semibold shrink-0">
              <button
                onClick={() => setActiveTab("POST")}
                className={`py-2 transition-colors ${activeTab === "POST" ? "text-[#00DF81] border-b border-[#00DF81]" : "text-zinc-500"}`}
              >
                Post
              </button>
              <button
                onClick={() => setActiveTab("COMMENTS")}
                className={`py-2 transition-colors ${activeTab === "COMMENTS" ? "text-[#00DF81] border-b border-[#00DF81]" : "text-zinc-500"}`}
              >
                Comments
              </button>
              <button
                onClick={() => setActiveTab("DM")}
                className={`py-2 transition-colors ${activeTab === "DM" ? "text-[#00DF81] border-b border-[#00DF81]" : "text-zinc-500"}`}
              >
                Direct DM
              </button>
            </div>

            {/* Screen Content Wrapper */}
            <div className="flex-1 flex flex-col bg-black overflow-y-auto justify-start relative">
              
              {/* TAB 1: POST VIEW */}
              {activeTab === "POST" && (
                <div className="flex-1 flex flex-col">
                  {/* Account Header */}
                  <div className="px-3 py-2 flex items-center gap-2 border-b border-zinc-900 bg-zinc-950 shrink-0">
                    <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-[8px] text-[#00DF81]">
                      IG
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-[9px] leading-tight">{connectedAccounts[0]?.pageName || "your_profile"}</p>
                    </div>
                    <span className="text-[12px] text-zinc-500">•••</span>
                  </div>

                  {/* Post Image Container */}
                  <div className="relative aspect-square w-full bg-zinc-900 flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      src={activePostImage}
                      alt="Post mockup"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Action row */}
                  <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 text-zinc-200 mb-1.5">
                        <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                        <MessageSquare className="w-3.5 h-3.5" />
                        <Send className="w-3.5 h-3.5" />
                      </div>
                      <p className="font-semibold text-[9px] text-zinc-300">Liked by yassinecodez and 1,248 others</p>
                      
                      {/* Caption text */}
                      <p className="text-zinc-400 mt-1 leading-relaxed text-[10px]">
                        <span className="font-bold text-zinc-100 mr-1">{connectedAccounts[0]?.pageName || "your_profile"}</span>
                        Comment <span className="text-[#00DF81] font-semibold">"{triggerKeyword ? triggerKeyword.split(",")[0] : "LINK"}"</span> to get the access link sent straight to your DMs! 🚀
                      </p>
                    </div>

                    <div className="text-[8px] text-zinc-600 font-mono">
                      Just now
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: COMMENTS VIEW */}
              {activeTab === "COMMENTS" && (
                <div className="flex-1 flex flex-col justify-between p-3 bg-zinc-950">
                  <div className="space-y-3">
                    <div className="pb-1.5 border-b border-zinc-900 flex justify-between items-center text-[10px]">
                      <span className="font-bold text-zinc-200">Comments</span>
                      <span className="text-zinc-500 text-[9px]">Top</span>
                    </div>

                    {/* Customer Comment */}
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-[8px] text-zinc-400">C</div>
                      <div className="text-left space-y-0.5 max-w-[190px]">
                        <p className="font-semibold text-[9px] text-zinc-300">customer_ig <span className="text-zinc-600 text-[8px] ml-1">1m</span></p>
                        <p className="text-zinc-300 text-[10px]">
                          {triggerType === "ALL" ? "This looks amazing!" : triggerKeyword ? triggerKeyword.split(",")[0] : "LINK"} please!
                        </p>
                      </div>
                    </div>

                    {/* Public reply variation */}
                    {leavePublicReply && (
                      <div className="flex items-start gap-2 pl-5">
                        <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-[8px] text-[#00DF81]">IG</div>
                        <div className="text-left space-y-0.5 max-w-[170px]">
                          <p className="font-semibold text-[9px] text-zinc-300">
                            {connectedAccounts[0]?.pageName || "your_profile"}
                            <span className="text-zinc-600 text-[8px] ml-1">now</span>
                          </p>
                          <p className="text-[#00DF81] text-[9px] italic bg-[#00DF81]/10 p-1.5 rounded border border-[#00DF81]/20">
                            "{replyCommentOptions[0] || "Just sent you a DM! Check your inbox 📩"}"
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-1.5 border-t border-zinc-900 text-[8px] text-zinc-600 text-center">
                    Real-time Instagram comments simulation
                  </div>
                </div>
              )}

              {/* TAB 3: DM VIEW */}
              {activeTab === "DM" && (
                <div className="flex-1 flex flex-col h-full bg-black justify-between">
                  {/* Header */}
                  <div className="px-3 py-2 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-[8px] text-[#00DF81]">IG</div>
                      <div className="text-left">
                        <p className="font-semibold text-[9px] leading-tight">{connectedAccounts[0]?.pageName || "your_profile"}</p>
                        <p className="text-[7px] text-zinc-500">Active now</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Video className="w-3 h-3" />
                      <Info className="w-3 h-3" />
                    </div>
                  </div>

                  {/* Message bubbles */}
                  <div className="flex-1 p-3 space-y-2.5 overflow-y-auto flex flex-col justify-end bg-black">
                    
                    {/* User Trigger */}
                    <div className="self-end max-w-[80%] bg-zinc-800 text-zinc-100 rounded-2xl px-2.5 py-1.5 text-[9px]">
                      {triggerSource === "COMMENTS" ? `Commented: "${triggerKeyword ? triggerKeyword.split(",")[0] : "LINK"}"` : triggerKeyword ? triggerKeyword.split(",")[0] : "LINK"}
                    </div>

                    {/* Private reply */}
                    <div className="self-start max-w-[85%] space-y-1">
                      <div className="bg-[#18181B] border border-zinc-800 text-zinc-100 rounded-2xl px-3 py-2 text-[9px] break-words whitespace-pre-wrap leading-relaxed shadow-sm">
                        {replyDmMessage ? replyDmMessage.replace(/\{\{username\}\}/g, "customer_ig") : "..."}
                      </div>
                      
                      {enableButtons && (buttonTitle || secondaryButtonTitle) && (
                        <div className="flex flex-col gap-1 w-full bg-zinc-900 border border-zinc-800 rounded-xl p-1 shrink-0">
                          {buttonTitle && (
                            <div className="py-1 px-2 bg-zinc-800 hover:bg-zinc-750 rounded-lg text-center text-[8px] font-bold text-[#00DF81] truncate">
                              {buttonTitle}
                            </div>
                          )}
                          {secondaryButtonTitle && (
                            <div className="py-1 px-2 bg-zinc-800 hover:bg-zinc-750 rounded-lg text-center text-[8px] font-bold text-[#00DF81] truncate">
                              {secondaryButtonTitle}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Lead collection simulation */}
                    {enableLeadCapture && (
                      <>
                        <div className="self-end max-w-[80%] bg-zinc-800 text-zinc-100 rounded-2xl px-2.5 py-1.5 text-[9px]">
                          hello@example.com
                        </div>
                        <div className="self-start max-w-[85%] bg-[#18181B] border border-zinc-800 text-zinc-100 rounded-2xl px-3 py-2 text-[9px] break-words whitespace-pre-wrap leading-relaxed">
                          {leadConfirmationDm ? leadConfirmationDm.replace(/\{\{username\}\}/g, "customer_ig") : "..."}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Mock Input */}
                  <div className="p-2 border-t border-zinc-900 bg-zinc-950 flex items-center justify-between gap-1.5 shrink-0">
                    <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-2.5 py-1 text-left text-zinc-500 text-[8px] flex items-center justify-between">
                      <span>Message...</span>
                      <Send className="w-2.5 h-2.5 text-zinc-400" />
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Home Indicator */}
            <div className="h-4 bg-zinc-950 flex items-center justify-center shrink-0">
              <span className="w-16 h-1 rounded-full bg-zinc-800" />
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
