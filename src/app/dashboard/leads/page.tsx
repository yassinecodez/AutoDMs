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

  const totalLeads = leads.length;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const leadsThisWeek = leads.filter(
    (l) => new Date(l.createdAt).getTime() >= sevenDaysAgo.getTime()
  ).length;

  const counts: { [key: string]: number } = {};
  leads.forEach((l) => {
    const name = l.automation?.name || "Direct / Manual";
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
      name: "Total leads captured",
      value: totalLeads.toLocaleString(),
      subtext: "Emails & phone contacts",
      icon: Users,
    },
    {
      name: "Leads this week",
      value: leadsThisWeek.toLocaleString(),
      subtext: "Last 7 days",
      icon: Calendar,
    },
    {
      name: "Top converting rule",
      value: topConvertingRule,
      subtext: maxCount > 0 ? `${maxCount} conversions` : "No activity",
      icon: Award,
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="space-y-0.5 pb-2 border-b border-[#222222]">
        <h1 className="text-xl font-bold text-white tracking-tight">Leads database</h1>
        <p className="text-xs text-zinc-400">
          Search, filter, and export contact details verified via direct message conversations
        </p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="p-4 bg-[#0A0A0A] border border-[#222222] rounded-xl flex items-center justify-between shadow-sm"
            >
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-zinc-400">{stat.name}</p>
                <p className="text-2xl font-bold text-white tracking-tight truncate max-w-[200px]" title={String(stat.value)}>
                  {stat.value}
                </p>
                <p className="text-[11px] text-zinc-500">{stat.subtext}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#111111] border border-[#222222] text-white shrink-0">
                <Icon className="w-4 h-4" strokeWidth={1.75} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Leads Table Section */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-white">All captured contacts</h2>
        <LeadsTable initialLeads={leads} />
      </div>
    </div>
  );
}
