import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import AccountFinder from "@/components/AccountFinder";
import GuidedConnectionHelper from "@/components/GuidedConnectionHelper";
import { disconnectAccount } from "./actions";
import { Trash2 } from "lucide-react";
import { redirect } from "next/navigation";
import { refreshLongLivedTokenIfNeeded } from "@/lib/tokenRefresh";

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface PageProps {
  searchParams: Promise<{
    status?: string;
    error?: string;
    message?: string;
    count?: string;
    connected?: string;
    details?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function AccountsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }
  const userId = session.user.id;

  // Auto-cleanup legacy placeholder accounts
  try {
    await db.igAccount.deleteMany({
      where: {
        userId,
        pageName: "Instagram Account",
      },
    });
  } catch (cleanErr) {
    console.warn("Cleanup warning:", cleanErr);
  }

  const rawAccounts = await db.igAccount.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  for (const acc of rawAccounts) {
    await refreshLongLivedTokenIfNeeded(acc);
  }

  const accounts = await db.igAccount.findMany({
    where: { userId },
    select: {
      id: true,
      instagramAccountId: true,
      pageName: true,
      profilePictureUrl: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-1 pb-6 border-b border-[#222222]">
        <h1 className="text-2xl font-bold tracking-tight text-white">Instagram accounts</h1>
        <p className="text-sm text-zinc-400">
          Connect, verify permissions, and manage your Instagram Professional profile integrations
        </p>
      </div>

      {/* Guided Connection Helper & Error Reporting Banner */}
      <GuidedConnectionHelper
        errorParam={params.error}
        detailsParam={params.details}
        statusParam={params.status || (params.connected ? "SUCCESS" : undefined)}
        countParam={params.count}
        hasConnectedAccounts={accounts.length > 0}
      />

      {/* Pre-OAuth Account Finder & Connection Box */}
      <AccountFinder />

      {/* Accounts List */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Connected profiles ({accounts.length})
          </h2>
        </div>

        {accounts.length === 0 ? (
          <div className="p-12 text-center bg-[#0A0A0A] border border-[#222222] rounded-2xl text-zinc-500 text-xs space-y-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            <div className="w-10 h-10 rounded-full bg-[#111111] border border-[#222222] flex items-center justify-center mx-auto text-zinc-500">
              <InstagramIcon className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-zinc-200 font-medium text-sm">No connected profiles yet</p>
              <p className="text-zinc-500 max-w-sm mx-auto">
                Use the account finder above to verify and connect your professional Instagram profile.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="p-5 bg-[#0A0A0A] border border-[#222222] rounded-2xl flex items-center justify-between gap-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:border-zinc-700 hover:bg-[#0D0D0D] transition-all duration-200"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Circular Instagram Avatar */}
                  <div className="w-12 h-12 rounded-full bg-[#141414] border border-[#262626] flex items-center justify-center text-white shrink-0 overflow-hidden shadow-inner">
                    {acc.profilePictureUrl ? (
                      <img
                        src={acc.profilePictureUrl}
                        alt={acc.pageName}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-purple-600/20 flex items-center justify-center font-bold text-sm text-white uppercase">
                        {acc.pageName ? acc.pageName[0] : "I"}
                      </div>
                    )}
                  </div>

                  {/* Clean Account Handle & Status */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-white truncate">@{acc.pageName}</h3>
                      <svg className="w-4 h-4 text-[#0095F6] fill-current shrink-0" viewBox="0 0 24 24">
                        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7l-4.2-4.2 1.4-1.4 2.8 2.8 6.8-6.8 1.4 1.4-8.2 8.2z" />
                      </svg>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950/50 border border-emerald-800/50 text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Connected
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 truncate">Instagram Professional Account</p>
                  </div>
                </div>

                {/* Single Trash / Disconnect Action */}
                <div className="flex items-center gap-2 shrink-0">
                  <form
                    action={async () => {
                      "use server";
                      await disconnectAccount(acc.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="p-2.5 text-zinc-400 hover:text-red-400 hover:bg-[#141414] rounded-xl transition-colors border border-transparent hover:border-zinc-800"
                      title="Disconnect Account"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
