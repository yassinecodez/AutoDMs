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
    strokeWidth="2"
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

  // Fetch all linked Instagram accounts for this user
  const rawAccounts = await db.igAccount.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // Automatically check/refresh long-lived tokens if expiring within 20 days
  for (const acc of rawAccounts) {
    await refreshLongLivedTokenIfNeeded(acc);
  }

  const accounts = await db.igAccount.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#F9FAFB] tracking-tight">Meta accounts</h1>
        <p className="text-xs md:text-sm text-[#9CA3AF]">Connect and manage your Facebook Pages linked to Instagram Business accounts</p>
      </div>

      {/* Query Status Banners */}
      {params.status === "success" && (
        <div className="p-4 bg-[#00DF81]/10 border border-[#00DF81]/20 text-[#00DF81] rounded-xl flex items-start gap-3 text-xs">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm text-[#F9FAFB]">Authentication successful</p>
            <p className="text-slate-400 mt-0.5">
              Successfully linked {params.count || "0"} Instagram Business account(s).
            </p>
          </div>
        </div>
      )}

      {params.status === "error" && (
        <div className="p-4 bg-red-950/40 border border-red-500/20 text-red-400 rounded-xl flex items-start gap-3 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm text-[#F9FAFB]">Connection failed</p>
            <p className="text-slate-400 mt-0.5">
              {params.message || "An unexpected error occurred during connection."}
            </p>
          </div>
        </div>
      )}

      {/* Connect Area */}
      <div className="p-6 bg-[#111827] border border-[#1F2937] rounded-xl space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-[#00DF81]/10 border border-[#00DF81]/20 rounded-xl text-[#00DF81] shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-[#F9FAFB]">Add new profile</h2>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Link your professional profiles. Make sure your Instagram account is set to a{" "}
              <strong className="text-white">Business or Creator account</strong> and linked to a Facebook Page you manage.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-start gap-4 pt-2 border-t border-[#1F2937]">
          <ConnectFacebookButton />
          <ManualConnectForm />
        </div>
      </div>

      {/* Accounts List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[#F9FAFB]">Linked professional accounts</h2>
        
        {accounts.length === 0 ? (
          <div className="p-12 text-center bg-[#111827] border border-[#1F2937] rounded-xl text-slate-500 text-xs space-y-2">
            <InstagramIcon className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-[#F9FAFB] font-semibold">No connected accounts found</p>
            <p className="text-[#9CA3AF]">Click the button above to link your first Instagram Business profile.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="p-5 bg-[#111827] border border-[#1F2937] rounded-xl flex items-center justify-between shadow-sm hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#0B0F17] border border-[#1F2937] flex items-center justify-center text-[#00DF81]">
                    <InstagramIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#F9FAFB]">@{acc.pageName}</h3>
                    <p className="text-[11px] text-[#9CA3AF] font-mono">ID: {acc.instagramAccountId}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#0B0F17] border border-[#1F2937] text-slate-300">
                        Page: {acc.pageName}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00DF81] animate-pulse" />
                      <span className="text-[10px] text-[#00DF81] uppercase font-bold tracking-wide">Live webhook</span>
                      
                      {(() => {
                        if (!acc.tokenExpiresAt) {
                          return (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-[#0B0F17] text-slate-300 font-semibold border border-[#1F2937]">
                              Active (Long-Lived)
                            </span>
                          );
                        }
                        const diffTime = new Date(acc.tokenExpiresAt).getTime() - Date.now();
                        const expiryDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        const daysLeft = expiryDays > 0 ? expiryDays : 0;
                        return (
                          <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                            daysLeft < 15 
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                              : "bg-[#00DF81]/10 text-[#00DF81] border-[#00DF81]/20"
                          }`}>
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
                      className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-[#0B0F17] rounded-xl transition-colors"
                      title="Disconnect Account"
                    >
                      <Trash2 className="w-4 h-4" />
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
