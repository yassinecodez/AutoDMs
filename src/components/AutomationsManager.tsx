"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  MessageCircle,
  Sparkles,
  Inbox,
  AlertTriangle,
  Loader2,
  Check,
  X,
  Filter,
  Zap,
} from "lucide-react";
import { toggleAutomationActive, deleteAutomation } from "@/app/dashboard/automations/actions";
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
  _count?: {
    logs: number;
    leads: number;
  };
}

interface AutomationsManagerProps {
  initialAutomations: Automation[];
  connectedAccounts: IgAccount[];
}

export default function AutomationsManager({
  initialAutomations,
  connectedAccounts,
}: AutomationsManagerProps) {
  const [automations, setAutomations] = useState<Automation[]>(initialAutomations);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toggle rule active status
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

  // Delete rule
  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await deleteAutomation(deleteId);
      setAutomations((prev) => prev.filter((auto) => auto.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error("Failed to delete automation:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtered automations
  const filteredAutomations = useMemo(() => {
    return automations.filter((auto) => {
      // Search matching
      const matchesSearch =
        searchQuery === "" ||
        auto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (auto.triggerKeyword &&
          auto.triggerKeyword.toLowerCase().includes(searchQuery.toLowerCase())) ||
        auto.replyDmMessage.toLowerCase().includes(searchQuery.toLowerCase());

      // Source filter
      const matchesSource =
        selectedSource === "ALL" ||
        (selectedSource === "COMMENTS" && auto.triggerSource === "COMMENTS") ||
        (selectedSource === "STORY_MENTIONS" && auto.triggerSource === "STORY_MENTIONS") ||
        (selectedSource === "DIRECT_MESSAGES" && auto.triggerSource === "DIRECT_MESSAGES");

      // Status filter
      const matchesStatus =
        selectedStatus === "ALL" ||
        (selectedStatus === "LIVE" && auto.active) ||
        (selectedStatus === "PAUSED" && !auto.active);

      return matchesSearch && matchesSource && matchesStatus;
    });
  }, [automations, searchQuery, selectedSource, selectedStatus]);

  return (
    <div className="space-y-6">
      {/* Account Warning if 0 connected accounts */}
      {connectedAccounts.length === 0 && (
        <div className="p-4 bg-[#0A0A0A] border border-amber-900/40 text-amber-300 rounded-xl flex items-start gap-3 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" strokeWidth={1.75} />
          <div className="space-y-1">
            <p className="font-semibold text-xs text-white">No Connected Instagram Accounts</p>
            <p className="text-zinc-400 leading-relaxed">
              Connect your Meta Facebook Page & Instagram Business account to allow real-time comment and DM automation.
            </p>
            <Link
              href="/dashboard/accounts"
              className="inline-block font-medium text-white hover:underline pt-0.5"
            >
              Connect Profile &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. Search & Filter Controls */}
      {/* ========================================================================= */}
      <div className="bg-[#0A0A0A] border border-[#222222] rounded-xl p-3 flex flex-wrap gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search automations..."
            className="bg-[#111111] border border-[#262626] rounded-lg h-9 pl-9 pr-3 text-sm text-white placeholder-zinc-500 w-full focus:outline-none focus:border-zinc-500 transition-colors"
          />
        </div>

        {/* Filter Pills / Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Trigger Source Filter */}
          <div className="flex items-center bg-[#111111] border border-[#262626] rounded-lg p-0.5 text-xs font-medium text-zinc-400">
            <button
              onClick={() => setSelectedSource("ALL")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                selectedSource === "ALL"
                  ? "bg-[#222222] text-white"
                  : "hover:text-zinc-200"
              }`}
            >
              All Triggers
            </button>
            <button
              onClick={() => setSelectedSource("COMMENTS")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                selectedSource === "COMMENTS"
                  ? "bg-[#222222] text-white"
                  : "hover:text-zinc-200"
              }`}
            >
              Comments
            </button>
            <button
              onClick={() => setSelectedSource("STORY_MENTIONS")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                selectedSource === "STORY_MENTIONS"
                  ? "bg-[#222222] text-white"
                  : "hover:text-zinc-200"
              }`}
            >
              Story Mentions
            </button>
            <button
              onClick={() => setSelectedSource("DIRECT_MESSAGES")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                selectedSource === "DIRECT_MESSAGES"
                  ? "bg-[#222222] text-white"
                  : "hover:text-zinc-200"
              }`}
            >
              Direct Messages
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#111111] border border-[#262626] rounded-lg h-9 px-3 text-xs font-medium text-zinc-300 focus:outline-none focus:border-zinc-500 transition-colors"
          >
            <option value="ALL">All Status</option>
            <option value="LIVE">Live</option>
            <option value="PAUSED">Paused</option>
          </select>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. Automations Rules List / Table */}
      {/* ========================================================================= */}
      {automations.length === 0 ? (
        /* Empty State (0 rules created) */
        <div className="border border-dashed border-[#262626] rounded-2xl p-12 text-center my-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#111111] border border-[#222222] flex items-center justify-center mx-auto text-zinc-400">
            <Zap className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-white">No automations created yet</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
              Set up your first comment or story trigger to start sending automated direct messages and capturing leads.
            </p>
          </div>
          <Link
            href="/dashboard/automations/builder"
            className="inline-flex items-center gap-2 h-10 px-5 bg-white hover:bg-zinc-200 text-black font-medium rounded-lg text-xs transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            Create Your First Automation
          </Link>
        </div>
      ) : filteredAutomations.length === 0 ? (
        /* Search/Filter Empty State */
        <div className="p-12 text-center bg-[#0A0A0A] border border-[#222222] rounded-xl text-xs space-y-3">
          <Filter className="w-6 h-6 text-zinc-500 mx-auto" />
          <p className="text-zinc-200 font-medium">No automations match your search criteria</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedSource("ALL");
              setSelectedStatus("ALL");
            }}
            className="text-xs font-medium text-white hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Data Table */
        <div className="bg-[#0A0A0A] border border-[#222222] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider bg-[#0d0d0d] border-b border-[#222222]">
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Automation Name & Trigger</th>
                  <th className="py-3.5 px-4">Source</th>
                  <th className="py-3.5 px-4">Total Dispatches</th>
                  <th className="py-3.5 px-4">Created</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222] text-xs">
                {filteredAutomations.map((auto) => {
                  const dispatchesCount = auto._count?.logs || 0;
                  const leadsCount = auto._count?.leads || 0;

                  return (
                    <tr
                      key={auto.id}
                      className="bg-[#0A0A0A] hover:bg-[#111111] transition-colors group"
                    >
                      {/* 1. Status Column */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={auto.active}
                            disabled={toggleLoading === auto.id}
                            onClick={() => handleToggleActive(auto.id, auto.active)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                              auto.active ? "bg-white" : "bg-[#262626]"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-black shadow-lg ring-0 transition duration-200 ease-in-out ${
                                auto.active ? "translate-x-4 bg-black" : "translate-x-0 bg-zinc-400"
                              }`}
                            />
                          </button>

                          <span
                            className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider ${
                              auto.active ? "text-zinc-200" : "text-zinc-500"
                            }`}
                          >
                            {auto.active ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Live
                              </>
                            ) : (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                                Paused
                              </>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* 2. Rule Details Column */}
                      <td className="py-4 px-4 max-w-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white truncate" title={auto.name}>
                              {auto.name}
                            </span>
                            {auto.enableLeadCapture && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#181818] text-zinc-300 border border-[#2b2b2b] uppercase tracking-wider">
                                Lead Capture
                              </span>
                            )}
                          </div>

                          {/* Trigger Subtext */}
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-400">
                            {auto.triggerSource === "STORY_MENTIONS" ? (
                              <span>Trigger: Story Tag / Mention</span>
                            ) : (
                              <>
                                <span className="text-zinc-500">Trigger:</span>
                                {auto.triggerType === "ALL" ? (
                                  <span className="font-mono text-zinc-300">Any Comment</span>
                                ) : (
                                  <span className="font-mono text-white">
                                    "{auto.triggerKeyword || "None"}"
                                  </span>
                                )}
                                <span className="text-zinc-600">•</span>
                                <span className="text-zinc-400">
                                  {auto.triggerScope === "SPECIFIC_POSTS"
                                    ? `Specific Media (${auto.targetMediaIds?.length || 0})`
                                    : "All Posts & Reels"}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Response Preview */}
                          <div className="pt-0.5">
                            <p
                              className="text-[11px] text-zinc-400 truncate max-w-xs font-mono bg-[#111111] px-2 py-0.5 rounded border border-[#222222]"
                              title={auto.replyDmMessage}
                            >
                              DM: "{auto.replyDmMessage}"
                            </p>
                          </div>

                          {/* Button link preview if present */}
                          {auto.buttonTitle && auto.buttonUrl && (
                            <div className="flex items-center gap-1 text-[10px] text-zinc-400 pt-0.5">
                              <ExternalLink className="w-3 h-3 text-zinc-500" />
                              <span className="text-zinc-400">Button:</span>
                              <span className="text-white font-medium truncate max-w-[150px]">
                                {auto.buttonTitle}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 3. Source Badge Column */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#141414] border border-[#262626] text-zinc-300">
                          {auto.triggerSource === "COMMENTS" ? (
                            <>
                              <MessageCircle className="w-3.5 h-3.5 text-zinc-400" />
                              Comments
                            </>
                          ) : auto.triggerSource === "STORY_MENTIONS" ? (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                              Stories
                            </>
                          ) : (
                            <>
                              <Inbox className="w-3.5 h-3.5 text-zinc-400" />
                              Direct DMs
                            </>
                          )}
                        </span>
                      </td>

                      {/* 4. Total Dispatches Column */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-bold text-white tracking-tight">
                            {dispatchesCount.toLocaleString()}
                          </p>
                          {auto.enableLeadCapture && (
                            <p className="text-[11px] text-zinc-500">
                              {leadsCount} lead{leadsCount !== 1 ? "s" : ""}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* 5. Created Date Column */}
                      <td className="py-4 px-4 whitespace-nowrap text-zinc-400 text-xs font-mono">
                        {new Date(auto.createdAt).toLocaleDateString()}
                      </td>

                      {/* 6. Actions Column */}
                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href="/dashboard/automations/builder"
                            className="p-2 text-zinc-400 hover:text-white hover:bg-[#181818] rounded-lg transition-colors"
                            title="Edit Automation Rule"
                          >
                            <Edit2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                          </Link>

                          <button
                            type="button"
                            onClick={() => setDeleteId(auto.id)}
                            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-[#181818] rounded-lg transition-colors"
                            title="Delete Automation Rule"
                          >
                            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. Delete Confirmation Dialog Modal */}
      {/* ========================================================================= */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0A0A0A] border border-[#222222] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-white">Delete Automation Rule</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Are you sure you want to delete this automation rule? Active comments matching this keyword trigger will no longer receive automated direct messages.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setDeleteId(null)}
                className="h-9 px-4 rounded-lg bg-[#111111] hover:bg-[#181818] text-zinc-300 hover:text-white border border-[#262626] text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={confirmDelete}
                className="h-9 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                {deleteLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Delete Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
