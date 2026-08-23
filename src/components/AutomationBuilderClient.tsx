"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowLeft, Plus, Settings, Sparkles, Send, Mail, Percent, BookOpen, ChevronRight, ChevronLeft, Check, Camera, MessageSquare, Laptop, Video, Info, Heart, Trash2, Globe, ToggleLeft, ToggleRight } from "lucide-react";
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
  const [triggerKeyword, setTriggerKeyword] = useState("LINK, GUIDE, INFO");
  
  const [replyDmMessage, setReplyDmMessage] = useState("Hey {{username}}! Here is your download link: https://example.com/guide 🚀 Let me know if you have any questions!");
  const [enableLeadCapture, setEnableLeadCapture] = useState(false);
  const [leadConfirmationDm, setLeadConfirmationDm] = useState("Thanks {{username}}! I've sent the PDF to your email. You can also download it directly here: https://example.com/free-training.pdf 🎁");

  // Rich Interactive Buttons States
  const [enableButtons, setEnableButtons] = useState(false);
  const [buttonTitle, setButtonTitle] = useState("");
  const [buttonUrl, setButtonUrl] = useState("");
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
    const t = setTimeout(() => setIsSavedDot(true), 600);
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
    formData.append("triggerType", triggerSource === "STORY_MENTIONS" ? "ALL" : triggerType);
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

  // Find selected media thumbnail
  const selectedMediaItem = mediaItems.find((item) => targetMediaIds.includes(item.id));
  const activePostImage = selectedMediaItem?.thumbnail_url || selectedMediaItem?.media_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60";

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden">
      
      {/* Sleek Top Navigation Bar */}
      <header className="h-16 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/automations"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Automations
          </Link>
          <span className="w-px h-4 bg-slate-800" />
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-violet-500 font-bold text-sm text-white focus:outline-none px-1 py-0.5 max-w-[240px] truncate"
              title="Click to edit rule name"
            />
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className={`w-1.5 h-1.5 rounded-full ${isSavedDot ? "bg-emerald-500 animate-pulse" : "bg-slate-600"}`} />
              <span>{isSavedDot ? "Saved to draft" : "Saving..."}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleGoLive}
          disabled={loading}
          className="px-5 py-1.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-xs transition-all active:scale-95 shadow-lg shadow-violet-600/10 disabled:opacity-50 flex items-center gap-1.5"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              Go Live
            </>
          )}
        </button>
      </header>

      {/* Main Builder Area: 50/50 split layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* LEFT COLUMN: 4-Step Interactive Wizard */}
        <div className="flex-1 lg:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto border-r border-slate-900 bg-slate-950/20">
          
          {/* Progress Indicators */}
          <div className="flex items-center gap-2 mb-8 shrink-0">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex-1 flex items-center gap-2">
                <div
                  className={`h-1.5 rounded-full flex-1 transition-all ${
                    s <= step ? "bg-violet-600" : "bg-slate-800"
                  }`}
                />
                <span className="text-[10px] text-slate-500 font-mono">0{s}</span>
              </div>
            ))}
          </div>

          {/* Form Step Body with Animating Slide */}
          <div className="flex-1 flex flex-col justify-start">
            {error && (
              <div className="mb-4 p-3 text-xs text-red-400 bg-red-950/20 border border-red-500/20 rounded-lg">
                {error}
              </div>
            )}

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -direction * 40 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
                className="space-y-6"
              >
                
                {/* STEP 1: WHEN SOMEONE COMMENTS ON... */}
                {step === 1 && (
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-violet-400 tracking-wider">Step 1 of 4</span>
                      <h2 className="text-xl font-extrabold text-white">When someone triggers this rule on...</h2>
                    </div>

                    <div className="space-y-3">
                      {/* Option 1: Specific Post */}
                      <div
                        onClick={() => {
                          setTriggerSource("COMMENTS");
                          setTriggerScope("SPECIFIC_POSTS");
                        }}
                        className={`p-4 border rounded-xl cursor-pointer transition-all flex items-start gap-4 ${
                          triggerSource === "COMMENTS" && triggerScope === "SPECIFIC_POSTS"
                            ? "border-violet-600 bg-violet-600/5 ring-1 ring-violet-500/25"
                            : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 mt-0.5">
                          <Plus className="w-4 h-4 text-violet-400" />
                        </div>
                        <div className="text-left space-y-1">
                          <p className="text-xs font-bold text-white">A specific post or reel</p>
                          <p className="text-[10px] text-slate-555 leading-relaxed">
                            Triggers only when comments are left on selected publications.
                          </p>
                        </div>
                      </div>

                      {/* Option 2: Any Post */}
                      <div
                        onClick={() => {
                          setTriggerSource("COMMENTS");
                          setTriggerScope("ALL_POSTS");
                        }}
                        className={`p-4 border rounded-xl cursor-pointer transition-all flex items-start gap-4 ${
                          triggerSource === "COMMENTS" && triggerScope === "ALL_POSTS"
                            ? "border-violet-600 bg-violet-600/5 ring-1 ring-violet-500/25"
                            : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 mt-0.5">
                          <Globe className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="text-left space-y-1">
                          <p className="text-xs font-bold text-white">Any current or future post</p>
                          <p className="text-[10px] text-slate-555 leading-relaxed">
                            Triggers on all posts & reels instantly, saving you time.
                          </p>
                        </div>
                      </div>

                      {/* Option 3: Story Mentions or DMs */}
                      <div
                        onClick={() => {
                          setTriggerSource("STORY_MENTIONS");
                        }}
                        className={`p-4 border rounded-xl cursor-pointer transition-all flex items-start gap-4 ${
                          triggerSource !== "COMMENTS"
                            ? "border-violet-600 bg-violet-600/5 ring-1 ring-violet-500/25"
                            : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 mt-0.5">
                          <MessageSquare className="w-4 h-4 text-pink-400" />
                        </div>
                        <div className="text-left space-y-1 flex-1">
                          <p className="text-xs font-bold text-white">Story Mentions or Inbound DMs</p>
                          <p className="text-[10px] text-slate-550 leading-relaxed mb-3">
                            Capture leads from tags in stories or keywords typed directly in DMs.
                          </p>
                          
                          {triggerSource !== "COMMENTS" && (
                            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/80">
                              <label
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTriggerSource("STORY_MENTIONS");
                                }}
                                className={`p-2 border rounded-lg text-center cursor-pointer transition-colors text-[10px] font-semibold ${
                                  triggerSource === "STORY_MENTIONS"
                                    ? "border-pink-500/50 bg-pink-500/10 text-pink-400"
                                    : "border-slate-800 bg-slate-955 text-slate-500"
                                }`}
                              >
                                Story Mentions
                              </label>
                              <label
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTriggerSource("DIRECT_MESSAGES");
                                }}
                                className={`p-2 border rounded-lg text-center cursor-pointer transition-colors text-[10px] font-semibold ${
                                  triggerSource === "DIRECT_MESSAGES"
                                    ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-400"
                                    : "border-slate-800 bg-slate-955 text-slate-500"
                                }`}
                              >
                                Inbound DMs
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Specific Post media list container if selected */}
                    {triggerSource === "COMMENTS" && triggerScope === "SPECIFIC_POSTS" && (
                      <div className="space-y-3 pt-3 border-t border-slate-900">
                        <label className="text-[11px] font-semibold text-slate-400 block">
                          Select Target Post/Reel or paste URL below
                        </label>
                        
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Paste Instagram Post Link (Optional)..."
                            value={postUrlInput}
                            onChange={(e) => setPostUrlInput(e.target.value)}
                            className="flex-1 px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 text-white"
                          />
                        </div>

                        {mediaLoading && (
                          <div className="flex items-center justify-center py-6 text-xs text-slate-500 gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                            Loading feed media...
                          </div>
                        )}

                        {mediaError && (
                          <div className="text-xs text-red-400 p-2 bg-red-950/20 border border-red-500/20 rounded-lg">
                            {mediaError}
                          </div>
                        )}

                        {!mediaLoading && !mediaError && mediaItems.length > 0 && (
                          <div className="grid grid-cols-3 gap-2 max-h-[180px] overflow-y-auto pr-1">
                            {mediaItems.map((item) => {
                              const isSelected = targetMediaIds.includes(item.id);
                              const img = item.thumbnail_url || item.media_url;
                              return (
                                <div
                                  key={item.id}
                                  onClick={() => handleToggleMediaSelect(item.id)}
                                  className={`relative aspect-square bg-slate-900 border rounded-lg overflow-hidden cursor-pointer transition-all ${
                                    isSelected
                                      ? "border-violet-500 ring-2 ring-violet-500/10"
                                      : "border-slate-800 hover:border-slate-700"
                                  }`}
                                >
                                  {img ? (
                                    <img src={img} alt="Instagram Media" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[8px] bg-slate-955 text-slate-600">Media</div>
                                  )}
                                  {isSelected && (
                                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-violet-600 border border-white flex items-center justify-center text-[9px] text-white font-bold">✓</div>
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

                {/* STEP 2: USER COMMENTS WITH... */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-violet-400 tracking-wider">Step 2 of 4</span>
                      <h2 className="text-xl font-extrabold text-white">
                        {triggerSource === "DIRECT_MESSAGES" ? "When someone DMs..." : "When someone comments with..."}
                      </h2>
                    </div>

                    {triggerSource === "STORY_MENTIONS" ? (
                      <div className="p-6 bg-slate-900/50 border border-slate-850 rounded-2xl text-center space-y-3">
                        <Sparkles className="w-10 h-10 text-pink-400 mx-auto" />
                        <p className="text-xs font-semibold text-white">No keywords needed for Story Mentions</p>
                        <p className="text-[10px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                          Every story tag is rewarded automatically. You can bypass keywords and proceed straight to drafting your private response!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          {/* Specific Keywords */}
                          <div
                            onClick={() => setTriggerType("KEYWORD")}
                            className={`p-4 border rounded-xl cursor-pointer transition-all flex flex-col justify-between h-[100px] text-left ${
                              triggerType === "KEYWORD"
                                ? "border-violet-600 bg-violet-600/5 ring-1 ring-violet-500/25"
                                : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
                            }`}
                          >
                            <p className="text-xs font-bold text-white">Specific Keywords</p>
                            <p className="text-[10px] text-slate-550 leading-tight">
                              Triggers only when comments match certain words.
                            </p>
                          </div>

                          {/* Any Keyword */}
                          <div
                            onClick={() => setTriggerType("ALL")}
                            className={`p-4 border rounded-xl cursor-pointer transition-all flex flex-col justify-between h-[100px] text-left ${
                              triggerType === "ALL"
                                ? "border-violet-600 bg-violet-600/5 ring-1 ring-violet-500/25"
                                : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
                            }`}
                          >
                            <p className="text-xs font-bold text-white">Any Comment</p>
                            <p className="text-[10px] text-slate-555 leading-tight">
                              Responds to every incoming message or comment universally.
                            </p>
                          </div>
                        </div>

                        {triggerType === "KEYWORD" && (
                          <div className="space-y-2 pt-3 border-t border-slate-900">
                            <label className="text-[10px] font-semibold text-slate-400 block uppercase">
                              Target Trigger Keywords (comma-separated)
                            </label>
                            <input
                              type="text"
                              value={triggerKeyword}
                              onChange={(e) => setTriggerKeyword(e.target.value)}
                              placeholder="e.g. LINK, PRICE, GEMINI"
                              className="w-full px-3.5 py-2.5 bg-slate-955 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm text-white"
                            />
                            
                            {/* Visual Chips */}
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {triggerKeyword.split(",").map((k) => k.trim()).filter((k) => k.length > 0).map((chip, idx) => (
                                <span key={idx} className="px-2.5 py-0.5 rounded bg-slate-905 border border-slate-800 text-violet-400 font-mono text-[9px] font-bold">
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

                {/* STEP 3: SEND PRIVATE REPLY IN DM... */}
                {step === 3 && (
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-violet-400 tracking-wider">Step 3 of 4</span>
                      <h2 className="text-xl font-extrabold text-white">Send private reply in DM...</h2>
                    </div>

                    <div className="space-y-4">
                      {/* DM text block */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            {enableLeadCapture ? "Step 1 DM: Request Email/Phone" : "Direct Message Reply Copy"}
                          </label>
                          <button
                            type="button"
                            onClick={() => setReplyDmMessage((p) => p + " {{username}}")}
                            className="text-[9px] font-bold text-violet-400 hover:text-violet-300 transition-colors"
                          >
                            + Insert username pill
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          value={replyDmMessage}
                          onChange={(e) => setReplyDmMessage(e.target.value)}
                          placeholder="Type your message copy..."
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm text-white leading-relaxed"
                        />
                      </div>

                      {/* Lead capture toggle */}
                      <div className="flex items-center justify-between p-4 bg-slate-900/40 border border-slate-850 rounded-xl">
                        <div className="text-left space-y-0.5">
                          <p className="text-xs font-bold text-white">Collect Email/Phone Leads First?</p>
                          <p className="text-[9px] text-slate-500">Wait for contact details before sharing links.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEnableLeadCapture(!enableLeadCapture)}
                          className="text-slate-400 hover:text-white transition-colors"
                        >
                          {enableLeadCapture ? (
                            <ToggleRight className="w-8 h-8 text-violet-500" />
                          ) : (
                            <ToggleLeft className="w-8 h-8 text-slate-600" />
                          )}
                        </button>
                      </div>

                      {/* Lead Capture Confirmation message */}
                      {enableLeadCapture && (
                        <div className="space-y-2 pt-3 border-t border-slate-900">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                              Step 2 DM: Confirmation & Link Delivery
                            </label>
                            <button
                              type="button"
                              onClick={() => setLeadConfirmationDm((p) => p + " {{username}}")}
                              className="text-[9px] font-bold text-violet-400 hover:text-violet-300 transition-colors"
                            >
                              + Insert username pill
                            </button>
                          </div>
                          <textarea
                            rows={3}
                            value={leadConfirmationDm}
                            onChange={(e) => setLeadConfirmationDm(e.target.value)}
                            placeholder="Type reward delivery copy..."
                            className="w-full px-3.5 py-2.5 bg-slate-955 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm text-white leading-relaxed"
                          />
                        </div>
                      )}

                      {/* Interactive Buttons Toggle */}
                      <div className="flex items-center justify-between p-4 bg-slate-900/40 border border-slate-850 rounded-xl">
                        <div className="text-left space-y-0.5">
                          <p className="text-xs font-bold text-white">Attach Web URL Buttons to DM?</p>
                          <p className="text-[9px] text-slate-500">Adds interactive template buttons underneath messages.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEnableButtons(!enableButtons)}
                          className="text-slate-400 hover:text-white transition-colors"
                        >
                          {enableButtons ? (
                            <ToggleRight className="w-8 h-8 text-violet-500" />
                          ) : (
                            <ToggleLeft className="w-8 h-8 text-slate-600" />
                          )}
                        </button>
                      </div>

                      {/* Interactive Buttons Input Fields */}
                      {enableButtons && (
                        <div className="space-y-3 pt-3 border-t border-slate-900">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-slate-400 uppercase">Primary Button Title</label>
                              <input
                                type="text"
                                value={buttonTitle}
                                onChange={(e) => setButtonTitle(e.target.value)}
                                placeholder="e.g. 👉 Get Access"
                                className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 text-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-slate-400 uppercase">Primary Button URL</label>
                              <input
                                type="text"
                                value={buttonUrl}
                                onChange={(e) => setButtonUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 text-white"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-1">
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-slate-400 uppercase">Secondary Button Title</label>
                              <input
                                type="text"
                                value={secondaryButtonTitle}
                                onChange={(e) => setSecondaryButtonTitle(e.target.value)}
                                placeholder="e.g. 📲 Chat on WA"
                                className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 text-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-slate-400 uppercase">Secondary Button URL</label>
                              <input
                                type="text"
                                value={secondaryButtonUrl}
                                onChange={(e) => setSecondaryButtonUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 text-white"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 4: AUTO-REPLY TO COMMENTS PUBLICLY */}
                {step === 4 && (
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-violet-400 tracking-wider">Step 4 of 4</span>
                      <h2 className="text-xl font-extrabold text-white">Auto-reply to comments publicly...</h2>
                    </div>

                    {triggerSource !== "COMMENTS" ? (
                      <div className="p-6 bg-slate-900/50 border border-slate-850 rounded-2xl text-center space-y-3">
                        <Sparkles className="w-10 h-10 text-indigo-400 mx-auto" />
                        <p className="text-xs font-semibold text-white">Public Comment Replies Not Applicable</p>
                        <p className="text-[10px] text-slate-550 max-w-xs mx-auto leading-relaxed">
                          Because this rule runs on Story Mentions / DMs rather than post comments, public replies are skipped. Review the simulator mockup and hit Go Live!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Toggle public reply */}
                        <div className="flex items-center justify-between p-4 bg-slate-900/40 border border-slate-850 rounded-xl">
                          <div className="text-left space-y-0.5">
                            <p className="text-xs font-bold text-white">Write a public comment reply?</p>
                            <p className="text-[9px] text-slate-550">Replies publicly to comment, signaling checkout details.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setLeavePublicReply(!leavePublicReply)}
                            className="text-slate-400 hover:text-white transition-colors"
                          >
                            {leavePublicReply ? (
                              <ToggleRight className="w-8 h-8 text-violet-500" />
                            ) : (
                              <ToggleLeft className="w-8 h-8 text-slate-600" />
                            )}
                          </button>
                        </div>

                        {leavePublicReply && (
                          <div className="space-y-3 pt-3 border-t border-slate-900">
                            <label className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
                              Randomized Comment Variations ({replyCommentOptions.length})
                            </label>

                            <div className="space-y-2">
                              {replyCommentOptions.map((opt, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                  <div className="flex-1 p-2.5 bg-slate-950 border border-slate-850 text-slate-300 text-xs rounded-xl truncate">
                                    "{opt}"
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeCommentOption(idx)}
                                    className="p-2.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-900 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>

                            <div className="flex gap-2 pt-2">
                              <input
                                type="text"
                                placeholder="Add another reply variation..."
                                value={newCommentOption}
                                onChange={(e) => setNewCommentOption(e.target.value)}
                                className="flex-1 px-3 py-2 bg-slate-955 border border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 text-white"
                              />
                              <button
                                type="button"
                                onClick={addCommentOption}
                                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom navigation buttons */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-900 shrink-0">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="px-4 py-2 border border-slate-800 hover:bg-slate-900 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            {step < 4 ? (
              <button
                onClick={handleNext}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleGoLive}
                disabled={loading}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-violet-600/10 active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    🚀 Go Live
                  </>
                )}
              </button>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Interactive iPhone Mockup */}
        <div className="flex-1 lg:w-1/2 bg-slate-950 p-6 flex flex-col items-center justify-center border-l border-slate-900 overflow-y-auto">
          
          {/* iOS iPhone Shell */}
          <div className="w-[285px] h-[550px] bg-black border-[6px] border-slate-800 rounded-[36px] overflow-hidden shadow-2xl flex flex-col relative text-white text-[11px] tracking-normal">
            
            {/* Speaker bar */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-3 rounded-full bg-slate-850 z-20 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-black/60 absolute left-2" />
            </div>

            {/* Simulated iPhone Header */}
            <div className="h-4 bg-zinc-950 shrink-0" />

            {/* Tab switch panel inside device */}
            <div className="grid grid-cols-3 bg-zinc-950 border-b border-slate-900 text-center text-[9px] uppercase font-bold shrink-0">
              <button
                onClick={() => setActiveTab("POST")}
                className={`py-2 ${activeTab === "POST" ? "text-violet-400 border-b border-violet-500" : "text-slate-500"}`}
              >
                Post
              </button>
              <button
                onClick={() => setActiveTab("COMMENTS")}
                className={`py-2 ${activeTab === "COMMENTS" ? "text-violet-400 border-b border-violet-500" : "text-slate-500"}`}
              >
                Comments
              </button>
              <button
                onClick={() => setActiveTab("DM")}
                className={`py-2 ${activeTab === "DM" ? "text-violet-400 border-b border-violet-500" : "text-slate-500"}`}
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
                  <div className="px-3 py-2 flex items-center gap-2 border-b border-slate-950 bg-zinc-950 shrink-0">
                    <div className="w-5 h-5 rounded-full bg-slate-850 flex items-center justify-center font-bold text-[8px] text-violet-400 border border-slate-800">
                      IG
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-bold text-[9px] leading-tight">{connectedAccounts[0]?.pageName || "your_profile"}</p>
                    </div>
                    <span className="text-[12px] text-slate-500">•••</span>
                  </div>

                  {/* Post Image Container */}
                  <div className="relative aspect-square w-full bg-slate-900 flex items-center justify-center overflow-hidden shrink-0 border-b border-slate-950">
                    <img
                      src={activePostImage}
                      alt="Post mockup"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Action row */}
                  <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-white mb-2">
                        <div className="flex items-center gap-3">
                          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                          <MessageSquare className="w-3.5 h-3.5" />
                          <Send className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <p className="font-bold text-[9px] text-slate-200">Liked by yassinecodez and 1,248 others</p>
                      
                      {/* Caption text */}
                      <p className="text-slate-300 mt-1 leading-relaxed text-[10px]">
                        <span className="font-bold text-white mr-1.5">{connectedAccounts[0]?.pageName || "your_profile"}</span>
                        Comment <span className="text-violet-400 font-bold">"{triggerKeyword ? triggerKeyword.split(",")[0] : "LINK"}"</span> to get the access link sent straight to your DMs! 🚀
                      </p>
                    </div>

                    <div className="text-[8px] text-slate-500 font-mono">
                      2 hours ago
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: COMMENTS VIEW */}
              {activeTab === "COMMENTS" && (
                <div className="flex-1 flex flex-col justify-between p-3.5 bg-zinc-955">
                  <div className="space-y-3">
                    <div className="pb-2 border-b border-slate-900 flex justify-between items-center text-[10px]">
                      <span className="font-bold text-white">Comments Sheet</span>
                      <span className="text-slate-500">Most relevant</span>
                    </div>

                    {/* Customer Comment */}
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[8px] text-slate-400 border border-slate-700">C</div>
                      <div className="text-left space-y-0.5 max-w-[200px]">
                        <p className="font-bold text-[9px] text-slate-200">customer_ig <span className="font-normal text-slate-500 text-[8px] ml-1">45m</span></p>
                        <p className="text-slate-350 text-[10px]">
                          {triggerType === "ALL" ? "This is awesome!" : triggerKeyword ? triggerKeyword.split(",")[0] : "LINK"} please!
                        </p>
                      </div>
                    </div>

                    {/* Business reply comment variation */}
                    {leavePublicReply && (
                      <div className="flex items-start gap-2.5 pl-6">
                        <div className="w-5 h-5 rounded-full bg-slate-850 flex items-center justify-center font-bold text-[8px] text-violet-400 border border-slate-800">IG</div>
                        <div className="text-left space-y-0.5 max-w-[170px]">
                          <p className="font-bold text-[9px] text-slate-200">
                            {connectedAccounts[0]?.pageName || "your_profile"}
                            <span className="font-normal text-slate-500 text-[8px] ml-1">45m</span>
                          </p>
                          <p className="text-violet-300 text-[10px] italic bg-violet-650/10 p-2 rounded-lg border border-violet-500/10">
                            "{replyCommentOptions[0] || "Just sent you a DM! Check your inbox 📩"}"
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-2 border-t border-slate-900 text-[8px] text-slate-600 italic text-center">
                    Simulated Instagram comments drawer
                  </div>
                </div>
              )}

              {/* TAB 3: DM VIEW */}
              {activeTab === "DM" && (
                <div className="flex-1 flex flex-col h-full bg-black justify-between">
                  {/* Header Mock */}
                  <div className="px-3 py-2 border-b border-slate-900 bg-zinc-950 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <ArrowLeft className="w-3.5 h-3.5 text-white" />
                      <div className="w-5 h-5 rounded-full bg-slate-850 flex items-center justify-center border border-slate-850 font-bold text-[8px] text-violet-400">IG</div>
                      <div className="text-left">
                        <p className="font-bold text-[9px] leading-tight">{connectedAccounts[0]?.pageName || "your_profile"}</p>
                        <p className="text-[7px] text-slate-500 leading-none">Active now</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <Video className="w-3.5 h-3.5" />
                      <Info className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Chat Bubbles */}
                  <div className="flex-1 p-3.5 space-y-3 overflow-y-auto flex flex-col justify-end bg-black">
                    
                    {/* User trigger message bubble */}
                    <div className="self-end max-w-[80%] bg-zinc-800 text-white rounded-2xl px-3 py-2 text-[10px] shadow-sm">
                      {triggerSource === "COMMENTS" ? `Commented: "${triggerKeyword ? triggerKeyword.split(",")[0] : "LINK"}"` : triggerKeyword ? triggerKeyword.split(",")[0] : "LINK"}
                    </div>

                    {/* Business reply message bubble (with buttons attached if enabled) */}
                    <div className="self-start max-w-[80%] space-y-1">
                      <div className="bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 text-white rounded-2xl px-3 py-2.5 text-[10px] break-words whitespace-pre-wrap leading-normal shadow-sm">
                        {replyDmMessage
                          ? replyDmMessage.replace("{{username}}", "customer_ig")
                          : "DM reply content will populate here..."}
                      </div>
                      
                      {enableButtons && (buttonTitle || secondaryButtonTitle) && (
                        <div className="flex flex-col gap-1 w-full bg-zinc-900 border border-slate-850 rounded-xl p-1 shrink-0">
                          {buttonTitle && (
                            <div className="py-1 px-2.5 bg-zinc-850 hover:bg-zinc-800 rounded-lg text-center text-[8px] font-bold text-violet-400 border border-slate-800 truncate select-none">
                              {buttonTitle}
                            </div>
                          )}
                          {secondaryButtonTitle && (
                            <div className="py-1 px-2.5 bg-zinc-850 hover:bg-zinc-800 rounded-lg text-center text-[8px] font-bold text-violet-400 border border-slate-800 truncate select-none">
                              {secondaryButtonTitle}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Email collection sequence simulation */}
                    {enableLeadCapture && (
                      <>
                        <div className="self-end max-w-[80%] bg-zinc-800 text-white rounded-2xl px-3 py-2 text-[10px]">
                          hello@example.com
                        </div>
                        <div className="self-start max-w-[80%] bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 text-white rounded-2xl px-3 py-2.5 text-[10px] break-words whitespace-pre-wrap leading-normal shadow-sm">
                          {leadConfirmationDm
                            ? leadConfirmationDm.replace("{{username}}", "customer_ig")
                            : "Reward confirmation DM will populate here..."}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Mock DM Footer Input */}
                  <div className="p-2 border-t border-slate-950 bg-zinc-950 flex items-center justify-between gap-1.5 shrink-0">
                    <div className="flex-1 bg-zinc-900 border border-slate-850 rounded-full px-2.5 py-1.5 text-left text-slate-500 text-[8px] flex items-center justify-between">
                      <span>Message...</span>
                      <Send className="w-2.5 h-2.5 text-slate-400" />
                    </div>
                    <Heart className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </div>
                </div>
              )}

            </div>

            {/* Home indicator bar inside mockup */}
            <div className="h-5 bg-zinc-950 flex items-center justify-center shrink-0">
              <span className="w-20 h-1 rounded-full bg-slate-800" />
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
