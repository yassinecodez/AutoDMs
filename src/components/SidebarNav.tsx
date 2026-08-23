"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, UserCheck, Settings, FileSpreadsheet, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export function SidebarNav() {
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
  ];

  return (
    <>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-violet-600 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <Icon className="w-5 h-5" />
            {item.name}
          </Link>
        );
      })}
    </>
  );
}
export default SidebarNav;
