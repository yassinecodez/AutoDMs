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
        className="h-10 inline-flex items-center justify-center gap-2 px-4 rounded-lg bg-[#111111] hover:bg-[#181818] font-medium text-xs text-zinc-300 transition-colors border border-[#262626]"
      >
        <Key className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.75} />
        {open ? "Close manual form" : "Connect with Token"}
      </button>

      {open && (
        <form
          onSubmit={handleSubmit}
          className="p-5 bg-[#0A0A0A] border border-[#222222] rounded-xl space-y-3.5 max-w-md animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <h3 className="font-semibold text-xs text-white">Manual Meta Token Configuration</h3>

          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}

          {success && (
            <p className="text-xs text-zinc-300">Account linked successfully!</p>
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
                className="w-full h-9 px-3 bg-[#111111] border border-[#262626] rounded-lg focus:outline-none focus:border-zinc-400 text-white text-xs"
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
                className="w-full h-9 px-3 bg-[#111111] border border-[#262626] rounded-lg focus:outline-none focus:border-zinc-400 text-white text-xs"
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
                className="w-full h-9 px-3 bg-[#111111] border border-[#262626] rounded-lg focus:outline-none focus:border-zinc-400 text-white text-xs"
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
                className="w-full px-3 py-1.5 bg-[#111111] border border-[#262626] rounded-lg focus:outline-none focus:border-zinc-400 text-white font-mono text-[10px]"
                placeholder="EAAGm0PX4E1gBA..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-9 bg-white hover:bg-zinc-200 text-black font-medium rounded-lg transition-colors text-xs flex items-center justify-center gap-1.5"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : "Save and Connect"}
          </button>
        </form>
      )}
    </div>
  );
}
export default ManualConnectForm;
