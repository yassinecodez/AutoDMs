"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Zap, LayoutTemplate, Users, ScrollText, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const InstagramNavIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export function SidebarNav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Automations",
      href: "/dashboard/automations",
      icon: Zap,
    },
    {
      name: "Templates",
      href: "/dashboard/templates",
      icon: LayoutTemplate,
    },
    {
      name: "Leads Database",
      href: "/dashboard/leads",
      icon: Users,
    },
    {
      name: "Instagram Accounts",
      href: "/dashboard/accounts",
      icon: InstagramNavIcon,
    },
    {
      name: "Activity Logs",
      href: "/dashboard/logs",
      icon: ScrollText,
    },
    {
      name: "Settings & Billing",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="space-y-1">
      {navItems.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors group relative",
              isActive
                ? "bg-white/10 text-white"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
            )}
          >
            <div className="flex items-center gap-2.5">
              <Icon
                className={cn(
                  "w-4 h-4 transition-colors",
                  isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                )}
              />
              <span>{item.name}</span>
            </div>
            {isActive && (
              <span className="w-1 h-3 rounded-full bg-white shrink-0" />
            )}
          </Link>
        );
      })}
    </div>
  );
}

export default SidebarNav;
