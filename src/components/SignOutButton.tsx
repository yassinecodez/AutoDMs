"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="p-1.5 text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded-lg transition-colors"
      title="Sign out"
    >
      <LogOut className="w-4 h-4" strokeWidth={1.75} />
    </button>
  );
}
export default SignOutButton;
