"use client";

import { useState } from "react";
import { Loader2, Plus, Settings, Trash2, ToggleLeft, ToggleRight, MessageSquare, Key, AlertTriangle } from "lucide-react";
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
      // Fetch updated list or append locally
      // For simplicity, reload window or refresh routes. Since we're in Next.js, 
      // the best approach to reflect Server Actions is letting the page revalidate.
      // We will reload to sync instantly.
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
                  <h3 className="text-lg font-bold text-white truncate max-w-[200px]" title={auto.name}>
                    {auto.name}
                  </h3>
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

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Trigger:</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold uppercase tracking-wider text-[10px]">
                      {auto.triggerType === "ALL"
                        ? "Any Comment"
                        : auto.triggerType === "EXACT"
                        ? "Exact Match"
                        : "Contains Keyword"}
                    </span>
                    {auto.triggerKeyword && (
                      <span className="text-violet-400 font-mono font-bold">"{auto.triggerKeyword}"</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 block">Private Reply (DM):</span>
                    <p className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-mono text-[11px] leading-relaxed break-words">
                      {auto.replyDmMessage}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 block">
                      Public Comment Replies ({auto.replyCommentOptions.length} options):
                    </span>
                    {auto.replyCommentOptions.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {auto.replyCommentOptions.map((opt, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 rounded bg-slate-950 border border-slate-850 text-slate-400 text-[10px] truncate max-w-[150px]"
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
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
              <h3 className="font-extrabold text-white text-base">New Automation Rule</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white font-semibold text-sm"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {error && (
                <div className="p-3 text-xs text-red-400 bg-red-950/20 border border-red-500/20 rounded-lg">
                  {error}
                </div>
              )}

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
                    <option value="ALL">Any Comment (Universal)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Keyword {triggerType === "ALL" && "(Disabled)"}
                  </label>
                  <input
                    name="triggerKeyword"
                    type="text"
                    disabled={triggerType === "ALL"}
                    required={triggerType !== "ALL"}
                    placeholder={triggerType === "ALL" ? "N/A" : "e.g. discount"}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Private Reply message (DM)</label>
                <textarea
                  name="replyDmMessage"
                  required
                  rows={3}
                  placeholder="Hey! Here's the access link you requested: https://example.com/checkout 🚀"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm text-white leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Public Comment Replies <span className="text-[10px] text-slate-500 font-normal">(One option per line - randomized)</span>
                </label>
                <textarea
                  name="replyCommentOptions"
                  rows={3}
                  placeholder="Just sent you a DM! Check your inbox 📥&#10;Sent! Let me know if you got it 🚀&#10;Check your messages!"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm text-white leading-relaxed font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-violet-500/10"
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
