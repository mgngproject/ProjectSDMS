"use client";

import { BarChart3, CalendarClock, ChevronDown, FileText, Gauge, LayoutDashboard, UserMinus, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const MENU = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/karyawan", label: "Karyawan", icon: Users },
  { href: "/kontrak", label: "Kontrak", icon: FileText },
  { href: "/datadiri", label: "Data Diri", icon: BarChart3 },
  { href: "/monitoring", label: "Monitoring", icon: CalendarClock },
  { href: "/terminate", label: "Terminate", icon: UserMinus },
  { href: "/kuota", label: "Kuota", icon: Gauge },
];

export type KategoriMenu = { nama: string; jumlah: number };

type Props = {
  /** Hanya untuk Super Admin: submenu Karyawan per kategori. Admin kategori tidak memakainya. */
  kategori?: KategoriMenu[];
  /** Sidebar tertutup (layar lebar): hanya ikon, tanpa tulisan dan submenu. */
  ringkas?: boolean;
  /** Menu Kuota hanya untuk Super Admin dan PIC Magang. */
  tampilKuota?: boolean;
};

const kelasItem = (aktif: boolean) =>
  `relative flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition ${
    aktif ? "bg-primary-soft text-primary" : "text-muted hover:bg-soft hover:text-ink"
  }`;

export default function SidebarNav({ kategori, ringkas = false, tampilKuota = false }: Props) {
  const path = usePathname();
  const pilihan = useSearchParams().get("kategori");
  const diKaryawan = path === "/karyawan" || path.startsWith("/karyawan/");
  // Submenu terbuka saat masuk ke halaman Karyawan dan tertutup saat keluar; setelah itu bisa dibuka/ditutup
  // lewat panah atau dengan mengklik "Karyawan" ketika sudah berada di halamannya
  const [terbuka, setTerbuka] = useState(diKaryawan);
  useEffect(() => setTerbuka(diKaryawan), [diKaryawan]);
  const total = (kategori ?? []).reduce((n, k) => n + k.jumlah, 0);

  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
      {MENU.filter((m) => m.href !== "/kuota" || tampilKuota).map(({ href, label, icon: Icon }) => {
        const aktif = path === href || path.startsWith(`${href}/`);
        const punyaSubmenu = href === "/karyawan" && kategori && kategori.length > 0;
        const submenuTampil = punyaSubmenu && !ringkas;

        return (
          <div key={href} className="flex flex-col gap-1">
            <div className="relative flex items-center">
              <Link
                href={href}
                title={ringkas ? label : undefined}
                className={`${kelasItem(aktif && !submenuTampil)} flex-1 ${aktif && submenuTampil ? "text-primary" : ""} ${ringkas ? "md:justify-center md:px-0" : ""}`}
                onClick={(e) => {
                  if (!submenuTampil) return;
                  // Sudah di halaman Karyawan dengan submenu terbuka: klik menutupnya tanpa pindah halaman
                  if (diKaryawan && terbuka) {
                    e.preventDefault();
                    setTerbuka(false);
                  } else {
                    setTerbuka(true);
                  }
                }}
              >
                {aktif && !submenuTampil && <span className="absolute inset-y-1 left-0 hidden w-1 rounded-full bg-primary md:block" />}
                <Icon size={18} className="shrink-0" />
                <span className={ringkas ? "md:sr-only" : ""}>{label}</span>
              </Link>
              {submenuTampil && (
                <button
                  type="button"
                  onClick={() => setTerbuka((v) => !v)}
                  aria-label={terbuka ? "Tutup submenu Karyawan" : "Buka submenu Karyawan"}
                  aria-expanded={terbuka}
                  className="absolute right-2 hidden rounded-lg p-1.5 text-muted transition hover:bg-soft hover:text-ink md:block"
                >
                  <ChevronDown size={16} className={`transition ${terbuka ? "rotate-180" : ""}`} />
                </button>
              )}
            </div>

            {submenuTampil && terbuka && (
              <div className="ml-4 hidden flex-col gap-0.5 border-l border-line pl-2 md:flex">
                {[{ nama: null as string | null, jumlah: total }, ...kategori!].map((k) => {
                  const subAktif = diKaryawan && path === "/karyawan" && (k.nama ?? null) === (pilihan || null);
                  return (
                    <Link
                      key={k.nama ?? "semua"}
                      href={k.nama ? `/karyawan?kategori=${encodeURIComponent(k.nama)}` : "/karyawan"}
                      className={`flex items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-sm transition ${
                        subAktif ? "bg-primary-soft font-medium text-primary" : "text-muted hover:bg-soft hover:text-ink"
                      }`}
                    >
                      <span className="truncate">{k.nama ?? "Semua"}</span>
                      <span className="text-xs tabular-nums opacity-70">{k.jumlah}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
