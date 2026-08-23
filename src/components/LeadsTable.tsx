"use client";

import { useState } from "react";
import { Download, Search } from "lucide-react";

interface Lead {
  id: string;
  username: string | null;
  email: string | null;
  phone: string | null;
  createdAt: any;
  automation: { name: string } | null;
}

export function LeadsTable({ initialLeads }: { initialLeads: Lead[] }) {
  const [search, setSearch] = useState("");
  
  const filteredLeads = initialLeads.filter(lead => {
    const term = search.toLowerCase();
    return (
      (lead.username?.toLowerCase() || "").includes(term) ||
      (lead.email?.toLowerCase() || "").includes(term) ||
      (lead.phone?.toLowerCase() || "").includes(term) ||
      (lead.automation?.name.toLowerCase() || "").includes(term)
    );
  });

  const exportToCsv = () => {
    const headers = ["Instagram Handle", "Email", "Phone Number", "Source Automation", "Capture Date"];
    const rows = filteredLeads.map(l => [
      l.username ? `@${l.username}` : "unknown",
      l.email || "N/A",
      l.phone || "N/A",
      l.automation?.name || "Direct / Manual",
      new Date(l.createdAt).toLocaleString()
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `leads_export_${dateStr}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search handle, email, phone..."
            className="w-full pl-9 pr-4 py-2 bg-[#111827] border border-[#1F2937] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#00DF81] text-[#F9FAFB] placeholder-slate-500"
          />
        </div>
        
        <button
          onClick={exportToCsv}
          disabled={filteredLeads.length === 0}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#00DF81] hover:bg-[#00C770] text-[#000000] font-bold rounded-xl text-xs transition-all shadow-md shadow-[#00DF81]/10 disabled:opacity-50 active:scale-95 shrink-0"
        >
          <Download className="w-4 h-4" />
          Export to CSV
        </button>
      </div>

      <div className="overflow-x-auto border border-[#1F2937] rounded-xl bg-[#111827]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[11px] text-[#9CA3AF] border-b border-[#1F2937] bg-[#0B0F17]/40">
              <th className="px-6 py-3.5 font-semibold">Instagram handle</th>
              <th className="px-6 py-3.5 font-semibold">Email</th>
              <th className="px-6 py-3.5 font-semibold">Phone number</th>
              <th className="px-6 py-3.5 font-semibold">Source automation</th>
              <th className="px-6 py-3.5 font-semibold">Capture date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2937]/60 text-xs">
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-[#9CA3AF] text-xs">
                  No leads found matching your search.
                </td>
              </tr>
            ) : (
              filteredLeads.map(l => (
                <tr key={l.id} className="hover:bg-[#0B0F17]/30 transition-colors">
                  <td className="px-6 py-3.5 font-semibold text-[#F9FAFB]">
                    {l.username ? `@${l.username}` : "unknown"}
                  </td>
                  <td className="px-6 py-3.5 text-slate-300 font-mono text-[11px]">{l.email || "N/A"}</td>
                  <td className="px-6 py-3.5 text-slate-400 font-mono text-[11px]">{l.phone || "N/A"}</td>
                  <td className="px-6 py-3.5 text-[#9CA3AF]">{l.automation?.name || "Direct / Manual"}</td>
                  <td className="px-6 py-3.5 text-slate-500 text-[11px] font-mono">
                    {new Date(l.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default LeadsTable;
