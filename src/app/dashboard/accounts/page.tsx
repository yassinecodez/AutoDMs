import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import ConnectFacebookButton from "@/components/ConnectFacebookButton";
import ManualConnectForm from "@/components/ManualConnectForm";
import SyncWebhookButton from "@/components/SyncWebhookButton";
import GuidedConnectionHelper from "@/components/GuidedConnectionHelper";
import { disconnectAccount } from "./actions";
import { Shield, Trash2, CheckCircle2 } from "lucide-react";

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

import { redirect } from "next/navigation";
import { refreshLongLivedTokenIfNeeded } from "@/lib/tokenRefresh";
import RefreshTokenButton from "@/components/RefreshTokenButton";

interface PageProps {
  searchParams: Promise<{
    status?: string;
    error?: string;
    message?: string;
    count?: string;
    connected?: string;
  }>;
}

export default async function AccountsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }
  const userId = session.user.id;

  const rawAccounts = await db.igAccount.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  for (const acc of rawAccounts) {
    await refreshLongLivedTokenIfNeeded(acc);
  }

  const accounts = await db.igAccount.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 md:p-10 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-0.5 pb-6 border-b border-[#222222]">
        <h1 className="text-2xl font-bold tracking-tight text-white">Meta Accounts</h1>
        <p className="text-sm text-zinc-400 mt-0.5">
          Connect and manage Instagram Professional & Facebook Page integrations
        </p>
      </div>

      {/* Guided Connection Helper & Error Reporting Banner */}
      <GuidedConnectionHelper
        errorParam={params.error}
        statusParam={params.status || (params.connected ? "SUCCESS" : undefined)}
        countParam={params.count}
        hasConnectedAccounts={accounts.length > 0}
      />

      {/* Connect Profile Action Box */}
      <div className="p-6 bg-[#0A0A0A] border border-[#222222] rounded-xl space-y-4 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-[#141414] border border-[#262626] rounded-lg text-white shrink-0">
            <Shield className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-white">Connect Instagram Professional Profile</h2>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
              Link your Instagram account to enable real-time keyword comment auto-replies, story reward triggers, and direct message lead capture. Ensure your account is set to{" "}
              <strong className="text-zinc-200">Business or Creator</strong>.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-[#222222]">
          <ConnectFacebookButton />
          <ManualConnectForm />
        </div>
      </div>

      {/* Accounts List */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Linked Professional Profiles ({accounts.length})
          </h2>
        </div>

        {accounts.length === 0 ? (
          <div className="p-12 text-center bg-[#0A0A0A] border border-[#222222] rounded-xl text-zinc-500 text-xs space-y-3">
            <InstagramIcon className="w-8 h-8 text-zinc-600 mx-auto" />
            <div className="space-y-1">
              <p className="text-zinc-200 font-medium text-sm">No connected profiles found</p>
              <p className="text-zinc-500 max-w-sm mx-auto">
                Click "Connect Instagram Account" above to link your first profile via Meta OAuth.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="p-5 bg-[#0A0A0A] border border-[#222222] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#141414] border border-[#262626] flex items-center justify-center text-white shrink-0">
                    <InstagramIcon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">@{acc.pageName}</h3>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#141414] border border-[#262626] text-zinc-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live Webhook
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                      <span className="text-[11px] font-mono text-zinc-500">ID: {acc.instagramAccountId}</span>
                      <span className="text-zinc-600">•</span>
                      {(() => {
                        if (!acc.tokenExpiresAt) {
                          return (
                            <span className="text-[11px] text-zinc-300 font-medium">
                              Token: Permanent Page Token
                            </span>
                          );
                        }
                        const diffTime = new Date(acc.tokenExpiresAt).getTime() - Date.now();
                        const expiryDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        const daysLeft = expiryDays > 0 ? expiryDays : 0;
                        return (
                          <span className="text-[11px] text-zinc-300 font-medium">
                            Token: Active ({daysLeft}d left)
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <SyncWebhookButton />
                  <RefreshTokenButton instagramAccountId={acc.instagramAccountId} />
                  <form
                    action={async () => {
                      "use server";
                      await disconnectAccount(acc.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="p-2 text-zinc-400 hover:text-red-400 hover:bg-[#141414] rounded-lg transition-colors"
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
