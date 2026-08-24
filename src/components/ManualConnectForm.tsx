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
    <div className="space-y-3">
      <button
        onClick={() => setOpen(!open)}
        className="h-10 inline-flex items-center justify-center gap-2 px-4 rounded-lg bg-[#18181B] hover:bg-zinc-800 font-medium text-xs text-zinc-300 transition-colors border border-[#27272A] active:scale-95"
      >
        <Key className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.75} />
        {open ? "Close manual form" : "Connect with Token"}
      </button>

      {open && (
        <form
          onSubmit={handleSubmit}
          className="p-5 bg-[#18181B] border border-[#27272A] rounded-xl space-y-3.5 max-w-md animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <h3 className="font-bold text-xs text-zinc-100">Manual Meta Token Configuration</h3>

          {error && (
            <div className="p-2.5 text-xs text-red-400 bg-red-950/20 border border-red-500/20 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="p-2.5 text-xs text-[#00DF81] bg-[#00DF81]/10 border border-[#00DF81]/20 rounded-lg">
              Account linked successfully!
            </div>
          )}

          <div className="space-y-2.5 text-xs">
            <div className="space-y-1">
              <label htmlFor="pageId" className="font-medium text-zinc-400 text-[11px]">
                Facebook Page ID
              </label>
              <input
                id="pageId"
                name="pageId"
                type="text"
                required
                className="w-full px-3 py-1.5 bg-[#0F0F0F] border border-[#27272A] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00DF81] text-zinc-100 text-xs"
                placeholder="e.g. 1048472918471"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="instagramId" className="font-medium text-zinc-400 text-[11px]">
                Instagram Account ID
              </label>
              <input
                id="instagramId"
                name="instagramId"
                type="text"
                required
                className="w-full px-3 py-1.5 bg-[#0F0F0F] border border-[#27272A] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00DF81] text-zinc-100 text-xs"
                placeholder="e.g. 178414002947192"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="username" className="font-medium text-zinc-400 text-[11px]">
                Username / Handle
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="w-full px-3 py-1.5 bg-[#0F0F0F] border border-[#27272A] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00DF81] text-zinc-100 text-xs"
                placeholder="e.g. your_brand"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="accessToken" className="font-medium text-zinc-400 text-[11px]">
                Page Access Token
              </label>
              <textarea
                id="accessToken"
                name="accessToken"
                required
                rows={3}
                className="w-full px-3 py-1.5 bg-[#0F0F0F] border border-[#27272A] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00DF81] text-zinc-100 font-mono text-[10px]"
                placeholder="EAAGm0PX4E1gBA..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-9 bg-[#00DF81] hover:bg-[#00C770] text-black font-semibold rounded-lg transition-colors text-xs flex items-center justify-center gap-1.5"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : "Save and Connect"}
          </button>
        </form>
      )}
    </div>
  );
}
export default ManualConnectForm;
