import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import ConnectFacebookButton from "@/components/ConnectFacebookButton";
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
  const userId = session!.user!.id!;

  // Fetch all linked Instagram accounts for this user
  const accounts = await db.igAccount.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Meta Accounts</h1>
        <p className="text-slate-400 text-sm">Connect and manage your Facebook Pages linked to Instagram Business accounts</p>
      </div>

      {/* Query Status Banners */}
      {params.status === "success" && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-start gap-3">
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Authentication Successful</p>
            <p className="text-xs text-slate-400 mt-1">
              Successfully linked {params.count || "0"} Instagram Business account(s).
            </p>
          </div>
        </div>
      )}

      {params.status === "error" && (
        <div className="p-4 bg-red-950/40 border border-red-500/20 text-red-400 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Connection Failed</p>
            <p className="text-xs text-slate-400 mt-1">
              {params.message || "An unexpected error occurred during connection."}
            </p>
          </div>
        </div>
      )}

      {/* Connect Area */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Add New Profile</h2>
            <p className="text-sm text-slate-400 mt-1">
              Link your professional profiles. Make sure your Instagram Account is switched to a{" "}
              <strong>Business/Creator Account</strong> and linked to a Facebook Page you manage.
            </p>
          </div>
        </div>
        
        <ConnectFacebookButton />
      </div>

      {/* Accounts List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Linked Professional Accounts</h2>
        
        {accounts.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-500 text-sm">
            <InstagramIcon className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p>No connected accounts found.</p>
            <p className="text-xs text-slate-600 mt-1">Click the button above to link your first Instagram Business profile.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between shadow-sm hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 p-0.5 flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-white">
                      <InstagramIcon className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">IG Business Account</h3>
                    <p className="text-xs text-slate-400 mt-0.5">ID: {acc.instagramAccountId}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        FB Page: {acc.pageName}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] text-emerald-400 uppercase font-semibold">Active webhook</span>
                    </div>
                  </div>
                </div>

                <form
                  action={async () => {
                    "use server";
                    await disconnectAccount(acc.id);
                  }}
                >
                  <button
                    type="submit"
                    className="p-3 text-slate-500 hover:text-red-400 hover:bg-slate-800/50 rounded-xl transition-colors"
                    title="Disconnect Account"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
