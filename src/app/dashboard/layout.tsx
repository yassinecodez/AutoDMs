import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Activity } from "lucide-react";
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
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          <div className="h-16 flex items-center gap-2 px-6 border-b border-slate-800">
            <Activity className="w-6 h-6 text-violet-500" />
            <span className="font-bold text-lg text-white">InstaFlow</span>
          </div>
          <nav className="p-4 space-y-1">
            <SidebarNav dmsCount={dmsCount} dmsLimit={dmsLimit} />
          </nav>
        </div>

        {/* Minimalist Quota Usage Meter */}
        <div className="p-4 mx-4 mb-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 shrink-0">
          <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
            <span>DMs: {dmsCount} / {dmsLimit}</span>
            <span>{Math.min(Math.round((dmsCount / dmsLimit) * 100), 100)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.min(Math.round((dmsCount / dmsLimit) * 100), 100)}%` }}
              className="h-full bg-violet-500 rounded-full"
            />
          </div>
          <Link
            href="/dashboard/settings"
            className="block text-center text-[9px] font-bold text-violet-400 hover:text-violet-300 transition-colors uppercase pt-1"
          >
            Upgrade &rarr;
          </Link>
        </div>

        <div className="p-4 border-t border-slate-800 flex items-center justify-between gap-2">
          <div className="truncate">
            <p className="text-sm font-medium text-slate-300 truncate">{session.user.name || session.user.email}</p>
            <p className="text-xs text-slate-500 truncate">{session.user.email}</p>
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-slate-950">
        {children}
      </main>
    </div>
  );
}
