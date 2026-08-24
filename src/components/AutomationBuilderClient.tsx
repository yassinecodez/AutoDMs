"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Plus, Send, ChevronRight, ChevronLeft, MessageSquare, Trash2, Camera, Sparkles } from "lucide-react";
import { createAutomation } from "@/app/dashboard/automations/actions";
import Link from "next/link";
import InstagramPreview from "@/components/InstagramPreview";

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
  }, [ruleName, triggerSource, triggerScope, targetMediaIds, triggerType, triggerKeyword, replyDmMessage, enableLeadCapture, leadConfirmationDm, leavePublicReply, replyCommentOptions, enableButtons, buttonTitle, buttonUrl, secondaryButtonTitle, secondaryButtonUrl]);

  // Fetch Instagram posts if target is SPECIFIC_POSTS and media list is empty
  useEffect(() => {
    if (triggerScope === "SPECIFIC_POSTS" && mediaItems.length === 0) {
      const fetchMedia = async () => {
        setMediaLoading(true);
        try {
          const res = await fetch("/api/instagram/media");
          if (res.ok) {
            const data = await res.json();
            setMediaItems(data.media || []);
          }
        } catch (err: any) {
          console.error("Failed to load Instagram media:", err);
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

  const username = connectedAccounts[0]?.pageName || "your_brand";
  const firstKeyword = triggerKeyword ? triggerKeyword.split(",")[0].trim() : "PRICE";

  return (
    <div className="flex flex-col h-screen bg-[#000000] text-zinc-100 overflow-hidden font-sans selection:bg-white/20 selection:text-white">
      
      {/* Sleek Minimalist Header */}
      <header className="h-14 px-6 bg-[#000000] border-b border-[#222222] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/automations"
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors font-medium"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
            Automations
          </Link>
          <span className="text-zinc-700">/</span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              className="bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-white font-medium text-xs text-white focus:outline-none px-1 py-0.5 max-w-[200px] truncate"
              title="Click to rename rule"
            />
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
              <span className={`w-1.5 h-1.5 rounded-full ${isSavedDot ? "bg-white" : "bg-zinc-600"}`} />
              <span>{isSavedDot ? "Saved" : "Saving..."}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleGoLive}
          disabled={loading}
          className="h-9 px-4 bg-white hover:bg-zinc-200 text-black font-medium rounded-lg text-xs transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
          ) : (
            "Go live"
          )}
        </button>
      </header>

      {/* Main 50/50 Split Builder Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* LEFT PANEL: 4-Step Interactive Configuration */}
        <div className="flex-1 lg:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto border-r border-[#222222] bg-[#000000]">
          
          {/* Step Pill Indicators */}
          <div className="grid grid-cols-4 gap-2 mb-6 shrink-0">
            {[
              { num: 1, name: "Trigger" },
              { num: 2, name: "Keywords" },
              { num: 3, name: "Direct Reply" },
              { num: 4, name: "Public Reply" },
            ].map((s) => (
              <button
                key={s.num}
                onClick={() => setStep(s.num as any)}
                className={`p-2.5 rounded-lg border text-left transition-colors ${
                  step === s.num
                    ? "bg-[#111111] border-white/40 text-white"
                    : s.num < step
                    ? "bg-[#0A0A0A] border-[#222222] text-zinc-400 hover:border-zinc-700"
                    : "bg-[#000000] border-[#222222]/60 text-zinc-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-500">0{s.num}</span>
                  {s.num < step && <span className="text-[10px] text-white font-bold">✓</span>}
                </div>
                <p className="text-[11px] font-medium truncate mt-0.5">{s.name}</p>
              </button>
            ))}
          </div>

          {/* Form Step Content */}
          <div className="flex-1 flex flex-col justify-start">
            {error && (
              <p className="text-red-400 text-xs mb-4">{error}</p>
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
                      <h2 className="text-sm font-semibold text-white">Step 1: When someone interacts with...</h2>
                      <p className="text-xs text-zinc-400">Select which Instagram touchpoint activates this automation rule.</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { id: "COMMENTS", title: "Comments", desc: "Post & Reel comments", icon: MessageSquare },
                        { id: "STORY_MENTIONS", title: "Story Mentions", desc: "Tagged in stories", icon: Camera },
                        { id: "DIRECT_MESSAGES", title: "Direct DMs", desc: "Inbound inbox messages", icon: Send },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSelected = triggerSource === item.id;
                        return (
                          <div
                            key={item.id}
                            onClick={() => setTriggerSource(item.id as any)}
                            className={`p-3.5 border rounded-xl cursor-pointer transition-colors flex flex-col justify-between h-[100px] ${
                              isSelected
                                ? "border-white bg-[#111111]"
                                : "border-[#222222] bg-[#0A0A0A] hover:border-zinc-700"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-zinc-500"}`} strokeWidth={1.75} />
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <div>
                              <p className="text-xs font-medium text-white">{item.title}</p>
                              <p className="text-[10px] text-zinc-400 mt-0.5 leading-tight">{item.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {triggerSource === "COMMENTS" && (
                      <div className="space-y-3 pt-3 border-t border-[#222222]">
                        <label className="text-xs font-medium text-zinc-300 block">Target publications</label>
                        
                        <div className="grid grid-cols-2 gap-2.5">
                          <div
                            onClick={() => setTriggerScope("ALL_POSTS")}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              triggerScope === "ALL_POSTS"
                                ? "border-white bg-[#111111]"
                                : "border-[#222222] bg-[#0A0A0A] hover:border-zinc-700"
                            }`}
                          >
                            <p className="text-xs font-medium text-white">All current & future posts</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">Applies across all profile publications</p>
                          </div>

                          <div
                            onClick={() => setTriggerScope("SPECIFIC_POSTS")}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              triggerScope === "SPECIFIC_POSTS"
                                ? "border-white bg-[#111111]"
                                : "border-[#222222] bg-[#0A0A0A] hover:border-zinc-700"
                            }`}
                          >
                            <p className="text-xs font-medium text-white">Specific posts or reels</p>
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
                              className="w-full h-10 px-3 bg-[#0A0A0A] border border-[#262626] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
                            />

                            {mediaLoading && (
                              <div className="flex items-center justify-center py-4 text-xs text-zinc-500 gap-2">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
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
                                      className={`relative aspect-square bg-[#111111] border rounded-lg overflow-hidden cursor-pointer transition-colors ${
                                        isSelected
                                          ? "border-white"
                                          : "border-[#222222] hover:border-zinc-700"
                                      }`}
                                    >
                                      {img && <img src={img} alt="Post" className="w-full h-full object-cover" />}
                                      {isSelected && (
                                        <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-white text-black flex items-center justify-center text-[8px] font-bold">✓</div>
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
                      <h2 className="text-sm font-semibold text-white">Step 2: Trigger keywords & condition</h2>
                      <p className="text-xs text-zinc-400">Specify what words followers must say to receive your response.</p>
                    </div>

                    {triggerSource === "STORY_MENTIONS" ? (
                      <div className="p-5 bg-[#0A0A0A] border border-[#222222] rounded-xl text-center space-y-2">
                        <Camera className="w-5 h-5 text-white mx-auto" strokeWidth={1.75} />
                        <p className="text-xs font-medium text-white">No keywords required for Story Mentions</p>
                        <p className="text-[11px] text-zinc-400 max-w-xs mx-auto leading-relaxed">
                          Whenever someone mentions you in their Instagram story, AutoDMs automatically sends your reply.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2.5">
                          <div
                            onClick={() => setTriggerType("KEYWORD")}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              triggerType === "KEYWORD"
                                ? "border-white bg-[#111111]"
                                : "border-[#222222] bg-[#0A0A0A] hover:border-zinc-700"
                            }`}
                          >
                            <p className="text-xs font-medium text-white">Specific keywords</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">Triggers on matched phrases</p>
                          </div>

                          <div
                            onClick={() => setTriggerType("ALL")}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              triggerType === "ALL"
                                ? "border-white bg-[#111111]"
                                : "border-[#222222] bg-[#0A0A0A] hover:border-zinc-700"
                            }`}
                          >
                            <p className="text-xs font-medium text-white">All messages / comments</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">Responds to every interaction</p>
                          </div>
                        </div>

                        {triggerType === "KEYWORD" && (
                          <div className="space-y-3 pt-2 border-t border-[#222222]">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-medium text-zinc-300">Keyword phrases (comma-separated)</label>
                              <div className="flex items-center gap-1.5 text-[10px]">
                                <button
                                  type="button"
                                  onClick={() => setMatchMode("CONTAINS")}
                                  className={`px-2 py-0.5 rounded ${matchMode === "CONTAINS" ? "bg-white/10 text-white font-medium" : "text-zinc-500"}`}
                                >
                                  Contains
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setMatchMode("EXACT")}
                                  className={`px-2 py-0.5 rounded ${matchMode === "EXACT" ? "bg-white/10 text-white font-medium" : "text-zinc-500"}`}
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
                              className="w-full h-10 px-3 bg-[#0A0A0A] border border-[#262626] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
                            />

                            {/* Tag Chips */}
                            <div className="flex flex-wrap gap-1.5">
                              {triggerKeyword.split(",").map((k) => k.trim()).filter((k) => k.length > 0).map((chip, idx) => (
                                <span key={idx} className="px-2 py-0.5 rounded bg-[#111111] border border-[#222222] text-zinc-300 font-mono text-[10px]">
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
                      <h2 className="text-sm font-semibold text-white">Step 3: Direct Message reply & interactive buttons</h2>
                      <p className="text-xs text-zinc-400">Craft the automated DM sent directly to the follower's inbox.</p>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <label className="font-medium text-zinc-300">Message copy</label>
                          <button
                            type="button"
                            onClick={() => setReplyDmMessage((p) => p + " {{username}}")}
                            className="text-[10px] font-medium text-zinc-400 hover:text-white"
                          >
                            + Insert @username
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          value={replyDmMessage}
                          onChange={(e) => setReplyDmMessage(e.target.value)}
                          placeholder="Hey {{username}}! Here is your download link..."
                          className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#262626] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors leading-relaxed resize-none"
                        />
                      </div>

                      {/* Interactive Button Attachment */}
                      <div className="p-3.5 bg-[#0A0A0A] border border-[#222222] rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-white">Interactive Web URL Buttons</p>
                            <p className="text-[10px] text-zinc-400">Adds clickable action buttons below the DM card</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEnableButtons(!enableButtons)}
                            className={`w-9 h-5 rounded-full transition-colors relative ${enableButtons ? "bg-white" : "bg-zinc-700"}`}
                          >
                            <span className={`w-3.5 h-3.5 rounded-full bg-black absolute top-0.5 transition-transform ${enableButtons ? "right-1" : "left-1"}`} />
                          </button>
                        </div>

                        {enableButtons && (
                          <div className="space-y-3 pt-2 border-t border-[#222222]">
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
                                  placeholder="e.g. Shop Now"
                                  className="w-full h-9 px-3 bg-[#111111] border border-[#262626] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] text-zinc-400 font-medium block">Destination URL</span>
                                <input
                                  type="text"
                                  value={buttonUrl}
                                  onChange={(e) => setButtonUrl(e.target.value)}
                                  placeholder="https://example.com"
                                  className="w-full h-9 px-3 bg-[#111111] border border-[#262626] rounded-lg text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-zinc-400 transition-colors"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5 pt-1">
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
                                  <span>Secondary button (optional)</span>
                                  <span>{secondaryButtonTitle.length}/20</span>
                                </div>
                                <input
                                  type="text"
                                  maxLength={20}
                                  value={secondaryButtonTitle}
                                  onChange={(e) => setSecondaryButtonTitle(e.target.value)}
                                  placeholder="e.g. WhatsApp"
                                  className="w-full h-9 px-3 bg-[#111111] border border-[#262626] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] text-zinc-400 font-medium block">Secondary URL</span>
                                <input
                                  type="text"
                                  value={secondaryButtonUrl}
                                  onChange={(e) => setSecondaryButtonUrl(e.target.value)}
                                  placeholder="https://wa.me/..."
                                  className="w-full h-9 px-3 bg-[#111111] border border-[#262626] rounded-lg text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-zinc-400 transition-colors"
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
                      <h2 className="text-sm font-semibold text-white">Step 4: Public reply & lead capture</h2>
                      <p className="text-xs text-zinc-400">Configure comment replies and optional email capture.</p>
                    </div>

                    <div className="space-y-3">
                      {/* Lead Capture Toggle */}
                      <div className="p-3.5 bg-[#0A0A0A] border border-[#222222] rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-white">Collect Email or Phone Leads First?</p>
                            <p className="text-[10px] text-zinc-400">Captures contacts before delivering resource link</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEnableLeadCapture(!enableLeadCapture)}
                            className={`w-9 h-5 rounded-full transition-colors relative ${enableLeadCapture ? "bg-white" : "bg-zinc-700"}`}
                          >
                            <span className={`w-3.5 h-3.5 rounded-full bg-black absolute top-0.5 transition-transform ${enableLeadCapture ? "right-1" : "left-1"}`} />
                          </button>
                        </div>

                        {enableLeadCapture && (
                          <div className="space-y-1.5 pt-2 border-t border-[#222222]">
                            <label className="text-[10px] font-medium text-zinc-300 block">Step 2 Confirmation DM (After Contact Provided)</label>
                            <textarea
                              rows={2}
                              value={leadConfirmationDm}
                              onChange={(e) => setLeadConfirmationDm(e.target.value)}
                              className="w-full px-3 py-1.5 bg-[#111111] border border-[#262626] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
                            />
                          </div>
                        )}
                      </div>

                      {/* Public Comments Reply */}
                      {triggerSource === "COMMENTS" && (
                        <div className="p-3.5 bg-[#0A0A0A] border border-[#222222] rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-medium text-white">Post Public Comment Reply</p>
                              <p className="text-[10px] text-zinc-400">Boosts post ranking with randomized responses</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setLeavePublicReply(!leavePublicReply)}
                              className={`w-9 h-5 rounded-full transition-colors relative ${leavePublicReply ? "bg-white" : "bg-zinc-700"}`}
                            >
                              <span className={`w-3.5 h-3.5 rounded-full bg-black absolute top-0.5 transition-transform ${leavePublicReply ? "right-1" : "left-1"}`} />
                            </button>
                          </div>

                          {leavePublicReply && (
                            <div className="space-y-2 pt-2 border-t border-[#222222]">
                              <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
                                {replyCommentOptions.map((opt, idx) => (
                                  <div key={idx} className="flex items-center justify-between gap-2 p-1.5 px-2 bg-[#111111] border border-[#222222] rounded-lg text-[11px] text-zinc-300">
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
                                  className="flex-1 h-9 px-3 bg-[#111111] border border-[#262626] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
                                />
                                <button
                                  type="button"
                                  onClick={addCommentOption}
                                  className="px-3 h-9 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-white font-medium rounded-lg text-xs transition-colors"
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
          <div className="flex items-center justify-between pt-5 mt-5 border-t border-[#222222] shrink-0">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="h-9 px-3.5 border border-[#222222] hover:bg-[#111111] text-zinc-300 font-medium rounded-lg text-xs flex items-center gap-1 transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back
            </button>

            {step < 4 ? (
              <button
                onClick={handleNext}
                className="h-9 px-4 bg-white hover:bg-zinc-200 text-black font-medium rounded-lg text-xs flex items-center gap-1 transition-colors shadow-sm"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleGoLive}
                disabled={loading}
                className="h-9 px-4 bg-white hover:bg-zinc-200 text-black font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-black" /> : "Go live"}
              </button>
            )}
          </div>

        </div>

        {/* RIGHT PANEL: Authentic 1:1 Instagram iOS Dark Mode Preview */}
        <div className="flex-1 lg:w-1/2 bg-[#050505] p-6 flex flex-col items-center justify-center border-l border-[#222222] overflow-y-auto">
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

    </div>
  );
}
