"use client";

import { useState, useMemo } from "react";
import {
  Search,
  MessageCircle,
  Sparkles,
  Inbox,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Filter,
  ScrollText,
  Send,
  Zap,
  Users,
  Clock,
  ArrowUpRight,
} from "lucide-react";

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

    return date.toLocaleDateString([], { month: "short", day: "numeric" });
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Card 1: Total Dispatches */}
        <div className="p-4 bg-[#0A0A0A] border border-[#222222] rounded-2xl flex items-center justify-between shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="space-y-0.5">
            <p className="text-[11px] font-medium text-zinc-400">Total Dispatches</p>
            <p className="text-2xl font-bold text-white tracking-tight">{totalDispatches.toLocaleString()}</p>
            <p className="text-[10px] text-zinc-500 font-mono">Live webhook triggers</p>
          </div>
          <div className="p-2.5 rounded-xl bg-[#141414] border border-[#262626] text-white shrink-0">
            <Send className="w-4 h-4" strokeWidth={1.75} />
          </div>
        </div>

        {/* Card 2: Delivery Success Rate */}
        <div className="p-4 bg-[#0A0A0A] border border-[#222222] rounded-2xl flex items-center justify-between shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="space-y-0.5">
            <p className="text-[11px] font-medium text-zinc-400">Delivery Success Rate</p>
            <p className="text-2xl font-bold text-white tracking-tight">{successRate}%</p>
            <p className="text-[10px] text-zinc-500 font-mono">{deliveredCount} delivered</p>
          </div>
          <div className="p-2.5 rounded-xl bg-[#141414] border border-[#262626] text-white shrink-0">
            <CheckCircle2 className="w-4 h-4" strokeWidth={1.75} />
          </div>
        </div>

        {/* Card 3: Leads Captured */}
        <div className="p-4 bg-[#0A0A0A] border border-[#222222] rounded-2xl flex items-center justify-between shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="space-y-0.5">
            <p className="text-[11px] font-medium text-zinc-400">Leads Captured</p>
            <p className="text-2xl font-bold text-white tracking-tight">{leadsCapturedCount.toLocaleString()}</p>
            <p className="text-[10px] text-zinc-500 font-mono">Contact extractions</p>
          </div>
          <div className="p-2.5 rounded-xl bg-[#141414] border border-[#262626] text-white shrink-0">
            <Users className="w-4 h-4" strokeWidth={1.75} />
          </div>
        </div>

        {/* Card 4: Skipped / Quota */}
        <div className="p-4 bg-[#0A0A0A] border border-[#222222] rounded-2xl flex items-center justify-between shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="space-y-0.5">
            <p className="text-[11px] font-medium text-zinc-400">Skipped / Filtered</p>
            <p className="text-2xl font-bold text-white tracking-tight">{skippedOrRestrictedCount.toLocaleString()}</p>
            <p className="text-[10px] text-zinc-500 font-mono">No match or quota</p>
          </div>
          <div className="p-2.5 rounded-xl bg-[#141414] border border-[#262626] text-white shrink-0">
            <Zap className="w-4 h-4" strokeWidth={1.75} />
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
            className="bg-[#111111] border border-[#262626] rounded-lg h-9 pl-9 pr-3 text-sm text-white placeholder-zinc-500 w-full focus:outline-none focus:border-zinc-500 transition-colors"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Status Tabs */}
          <div className="flex items-center bg-[#111111] border border-[#262626] rounded-lg p-0.5 text-xs font-medium text-zinc-400">
            <button
              onClick={() => setSelectedStatus("ALL")}
              className={`px-2.5 py-1.5 rounded-md transition-colors ${
                selectedStatus === "ALL" ? "bg-[#222222] text-white" : "hover:text-zinc-200"
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setSelectedStatus("SUCCESS")}
              className={`px-2.5 py-1.5 rounded-md transition-colors ${
                selectedStatus === "SUCCESS" ? "bg-[#222222] text-white" : "hover:text-zinc-200"
              }`}
            >
              Success
            </button>
            <button
              onClick={() => setSelectedStatus("LEAD_CAPTURED")}
              className={`px-2.5 py-1.5 rounded-md transition-colors ${
                selectedStatus === "LEAD_CAPTURED" ? "bg-[#222222] text-white" : "hover:text-zinc-200"
              }`}
            >
              Lead Captured
            </button>
            <button
              onClick={() => setSelectedStatus("FAILED")}
              className={`px-2.5 py-1.5 rounded-md transition-colors ${
                selectedStatus === "FAILED" ? "bg-[#222222] text-white" : "hover:text-zinc-200"
              }`}
            >
              Failed
            </button>
            <button
              onClick={() => setSelectedStatus("SKIPPED")}
              className={`px-2.5 py-1.5 rounded-md transition-colors ${
                selectedStatus === "SKIPPED" ? "bg-[#222222] text-white" : "hover:text-zinc-200"
              }`}
            >
              Skipped
            </button>
          </div>

          {/* Source Dropdown */}
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="bg-[#111111] border border-[#262626] rounded-lg h-9 px-3 text-xs font-medium text-zinc-300 focus:outline-none focus:border-zinc-500 transition-colors"
          >
            <option value="ALL">All Sources</option>
            <option value="COMMENTS">Comments</option>
            <option value="STORIES">Stories</option>
            <option value="DIRECT_MESSAGES">Direct Messages</option>
          </select>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. Live Execution Logs Table */}
      {/* ========================================================================= */}
      {initialLogs.length === 0 ? (
        /* Empty State (0 logs recorded) */
        <div className="border border-dashed border-[#262626] rounded-2xl p-12 text-center my-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#111111] border border-[#222222] flex items-center justify-center mx-auto text-zinc-400">
            <ScrollText className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-white">No activity recorded yet</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
              When followers comment trigger keywords on your posts or send DMs, real-time dispatch logs will stream here.
            </p>
          </div>
        </div>
      ) : filteredLogs.length === 0 ? (
        /* Zero Match Filter State */
        <div className="p-12 text-center bg-[#0A0A0A] border border-[#222222] rounded-2xl text-xs space-y-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <Filter className="w-6 h-6 text-zinc-500 mx-auto" />
          <p className="text-zinc-200 font-medium">No activity logs match your filter criteria</p>
          <button
            onClick={() => {
              setSearch("");
              setSelectedStatus("ALL");
              setSelectedSource("ALL");
            }}
            className="text-xs font-medium text-white hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Logs Data Table */
        <div className="bg-[#0A0A0A] border border-[#222222] rounded-2xl overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider bg-[#0d0d0d] border-b border-[#222222]">
                  <th className="py-3.5 px-4">Time</th>
                  <th className="py-3.5 px-4">Source</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Input Message</th>
                  <th className="py-3.5 px-4">Rule Matched</th>
                  <th className="py-3.5 px-4">Status & Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222] text-xs">
                {filteredLogs.map((log) => {
                  const timeAgo = formatTimeAgo(log.timestamp);
                  const isComment = log.triggerSource === "COMMENT" || log.triggerSource === "COMMENTS";
                  const isStory = log.triggerSource === "STORY_MENTION" || log.triggerSource === "STORY_MENTIONS";

                  return (
                    <tr
                      key={log.id}
                      className="bg-[#0A0A0A] hover:bg-[#111111] transition-colors group"
                    >
                      {/* 1. Time Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[11px]">
                          <Clock className="w-3 h-3 text-zinc-600" />
                          <span title={new Date(log.timestamp).toLocaleString()}>
                            {timeAgo}
                          </span>
                        </div>
                      </td>

                      {/* 2. Source Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-[#141414] border border-[#262626] text-zinc-300">
                          {isComment ? (
                            <>
                              <MessageCircle className="w-3 h-3 text-zinc-400" />
                              Comment
                            </>
                          ) : isStory ? (
                            <>
                              <Sparkles className="w-3 h-3 text-zinc-400" />
                              Story
                            </>
                          ) : (
                            <>
                              <Inbox className="w-3 h-3 text-zinc-400" />
                              Direct DM
                            </>
                          )}
                        </span>
                      </td>

                      {/* 3. User Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-white">
                          @{log.commenterUsername}
                        </span>
                      </td>

                      {/* 4. Input Message Column */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p
                          className="text-xs text-zinc-300 font-mono bg-[#141414] px-2 py-1 rounded border border-[#222222] truncate max-w-xs"
                          title={log.commentText}
                        >
                          "{log.commentText}"
                        </p>
                      </td>

                      {/* 5. Rule Matched Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {log.automation?.name ? (
                          <span className="text-xs text-white font-medium">
                            {log.automation.name}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-500 italic">—</span>
                        )}
                      </td>

                      {/* 6. Status & Details Column */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            {log.dmStatus === "SUCCESS" ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[11px] font-medium text-emerald-400">
                                  Delivered
                                </span>
                              </>
                            ) : log.dmStatus === "LEAD_CAPTURED" ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                <span className="text-[11px] font-medium text-white">
                                  Lead Captured
                                </span>
                              </>
                            ) : log.dmStatus === "FAILED" ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                <span className="text-[11px] font-medium text-red-400">
                                  Failed
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                                <span className="text-[11px] font-medium text-zinc-400">
                                  {log.dmStatus === "TEST_EVENT" ? "Test Event" : "Skipped"}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Error subtext if failed or skipped */}
                          {log.dmError && (
                            <p
                              className="text-[10px] text-zinc-500 truncate max-w-[220px]"
                              title={log.dmError}
                            >
                              {log.dmError}
                            </p>
                          )}
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
  );
}

export default ActivityLogsViewer;
