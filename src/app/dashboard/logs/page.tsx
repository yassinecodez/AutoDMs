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
    <div className="p-6 md:p-8 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="space-y-0.5 pb-2 border-b border-[#222222]">
        <h1 className="text-xl font-bold text-white tracking-tight">Activity logs</h1>
        <p className="text-xs text-zinc-400">Audit trail of comment detections, matched rules, and messaging delivery statuses</p>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-2.5 bg-[#0A0A0A] border border-[#262626] px-3 py-2 rounded-lg max-w-sm">
        <Search className="w-3.5 h-3.5 text-zinc-500 shrink-0" strokeWidth={1.75} />
        <form method="GET" className="flex-1">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search by username or text..."
            className="w-full bg-transparent border-none text-white placeholder-zinc-500 focus:outline-none text-xs"
          />
        </form>
      </div>

      {/* Logs Table */}
      <div className="bg-[#0A0A0A] border border-[#222222] rounded-xl overflow-hidden shadow-sm">
        {logs.length === 0 ? (
          <div className="p-10 text-center text-zinc-500 text-xs space-y-2">
            <FileSpreadsheet className="w-8 h-8 text-zinc-600 mx-auto mb-2" strokeWidth={1.75} />
            <p className="font-medium text-zinc-200">No matching logs found</p>
            <p className="text-zinc-500">Either no comments have been processed yet, or your search query yielded no results.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] text-zinc-500 border-b border-[#222222] bg-[#000000]/60">
                  <th className="px-5 py-3 font-medium">Time</th>
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Source</th>
                  <th className="px-5 py-3 font-medium">Trigger text</th>
                  <th className="px-5 py-3 font-medium">Matched rule</th>
                  <th className="px-5 py-3 font-medium">DM status</th>
                  <th className="px-5 py-3 font-medium">Public reply</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]/80 text-xs">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#111111]/40 transition-colors">
                    <td className="px-5 py-3 text-zinc-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString("en-US", {
                        hour12: false,
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-3 font-medium text-zinc-200">@{log.commenterUsername}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#111111] border border-[#222222] text-zinc-300">
                        {log.triggerSource === "COMMENT" ? "Comment" : log.triggerSource === "STORY_MENTION" ? "Story" : "Direct DM"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-zinc-400 max-w-xs truncate font-mono text-[11px]" title={log.commentText}>
                      "{log.commentText}"
                    </td>
                    <td className="px-5 py-3 text-zinc-300 font-medium max-w-[140px] truncate">
                      {log.automation?.name || (
                        <span className="text-zinc-600 italic">Deleted rule</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        {log.dmStatus === "SUCCESS" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                        ) : log.dmStatus === "FAILED" ? (
                          <span title={log.dmError || undefined}>
                            <AlertCircle className="w-3.5 h-3.5 text-red-400" strokeWidth={2} />
                          </span>
                        ) : (
                          <HelpCircle className="w-3.5 h-3.5 text-zinc-500" strokeWidth={2} />
                        )}
                        <span
                          className={`text-[10px] font-medium ${
                            log.dmStatus === "SUCCESS"
                              ? "text-white"
                              : log.dmStatus === "FAILED"
                              ? "text-red-400"
                              : "text-zinc-400"
                          }`}
                        >
                          {log.dmStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        {log.commentStatus === "SUCCESS" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                        ) : log.commentStatus === "FAILED" ? (
                          <span title={log.commentError || undefined}>
                            <AlertCircle className="w-3.5 h-3.5 text-red-400" strokeWidth={2} />
                          </span>
                        ) : (
                          <HelpCircle className="w-3.5 h-3.5 text-zinc-500" strokeWidth={2} />
                        )}
                        <span
                          className={`text-[10px] font-medium ${
                            log.commentStatus === "SUCCESS"
                              ? "text-white"
                              : log.commentStatus === "FAILED"
                              ? "text-red-400"
                              : "text-zinc-400"
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
