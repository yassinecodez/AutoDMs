import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Activity } from "lucide-react";
import SidebarNav from "@/components/SidebarNav";
import SignOutButton from "@/components/SignOutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

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
            <SidebarNav />
          </nav>
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
