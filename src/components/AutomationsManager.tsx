"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Settings, Trash2, ToggleLeft, ToggleRight, AlertTriangle, Key } from "lucide-react";
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
  
  // Form states
  const [triggerType, setTriggerType] = useState("KEYWORD");
  const [triggerScope, setTriggerScope] = useState("ALL_POSTS");
  const [triggerSource, setTriggerSource] = useState("COMMENTS");
  const [enableLeadCapture, setEnableLeadCapture] = useState(false);
  const [targetMediaIds, setTargetMediaIds] = useState<string[]>([]);
  
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
            <Link href="/dashboard/accounts" className="inline-block mt-2 font-bold text-violet-400 hover:text-violet-300 underline">
              Go to Meta Accounts &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Action Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Active Rules ({automations.length})</h2>
        <button
          onClick={() => {
            setIsModalOpen(true);
            setError("");
            setTargetMediaIds([]);
            setTriggerScope("ALL_POSTS");
            setTriggerSource("COMMENTS");
            setEnableLeadCapture(false);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-violet-500/10 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Create Automation
        </button>
      </div>

      {/* Rules List */}
      {automations.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-500 text-sm">
          <Settings className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p>No automation rules configured.</p>
          <p className="text-xs text-slate-600 mt-1">Click "Create Automation" above to define your first trigger.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {automations.map((auto) => (
            <div
              key={auto.id}
              className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white truncate max-w-[200px]" title={auto.name}>
                      {auto.name}
                    </h3>
                    {auto.enableLeadCapture && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
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
                      <ToggleRight className="w-9 h-9 text-violet-500" />
                    ) : (
                      <ToggleLeft className="w-9 h-9 text-slate-600" />
                    )}
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  {/* Trigger Source Badge */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-slate-500">Source:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      auto.triggerSource === "COMMENTS"
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        : auto.triggerSource === "STORY_MENTIONS"
                        ? "bg-pink-500/10 text-pink-400 border-pink-500/20"
                        : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                    }`}>
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
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold uppercase tracking-wider text-[10px]">
                        {auto.triggerType === "ALL"
                          ? "Any Message"
                          : auto.triggerType === "EXACT"
                          ? "Exact Match"
                          : "Contains Keyword"}
                      </span>
                      {auto.triggerKeyword && (
                        <span className="text-violet-400 font-mono font-bold">"{auto.triggerKeyword}"</span>
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40 shrink-0">
              <h3 className="font-extrabold text-white text-base">New Automation Rule</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white font-semibold text-sm"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 overflow-y-auto flex-1">
              {error && (
                <div className="p-3 text-xs text-red-400 bg-red-950/20 border border-red-500/20 rounded-lg">
                  {error}
                </div>
              )}

              <input type="hidden" name="targetMediaIds" value={targetMediaIds.join(",")} />

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Rule Name</label>
                <input
                  name="name"
                  type="text"
                  required
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
                  onChange={(e) => setTriggerSource(e.target.value)}
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
                      onChange={(e) => setTriggerType(e.target.value)}
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
                  onChange={(e) => setEnableLeadCapture(e.target.checked)}
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
                    onChange={(e) => setTriggerScope(e.target.value)}
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

              {/* Private reply */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  {enableLeadCapture
                    ? "Initial Ask message (Ask for email/phone)"
                    : triggerSource === "STORY_MENTIONS"
                    ? "Reward Message (DM)"
                    : "Private Reply message (DM)"}
                </label>
                <textarea
                  name="replyDmMessage"
                  required
                  rows={2}
                  placeholder={
                    enableLeadCapture
                      ? "Hey! Reply to this DM with your email address to unlock your reward link 🚀"
                      : triggerSource === "STORY_MENTIONS"
                      ? "Thanks for tagging us, {{username}}! Here is your gift: https://example.com/gift 🎁"
                      : "Hey! Here's the access link you requested: https://example.com/checkout 🚀"
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm text-white leading-relaxed"
                />
              </div>

              {/* Lead Confirmation DM (Only if Lead Capture enabled) */}
              {enableLeadCapture && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Lead Confirmation DM (Deliver reward link)</label>
                  <textarea
                    name="leadConfirmationDm"
                    required
                    rows={2}
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
                    rows={2}
                    placeholder="Just sent you a DM! Check your inbox 📥&#10;Sent! Let me know if you got it 🚀&#10;Check your messages!"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm text-white leading-relaxed font-sans"
                  />
                </div>
              )}

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
          </div>
        </div>
      )}
    </div>
  );
}
export default AutomationsManager;
