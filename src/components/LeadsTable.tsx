"use client";

import { useState, useMemo } from "react";
import {
  Download,
  Search,
  Users,
  Mail,
  Phone,
  MessageSquare,
  Filter,
  Plus,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

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
  const [filterType, setFilterType] = useState<"ALL" | "EMAIL" | "PHONE">("ALL");

  // Filtered Leads Calculation
  const filteredLeads = useMemo(() => {
    return initialLeads.filter((lead) => {
      const term = search.toLowerCase();
      const matchesSearch =
        search === "" ||
        (lead.username?.toLowerCase() || "").includes(term) ||
        (lead.email?.toLowerCase() || "").includes(term) ||
        (lead.phone?.toLowerCase() || "").includes(term) ||
        (lead.automation?.name.toLowerCase() || "").includes(term);

      const matchesFilter =
        filterType === "ALL" ||
        (filterType === "EMAIL" && Boolean(lead.email)) ||
        (filterType === "PHONE" && Boolean(lead.phone));

      return matchesSearch && matchesFilter;
    });
  }, [initialLeads, search, filterType]);

  // CSV Export Utility
  const exportToCsv = () => {
    if (filteredLeads.length === 0) return;

    const headers = ["Instagram Handle", "Email Address", "Phone Number", "Source Automation", "Date Captured"];
    const rows = filteredLeads.map((l) => [
      l.username ? `@${l.username}` : "unknown",
      l.email || "",
      l.phone || "",
      l.automation?.name || "Direct DM",
      new Date(l.createdAt).toLocaleString(),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `autodms-leads-${dateStr}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to sanitize phone for WhatsApp direct click
  const getWhatsAppUrl = (phone: string) => {
    const cleaned = phone.replace(/[^0-9]/g, "");
    if (!cleaned) return null;
    return `https://wa.me/${cleaned}`;
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. Header & Top Controls Bar */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#222222]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Contacts & Leads</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            View, filter, and export contact details captured from Instagram DMs
          </p>
        </div>

        <button
          onClick={exportToCsv}
          disabled={filteredLeads.length === 0}
          className="bg-white hover:bg-zinc-200 text-black font-medium rounded-lg h-9 px-4 text-sm flex items-center gap-2 transition-colors disabled:opacity-40 shrink-0 shadow-sm"
        >
          <Download className="w-4 h-4" strokeWidth={2} />
          Export CSV ({filteredLeads.length})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. Search & Filter Controls */}
      {/* ========================================================================= */}
      <div className="bg-[#0A0A0A] border border-[#222222] rounded-xl p-3 flex flex-wrap gap-3 items-center justify-between">
        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username, email, phone..."
            className="bg-[#111111] border border-[#262626] rounded-lg h-9 pl-9 pr-3 text-sm text-white placeholder-zinc-500 w-full focus:outline-none focus:border-zinc-500 transition-colors"
          />
        </div>

        {/* Filter Tabs & Counter */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center bg-[#111111] border border-[#262626] rounded-lg p-0.5 text-xs font-medium text-zinc-400">
            <button
              onClick={() => setFilterType("ALL")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterType === "ALL" ? "bg-[#222222] text-white" : "hover:text-zinc-200"
              }`}
            >
              All Contacts
            </button>
            <button
              onClick={() => setFilterType("EMAIL")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterType === "EMAIL" ? "bg-[#222222] text-white" : "hover:text-zinc-200"
              }`}
            >
              With Email
            </button>
            <button
              onClick={() => setFilterType("PHONE")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterType === "PHONE" ? "bg-[#222222] text-white" : "hover:text-zinc-200"
              }`}
            >
              With Phone
            </button>
          </div>

          <span className="text-xs text-zinc-500 font-medium">
            Showing {filteredLeads.length} contact{filteredLeads.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. Contacts Data Table */}
      {/* ========================================================================= */}
      {initialLeads.length === 0 ? (
        /* Empty State (0 total leads in DB) */
        <div className="border border-dashed border-[#262626] rounded-2xl p-12 text-center my-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#111111] border border-[#222222] flex items-center justify-center mx-auto text-zinc-400">
            <Users className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-white">No leads captured yet</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
              When followers send their email or phone number in Instagram DMs, AutoDMs automatically extracts, verifies, and records them here.
            </p>
          </div>
          <Link
            href="/dashboard/automations/builder"
            className="inline-flex items-center gap-2 h-10 px-5 bg-white hover:bg-zinc-200 text-black font-medium rounded-lg text-xs transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            Create Lead Capture Rule
          </Link>
        </div>
      ) : filteredLeads.length === 0 ? (
        /* Filter Empty State */
        <div className="p-12 text-center bg-[#0A0A0A] border border-[#222222] rounded-xl text-xs space-y-3">
          <Filter className="w-6 h-6 text-zinc-500 mx-auto" />
          <p className="text-zinc-200 font-medium">No contacts match your current filter</p>
          <button
            onClick={() => {
              setSearch("");
              setFilterType("ALL");
            }}
            className="text-xs font-medium text-white hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Data Table */
        <div className="bg-[#0A0A0A] border border-[#222222] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider bg-[#0d0d0d] border-b border-[#222222]">
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Email Address</th>
                  <th className="py-3.5 px-4">Phone Number</th>
                  <th className="py-3.5 px-4">Captured Via</th>
                  <th className="py-3.5 px-4 text-right">Date Captured</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222] text-xs">
                {filteredLeads.map((lead) => {
                  const initial = (lead.username ? lead.username[0] : "U").toUpperCase();
                  const waUrl = lead.phone ? getWhatsAppUrl(lead.phone) : null;

                  return (
                    <tr
                      key={lead.id}
                      className="bg-[#0A0A0A] hover:bg-[#111111] transition-colors group"
                    >
                      {/* 1. Contact Column */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#181818] border border-[#262626] flex items-center justify-center text-[10px] font-bold text-zinc-300">
                            {initial}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-white">
                              {lead.username ? `@${lead.username}` : "unknown"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Email Address Column */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {lead.email ? (
                          <div className="flex items-center gap-1.5 text-zinc-300 font-mono text-[11px]">
                            <Mail className="w-3.5 h-3.5 text-zinc-500" />
                            <a
                              href={`mailto:${lead.email}`}
                              className="hover:text-white hover:underline transition-colors"
                            >
                              {lead.email}
                            </a>
                          </div>
                        ) : (
                          <span className="text-zinc-600 font-mono text-xs">—</span>
                        )}
                      </td>

                      {/* 3. Phone Number Column */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {lead.phone ? (
                          <div className="flex items-center gap-2 text-zinc-300 font-mono text-[11px]">
                            <Phone className="w-3.5 h-3.5 text-zinc-500" />
                            <span>{lead.phone}</span>
                            {waUrl && (
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-zinc-500 hover:text-emerald-400 transition-colors ml-0.5"
                                title="Open WhatsApp Chat"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-zinc-600 font-mono text-xs">—</span>
                        )}
                      </td>

                      {/* 4. Captured Via (Source Automation) */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#141414] border border-[#262626] text-zinc-300">
                          {lead.automation?.name || "Direct DM"}
                        </span>
                      </td>

                      {/* 5. Date Captured Column */}
                      <td className="py-4 px-4 whitespace-nowrap text-zinc-400 text-xs font-mono text-right">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeadsTable;
