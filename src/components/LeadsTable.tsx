"use client";

import { useState } from "react";
import { Download, Search, Users, Mail, Phone } from "lucide-react";

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
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-zinc-500" strokeWidth={1.75} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter leads by handle, email, phone..."
            className="w-full h-10 pl-9 pr-3 bg-[#0A0A0A] border border-[#262626] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
          />
        </div>
        
        <button
          onClick={exportToCsv}
          disabled={filteredLeads.length === 0}
          className="h-10 inline-flex items-center justify-center gap-1.5 px-4 bg-white hover:bg-zinc-200 text-black font-medium rounded-lg text-xs transition-colors shadow-sm disabled:opacity-40 shrink-0"
        >
          <Download className="w-3.5 h-3.5" strokeWidth={2} />
          Export CSV ({filteredLeads.length})
        </button>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto border border-[#222222] rounded-xl bg-[#0A0A0A]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[11px] text-zinc-500 border-b border-[#222222] bg-[#000000]/60">
              <th className="px-5 py-3 font-medium">Instagram handle</th>
              <th className="px-5 py-3 font-medium">Contact email</th>
              <th className="px-5 py-3 font-medium">Phone number</th>
              <th className="px-5 py-3 font-medium">Source rule</th>
              <th className="px-5 py-3 font-medium text-right">Capture date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222222]/80 text-xs">
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 text-xs">
                  <Users className="w-6 h-6 mx-auto mb-2 text-zinc-600" strokeWidth={1.75} />
                  <p className="font-medium text-zinc-300">No leads found</p>
                  <p className="text-zinc-500 mt-0.5">Leads captured via 2-step direct message verification will populate here.</p>
                </td>
              </tr>
            ) : (
              filteredLeads.map(l => (
                <tr key={l.id} className="hover:bg-[#111111]/40 transition-colors">
                  <td className="px-5 py-3 font-medium text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#111111] border border-[#222222] flex items-center justify-center text-[10px] text-zinc-300 font-bold">
                      {l.username ? l.username[0].toUpperCase() : "U"}
                    </span>
                    <span>{l.username ? `@${l.username}` : "unknown"}</span>
                  </td>
                  <td className="px-5 py-3 text-zinc-300 font-mono text-[11px]">
                    {l.email ? (
                      <span className="inline-flex items-center gap-1.5 text-zinc-200">
                        <Mail className="w-3 h-3 text-zinc-400" strokeWidth={1.75} />
                        {l.email}
                      </span>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-zinc-300 font-mono text-[11px]">
                    {l.phone ? (
                      <span className="inline-flex items-center gap-1.5 text-zinc-200">
                        <Phone className="w-3 h-3 text-zinc-400" strokeWidth={1.75} />
                        {l.phone}
                      </span>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-zinc-400">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#111111] border border-[#222222] text-zinc-300">
                      {l.automation?.name || "Direct / Manual"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-zinc-500 text-[11px] font-mono text-right">
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
