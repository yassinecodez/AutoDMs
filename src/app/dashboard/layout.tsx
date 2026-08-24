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
    <div className="flex h-screen bg-[#0F0F0F] overflow-hidden text-zinc-100 font-sans selection:bg-[#00DF81]/25 selection:text-white">
      {/* 240px Fixed Sidebar */}
      <aside className="w-[240px] bg-[#0F0F0F] border-r border-[#27272A] flex flex-col justify-between shrink-0">
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="h-14 flex items-center justify-between px-5 border-b border-[#27272A]">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-zinc-100 text-sm tracking-tight select-none">
              <span className="w-2 h-2 rounded-full bg-[#00DF81] inline-block shrink-0 shadow-[0_0_8px_rgba(0,223,129,0.5)]" />
              <span>AutoDMs</span>
            </Link>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">
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
          <div className="p-3 mx-3 mb-3 bg-[#18181B] border border-[#27272A] rounded-xl space-y-2.5 shrink-0">
            {igAccount ? (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400 font-medium truncate">@{igAccount.pageName}</span>
                <span className="flex items-center gap-1 text-[10px] text-[#00DF81] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00DF81] animate-pulse" />
                  Live
                </span>
              </div>
            ) : (
              <div className="text-[11px] text-zinc-400">
                <span>No profile linked</span>
              </div>
            )}

            {/* Quota Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
                <span>DMs: <strong className="text-zinc-200">{dmsCount}</strong>/{dmsLimit}</span>
                <span className="text-[#00DF81] font-semibold">{usagePct}%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                <div
                  style={{ width: `${usagePct}%` }}
                  className="h-full bg-[#00DF81] rounded-full transition-all duration-300"
                />
              </div>
            </div>

            <Link
              href="/dashboard/settings"
              className="block text-center text-[10px] font-semibold text-[#00DF81] hover:text-[#00C770] transition-colors"
            >
              Manage Plan &rarr;
            </Link>
          </div>

          {/* User Footer Profile */}
          <div className="p-3 px-4 border-t border-[#27272A] flex items-center justify-between gap-2 bg-[#0F0F0F]">
            <div className="truncate">
              <p className="text-xs font-semibold text-zinc-200 truncate">{session.user.name || session.user.email}</p>
              <p className="text-[10px] text-zinc-400 truncate">{session.user.email}</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-[#0F0F0F]">
        {children}
      </main>
    </div>
  );
}
