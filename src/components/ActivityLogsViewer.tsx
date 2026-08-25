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
        <div className="p-4 bg-card border border-border rounded-2xl flex items-center justify-between shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-muted-foreground">Total dispatches</p>
            <p className="text-2xl font-bold text-foreground tracking-tight">{totalDispatches.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground font-medium">Live webhook triggers</p>
          </div>
          <div className="p-2.5 rounded-xl bg-secondary border border-border text-foreground shrink-0">
            <Send className="w-4 h-4" strokeWidth={1.75} />
          </div>
        </div>

        {/* Card 2: Delivery Success Rate */}
        <div className="p-4 bg-card border border-border rounded-2xl flex items-center justify-between shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-muted-foreground">Success rate</p>
            <p className="text-2xl font-bold text-foreground tracking-tight">{successRate}%</p>
            <p className="text-xs text-muted-foreground font-medium">{deliveredCount} delivered</p>
          </div>
          <div className="p-2.5 rounded-xl bg-secondary border border-border text-foreground shrink-0">
            <CheckCircle2 className="w-4 h-4" strokeWidth={1.75} />
          </div>
        </div>

        {/* Card 3: Leads Captured */}
        <div className="p-4 bg-card border border-border rounded-2xl flex items-center justify-between shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-muted-foreground">Leads captured</p>
            <p className="text-2xl font-bold text-foreground tracking-tight">{leadsCapturedCount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground font-medium">Contact extractions</p>
          </div>
          <div className="p-2.5 rounded-xl bg-secondary border border-border text-foreground shrink-0">
            <Zap className="w-4 h-4" strokeWidth={1.75} />
          </div>
        </div>

        {/* Card 4: Skipped / Filtered */}
        <div className="p-4 bg-card border border-border rounded-2xl flex items-center justify-between shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-muted-foreground">Skipped / Filtered</p>
            <p className="text-2xl font-bold text-foreground tracking-tight">{skippedOrRestrictedCount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground font-medium">No match or quota</p>
          </div>
          <div className="p-2.5 rounded-xl bg-secondary border border-border text-foreground shrink-0">
            <ScrollText className="w-4 h-4" strokeWidth={1.75} />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. Search & Filter Controls */}
      {/* ========================================================================= */}
      <div className="bg-card border border-border rounded-2xl p-3 flex flex-wrap gap-3 items-center justify-between shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username, text, error..."
            className="w-full h-10 pl-9 pr-3 bg-secondary border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Status Tabs */}
          <div className="flex items-center bg-secondary border border-border rounded-xl p-1 text-xs font-medium text-muted-foreground">
            <button
              type="button"
              onClick={() => setSelectedStatus("ALL")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedStatus === "ALL" ? "bg-card text-foreground shadow-sm font-semibold" : "hover:text-foreground"
              }`}
            >
              All status
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus("SUCCESS")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedStatus === "SUCCESS" ? "bg-card text-foreground shadow-sm font-semibold" : "hover:text-foreground"
              }`}
            >
              Delivered
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus("LEAD_CAPTURED")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedStatus === "LEAD_CAPTURED" ? "bg-card text-foreground shadow-sm font-semibold" : "hover:text-foreground"
              }`}
            >
              Lead captured
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus("FAILED")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedStatus === "FAILED" ? "bg-card text-foreground shadow-sm font-semibold" : "hover:text-foreground"
              }`}
            >
              Failed
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus("SKIPPED")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedStatus === "SKIPPED" ? "bg-card text-foreground shadow-sm font-semibold" : "hover:text-foreground"
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
        <div className="bg-card border border-border rounded-2xl p-12 text-center my-8 space-y-4 shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="w-12 h-12 rounded-2xl bg-secondary border border-border flex items-center justify-center mx-auto text-muted-foreground">
            <ScrollText className="w-6 h-6" strokeWidth={1.75} />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-semibold text-foreground">No activity recorded yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              When followers comment trigger keywords on your posts or send DMs, real-time dispatch logs will stream here.
            </p>
          </div>
        </div>
      ) : filteredLogs.length === 0 ? (
        /* Zero Match Filter State */
        <div className="p-12 text-center bg-card border border-border rounded-2xl text-xs space-y-3 shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <Filter className="w-6 h-6 text-muted-foreground mx-auto" />
          <p className="text-foreground font-medium text-sm">No activity logs match your filter criteria</p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSelectedStatus("ALL");
              setSelectedSource("ALL");
            }}
            className="text-xs font-semibold text-foreground hover:underline pt-1"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        /* Logs Stream Table (12-Column Linear / Vercel Grid) */
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          {/* Header Row */}
          <div className="grid grid-cols-12 px-5 py-3 text-xs font-medium text-muted-foreground border-b border-border bg-card rounded-t-xl gap-3 sm:gap-4">
            <div className="col-span-5 font-medium">User & event</div>
            <div className="col-span-3 font-medium">Automation rule</div>
            <div className="col-span-2 font-medium">Status</div>
            <div className="col-span-2 font-medium text-right">Time</div>
          </div>

          {/* Rows Stream */}
          <div className="divide-y divide-border">
            {filteredLogs.map((log) => {
              const timeAgo = formatTimeAgo(log.timestamp);
              const isComment = log.triggerSource === "COMMENT" || log.triggerSource === "COMMENTS";
              const isStory = log.triggerSource === "STORY_MENTION" || log.triggerSource === "STORY_MENTIONS";
              const initial = (log.commenterUsername ? log.commenterUsername[0] : "U").toUpperCase();
              const avatarUrl = getCommenterAvatar(log.commenterUsername);

              return (
                <div
                  key={log.id}
                  className="grid grid-cols-12 items-center px-5 py-3.5 border-b border-border bg-card hover:bg-zinc-50 dark:hover:bg-[#0E0E10] transition-colors last:border-b-0 last:rounded-b-xl gap-3 sm:gap-4"
                >
                  {/* Columns 1-5: User & Event (42% width) */}
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    {/* 36px Crisp Avatar */}
                    <div className="h-9 w-9 flex-shrink-0 rounded-full overflow-hidden bg-secondary border border-border text-foreground font-semibold text-sm flex items-center justify-center shadow-inner">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={log.commenterUsername}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span>{initial}</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground truncate">
                          @{log.commenterUsername}
                        </span>
                        {log.isFollower ? (
                          <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[11px] font-medium px-2 py-0.5 rounded-md shrink-0">
                            Follower
                          </span>
                        ) : (
                          <span className="bg-secondary text-muted-foreground border border-border text-[11px] font-medium px-2 py-0.5 rounded-md shrink-0">
                            Not following
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {isComment ? (
                          <span>
                            commented <span className="text-foreground font-normal">&quot;{log.commentText}&quot;</span>
                          </span>
                        ) : isStory ? (
                          <span>mentioned you in a story</span>
                        ) : (
                          <span>
                            sent DM <span className="text-foreground font-normal">&quot;{log.commentText}&quot;</span>
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Columns 6-8: Automation Rule (25% width) */}
                  <div className="col-span-3 min-w-0 space-y-0.5">
                    <p className="text-sm font-medium text-foreground truncate">
                      {log.automation?.name || "Direct Trigger Rule"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {isStory ? "Story mention trigger" : "Private DM + Link delivered"}
                    </p>
                  </div>

                  {/* Columns 9-10: Status (18% width) */}
                  <div className="col-span-2 min-w-0">
                    <div className="w-fit flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary border border-border">
                      {log.dmStatus === "SUCCESS" ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span className="text-xs font-medium text-emerald-500">
                            Delivered
                          </span>
                        </>
                      ) : log.dmStatus === "LEAD_CAPTURED" ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          <span className="text-xs font-medium text-foreground">
                            Lead captured
                          </span>
                        </>
                      ) : log.dmStatus === "FAILED" ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                          <span className="text-xs font-medium text-red-500">
                            Failed
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground shrink-0" />
                          <span className="text-xs font-medium text-muted-foreground">
                            {log.dmStatus === "TEST_EVENT" ? "Test event" : "Skipped"}
                          </span>
                        </>
                      )}
                    </div>
                    {log.dmError && (
                      <p className="text-xs text-red-500 truncate max-w-[150px] mt-0.5" title={log.dmError}>
                        {log.dmError}
                      </p>
                    )}
                  </div>

                  {/* Columns 11-12: Time (15% width) */}
                  <div className="col-span-2 text-right text-xs text-muted-foreground font-mono">
                    <span title={new Date(log.timestamp).toLocaleString()}>
                      {timeAgo}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivityLogsViewer;
