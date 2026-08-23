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
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { dmsCountThisMonth: true, dmsLimit: true }
  });

  const dmsCount = user?.dmsCountThisMonth || 0;
  const dmsLimit = user?.dmsLimit || 150;

  return (
    <div className="flex h-screen bg-[#0B0F17] overflow-hidden text-slate-100 font-sans selection:bg-[#00DF81]/30 selection:text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0B0F17] border-r border-[#1F2937] flex flex-col justify-between shrink-0">
        <div className="flex flex-col">
          {/* Logo & Brand */}
          <div className="h-16 flex items-center px-6 border-b border-[#1F2937]">
            <Link href="/dashboard" className="flex items-center gap-2 font-black text-white text-base tracking-tight select-none">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00DF81] inline-block shrink-0" />
              AutoDMs
            </Link>
          </div>
          <nav className="p-4">
            <SidebarNav dmsCount={dmsCount} dmsLimit={dmsLimit} />
          </nav>
        </div>

        <div>
          {/* Minimalist Quota Usage Meter */}
          <div className="p-4 mx-4 mb-4 bg-[#111827] border border-[#1F2937] rounded-xl space-y-2 shrink-0">
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>DMs: <strong className="text-white">{dmsCount}</strong> / {dmsLimit}</span>
              <span className="text-[#00DF81]">{Math.min(Math.round((dmsCount / dmsLimit) * 100), 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#0B0F17] rounded-full overflow-hidden border border-[#1F2937]/50">
              <div
                style={{ width: `${Math.min(Math.round((dmsCount / dmsLimit) * 100), 100)}%` }}
                className="h-full bg-[#00DF81] rounded-full"
              />
            </div>
            <Link
              href="/dashboard/settings"
              className="block text-center text-[10px] font-bold text-[#00DF81] hover:text-[#00C770] transition-colors uppercase pt-1"
            >
              Upgrade &rarr;
            </Link>
          </div>

          {/* User Footer Profile */}
          <div className="p-4 border-t border-[#1F2937] flex items-center justify-between gap-2 bg-[#0B0F17]">
            <div className="truncate">
              <p className="text-xs font-semibold text-[#F9FAFB] truncate">{session.user.name || session.user.email}</p>
              <p className="text-[10px] text-[#9CA3AF] truncate">{session.user.email}</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-[#0B0F17]">
        {children}
      </main>
    </div>
  );
}
