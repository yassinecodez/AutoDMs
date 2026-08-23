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
      value: totalLeads,
      icon: Users,
    },
    {
      name: "Leads this week",
      value: leadsThisWeek,
      icon: Calendar,
    },
    {
      name: "Top converting rule",
      value: topConvertingRule,
      icon: Award,
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#F9FAFB] tracking-tight">Leads database</h1>
        <p className="text-xs md:text-sm text-[#9CA3AF]">
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
              className="p-5 bg-[#111827] border border-[#1F2937] rounded-xl flex items-center justify-between shadow-sm"
            >
              <div className="space-y-1">
                <p className="text-xs font-medium text-[#9CA3AF]">{stat.name}</p>
                <p className="text-2xl font-extrabold text-[#F9FAFB] tracking-tight truncate max-w-[200px]" title={String(stat.value)}>
                  {stat.value}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0B0F17] border border-[#1F2937] text-[#00DF81] shrink-0">
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Leads Table Section */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[#F9FAFB]">All captured leads</h2>
        <LeadsTable initialLeads={leads} />
      </div>
    </div>
  );
}
