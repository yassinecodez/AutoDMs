import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import ConnectFacebookButton from "@/components/ConnectFacebookButton";
import ManualConnectForm from "@/components/ManualConnectForm";
import SyncWebhookButton from "@/components/SyncWebhookButton";
import { disconnectAccount } from "./actions";
import { Shield, AlertCircle, CheckCircle, Trash2 } from "lucide-react";

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
    message?: string;
    count?: string;
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
    <div className="p-6 md:p-8 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="space-y-0.5 pb-2 border-b border-[#222222]">
        <h1 className="text-xl font-bold text-white tracking-tight">Meta accounts</h1>
        <p className="text-xs text-zinc-400">Connect and manage Facebook Pages linked to Instagram Business profiles</p>
      </div>

      {/* Query Status Banners */}
      {params.status === "success" && (
        <div className="p-3.5 bg-[#0A0A0A] border border-white/20 text-white rounded-xl flex items-start gap-2.5 text-xs">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.75} />
          <div>
            <p className="font-semibold text-xs text-white">Authentication successful</p>
            <p className="text-zinc-400 mt-0.5">
              Successfully linked {params.count || "0"} Instagram Business profile(s).
            </p>
          </div>
        </div>
      )}

      {params.status === "error" && (
        <div className="p-3.5 bg-[#0A0A0A] border border-red-500/30 text-red-400 rounded-xl flex items-start gap-2.5 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.75} />
          <div>
            <p className="font-semibold text-xs text-white">Connection failed</p>
            <p className="text-zinc-400 mt-0.5">
              {params.message || "An unexpected error occurred during connection."}
            </p>
          </div>
        </div>
      )}

      {/* Connect Profile Action Box */}
      <div className="p-5 bg-[#0A0A0A] border border-[#222222] rounded-xl space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#111111] border border-[#222222] rounded-lg text-white shrink-0">
            <Shield className="w-4 h-4" strokeWidth={1.75} />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-xs font-semibold text-white">Add new Instagram profile</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Connect your professional profile. Ensure your Instagram account is switched to a{" "}
              <strong className="text-zinc-200">Business or Creator account</strong> and linked to a Facebook Page you manage.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3 border-t border-[#222222]">
          <ConnectFacebookButton />
          <ManualConnectForm />
        </div>
      </div>

      {/* Accounts List */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-white">Linked professional profiles</h2>
        
        {accounts.length === 0 ? (
          <div className="p-10 text-center bg-[#0A0A0A] border border-[#222222] rounded-xl text-zinc-500 text-xs space-y-2">
            <InstagramIcon className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-zinc-200 font-medium">No connected profiles found</p>
            <p className="text-zinc-500">Click the button above to link your first Instagram Business profile.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="p-4 bg-[#0A0A0A] border border-[#222222] rounded-xl flex items-center justify-between shadow-sm hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-[#111111] border border-[#222222] flex items-center justify-center text-white">
                    <InstagramIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white">@{acc.pageName}</h3>
                    <p className="text-[10px] text-zinc-400 font-mono">ID: {acc.instagramAccountId}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#111111] border border-[#222222] text-zinc-300">
                        Page: {acc.pageName}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span className="text-[10px] text-zinc-300 font-medium">Live webhook</span>
                      
                      {(() => {
                        if (!acc.tokenExpiresAt) {
                          return (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-[#111111] text-zinc-400 font-medium border border-[#222222]">
                              Active (Long-Lived)
                            </span>
                          );
                        }
                        const diffTime = new Date(acc.tokenExpiresAt).getTime() - Date.now();
                        const expiryDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        const daysLeft = expiryDays > 0 ? expiryDays : 0;
                        return (
                          <span className="text-[10px] px-2 py-0.5 rounded font-medium border border-[#222222] bg-[#111111] text-zinc-300">
                            Active ({daysLeft}d left)
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
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
                      className="p-2 text-zinc-500 hover:text-red-400 hover:bg-[#111111] rounded-lg transition-colors"
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
