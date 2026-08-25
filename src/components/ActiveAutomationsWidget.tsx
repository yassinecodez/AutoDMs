"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Plus, ArrowRight, MessageCircle, Sparkles, Inbox, ExternalLink, ChevronRight } from "lucide-react";
import { toggleAutomationActive } from "@/app/dashboard/automations/actions";

export interface QuickAutomationItem {
  id: string;
  name: string;
  triggerSource: string;
  triggerKeyword: string | null;
  triggerScope: string;
  active: boolean;
  _count?: {
    logs: number;
  };
}

interface ActiveAutomationsWidgetProps {
  initialAutomations: QuickAutomationItem[];
  totalCount: number;
}

export function ActiveAutomationsWidget({
  initialAutomations,
  totalCount,
}: ActiveAutomationsWidgetProps) {
  const [automations, setAutomations] = useState<QuickAutomationItem[]>(initialAutomations);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggle = async (id: string, currentStatus: boolean) => {
    setTogglingId(id);
    // Optimistic update
    setAutomations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, active: !currentStatus } : item))
    );

    try {
      await toggleAutomationActive(id, !currentStatus);
    } catch (err) {
      console.error("Failed to toggle automation:", err);
      // Revert on error
      setAutomations((prev) =>
        prev.map((item) => (item.id === id ? { ...item, active: currentStatus } : item))
      );
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] h-full space-y-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-secondary border border-border flex items-center justify-center text-foreground">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Active automations</h3>
              <p className="text-xs text-muted-foreground">Quick switch triggers</p>
            </div>
          </div>
          <Link
            href="/dashboard/automations"
            className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <span>Manage ({totalCount})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* List or Empty State */}
        {automations.length === 0 ? (
          <div className="p-6 text-center bg-secondary/30 border border-border rounded-xl space-y-2.5 my-2">
            <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground mx-auto">
              <Zap className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-foreground">No automations created yet</p>
              <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                Create a keyword rule to automatically reply to comments or DMs.
              </p>
            </div>
            <Link
              href="/dashboard/automations/builder"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create automation</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {automations.map((auto) => {
              const dispatches = auto._count?.logs || 0;
              const isToggling = togglingId === auto.id;

              return (
                <div
                  key={auto.id}
                  className="p-3 bg-secondary/40 hover:bg-secondary/70 border border-border rounded-xl flex items-center justify-between gap-3 transition-colors group"
                >
                  {/* Left info */}
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          auto.active ? "bg-emerald-500" : "bg-zinc-400 dark:bg-zinc-600"
                        }`}
                      />
                      <Link
                        href={`/dashboard/automations/builder?edit=${auto.id}`}
                        className="text-xs font-semibold text-foreground hover:underline truncate"
                        title={auto.name}
                      >
                        {auto.name}
                      </Link>
                    </div>

                    <p className="text-[11px] text-muted-foreground truncate pl-3">
                      {auto.triggerSource === "STORY_MENTIONS" ? (
                        <span>Story mentions & tags</span>
                      ) : auto.triggerSource === "DIRECT_MESSAGES" ? (
                        <span>
                          DM: <strong className="text-foreground font-medium">&quot;{auto.triggerKeyword || "Any"}&quot;</strong>
                        </span>
                      ) : (
                        <span>
                          Keyword: <strong className="text-foreground font-medium">&quot;{auto.triggerKeyword || "Any"}&quot;</strong>
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Right side: Dispatches count + Toggle Switch */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {dispatches} sent
                    </span>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggle(auto.id, auto.active)}
                      disabled={isToggling}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        auto.active ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"
                      }`}
                      title={auto.active ? "Click to pause rule" : "Click to activate rule"}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          auto.active ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="pt-2 flex items-center justify-between gap-3 border-t border-border">
        <Link
          href="/dashboard/automations/builder"
          className="h-9 px-4 rounded-xl bg-primary text-primary-foreground hover:opacity-90 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New automation</span>
        </Link>
        <Link
          href="/dashboard/automations"
          className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <span>All rules</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default ActiveAutomationsWidget;
