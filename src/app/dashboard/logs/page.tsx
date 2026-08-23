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
    <div className="p-6 md:p-8 space-y-8 max-w-6xl">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#F9FAFB] tracking-tight">Activity logs</h1>
        <p className="text-xs md:text-sm text-[#9CA3AF]">Audit trail of all comment detections, matched rules, and messaging statuses</p>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3 bg-[#111827] border border-[#1F2937] px-4 py-2.5 rounded-xl max-w-md">
        <Search className="w-4 h-4 text-slate-500 shrink-0" />
        <form method="GET" className="flex-1">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search by username or comment..."
            className="w-full bg-transparent border-none text-[#F9FAFB] placeholder-slate-500 focus:outline-none text-xs"
          />
        </form>
      </div>

      {/* Logs Table */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-sm">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <FileSpreadsheet className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-[#F9FAFB]">No matching logs found</p>
            <p className="text-[#9CA3AF]">Either no comments have been processed yet, or your search query yielded no results.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] text-[#9CA3AF] border-b border-[#1F2937] bg-[#0B0F17]/40">
                  <th className="px-6 py-3.5 font-semibold">Time</th>
                  <th className="px-6 py-3.5 font-semibold">User</th>
                  <th className="px-6 py-3.5 font-semibold">Source</th>
                  <th className="px-6 py-3.5 font-semibold">Trigger text</th>
                  <th className="px-6 py-3.5 font-semibold">Matched rule</th>
                  <th className="px-6 py-3.5 font-semibold">DM status</th>
                  <th className="px-6 py-3.5 font-semibold">Public reply</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]/60 text-xs">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#0B0F17]/30 transition-colors">
                    <td className="px-6 py-3.5 text-slate-400 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString("en-US", {
                        hour12: false,
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-[#F9FAFB]">@{log.commenterUsername}</td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#0B0F17] border border-[#1F2937] text-slate-300">
                        {log.triggerSource === "COMMENT" ? "Comment" : log.triggerSource === "STORY_MENTION" ? "Story" : "Direct DM"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-[#9CA3AF] max-w-xs truncate font-mono text-[11px]" title={log.commentText}>
                      "{log.commentText}"
                    </td>
                    <td className="px-6 py-3.5 text-slate-300 font-medium">
                      {log.automation?.name || (
                        <span className="text-slate-600 italic">Deleted rule</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {log.dmStatus === "SUCCESS" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#00DF81]" />
                        ) : log.dmStatus === "FAILED" ? (
                          <span title={log.dmError || undefined}>
                            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                          </span>
                        ) : (
                          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        <span
                          className={`text-[10px] font-bold ${
                            log.dmStatus === "SUCCESS"
                              ? "text-[#00DF81]"
                              : log.dmStatus === "FAILED"
                              ? "text-red-400"
                              : "text-slate-500"
                          }`}
                        >
                          {log.dmStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {log.commentStatus === "SUCCESS" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#00DF81]" />
                        ) : log.commentStatus === "FAILED" ? (
                          <span title={log.commentError || undefined}>
                            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                          </span>
                        ) : (
                          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        <span
                          className={`text-[10px] font-bold ${
                            log.commentStatus === "SUCCESS"
                              ? "text-[#00DF81]"
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
