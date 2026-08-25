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
  Zap,
} from "lucide-react";
import { toggleAutomationActive, deleteAutomation } from "@/app/dashboard/automations/actions";
import Link from "next/link";
import { TemplatesLibraryClient } from "@/components/TemplatesLibraryClient";
import DropdownSelect from "@/components/DropdownSelect";

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
  defaultTab?: "MY_RULES" | "TEMPLATES";
}

export default function AutomationsManager({
  initialAutomations,
  connectedAccounts,
  defaultTab = "MY_RULES",
}: AutomationsManagerProps) {
  const [activeTab, setActiveTab] = useState<"MY_RULES" | "TEMPLATES">(defaultTab);
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
  const handleDeleteConfirm = async () => {
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
      {/* Top Segmented Tab Switcher */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#0A0A0A] border border-[#222222] rounded-2xl w-fit shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
        <button
          type="button"
          onClick={() => setActiveTab("MY_RULES")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === "MY_RULES"
              ? "bg-[#181818] text-white shadow-sm border border-[#2B2B2B]"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>My automations</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#111111] text-zinc-400 border border-[#222222]">
            {automations.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("TEMPLATES")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === "TEMPLATES"
              ? "bg-[#181818] text-white shadow-sm border border-[#2B2B2B]"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Templates</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#111111] text-zinc-400 border border-[#222222]">
            6
          </span>
        </button>
      </div>

      {/* Tab 2: Templates Library */}
      {activeTab === "TEMPLATES" && (
        <div className="animate-in fade-in duration-200">
          <TemplatesLibraryClient />
        </div>
      )}

      {/* Tab 1: My Automations */}
      {activeTab === "MY_RULES" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Account Warning if 0 connected accounts */}
          {connectedAccounts.length === 0 && (
            <div className="p-4 bg-[#0A0A0A] border border-amber-900/40 text-amber-300 rounded-2xl flex items-start gap-3 text-xs shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" strokeWidth={1.75} />
              <div className="space-y-1">
                <p className="font-semibold text-xs text-white">No Connected Instagram Accounts</p>
                <p className="text-zinc-400 leading-relaxed">
                  Connect your Instagram Creator or Business account to enable instant comment and DM workflows.
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

          {/* Filters & Search Header */}
          <div className="bg-[#0A0A0A] border border-[#222222] rounded-2xl p-3 flex flex-wrap gap-3 items-center justify-between shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search automations..."
                className="w-full h-10 pl-9 pr-3 bg-[#111111] border border-[#262626] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
              />
            </div>

            {/* Filter Pills / Dropdowns */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Trigger Source Filter */}
              <div className="flex items-center bg-[#111111] border border-[#262626] rounded-xl p-1 text-xs font-medium text-zinc-400">
                <button
                  type="button"
                  onClick={() => setSelectedSource("ALL")}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    selectedSource === "ALL" ? "bg-[#222222] text-white shadow-sm" : "hover:text-zinc-200"
                  }`}
                >
                  All triggers
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSource("COMMENTS")}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    selectedSource === "COMMENTS" ? "bg-[#222222] text-white shadow-sm" : "hover:text-zinc-200"
                  }`}
                >
                  Comments
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSource("STORY_MENTIONS")}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    selectedSource === "STORY_MENTIONS" ? "bg-[#222222] text-white shadow-sm" : "hover:text-zinc-200"
                  }`}
                >
                  Stories
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSource("DIRECT_MESSAGES")}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    selectedSource === "DIRECT_MESSAGES" ? "bg-[#222222] text-white shadow-sm" : "hover:text-zinc-200"
                  }`}
                >
                  Direct DMs
                </button>
              </div>

              {/* Status Filter Custom Dropdown */}
              <DropdownSelect
                value={selectedStatus}
                onChange={setSelectedStatus}
                options={[
                  { value: "ALL", label: "All statuses" },
                  { value: "LIVE", label: "Live only" },
                  { value: "PAUSED", label: "Paused only" },
                ]}
              />
            </div>
          </div>

          {/* Automations Table or Empty State */}
          {filteredAutomations.length === 0 ? (
            <div className="p-12 text-center bg-[#0A0A0A] border border-[#222222] rounded-2xl text-zinc-500 space-y-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
              <div className="w-12 h-12 rounded-2xl bg-[#111111] border border-[#222222] flex items-center justify-center mx-auto text-zinc-500">
                <Zap className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <p className="text-white font-semibold text-base">No automations found</p>
                <p className="text-sm text-zinc-400 max-w-sm mx-auto">
                  {searchQuery || selectedSource !== "ALL" || selectedStatus !== "ALL"
                    ? "No rules match your active search filters. Try clearing your search."
                    : "Create your first keyword trigger to automatically send DMs when followers engage."}
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/dashboard/automations/builder"
                  className="h-10 px-5 rounded-xl bg-white hover:bg-zinc-200 text-black font-medium text-sm inline-flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create new automation</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-[#0A0A0A] border border-[#222222] rounded-2xl overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[#1F1F23] bg-[#0A0A0A] text-xs font-medium text-zinc-400">
                      <th className="py-3 px-4 font-medium">Status</th>
                      <th className="py-3 px-4 font-medium">Automation & trigger</th>
                      <th className="py-3 px-4 font-medium">Source</th>
                      <th className="py-3 px-4 font-medium">Dispatches</th>
                      <th className="py-3 px-4 font-medium">Created</th>
                      <th className="py-3 px-4 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F1F23]">
                    {filteredAutomations.map((auto) => {
                      const isToggling = toggleLoading === auto.id;
                      const dispatchesCount = auto._count?.logs || 0;
                      const leadsCount = auto._count?.leads || 0;

                      return (
                        <tr
                          key={auto.id}
                          className="bg-[#0A0A0A] hover:bg-[#0F0F0F] border-b border-[#1F1F23] transition-colors group"
                        >
                          {/* 1. Status Toggle Column */}
                          <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                            <button
                              type="button"
                              onClick={() => handleToggleActive(auto.id, auto.active)}
                              disabled={isToggling}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                auto.active ? "bg-white" : "bg-zinc-800"
                              }`}
                              title={auto.active ? "Click to pause rule" : "Click to activate rule"}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-black shadow-md ring-0 transition duration-200 ease-in-out ${
                                  auto.active ? "translate-x-4 bg-black" : "translate-x-0 bg-zinc-400"
                                }`}
                              />
                            </button>
                          </td>

                          {/* 2. Automation Name & Clean Trigger Column */}
                          <td className="py-3.5 px-4 min-w-[260px] align-middle">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${auto.active ? "bg-emerald-400" : "bg-zinc-600"}`} />
                                <span className="text-sm font-semibold text-white truncate" title={auto.name}>
                                  {auto.name}
                                </span>
                                {auto.enableLeadCapture && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#141414] text-zinc-300 border border-[#262626]">
                                    Lead capture
                                  </span>
                                )}
                              </div>

                              {/* Clean Subtitle Line Trigger Details */}
                              <p className="text-xs text-zinc-400 flex items-center gap-1 flex-wrap">
                                {auto.triggerSource === "STORY_MENTIONS" ? (
                                  <span>Story mentions & tags</span>
                                ) : auto.triggerSource === "DIRECT_MESSAGES" ? (
                                  <span>
                                    Direct message keyword: <strong className="text-zinc-200 font-medium">"{auto.triggerKeyword || "Any"}"</strong>
                                  </span>
                                ) : (
                                  <span>
                                    Keywords: <strong className="text-zinc-200 font-medium">"{auto.triggerKeyword || "Any"}"</strong>
                                    <span className="text-zinc-600 mx-1.5">•</span>
                                    <span>{auto.triggerScope === "SPECIFIC_POSTS" ? `Specific post (${auto.targetMediaIds?.length || 1})` : "All posts"}</span>
                                  </span>
                                )}
                              </p>
                            </div>
                          </td>

                          {/* 3. Source Column */}
                          <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-normal text-zinc-300 bg-[#161616] border border-[#262626]">
                              {auto.triggerSource === "COMMENTS" ? (
                                <>
                                  <MessageCircle className="w-3.5 h-3.5 text-zinc-400" />
                                  <span>Comments</span>
                                </>
                              ) : auto.triggerSource === "STORY_MENTIONS" ? (
                                <>
                                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Stories</span>
                                </>
                              ) : (
                                <>
                                  <Inbox className="w-3.5 h-3.5 text-zinc-400" />
                                  <span>Direct messages</span>
                                </>
                              )}
                            </span>
                          </td>

                          {/* 4. Dispatches Column */}
                          <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                            <div className="text-sm font-medium text-white">
                              <span>{dispatchesCount} sent</span>
                              {auto.enableLeadCapture && leadsCount > 0 && (
                                <span className="text-xs text-zinc-500 block font-normal">
                                  {leadsCount} lead{leadsCount !== 1 ? "s" : ""}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 5. Created Date Column */}
                          <td className="py-3.5 px-4 whitespace-nowrap align-middle text-xs text-zinc-500 font-normal">
                            {new Date(auto.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>

                          {/* 6. Actions Column */}
                          <td className="py-3.5 px-4 whitespace-nowrap align-middle text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Link
                                href={`/dashboard/automations/builder?edit=${auto.id}`}
                                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors inline-flex items-center justify-center"
                                title="Edit automation rule"
                              >
                                <Edit2 className="w-4 h-4" strokeWidth={1.75} />
                              </Link>

                              <button
                                type="button"
                                onClick={() => setDeleteId(auto.id)}
                                className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors inline-flex items-center justify-center"
                                title="Delete automation rule"
                              >
                                <Trash2 className="w-4 h-4" strokeWidth={1.75} />
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
        </div>
      )}

      {/* Delete Confirmation Dialog Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0A0A0A] border border-[#222222] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-white">Delete automation rule</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Are you sure you want to delete this automation rule? Active comments matching this keyword trigger will no longer receive automated direct messages.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setDeleteId(null)}
                className="h-10 px-4 rounded-xl bg-[#111111] hover:bg-[#181818] text-zinc-300 hover:text-white border border-[#262626] text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDeleteConfirm}
                className="h-10 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors flex items-center gap-1.5"
              >
                {deleteLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
