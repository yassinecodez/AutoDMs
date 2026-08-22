"use client";

import { useState } from "react";
import { Loader2, Key } from "lucide-react";
import { manualConnectAccount } from "@/app/dashboard/accounts/actions";

export function ManualConnectForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    try {
      await manualConnectAccount(formData);
      setSuccess(true);
      e.currentTarget.reset();
      
      // Close manual form panel on success
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to manually connect account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-white transition-colors border border-slate-700 shadow-md active:scale-95"
      >
        <Key className="w-5 h-5 text-slate-300" />
        {open ? "Close Manual Connection" : "Connect via Access Token"}
      </button>

      {open && (
        <form
          onSubmit={handleSubmit}
          className="p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-4 max-w-md animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <h3 className="font-bold text-sm text-white">Manual Connection Configuration</h3>

          {error && (
            <div className="p-3 text-xs text-red-400 bg-red-950/20 border border-red-500/20 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 rounded-lg">
              Account linked successfully!
            </div>
          )}

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label htmlFor="pageId" className="font-medium text-slate-300">
                Facebook Page ID
              </label>
              <input
                id="pageId"
                name="pageId"
                type="text"
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white"
                placeholder="e.g. 1048472918471"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="instagramId" className="font-medium text-slate-300">
                Instagram Account ID
              </label>
              <input
                id="instagramId"
                name="instagramId"
                type="text"
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white"
                placeholder="e.g. 178414002947192"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="username" className="font-medium text-slate-300">
                Username / Name
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white"
                placeholder="e.g. fitness_coach"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="accessToken" className="font-medium text-slate-300">
                Page Access Token
              </label>
              <textarea
                id="accessToken"
                name="accessToken"
                required
                rows={3}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-white font-mono text-[10px]"
                placeholder="EAAGm0PX4E1gBA..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg transition-colors text-xs flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Connect Account"
            )}
          </button>
        </form>
      )}
    </div>
  );
}
export default ManualConnectForm;
