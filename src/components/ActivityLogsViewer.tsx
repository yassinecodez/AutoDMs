"use client";

import { useState, useMemo } from "react";
import {
  Search,
  MessageCircle,
  Sparkles,
  Inbox,
  CheckCircle2,
  AlertCircle,
  Filter,
  ScrollText,
  Send,
  Zap,
} from "lucide-react";
import { getCommenterAvatar } from "@/lib/commenterAvatar";
import DropdownSelect from "@/components/DropdownSelect";

export interface ExecutionLogItem {
  id: string;
  commentId: string;
  commentText: string;
  commenterUsername: string;
  triggerSource: string;
  dmStatus: string;
  dmError: string | null;
  commentStatus: string;
  commentError: string | null;
  isFollower?: boolean | null;
  timestamp: any;
  automation?: {
    id: string;
    name: string;
  } | null;
}

interface ActivityLogsViewerProps {
  initialLogs: ExecutionLogItem[];
}

export function ActivityLogsViewer({ initialLogs }: ActivityLogsViewerProps) {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedSource, setSelectedSource] = useState<string>("ALL");

  // Relative Time Formatter Helper
  const formatTimeAgo = (dateInput: any) => {
    const date = new Date(dateInput);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 30) return "Just now";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  // Metrics Calculation
  const totalDispatches = initialLogs.length;
  const deliveredCount = initialLogs.filter((l) => l.dmStatus === "SUCCESS").length;
  const leadsCapturedCount = initialLogs.filter((l) => l.dmStatus === "LEAD_CAPTURED").length;
  const skippedOrRestrictedCount = initialLogs.filter(
    (l) => l.dmStatus === "SKIPPED" || l.dmStatus === "FAILED"
  ).length;
  const successRate = totalDispatches > 0 ? Math.round((deliveredCount / totalDispatches) * 100) : 100;

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return initialLogs.filter((log) => {
      const term = search.toLowerCase();
      const matchesSearch =
        search === "" ||
        log.commenterUsername.toLowerCase().includes(term) ||
        log.commentText.toLowerCase().includes(term) ||
        (log.dmError && log.dmError.toLowerCase().includes(term)) ||
        (log.automation?.name && log.automation.name.toLowerCase().includes(term));

      // Status Filter
      const matchesStatus =
        selectedStatus === "ALL" ||
        (selectedStatus === "SUCCESS" && log.dmStatus === "SUCCESS") ||
        (selectedStatus === "LEAD_CAPTURED" && log.dmStatus === "LEAD_CAPTURED") ||
        (selectedStatus === "FAILED" && log.dmStatus === "FAILED") ||
        (selectedStatus === "SKIPPED" && (log.dmStatus === "SKIPPED" || log.dmStatus === "TEST_EVENT"));

      // Source Filter
      const matchesSource =
        selectedSource === "ALL" ||
        (selectedSource === "COMMENTS" && (log.triggerSource === "COMMENT" || log.triggerSource === "COMMENTS")) ||
        (selectedSource === "STORIES" && (log.triggerSource === "STORY_MENTION" || log.triggerSource === "STORY_MENTIONS")) ||
        (selectedSource === "DIRECT_MESSAGES" && (log.triggerSource === "DIRECT_MESSAGE" || log.triggerSource === "DIRECT_MESSAGES"));

      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [initialLogs, search, selectedStatus, selectedSource]);

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. Metrics Summary Chips Row */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Dispatches */}
        <div className="p-4 bg-[#0A0A0A] border border-[#222222] rounded-2xl flex items-center justify-between shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-zinc-400">Total dispatches</p>
            <p className="text-2xl font-bold text-white tracking-tight">{totalDispatches.toLocaleString()}</p>
            <p className="text-xs text-zinc-500 font-medium">Live webhook triggers</p>
          </div>
          <div className="p-2.5 rounded-xl bg-[#141414] border border-[#262626] text-white shrink-0">
            <Send className="w-4 h-4" strokeWidth={1.75} />
          </div>
        </div>

        {/* Card 2: Delivery Success Rate */}
        <div className="p-4 bg-[#0A0A0A] border border-[#222222] rounded-2xl flex items-center justify-between shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-zinc-400">Success rate</p>
            <p className="text-2xl font-bold text-white tracking-tight">{successRate}%</p>
            <p className="text-xs text-zinc-500 font-medium">{deliveredCount} delivered</p>
          </div>
          <div className="p-2.5 rounded-xl bg-[#141414] border border-[#262626] text-white shrink-0">
            <CheckCircle2 className="w-4 h-4" strokeWidth={1.75} />
          </div>
        </div>

        {/* Card 3: Leads Captured */}
        <div className="p-4 bg-[#0A0A0A] border border-[#222222] rounded-2xl flex items-center justify-between shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-zinc-400">Leads captured</p>
            <p className="text-2xl font-bold text-white tracking-tight">{leadsCapturedCount.toLocaleString()}</p>
            <p className="text-xs text-zinc-500 font-medium">Contact extractions</p>
          </div>
          <div className="p-2.5 rounded-xl bg-[#141414] border border-[#262626] text-white shrink-0">
            <Zap className="w-4 h-4" strokeWidth={1.75} />
          </div>
        </div>

        {/* Card 4: Skipped / Filtered */}
        <div className="p-4 bg-[#0A0A0A] border border-[#222222] rounded-2xl flex items-center justify-between shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-zinc-400">Skipped / Filtered</p>
            <p className="text-2xl font-bold text-white tracking-tight">{skippedOrRestrictedCount.toLocaleString()}</p>
            <p className="text-xs text-zinc-500 font-medium">No match or quota</p>
          </div>
          <div className="p-2.5 rounded-xl bg-[#141414] border border-[#262626] text-white shrink-0">
            <ScrollText className="w-4 h-4" strokeWidth={1.75} />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. Search & Filter Controls */}
      {/* ========================================================================= */}
      <div className="bg-[#0A0A0A] border border-[#222222] rounded-2xl p-3 flex flex-wrap gap-3 items-center justify-between shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username, text, error..."
            className="w-full h-10 pl-9 pr-3 bg-[#111111] border border-[#262626] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Status Tabs */}
          <div className="flex items-center bg-[#111111] border border-[#262626] rounded-xl p-1 text-xs font-medium text-zinc-400">
            <button
              type="button"
              onClick={() => setSelectedStatus("ALL")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedStatus === "ALL" ? "bg-[#222222] text-white shadow-sm" : "hover:text-zinc-200"
              }`}
            >
              All status
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus("SUCCESS")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedStatus === "SUCCESS" ? "bg-[#222222] text-white shadow-sm" : "hover:text-zinc-200"
              }`}
            >
              Delivered
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus("LEAD_CAPTURED")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedStatus === "LEAD_CAPTURED" ? "bg-[#222222] text-white shadow-sm" : "hover:text-zinc-200"
              }`}
            >
              Lead captured
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus("FAILED")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedStatus === "FAILED" ? "bg-[#222222] text-white shadow-sm" : "hover:text-zinc-200"
              }`}
            >
              Failed
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus("SKIPPED")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedStatus === "SKIPPED" ? "bg-[#222222] text-white shadow-sm" : "hover:text-zinc-200"
              }`}
            >
              Skipped
            </button>
          </div>

          {/* Source Custom Dropdown */}
          <DropdownSelect
            value={selectedSource}
            onChange={setSelectedSource}
            options={[
              { value: "ALL", label: "All sources" },
              { value: "COMMENTS", label: "Comments" },
              { value: "STORIES", label: "Stories" },
              { value: "DIRECT_MESSAGES", label: "Direct messages" },
            ]}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. Live Execution Logs Stream (Linear / Vercel Architecture) */}
      {/* ========================================================================= */}
      {initialLogs.length === 0 ? (
        /* Empty State (0 logs recorded) */
        <div className="bg-[#0A0A0A] border border-[#222222] rounded-2xl p-12 text-center my-8 space-y-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="w-12 h-12 rounded-2xl bg-[#111111] border border-[#222222] flex items-center justify-center mx-auto text-zinc-500">
            <ScrollText className="w-6 h-6" strokeWidth={1.75} />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-semibold text-white">No activity recorded yet</h3>
            <p className="text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
              When followers comment trigger keywords on your posts or send DMs, real-time dispatch logs will stream here.
            </p>
          </div>
        </div>
      ) : filteredLogs.length === 0 ? (
        /* Zero Match Filter State */
        <div className="p-12 text-center bg-[#0A0A0A] border border-[#222222] rounded-2xl text-xs space-y-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <Filter className="w-6 h-6 text-zinc-500 mx-auto" />
          <p className="text-zinc-200 font-medium text-sm">No activity logs match your filter criteria</p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSelectedStatus("ALL");
              setSelectedSource("ALL");
            }}
            className="text-xs font-medium text-white hover:underline pt-1"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        /* Logs Stream Table */
        <div className="bg-[#0A0A0A] border border-[#222222] rounded-2xl overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1F1F23] bg-[#0A0A0A] text-xs font-medium text-zinc-400">
                  <th className="py-3 px-4 font-medium">User & event</th>
                  <th className="py-3 px-4 font-medium">Automation rule</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F23]">
                {filteredLogs.map((log) => {
                  const timeAgo = formatTimeAgo(log.timestamp);
                  const isComment = log.triggerSource === "COMMENT" || log.triggerSource === "COMMENTS";
                  const isStory = log.triggerSource === "STORY_MENTION" || log.triggerSource === "STORY_MENTIONS";

                  return (
                    <tr
                      key={log.id}
                      className="bg-[#0A0A0A] hover:bg-[#0E0E10] border-b border-[#1F1F23] transition-colors group"
                    >
                      {/* 1. Left Section: User & Action Narrative */}
                      <td className="py-3.5 px-4 min-w-[280px] align-middle">
                        <div className="flex items-center gap-3">
                          {/* 28px Crisp Circular Avatar */}
                          <div className="w-7 h-7 rounded-full overflow-hidden bg-[#141414] border border-[#262626] flex items-center justify-center shrink-0 shadow-inner">
                            <img
                              src={getCommenterAvatar(log.commenterUsername)}
                              alt={log.commenterUsername}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          <div className="space-y-0.5 truncate">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-white truncate">
                                @{log.commenterUsername}
                              </p>
                              {log.isFollower ? (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
                                  Follower
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#141414] border border-[#262626] text-zinc-400">
                                  Not following
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-400 font-normal truncate max-w-xs sm:max-w-md">
                              {isComment ? (
                                <span>
                                  commented <span className="text-zinc-200 font-normal">"{log.commentText}"</span>
                                </span>
                              ) : isStory ? (
                                <span>mentioned you in a story</span>
                              ) : (
                                <span>
                                  sent DM <span className="text-zinc-200 font-normal">"{log.commentText}"</span>
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 2. Middle Section: Matched Automation Rule */}
                      <td className="py-3.5 px-4 min-w-[200px] align-middle">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium text-zinc-200 truncate">
                            {log.automation?.name || "Direct Trigger Rule"}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {isStory
                              ? "Story mention trigger"
                              : "Private DM + Link delivered"}
                          </p>
                        </div>
                      </td>

                      {/* 3. Right Section: Status Indicator */}
                      <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            {log.dmStatus === "SUCCESS" ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <span className="text-xs font-medium text-emerald-400">
                                  Delivered
                                </span>
                              </>
                            ) : log.dmStatus === "LEAD_CAPTURED" ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                <span className="text-xs font-medium text-white">
                                  Lead captured
                                </span>
                              </>
                            ) : log.dmStatus === "FAILED" ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                <span className="text-xs font-medium text-red-400">
                                  Failed
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                                <span className="text-xs font-medium text-zinc-500">
                                  {log.dmStatus === "TEST_EVENT" ? "Test event" : "Skipped"}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Error subtext if failed or skipped */}
                          {log.dmError && (
                            <p
                              className="text-xs text-zinc-500 truncate max-w-[180px]"
                              title={log.dmError}
                            >
                              {log.dmError}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* 4. Right Section: Timestamp */}
                      <td className="py-3.5 px-4 whitespace-nowrap align-middle text-right text-xs text-zinc-500 font-mono">
                        <span title={new Date(log.timestamp).toLocaleString()}>
                          {timeAgo}
                        </span>
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
  );
}

export default ActivityLogsViewer;
