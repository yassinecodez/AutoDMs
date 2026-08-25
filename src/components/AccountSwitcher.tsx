"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronsUpDown, Check, Plus, Loader2 } from "lucide-react";
import { switchActiveAccountAction } from "@/app/actions/switchAccount";

interface AccountItem {
  id: string;
  pageName: string;
  profilePictureUrl: string | null;
}

interface AccountSwitcherProps {
  accounts: AccountItem[];
  activeAccountId: string | null;
}

export default function AccountSwitcher({
  accounts,
  activeAccountId,
}: AccountSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeAccount =
    accounts.find((a) => a.id === activeAccountId) || accounts[0] || null;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectAccount = async (accountId: string) => {
    if (accountId === activeAccount?.id) {
      setOpen(false);
      return;
    }
    setSwitchingId(accountId);
    try {
      await switchActiveAccountAction(accountId);
      setOpen(false);
      router.refresh();
    } catch (err) {
      console.error("Failed to switch account:", err);
    } finally {
      setSwitchingId(null);
    }
  };

  if (!activeAccount && accounts.length === 0) {
    return (
      <Link
        href="/dashboard/accounts"
        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#111111] hover:bg-[#181818] border border-[#222222] hover:border-zinc-700 transition-all text-xs text-zinc-300 group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-[#181818] border border-[#2B2B2B] flex items-center justify-center text-zinc-400 group-hover:text-white">
            <Plus className="w-3.5 h-3.5" />
          </div>
          <span className="font-medium truncate">Connect Instagram</span>
        </div>
        <span className="text-[10px] text-zinc-500 font-mono">+ Add</span>
      </Link>
    );
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-2 rounded-xl bg-[#111111] hover:bg-[#161616] border border-[#222222] hover:border-zinc-700 transition-all duration-150 text-left focus:outline-none shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full overflow-hidden bg-[#181818] border border-[#2B2B2B] flex items-center justify-center shrink-0 shadow-inner">
            {activeAccount.profilePictureUrl ? (
              <img
                src={activeAccount.profilePictureUrl}
                alt={activeAccount.pageName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-[10px] font-bold text-white">
                {(activeAccount.pageName ? activeAccount.pageName[0] : "I").toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-white truncate">
                @{activeAccount.pageName}
              </span>
              <svg className="w-3 h-3 text-[#0095F6] fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7l-4.2-4.2 1.4-1.4 2.8 2.8 6.8-6.8 1.4 1.4-8.2 8.2z" />
              </svg>
            </div>
            <span className="text-[10px] text-zinc-500 block -mt-0.5 font-mono">Workspace</span>
          </div>
        </div>

        <ChevronsUpDown className="w-3.5 h-3.5 text-zinc-500 shrink-0 ml-1.5" />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#0D0D0D] border border-[#262626] rounded-2xl p-1.5 shadow-2xl space-y-1 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-2.5 py-1.5 flex items-center justify-between border-b border-[#202020] mb-1">
            <span className="text-[11px] font-medium text-zinc-400">Switch workspace</span>
            <span className="text-[10px] font-mono text-zinc-500 bg-[#161616] px-1.5 py-0.2 rounded border border-[#262626]">
              {accounts.length} {accounts.length === 1 ? "profile" : "profiles"}
            </span>
          </div>

          {/* Account List */}
          <div className="max-h-48 overflow-y-auto space-y-0.5">
            {accounts.map((acc) => {
              const isSelected = acc.id === activeAccount.id;
              const isSwitching = switchingId === acc.id;

              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleSelectAccount(acc.id)}
                  disabled={isSwitching}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all text-xs ${
                    isSelected
                      ? "bg-[#181818] text-white"
                      : "text-zinc-300 hover:bg-[#141414] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-[#1C1C1C] border border-[#2B2B2B] flex items-center justify-center shrink-0">
                      {acc.profilePictureUrl ? (
                        <img
                          src={acc.profilePictureUrl}
                          alt={acc.pageName}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-[9px] font-bold text-white">
                          {(acc.pageName ? acc.pageName[0] : "I").toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="font-medium truncate">@{acc.pageName}</span>
                  </div>

                  <div className="shrink-0 ml-2">
                    {isSwitching ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                    ) : isSelected ? (
                      <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer CTA: Connect New Account */}
          <div className="pt-1 border-t border-[#202020]">
            <Link
              href="/dashboard/accounts"
              onClick={() => setOpen(false)}
              className="w-full flex items-center justify-center gap-1.5 p-2 rounded-xl text-[11px] font-medium text-zinc-400 hover:text-white hover:bg-[#141414] transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Connect new profile</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
