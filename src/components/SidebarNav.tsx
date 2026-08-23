"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, UserCheck, Settings, FileSpreadsheet, Users, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

export function SidebarNav({ dmsCount = 0, dmsLimit = 150 }: { dmsCount?: number; dmsLimit?: number }) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Meta Accounts",
      href: "/dashboard/accounts",
      icon: UserCheck,
    },
    {
      name: "Automations",
      href: "/dashboard/automations",
      icon: Settings,
    },
    {
      name: "Leads Database",
      href: "/dashboard/leads",
      icon: Users,
    },
    {
      name: "Activity Logs",
      href: "/dashboard/logs",
      icon: FileSpreadsheet,
    },
    {
      name: "Settings & Billing",
      href: "/dashboard/settings",
      icon: CreditCard,
    },
  ];

  return (
    <div className="space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors group relative",
              isActive
                ? "bg-[#1F2937] text-[#F9FAFB]"
                : "text-[#9CA3AF] hover:bg-[#111827] hover:text-[#F9FAFB]"
            )}
          >
            <div className="flex items-center gap-3">
              <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-[#00DF81]" : "text-slate-500 group-hover:text-slate-300")} />
              <span>{item.name}</span>
            </div>
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#00DF81] shrink-0" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
export default SidebarNav;
