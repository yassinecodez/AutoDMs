import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SidebarNav from "@/components/SidebarNav";
import SignOutButton from "@/components/SignOutButton";
import Link from "next/link";
import { db } from "@/lib/db";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const [user, igAccount] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: { dmsCountThisMonth: true, dmsLimit: true, planType: true },
    }),
    db.igAccount.findFirst({
      where: { userId: session.user.id },
      select: { pageName: true },
    }),
  ]);

  const dmsCount = user?.dmsCountThisMonth || 0;
  const dmsLimit = user?.dmsLimit || 150;
  const usagePct = Math.min(Math.round((dmsCount / dmsLimit) * 100), 100);

  return (
    <div className="flex h-screen bg-[#000000] overflow-hidden text-zinc-100 font-sans selection:bg-white/20 selection:text-white">
      {/* 240px Fixed Sidebar */}
      <aside className="w-[240px] bg-[#0A0A0A] border-r border-[#222222] flex flex-col justify-between shrink-0">
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="h-14 flex items-center justify-between px-5 border-b border-[#222222]">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-white text-sm tracking-tight select-none">
              <span className="w-2 h-2 rounded-full bg-white inline-block shrink-0" />
              <span>AutoDMs</span>
            </Link>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#111111] text-zinc-400 border border-[#222222]">
              v1.0
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-3">
            <SidebarNav />
          </nav>
        </div>

        <div>
          {/* Connected Profile Status & Monthly Meter */}
          <div className="p-3 mx-3 mb-3 bg-[#111111] border border-[#222222] rounded-xl space-y-2.5 shrink-0">
            {igAccount ? (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400 font-medium truncate">@{igAccount.pageName}</span>
                <span className="flex items-center gap-1 text-[10px] text-zinc-300 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Live
                </span>
              </div>
            ) : (
              <div className="text-[11px] text-zinc-500">
                <span>No profile linked</span>
              </div>
            )}

            {/* Quota Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
                <span>DMs: <strong className="text-white">{dmsCount}</strong>/{dmsLimit}</span>
                <span className="text-zinc-300">{usagePct}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#000000] rounded-full overflow-hidden border border-[#222222]">
                <div
                  style={{ width: `${usagePct}%` }}
                  className="h-full bg-white rounded-full transition-all duration-300"
                />
              </div>
            </div>

            <Link
              href="/dashboard/settings"
              className="block text-center text-[10px] font-medium text-zinc-300 hover:text-white transition-colors"
            >
              Manage Plan &rarr;
            </Link>
          </div>

          {/* User Footer Profile */}
          <div className="p-3 px-4 border-t border-[#222222] flex items-center justify-between gap-2.5 bg-[#0A0A0A]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#1A1A1A] border border-[#262626] flex items-center justify-center font-medium text-xs text-white uppercase shrink-0">
                {(session.user.name || session.user.email || "U")[0]}
              </div>
              <div className="truncate">
                <p className="text-xs font-medium text-white truncate">{session.user.name || session.user.email}</p>
                <p className="text-[10px] text-zinc-500 truncate">{session.user.email}</p>
              </div>
            </div>
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-[#000000]">
        {children}
      </main>
    </div>
  );
}
