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
      l.automation?.name || "Direct/Manual",
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
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search leads handle, email, phone..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-white"
          />
        </div>
        
        <button
          onClick={exportToCsv}
          disabled={filteredLeads.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-violet-500/10 disabled:opacity-50 active:scale-95 shrink-0"
        >
          <Download className="w-4 h-4" />
          Export to CSV
        </button>
      </div>

      <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900/40">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs text-slate-400 border-b border-slate-800 bg-slate-950/20 uppercase tracking-wider font-semibold">
              <th className="px-6 py-4">Instagram Handle</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Phone Number</th>
              <th className="px-6 py-4">Source Automation</th>
              <th className="px-6 py-4">Capture Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-sm">
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-xs">
                  No leads match your search criteria.
                </td>
              </tr>
            ) : (
              filteredLeads.map(l => (
                <tr key={l.id} className="hover:bg-slate-800/10 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-200">
                    {l.username ? `@${l.username}` : "unknown"}
                  </td>
                  <td className="px-6 py-4 text-slate-355 font-mono text-xs">{l.email || "N/A"}</td>
                  <td className="px-6 py-4 text-slate-400 font-mono text-xs">{l.phone || "N/A"}</td>
                  <td className="px-6 py-4 text-slate-400">{l.automation?.name || "Direct/Manual"}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs font-mono">
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
