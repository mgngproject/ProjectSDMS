"use client";

import { BarChart3, CalendarClock, FileText, LayoutDashboard, UserMinus, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const MENU = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/karyawan", label: "Karyawan", icon: Users },
  { href: "/kontrak", label: "Kontrak", icon: FileText },
  { href: "/datadiri", label: "Data Diri", icon: BarChart3 },
  { href: "/monitoring", label: "Monitoring", icon: CalendarClock },
  { href: "/terminate", label: "Terminate", icon: UserMinus },
];

export default function SidebarNav() {
  const path = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
      {MENU.map(({ href, label, icon: Icon }) => {
        const aktif = path === href || path.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={`relative flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              aktif ? "bg-primary-soft text-primary" : "text-muted hover:bg-soft hover:text-ink"
            }`}
          >
            {aktif && <span className="absolute inset-y-1 left-0 hidden w-1 rounded-full bg-primary md:block" />}
            <Icon size={18} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
