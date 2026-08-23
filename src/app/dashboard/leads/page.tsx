import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Users, Calendar, Award } from "lucide-react";
import LeadsTable from "@/components/LeadsTable";

export default async function LeadsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }
  const userId = session.user.id;

  // Fetch all leads captured for this user's Instagram accounts
  const leads = await db.lead.findMany({
    where: {
      igAccount: {
        userId,
      },
    },
    include: {
      automation: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Calculate statistics
  const totalLeads = leads.length;

  // Leads captured this week (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const leadsThisWeek = leads.filter(
    (l) => new Date(l.createdAt).getTime() >= sevenDaysAgo.getTime()
  ).length;

  // Calculate top converting rule
  const counts: { [key: string]: number } = {};
  leads.forEach((l) => {
    const name = l.automation?.name || "Direct/Manual";
    counts[name] = (counts[name] || 0) + 1;
  });

  let topConvertingRule = "None";
  let maxCount = 0;
  Object.entries(counts).forEach(([name, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topConvertingRule = name;
    }
  });

  const stats = [
    {
      name: "Total Leads Captured",
      value: totalLeads,
      icon: Users,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      name: "Leads This Week",
      value: leadsThisWeek,
      icon: Calendar,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      name: "Top Converting Rule",
      value: topConvertingRule,
      icon: Award,
      color: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Leads Database</h1>
        <p className="text-slate-400 text-sm">
          Track and export emails and phone numbers captured through direct message conversations
        </p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between shadow-sm"
            >
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.name}</p>
                <p className="text-2xl font-bold text-white tracking-tight truncate max-w-[200px]" title={String(stat.value)}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl border ${stat.color} shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Leads Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">All Captured Leads</h2>
        <LeadsTable initialLeads={leads} />
      </div>
    </div>
  );
}
