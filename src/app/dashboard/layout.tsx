import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SidebarNav from "@/components/SidebarNav";
import AccountSwitcher from "@/components/AccountSwitcher";
import Link from "next/link";
import { Settings } from "lucide-react";
import { db } from "@/lib/db";
import { getActiveAccount, getAllUserAccounts } from "@/lib/activeAccount";
import OnboardingModal from "@/components/OnboardingModal";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId: string = session.user.id;

  const [user, activeAccount, allAccounts] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        image: true,
        dmsCountThisMonth: true,
        dmsLimit: true,
        planType: true,
      },
    }),
    getActiveAccount(userId),
    getAllUserAccounts(userId),
  ]);

  const dmsCount = user?.dmsCountThisMonth || 0;
  const dmsLimit = user?.dmsLimit || 150;
  const usagePct = Math.min(Math.round((dmsCount / dmsLimit) * 100), 100);

  const userAvatar = user?.image || session.user.image;
  const displayName = user?.name || session.user.name || user?.email?.split("@")[0] || "User";
  const displayEmail = user?.email || session.user.email || "";

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-x-hidden font-sans selection:bg-primary/20 selection:text-foreground">
      {/* 240px Fixed Sidebar */}
      <aside className="w-60 flex-shrink-0 fixed inset-y-0 left-0 z-30 bg-card border-r border-border flex flex-col justify-between">
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="h-14 flex items-center justify-between px-5 border-b border-border">
            <Link href="/dashboard" className="flex items-center gap-2.5 font-semibold text-foreground text-sm tracking-tight select-none">
              <span className="w-2 h-2 rounded-full bg-primary inline-block shrink-0" />
              <span>AutoDMs</span>
            </Link>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
              v1.0
            </span>
          </div>

          {/* Top-Left ManyChat & Vercel Style Workspace Switcher */}
          <div className="p-3 border-b border-border">
            <AccountSwitcher
              accounts={allAccounts.map((a) => ({
                id: a.id,
                pageName: a.pageName,
                profilePictureUrl: a.profilePictureUrl,
              }))}
              activeAccountId={activeAccount?.id || null}
            />
          </div>

          {/* Navigation Links */}
          <nav className="p-3">
            <SidebarNav />
          </nav>
        </div>

        <div>
          {/* Monthly Quota Meter */}
          <div className="p-3.5 mx-3 mb-3 bg-secondary border border-border rounded-2xl space-y-2.5 shrink-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground font-medium">
                <span>DMs: <strong className="text-foreground font-semibold">{dmsCount}</strong>/{dmsLimit}</span>
                <span className="text-foreground font-medium">{usagePct}%</span>
              </div>
              <div className="w-full h-1.5 bg-background rounded-full overflow-hidden border border-border">
                <div
                  style={{ width: `${usagePct}%` }}
                  className="h-full bg-primary rounded-full transition-all duration-300"
                />
              </div>
            </div>

            <Link
              href="/dashboard/billing"
              className="block text-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors pt-0.5"
            >
              Manage plan &rarr;
            </Link>
          </div>

          {/* User Footer Profile */}
          <div className="p-3 px-4 border-t border-border flex items-center justify-between gap-2 bg-card-footer">
            {/* Profile Display (Left) */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {/* 32px Circular Google / User Avatar */}
              <div className="w-8 h-8 rounded-full overflow-hidden bg-secondary border border-border flex items-center justify-center font-semibold text-xs text-foreground shrink-0 shadow-inner">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span>{(displayName && displayName.length > 0 ? displayName[0] : "U").toUpperCase()}</span>
                )}
              </div>
              <div className="truncate min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground truncate">{displayName || "User"}</p>
                <p className="text-[11px] text-muted-foreground truncate">{displayEmail || ""}</p>
              </div>
            </div>

            {/* Settings Action (Right) */}
            <Link
              href="/dashboard/settings"
              className="text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg p-2 transition-colors shrink-0"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="pl-60 flex-1 flex flex-col min-w-0 w-full min-h-screen bg-background">
        {children}
      </main>

      {/* First-Time User Onboarding Modal */}
      <OnboardingModal hasConnectedAccounts={allAccounts.length > 0} />
    </div>
  );
}
