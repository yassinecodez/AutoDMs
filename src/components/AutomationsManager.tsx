"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Settings, Trash2, ToggleLeft, ToggleRight, AlertTriangle, Sparkles, Send, Mail, Percent, BookOpen, ArrowLeft, Video, Info, Heart, Camera } from "lucide-react";
import { createAutomation, toggleAutomationActive, deleteAutomation } from "@/app/dashboard/automations/actions";
import Link from "next/link";

interface IgAccount {
  id: string;
  instagramAccountId: string;
  pageName: string;
}

interface Automation {
  id: string;
  name: string;
  triggerType: string;
  triggerKeyword: string | null;
  replyDmMessage: string;
  replyCommentOptions: string[];
  triggerScope: string;
  targetMediaIds: string[];
  triggerSource: string;
  enableLeadCapture: boolean;
  leadConfirmationDm: string | null;
  active: boolean;
  createdAt: Date;
}

interface AutomationsManagerProps {
  initialAutomations: Automation[];
  connectedAccounts: IgAccount[];
}

export function AutomationsManager({ initialAutomations, connectedAccounts }: AutomationsManagerProps) {
  const [automations, setAutomations] = useState<Automation[]>(initialAutomations);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  
  // Form state bindings (for live preview)
  const [ruleName, setRuleName] = useState("");
  const [triggerSource, setTriggerSource] = useState("COMMENTS");
  const [triggerType, setTriggerType] = useState("KEYWORD");
  const [triggerKeyword, setTriggerKeyword] = useState("");
  const [enableLeadCapture, setEnableLeadCapture] = useState(false);
  const [replyDmMessage, setReplyDmMessage] = useState("");
  const [leadConfirmationDm, setLeadConfirmationDm] = useState("");
  const [replyCommentOptions, setReplyCommentOptions] = useState(
    "Just sent you a DM! Check your inbox 📩\nSent! Let me know if you got it 🚀\nCheck your messages! Just sent over the details ✨\nSent to your DMs! Let me know what you think 🔥\nJust sent it your way! Check message requests if you don't see it 💬"
  );
  
  const [targetMediaIds, setTargetMediaIds] = useState<string[]>([]);
  const [triggerScope, setTriggerScope] = useState("ALL_POSTS");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  // Media items states
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState("");

  // Load Instagram posts when modal is open, source is COMMENTS and scope is SPECIFIC_POSTS
  useEffect(() => {
    if (isModalOpen && triggerSource === "COMMENTS" && triggerScope === "SPECIFIC_POSTS" && mediaItems.length === 0) {
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
          setMediaError(err.message || "Failed to load posts from Instagram profile.");
        } finally {
          setMediaLoading(false);
        }
      };

      fetchMedia();
    }
  }, [isModalOpen, triggerSource, triggerScope, mediaItems.length]);

  const handleToggleMediaSelect = (mediaId: string) => {
    setTargetMediaIds((prev) =>
      prev.includes(mediaId) ? prev.filter((id) => id !== mediaId) : [...prev, mediaId]
    );
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setToggleLoading(id);
    try {
      await toggleAutomationActive(id, !currentStatus);
      setAutomations((prev) =>
        prev.map((auto) => (auto.id === id ? { ...auto, active: !currentStatus } : auto))
      );
    } catch (err) {
      console.error("Failed to toggle automation status:", err);
    } finally {
      setToggleLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this automation rule?")) return;
    setDeleteLoading(id);
    try {
      await deleteAutomation(id);
      setAutomations((prev) => prev.filter((auto) => auto.id !== id));
    } catch (err) {
      console.error("Failed to delete automation:", err);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    try {
      await createAutomation(formData);
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Failed to create automation.");
      setLoading(false);
    }
  };

  // Predefined templates selector details
  const templates = [
    {
      id: "resource",
      title: "Send Link / Resource",
      description: "Auto-deliver lead magnets, link trees, or PDFs.",
      icon: BookOpen,
      color: "border-blue-500/30 text-blue-400 bg-blue-500/5",
      keywords: "LINK, GUIDE, INFO",
      triggerSource: "COMMENTS",
      triggerType: "KEYWORD",
      enableLeadCapture: false,
      replyDm: "Hey {{username}}! Here is your download link: https://example.com/guide 🚀 Let me know if you have any questions!",
      leadConfirm: "",
      name: "Send Resource: Guide & Link"
    },
    {
      id: "discount",
      title: "Discount & Promo",
      description: "Auto-share discount codes & boost checkout rates.",
      icon: Percent,
      color: "border-pink-500/30 text-pink-400 bg-pink-500/5",
      keywords: "CODE, DISCOUNT, PROMO",
      triggerSource: "COMMENTS",
      triggerType: "KEYWORD",
      enableLeadCapture: false,
      replyDm: "Thanks for your comment, {{username}}! Use code AUTODMS20 at checkout for 20% off your next order. Shop here: https://example.com/shop 🛍️",
      leadConfirm: "",
      name: "Discount Code: 20% Off"
    },
    {
      id: "email",
      title: "Capture Email First",
      description: "2-Step Lead capture asking for email before delivery.",
      icon: Mail,
      color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/5",
      keywords: "ACCESS, PDF, FREE",
      triggerSource: "COMMENTS",
      triggerType: "KEYWORD",
      enableLeadCapture: true,
      replyDm: "Hey {{username}}! To get instant access to the free training, reply to this DM with your email address 📥",
      leadConfirm: "Thanks! I've sent the PDF to your email. You can also download it directly here: https://example.com/free-training.pdf 🎁",
      name: "Lead Gen: Email Collect"
    },
    {
      id: "whatsapp",
      title: "WhatsApp Order",
      description: "Send direct French orders or DMs to WhatsApp chat.",
      icon: Sparkles,
      color: "border-violet-500/30 text-violet-400 bg-violet-500/5",
      keywords: "PRIX, ORDER, WHATSAPP",
      triggerSource: "DIRECT_MESSAGES",
      triggerType: "KEYWORD",
      enableLeadCapture: false,
      replyDm: "Bonjour {{username}}! Pour commander directement sur WhatsApp et discuter avec notre équipe, cliquez ici: https://wa.me/123456789 📲",
      leadConfirm: "",
      name: "Direct Sales: WhatsApp Order"
    }
  ];

  const applyTemplate = (tpl: typeof templates[0]) => {
    setSelectedTemplate(tpl.id);
    setRuleName(tpl.name);
    setTriggerSource(tpl.triggerSource);
    setTriggerType(tpl.triggerType);
    setTriggerKeyword(tpl.keywords);
    setEnableLeadCapture(tpl.enableLeadCapture);
    setReplyDmMessage(tpl.replyDm);
    setLeadConfirmationDm(tpl.leadConfirm);
  };

  return (
    <div className="space-y-6">
      {/* Warning if no accounts connected */}
      {connectedAccounts.length === 0 && (
        <div className="p-4 bg-amber-950/40 border border-amber-500/20 text-amber-400 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-sm">No Connected Instagram Accounts</p>
            <p className="text-slate-400">
              You need to connect an Instagram Business Profile before your automation rules can detect comments and reply.
            </p>
            <Link href="/dashboard/accounts" className="inline-block mt-2 font-bold text-[#00DF81] hover:text-[#00C770] underline">
              Go to Meta accounts &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Action Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-base font-bold text-[#F9FAFB]">Active rules ({automations.length})</h2>
        <Link
          href="/dashboard/automations/builder"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00DF81] hover:bg-[#00C770] text-[#000000] font-bold rounded-xl text-xs transition-all shadow-md shadow-[#00DF81]/10 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Create automation
        </Link>
      </div>

      {/* Rules List */}
      {automations.length === 0 ? (
        <div className="p-12 text-center bg-[#111827] border border-[#1F2937] rounded-xl text-slate-500 text-xs space-y-2">
          <Settings className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-[#F9FAFB] font-semibold">No automation rules configured</p>
          <p className="text-[#9CA3AF]">Click "Create automation" above to define your first trigger.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {automations.map((auto) => (
            <div
              key={auto.id}
              className="p-5 bg-[#111827] border border-[#1F2937] rounded-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-[#F9FAFB] truncate max-w-[200px]" title={auto.name}>
                      {auto.name}
                    </h3>
                    {auto.enableLeadCapture && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-semibold bg-[#00DF81]/10 text-[#00DF81] border border-[#00DF81]/20 uppercase tracking-wider">
                        Lead Capture Active
                      </span>
                    )}
                  </div>
                  <button
                    disabled={toggleLoading === auto.id}
                    onClick={() => handleToggleActive(auto.id, auto.active)}
                    className="text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
                  >
                    {auto.active ? (
                      <ToggleRight className="w-8 h-8 text-[#00DF81]" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-600" />
                    )}
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  {/* Trigger Source Badge */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-slate-500">Source:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#0B0F17] border border-[#1F2937] text-slate-300">
                      {auto.triggerSource === "COMMENTS"
                        ? "Comments"
                        : auto.triggerSource === "STORY_MENTIONS"
                        ? "Story Mentions"
                        : "Direct Messages"}
                    </span>
                  </div>

                  {auto.triggerSource !== "STORY_MENTIONS" && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-slate-500">Trigger:</span>
                      <span className="px-2 py-0.5 rounded bg-[#0B0F17] text-slate-300 font-semibold uppercase tracking-wider text-[10px] border border-[#1F2937]">
                        {auto.triggerType === "ALL"
                          ? "Any Message"
                          : auto.triggerType === "EXACT"
                          ? "Exact Match"
                          : "Contains Keyword"}
                      </span>
                      {auto.triggerKeyword && (
                        <span className="text-[#00DF81] font-mono font-bold">"{auto.triggerKeyword}"</span>
                      )}
                    </div>
                  )}

                  {auto.triggerSource === "COMMENTS" && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-slate-500">Targeting:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        auto.triggerScope === "SPECIFIC_POSTS"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-slate-800 text-slate-400"
                      }`}>
                        {auto.triggerScope === "SPECIFIC_POSTS"
                          ? `Specific Media (${auto.targetMediaIds?.length || 0})`
                          : "All Posts & Reels"}
                      </span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-slate-500 block">
                      {auto.enableLeadCapture ? "Initial Ask (DM):" : "Private Reply (DM):"}
                    </span>
                    <p className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-mono text-[11px] leading-relaxed break-words">
                      {auto.replyDmMessage}
                    </p>
                  </div>

                  {auto.enableLeadCapture && auto.leadConfirmationDm && (
                    <div className="space-y-1">
                      <span className="text-slate-500 block">Lead Confirmation (DM):</span>
                      <p className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 font-mono text-[11px] leading-relaxed break-words">
                        {auto.leadConfirmationDm}
                      </p>
                    </div>
                  )}

                  {auto.triggerSource === "COMMENTS" && (
                    <div className="space-y-1">
                      <span className="text-slate-500 block">
                        Public Comment Replies ({auto.replyCommentOptions?.length || 0} options):
                      </span>
                      {auto.replyCommentOptions && auto.replyCommentOptions.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {auto.replyCommentOptions.map((opt, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 rounded bg-slate-950 border border-slate-855 text-slate-400 text-[10px] truncate max-w-[150px]"
                              title={opt}
                            >
                              "{opt}"
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-600 italic">None configured (replies off)</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-4 flex justify-between items-center text-xs">
                <span className="text-slate-500">
                  Created: {new Date(auto.createdAt).toLocaleDateString()}
                </span>

                <button
                  disabled={deleteLoading === auto.id}
                  onClick={() => handleDelete(auto.id)}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                  title="Delete Automation"
                >
                  {deleteLoading === auto.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-400" />
                <h3 className="font-extrabold text-white text-base">New Automation Rule</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white font-semibold text-sm transition-colors"
              >
                Cancel
              </button>
            </div>

            {/* Split Screen layout */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
              
              {/* LEFT SIDE: Creation Form */}
              <form onSubmit={handleCreate} className="p-6 space-y-4 overflow-y-auto flex-1 lg:w-2/3 border-r border-slate-800">
                {error && (
                  <div className="p-3 text-xs text-red-400 bg-red-950/20 border border-red-500/20 rounded-lg">
                    {error}
                  </div>
                )}

                <input type="hidden" name="targetMediaIds" value={targetMediaIds.join(",")} />

                {/* Templates Grid Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Choose Template Preset (Optional)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                    {templates.map((tpl) => {
                      const Icon = tpl.icon;
                      const isSelected = selectedTemplate === tpl.id;
                      return (
                        <div
                          key={tpl.id}
                          onClick={() => applyTemplate(tpl)}
                          className={`p-3 border rounded-xl cursor-pointer hover:border-slate-600 transition-all select-none flex flex-col justify-between h-[105px] ${
                            isSelected
                              ? "border-violet-500 ring-2 ring-violet-500/10 bg-slate-850"
                              : "border-slate-800 bg-slate-950/40"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className={`p-1.5 rounded-lg border ${tpl.color}`}>
                              <Icon className="w-4 h-4" />
                            </span>
                            {isSelected && (
                              <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                            )}
                          </div>
                          <div className="text-left mt-2">
                            <p className="text-[11px] font-bold text-white leading-tight truncate">{tpl.title}</p>
                            <p className="text-[9px] text-slate-500 leading-tight mt-0.5 line-clamp-2">{tpl.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <hr className="border-slate-800/80 my-1" />

                {/* Rule details */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Rule Name</label>
                  <input
                    name="name"
                    type="text"
                    required
                    value={ruleName}
                    onChange={(e) => {
                      setRuleName(e.target.value);
                      setSelectedTemplate(null);
                    }}
                    placeholder="e.g. Black Friday Promo"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm text-white"
                  />
                </div>

                {/* Trigger Source Dropdown */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Trigger Source</label>
                  <select
                    name="triggerSource"
                    value={triggerSource}
                    onChange={(e) => {
                      setTriggerSource(e.target.value);
                      setSelectedTemplate(null);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm text-white"
                  >
                    <option value="COMMENTS">💬 Post / Reel Comments</option>
                    <option value="STORY_MENTIONS">📸 Story Mentions</option>
                    <option value="DIRECT_MESSAGES">✉️ Direct Messages (DMs)</option>
                  </select>
                </div>

                {/* Trigger Match Type and Keyword */}
                {triggerSource !== "STORY_MENTIONS" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Trigger Match Type</label>
                      <select
                        name="triggerType"
                        value={triggerType}
                        onChange={(e) => {
                          setTriggerType(e.target.value);
                          setSelectedTemplate(null);
                        }}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm text-white"
                      >
                        <option value="KEYWORD">Contains Keyword</option>
                        <option value="EXACT">Exact Match</option>
                        <option value="ALL">Any Message (Universal)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">
                        Keywords {triggerType === "ALL" && "(Disabled)"} <span className="text-[10px] text-slate-550 font-normal">(comma-separated)</span>
                      </label>
                      <input
                        name="triggerKeyword"
                        type="text"
                        disabled={triggerType === "ALL"}
                        required={triggerType !== "ALL"}
                        value={triggerType === "ALL" ? "" : triggerKeyword}
                        onChange={(e) => {
                          setTriggerKeyword(e.target.value);
                          setSelectedTemplate(null);
                        }}
                        placeholder={triggerType === "ALL" ? "N/A" : "e.g. gemini, link, info"}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                )}

                {/* Lead Capture Mode Toggle */}
                <div className="flex items-center gap-2 py-1 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                  <input
                    type="checkbox"
                    id="enableLeadCapture"
                    checked={enableLeadCapture}
                    onChange={(e) => {
                      setEnableLeadCapture(e.target.checked);
                      setSelectedTemplate(null);
                    }}
                    className="w-4 h-4 text-violet-600 border-slate-800 rounded bg-slate-950 focus:ring-violet-500 cursor-pointer"
                  />
                  <input type="hidden" name="enableLeadCapture" value={String(enableLeadCapture)} />
                  <label htmlFor="enableLeadCapture" className="text-xs font-semibold text-slate-300 cursor-pointer select-none">
                    Enable Lead Capture Mode (2-Step Email/Phone collection)
                  </label>
                </div>

                {/* Post Scope Selection (Only for Comments source) */}
                {triggerSource === "COMMENTS" && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Trigger Target Scope</label>
                    <select
                      name="triggerScope"
                      value={triggerScope}
                      onChange={(e) => {
                        setTriggerScope(e.target.value);
                        setSelectedTemplate(null);
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm text-white"
                    >
                      <option value="ALL_POSTS">All Posts & Reels</option>
                      <option value="SPECIFIC_POSTS">Specific Posts / Reels</option>
                    </select>
                  </div>
                )}

                {/* Media selection grid if COMMENTS and SPECIFIC_POSTS */}
                {triggerSource === "COMMENTS" && triggerScope === "SPECIFIC_POSTS" && (
                  <div className="space-y-2 border border-slate-800/80 p-4 bg-slate-950/60 rounded-xl">
                    <label className="text-[11px] font-semibold text-slate-400 block">
                      Select Target Posts/Reels ({targetMediaIds.length} selected)
                    </label>
                    
                    {mediaLoading && (
                      <div className="flex items-center justify-center py-6 text-xs text-slate-500 gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                        Loading recent Instagram posts...
                      </div>
                    )}

                    {mediaError && (
                      <div className="text-xs text-red-400 p-2 bg-red-950/20 border border-red-500/20 rounded-lg">
                        {mediaError}
                      </div>
                    )}

                    {!mediaLoading && !mediaError && mediaItems.length === 0 && (
                      <div className="text-xs text-slate-500 text-center py-6">
                        No recent posts or Reels found on your Instagram profile.
                      </div>
                    )}

                    {!mediaLoading && !mediaError && mediaItems.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 max-h-[160px] overflow-y-auto pr-1">
                        {mediaItems.map((item) => {
                          const isSelected = targetMediaIds.includes(item.id);
                          const imageSrc = item.thumbnail_url || item.media_url;
                          return (
                            <div
                              key={item.id}
                              onClick={() => handleToggleMediaSelect(item.id)}
                              className={`relative aspect-square bg-slate-900 border rounded-lg overflow-hidden cursor-pointer transition-all ${
                                isSelected 
                                  ? "border-violet-500 ring-2 ring-violet-500/20" 
                                  : "border-slate-800 hover:border-slate-700"
                              }`}
                            >
                              {imageSrc ? (
                                <img 
                                  src={imageSrc} 
                                  alt={item.caption || "Instagram media"} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-500 p-1 text-center bg-slate-950">
                                  Media File
                                </div>
                              )}
                              
                              <div className="absolute inset-x-0 bottom-0 bg-black/50 p-1 text-left truncate">
                                <span className="text-[8px] text-slate-200 font-mono">
                                  {item.caption || "Untitled"}
                                </span>
                              </div>

                              {isSelected && (
                                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-violet-600 border border-white flex items-center justify-center text-[9px] text-white font-extrabold shadow-sm">
                                  ✓
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Private reply text */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-300">
                      {enableLeadCapture
                        ? "Initial Ask message (Ask for email/phone)"
                        : triggerSource === "STORY_MENTIONS"
                        ? "Reward Message (DM)"
                        : "Private Reply message (DM)"}
                    </label>
                    <span 
                      className="text-[10px] text-violet-400 cursor-help underline" 
                      title="Use {{username}} inside your messages to auto-replace it with the Instagram handle of the commenter"
                    >
                      Variables Info
                    </span>
                  </div>
                  <textarea
                    name="replyDmMessage"
                    required
                    rows={3}
                    value={replyDmMessage}
                    onChange={(e) => {
                      setReplyDmMessage(e.target.value);
                      setSelectedTemplate(null);
                    }}
                    placeholder={
                      enableLeadCapture
                        ? "Hey! Reply to this DM with your email address to unlock your reward link 🚀"
                        : triggerSource === "STORY_MENTIONS"
                        ? "Thanks for tagging us, {{username}}! Here is your gift: https://example.com/gift 🎁"
                        : "Hey! Here's the access link you requested: https://example.com/checkout 🚀"
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm text-white leading-relaxed"
                  />
                  <p className="text-[10px] text-slate-500">
                    Use <code className="text-violet-400 font-mono font-bold">{"{{username}}"}</code> to insert the user's handle.
                  </p>
                </div>

                {/* Lead Confirmation DM */}
                {enableLeadCapture && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Lead Confirmation DM (Deliver reward link)</label>
                    <textarea
                      name="leadConfirmationDm"
                      required
                      rows={3}
                      value={leadConfirmationDm}
                      onChange={(e) => {
                        setLeadConfirmationDm(e.target.value);
                        setSelectedTemplate(null);
                      }}
                      placeholder="Thanks {{username}}! We got your details. Here is your access link: https://example.com/checkout 🚀"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm text-white leading-relaxed"
                    />
                  </div>
                )}

                {/* Public reply (Only for Comments source) */}
                {triggerSource === "COMMENTS" && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Public Comment Replies <span className="text-[10px] text-slate-550 font-normal">(One option per line - randomized)</span>
                    </label>
                    <textarea
                      name="replyCommentOptions"
                      rows={4}
                      value={replyCommentOptions}
                      onChange={(e) => setReplyCommentOptions(e.target.value)}
                      placeholder="Just sent you a DM! Check your inbox 📥&#10;Sent! Let me know if you got it 🚀&#10;Check your messages!"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-xs text-slate-300 leading-relaxed font-mono"
                    />
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-violet-500/10 shrink-0"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Create Automation Rule"
                  )}
                </button>
              </form>

              {/* RIGHT SIDE: Live Instagram Preview Panel */}
              <div className="hidden lg:flex lg:w-1/3 flex-col bg-slate-950 p-6 space-y-4 overflow-y-auto shrink-0 justify-start border-slate-800">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Live Message Preview
                </h4>
                
                {/* iOS Instagram Mockup Card */}
                <div className="w-full bg-black border border-slate-850 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white text-[11px] h-[450px]">
                  
                  {/* Instagram Header Mock */}
                  <div className="px-3 py-2.5 border-b border-slate-900 bg-zinc-950 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ArrowLeft className="w-3.5 h-3.5 text-white" />
                      <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center">
                        <span className="text-[9px] font-bold text-violet-400">IG</span>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-[10px] leading-tight">Instagram Business</p>
                        <p className="text-[7px] text-slate-500 leading-none">Active now</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-white">
                      <Video className="w-3.5 h-3.5" />
                      <Info className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Chat Bubbles List */}
                  <div className="flex-1 p-3.5 space-y-3 overflow-y-auto flex flex-col justify-end bg-black">
                    
                    {/* User Trigger Comment Preview (If COMMENTS) */}
                    {triggerSource === "COMMENTS" && (
                      <div className="self-end max-w-[80%] bg-zinc-800 text-white rounded-2xl px-3 py-2 text-[10px]">
                        💬 Commented: "{triggerKeyword ? triggerKeyword.split(",")[0] : "Gemini"}"
                      </div>
                    )}

                    {/* User Trigger Direct Message (If DIRECT_MESSAGES) */}
                    {triggerSource === "DIRECT_MESSAGES" && (
                      <div className="self-end max-w-[80%] bg-blue-600 text-white rounded-2xl px-3 py-2 text-[10px]">
                        {triggerKeyword ? triggerKeyword.split(",")[0] : "Order"}
                      </div>
                    )}

                    {/* User Trigger Story Mention (If STORY_MENTIONS) */}
                    {triggerSource === "STORY_MENTIONS" && (
                      <div className="self-end max-w-[80%] bg-zinc-900 text-slate-400 border border-slate-800 rounded-2xl px-3 py-2 text-[9px] italic">
                        📸 Tagged you in their story
                      </div>
                    )}

                    {/* Business reply message bubble */}
                    <div className="self-start max-w-[80%] bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 text-white rounded-2xl px-3 py-2.5 text-[10px] break-words whitespace-pre-wrap leading-normal shadow-sm">
                      {replyDmMessage
                        ? replyDmMessage.replace("{{username}}", "customer_ig")
                        : "Private response text will appear here as you type..."}
                    </div>

                    {/* If Lead Capture active, simulate user email and confirmation reply */}
                    {enableLeadCapture && (
                      <>
                        <div className="self-end max-w-[80%] bg-zinc-800 text-white rounded-2xl px-3 py-2 text-[10px]">
                          hello@example.com
                        </div>
                        <div className="self-start max-w-[80%] bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 text-white rounded-2xl px-3 py-2.5 text-[10px] break-words whitespace-pre-wrap leading-normal shadow-sm">
                          {leadConfirmationDm
                            ? leadConfirmationDm.replace("{{username}}", "customer_ig")
                            : "Delivery reward message will appear here..."}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Input Mock Footer */}
                  <div className="p-2 border-t border-slate-950 bg-zinc-950 flex items-center justify-between gap-1.5 shrink-0">
                    <div className="flex-1 bg-zinc-900 border border-slate-850 rounded-full px-2.5 py-1.5 text-left text-slate-500 text-[9px] flex items-center justify-between">
                      <span>Message...</span>
                      <Send className="w-3 h-3 text-slate-400" />
                    </div>
                    <Heart className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </div>
                </div>

                {/* Comment Reply Variation Mock (if COMMENTS) */}
                {triggerSource === "COMMENTS" && (
                  <div className="p-3 bg-zinc-900/60 border border-slate-850 rounded-xl space-y-1.5 text-[9px] text-left text-slate-400">
                    <p className="font-semibold text-slate-300 uppercase tracking-wider text-[8px]">
                      Public Comment Reply Preview (Randomized)
                    </p>
                    <div className="p-2 bg-black border border-slate-850 rounded-lg text-slate-300 font-mono text-[9px]">
                      {replyCommentOptions.split("\n")[0] || "No replies configured"}
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
export default AutomationsManager;
