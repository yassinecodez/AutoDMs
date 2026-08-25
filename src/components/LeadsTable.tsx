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
import { getCommenterAvatar } from "@/lib/commenterAvatar";

interface Lead {
  id: string;
  username: string | null;
  email: string | null;
  phone: string | null;
  isFollower?: boolean | null;
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Contacts & leads</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            View, filter, and export contact details captured from Instagram DMs
          </p>
        </div>

        <button
          onClick={exportToCsv}
          disabled={filteredLeads.length === 0}
          className="bg-primary text-primary-foreground hover:opacity-90 font-medium rounded-lg h-9 px-4 text-sm flex items-center gap-2 transition-colors disabled:opacity-40 shrink-0 shadow-sm"
        >
          <Download className="w-4 h-4" strokeWidth={2} />
          Export CSV ({filteredLeads.length})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. Filter & Search Controls Bar */}
      {/* ========================================================================= */}
      <div className="bg-card border border-border rounded-2xl p-3 flex flex-wrap gap-3 items-center justify-between shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by @handle, email, phone, or rule..."
            className="w-full h-9 pl-9 pr-3 bg-secondary border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
          />
        </div>

        {/* Filter Type Pills */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-secondary border border-border rounded-xl p-1 text-xs font-medium text-muted-foreground">
            <button
              onClick={() => setFilterType("ALL")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterType === "ALL" ? "bg-card text-foreground font-semibold shadow-sm" : "hover:text-foreground"
              }`}
            >
              All contacts
            </button>
            <button
              onClick={() => setFilterType("EMAIL")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterType === "EMAIL" ? "bg-card text-foreground font-semibold shadow-sm" : "hover:text-foreground"
              }`}
            >
              With email
            </button>
            <button
              onClick={() => setFilterType("PHONE")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterType === "PHONE" ? "bg-card text-foreground font-semibold shadow-sm" : "hover:text-foreground"
              }`}
            >
              With phone
            </button>
          </div>

          <span className="text-xs text-muted-foreground font-medium">
            Showing {filteredLeads.length} contact{filteredLeads.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. Contacts Data Table */}
      {/* ========================================================================= */}
      {initialLeads.length === 0 ? (
        /* Empty State (0 total leads in DB) */
        <div className="border border-dashed border-border rounded-2xl p-12 text-center my-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center mx-auto text-muted-foreground">
            <Users className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">No leads captured yet</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              When followers send their email or phone number in Instagram DMs, AutoDMs automatically extracts, verifies, and records them here.
            </p>
          </div>
          <Link
            href="/dashboard/automations/builder"
            className="inline-flex items-center gap-2 h-10 px-5 bg-primary text-primary-foreground hover:opacity-90 font-medium rounded-lg text-xs transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            Create lead capture rule
          </Link>
        </div>
      ) : filteredLeads.length === 0 ? (
        /* Filter Empty State */
        <div className="p-12 text-center bg-card border border-border rounded-2xl text-xs space-y-3 shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <Filter className="w-6 h-6 text-muted-foreground mx-auto" />
          <p className="text-foreground font-medium">No contacts match your current filter</p>
          <button
            onClick={() => {
              setSearch("");
              setFilterType("ALL");
            }}
            className="text-xs font-semibold text-foreground hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Data Table */
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-medium text-muted-foreground bg-card border-b border-border">
                  <th className="py-3 px-4 font-medium">Contact</th>
                  <th className="py-3 px-4 font-medium">Follower status</th>
                  <th className="py-3 px-4 font-medium">Email address</th>
                  <th className="py-3 px-4 font-medium">Phone number</th>
                  <th className="py-3 px-4 font-medium">Captured via</th>
                  <th className="py-3 px-4 font-medium text-right">Date captured</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {filteredLeads.map((lead) => {
                  const waUrl = lead.phone ? getWhatsAppUrl(lead.phone) : null;

                  return (
                    <tr
                      key={lead.id}
                      className="bg-card hover:bg-zinc-50 dark:hover:bg-[#0E0E10] border-b border-border transition-colors group"
                    >
                      {/* 1. Contact Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full overflow-hidden bg-secondary border border-border flex items-center justify-center shrink-0 shadow-inner">
                            <img
                              src={getCommenterAvatar(lead.username)}
                              alt={lead.username || "User"}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-foreground">
                              {lead.username ? `@${lead.username}` : "unknown"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Follower Status Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                        {lead.isFollower ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                            Follower
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-secondary border border-border text-muted-foreground">
                            Not following
                          </span>
                        )}
                      </td>

                      {/* 3. Email Address Column */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {lead.email ? (
                          <div className="flex items-center gap-1.5 text-foreground text-[11px] font-normal">
                            <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                            <a
                              href={`mailto:${lead.email}`}
                              className="hover:underline transition-colors font-medium"
                            >
                              {lead.email}
                            </a>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>

                      {/* 4. Phone Number Column */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {lead.phone ? (
                          <div className="flex items-center gap-2 text-foreground text-[11px] font-normal">
                            <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>{lead.phone}</span>
                            {waUrl && (
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-muted-foreground hover:text-emerald-500 transition-colors ml-0.5"
                                title="Open WhatsApp Chat"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>

                      {/* 5. Captured Via (Source Automation) */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-secondary border border-border text-foreground">
                          {lead.automation?.name || "Direct DM"}
                        </span>
                      </td>

                      {/* 6. Date Captured Column */}
                      <td className="py-4 px-4 whitespace-nowrap text-muted-foreground text-xs font-normal text-right">
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
