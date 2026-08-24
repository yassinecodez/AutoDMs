"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
      title="Sign out"
    >
      <LogOut className="w-4 h-4" strokeWidth={1.75} />
    </button>
  );
}
export default SignOutButton;
