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
  buttonTitle?: string | null;
  buttonUrl?: string | null;
  secondaryButtonTitle?: string | null;
  secondaryButtonUrl?: string | null;
  active: boolean;
  createdAt: Date;
}

interface AutomationsManagerProps {
  initialAutomations: Automation[];
  connectedAccounts: IgAccount[];
}

export function AutomationsManager({ initialAutomations, connectedAccounts }: AutomationsManagerProps) {
  const [automations, setAutomations] = useState<Automation[]>(initialAutomations);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      {connectedAccounts.length === 0 && (
        <div className="p-4 bg-amber-950/30 border border-amber-500/20 text-amber-400 rounded-xl flex items-start gap-3 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.75} />
          <div className="space-y-1">
            <p className="font-bold text-xs text-zinc-100">No Connected Instagram Accounts</p>
            <p className="text-zinc-400 leading-relaxed">
              You need to connect an Instagram Business Profile before your automation rules can detect comments and reply.
            </p>
            <Link href="/dashboard/accounts" className="inline-block font-semibold text-[#00DF81] hover:text-[#00C770] underline pt-0.5">
              Go to Meta accounts &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Action Header */}
      <div className="flex justify-between items-center pb-2 border-b border-[#27272A]">
        <div>
          <h2 className="text-sm font-bold text-zinc-100">Configured rules ({automations.length})</h2>
          <p className="text-xs text-zinc-400">Manage real-time trigger keywords and automated message delivery</p>
        </div>
        <Link
          href="/dashboard/automations/builder"
          className="h-9 inline-flex items-center gap-1.5 px-3.5 bg-[#00DF81] hover:bg-[#00C770] text-[#000000] font-semibold rounded-lg text-xs transition-all shadow-sm active:scale-95 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2} />
          Create automation
        </Link>
      </div>

      {/* Rules List */}
      {automations.length === 0 ? (
        <div className="p-12 text-center bg-[#18181B] border border-[#27272A] rounded-xl text-zinc-500 text-xs space-y-2">
          <Settings className="w-8 h-8 text-zinc-600 mx-auto mb-2" strokeWidth={1.75} />
          <p className="text-zinc-200 font-semibold">No automation rules configured</p>
          <p className="text-zinc-500">Click "Create automation" above to configure your first trigger rule.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {automations.map((auto) => (
            <div
              key={auto.id}
              className="p-5 bg-[#18181B] border border-[#27272A] rounded-xl flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-colors shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-zinc-100 truncate max-w-[200px]" title={auto.name}>
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
                    className="text-zinc-500 hover:text-zinc-300 disabled:opacity-50 transition-colors"
                  >
                    {auto.active ? (
                      <ToggleRight className="w-7 h-7 text-[#00DF81]" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-zinc-700" />
                    )}
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  {/* Trigger Source Badge */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-zinc-500 text-[11px]">Source:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#0F0F0F] border border-[#27272A] text-zinc-300">
                      {auto.triggerSource === "COMMENTS"
                        ? "Comments"
                        : auto.triggerSource === "STORY_MENTIONS"
                        ? "Story Mentions"
                        : "Direct Messages"}
                    </span>
                  </div>

                  {auto.triggerSource !== "STORY_MENTIONS" && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-zinc-500 text-[11px]">Trigger:</span>
                      <span className="px-2 py-0.5 rounded bg-[#0F0F0F] text-zinc-300 font-semibold uppercase tracking-wider text-[10px] border border-[#27272A]">
                        {auto.triggerType === "ALL"
                          ? "Any Message"
                          : auto.triggerType === "EXACT"
                          ? "Exact Match"
                          : "Contains Keyword"}
                      </span>
                      {auto.triggerKeyword && (
                        <span className="text-[#00DF81] font-mono font-semibold text-[11px]">"{auto.triggerKeyword}"</span>
                      )}
                    </div>
                  )}

                  {auto.triggerSource === "COMMENTS" && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-zinc-500 text-[11px]">Targeting:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        auto.triggerScope === "SPECIFIC_POSTS"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-[#0F0F0F] text-zinc-400 border border-[#27272A]"
                      }`}>
                        {auto.triggerScope === "SPECIFIC_POSTS"
                          ? `Specific Media (${auto.targetMediaIds?.length || 0})`
                          : "All Posts & Reels"}
                      </span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-zinc-500 text-[11px] block">
                      {auto.enableLeadCapture ? "Initial Ask (DM):" : "Private Reply (DM):"}
                    </span>
                    <p className="p-2.5 bg-[#0F0F0F] border border-[#27272A] rounded-lg text-zinc-300 font-mono text-[10px] leading-relaxed break-words">
                      {auto.replyDmMessage}
                    </p>
                  </div>

                  {auto.enableLeadCapture && auto.leadConfirmationDm && (
                    <div className="space-y-1">
                      <span className="text-zinc-500 text-[11px] block">Lead Confirmation (DM):</span>
                      <p className="p-2.5 bg-[#0F0F0F] border border-[#27272A] rounded-lg text-[#00DF81] font-mono text-[10px] leading-relaxed break-words">
                        {auto.leadConfirmationDm}
                      </p>
                    </div>
                  )}

                  {auto.triggerSource === "COMMENTS" && (
                    <div className="space-y-1">
                      <span className="text-zinc-500 text-[11px] block">
                        Public Comment Replies ({auto.replyCommentOptions?.length || 0} variations):
                      </span>
                      {auto.replyCommentOptions && auto.replyCommentOptions.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {auto.replyCommentOptions.map((opt, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-[#0F0F0F] border border-[#27272A] text-zinc-400 text-[10px] truncate max-w-[150px]"
                              title={opt}
                            >
                              "{opt}"
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-zinc-600 italic">None configured (replies off)</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-[#27272A] pt-3 flex justify-between items-center text-xs">
                <span className="text-zinc-500 text-[11px] font-mono">
                  {new Date(auto.createdAt).toLocaleDateString()}
                </span>

                <button
                  disabled={deleteLoading === auto.id}
                  onClick={() => handleDelete(auto.id)}
                  className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-[#0F0F0F] rounded-lg transition-colors disabled:opacity-50"
                  title="Delete Automation"
                >
                  {deleteLoading === auto.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default AutomationsManager;
