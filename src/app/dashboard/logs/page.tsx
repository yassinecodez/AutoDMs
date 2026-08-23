import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Search, CheckCircle2, AlertCircle, HelpCircle, FileSpreadsheet } from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

import { redirect } from "next/navigation";

export default async function LogsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }
  const userId = session.user.id;
  const q = params.q || "";

  // Query logs linked to this creator's automations
  const logs = await db.executionLog.findMany({
    where: {
      automation: {
        userId,
      },
      OR: [
        { commenterUsername: { contains: q, mode: "insensitive" } },
        { commentText: { contains: q, mode: "insensitive" } },
      ],
    },
    orderBy: {
      timestamp: "desc",
    },
    include: {
      automation: true,
    },
  });

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Activity Logs</h1>
        <p className="text-slate-400 text-sm">Audit trail of all comment detections, matched rules, and messaging statuses</p>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl max-w-lg">
        <Search className="w-5 h-5 text-slate-500 shrink-0" />
        <form method="GET" className="flex-1">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search by username or comment text..."
            className="w-full bg-transparent border-none text-slate-200 placeholder-slate-500 focus:outline-none text-sm"
          />
        </form>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm space-y-2">
            <FileSpreadsheet className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="font-semibold text-slate-400">No matching logs found.</p>
            <p className="text-xs text-slate-600">Either no comments have been processed yet, or your search query yielded no results.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-slate-800 bg-slate-950/40 uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4">Trigger text</th>
                  <th className="px-6 py-4">Matched Rule</th>
                  <th className="px-6 py-4">DM status</th>
                  <th className="px-6 py-4">Public Reply</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-sm">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 text-slate-400 text-xs font-mono">
                      {new Date(log.timestamp).toLocaleString("en-US", {
                        hour12: false,
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-200">@{log.commenterUsername}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        log.triggerSource === "COMMENT"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : log.triggerSource === "STORY_MENTION"
                          ? "bg-pink-500/10 text-pink-400 border-pink-500/20"
                          : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                      }`}>
                        {log.triggerSource === "COMMENT" ? "Comment" : log.triggerSource === "STORY_MENTION" ? "Story" : "Direct DM"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 max-w-sm truncate" title={log.commentText}>
                      "{log.commentText}"
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-medium">
                      {log.automation?.name || (
                        <span className="text-slate-600 italic">Deleted Rule</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {log.dmStatus === "SUCCESS" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : log.dmStatus === "FAILED" ? (
                          <span title={log.dmError || undefined}>
                            <AlertCircle className="w-4 h-4 text-red-400" />
                          </span>
                        ) : (
                          <HelpCircle className="w-4 h-4 text-slate-500" />
                        )}
                        <span
                          className={`text-xs font-bold ${
                            log.dmStatus === "SUCCESS"
                              ? "text-emerald-400"
                              : log.dmStatus === "FAILED"
                              ? "text-red-400"
                              : "text-slate-500"
                          }`}
                        >
                          {log.dmStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {log.commentStatus === "SUCCESS" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : log.commentStatus === "FAILED" ? (
                          <span title={log.commentError || undefined}>
                            <AlertCircle className="w-4 h-4 text-red-400" />
                          </span>
                        ) : (
                          <HelpCircle className="w-4 h-4 text-slate-500" />
                        )}
                        <span
                          className={`text-xs font-bold ${
                            log.commentStatus === "SUCCESS"
                              ? "text-emerald-400"
                              : log.commentStatus === "FAILED"
                              ? "text-red-400"
                              : "text-slate-500"
                          }`}
                        >
                          {log.commentStatus}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
