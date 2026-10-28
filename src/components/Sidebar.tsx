"use client";

import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense, useState } from "react";
import SidebarNav, { type KategoriMenu } from "@/components/SidebarNav";
import { COOKIE_SIDEBAR } from "@/lib/sidebar";

type Props = {
  kategori?: KategoriMenu[];
  tampilKuota?: boolean;
  nama: string;
  peran: string;
  /** Keadaan awal dari cookie, agar halaman langsung tampil sesuai pilihan terakhir tanpa berkedip. */
  awalTertutup: boolean;
  logout: () => void | Promise<void>;
};

/**
 * Sidebar: logo Peruri di atas, menu, dan kartu pengguna. Pada layar lebar bisa dibuka-tutup;
 * tertutup hanya menampilkan ikon dan logo berupa bunga saja. Pada layar kecil selalu penuh.
 */
export default function Sidebar({ kategori, tampilKuota, nama, peran, awalTertutup, logout }: Props) {
  const [tertutup, setTertutup] = useState(awalTertutup);

  function ganti() {
    const baru = !tertutup;
    setTertutup(baru);
    document.cookie = `${COOKIE_SIDEBAR}=${baru ? "tutup" : "buka"}; path=/; max-age=31536000; samesite=lax`;
  }

  return (
    <aside
      className={`flex flex-col gap-4 border-b border-line bg-card p-4 transition-[width] duration-200 md:sticky md:top-0 md:h-screen md:shrink-0 md:overflow-y-auto md:border-b-0 md:border-r md:p-5 ${
        tertutup ? "md:w-20 md:px-3" : "md:w-64"
      }`}
    >
      <div className={`flex items-center ${tertutup ? "justify-between md:flex-col md:gap-3" : "justify-between gap-2"}`}>
        <Link href="/dashboard" aria-label="Peruri, ke Dashboard" className="flex items-center">
          {/* Logo penuh (selalu di layar kecil; saat sidebar tertutup disembunyikan di layar lebar) */}
          <span className={tertutup ? "md:hidden" : ""}>
            <Image src="/logo-peruri.png" alt="Peruri" width={941} height={333} priority className="h-10 w-auto dark:hidden" />
            <Image src="/logo-peruri-putih.png" alt="Peruri" width={1466} height={492} priority className="hidden h-10 w-auto dark:block" />
          </span>
          {/* Hanya bunga, saat sidebar tertutup */}
          <span className={tertutup ? "hidden md:block" : "hidden"}>
            <Image src="/logo-peruri-ikon.png" alt="Peruri" width={436} height={224} priority className="h-auto w-10 dark:hidden" />
            <Image src="/logo-peruri-putih-ikon.png" alt="Peruri" width={684} height={344} priority className="hidden h-auto w-10 dark:block" />
          </span>
        </Link>

        <button
          type="button"
          onClick={ganti}
          aria-label={tertutup ? "Buka sidebar" : "Tutup sidebar"}
          aria-expanded={!tertutup}
          title={tertutup ? "Buka sidebar" : "Tutup sidebar"}
          className="hidden rounded-lg p-2 text-muted transition hover:bg-soft hover:text-ink md:inline-flex"
        >
          {tertutup ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <Suspense fallback={null}>
        <SidebarNav kategori={kategori} ringkas={tertutup} tampilKuota={tampilKuota} />
      </Suspense>

      <div className={`mt-auto flex items-center gap-3 rounded-2xl bg-primary-soft p-3 ${tertutup ? "md:flex-col md:p-2" : ""}`}>
        <span
          title={tertutup ? `${nama} (${peran})` : undefined}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-card text-sm font-bold text-primary"
        >
          {nama.slice(0, 1).toUpperCase()}
        </span>
        <div className={`min-w-0 flex-1 ${tertutup ? "md:hidden" : ""}`}>
          <div className="truncate text-sm font-semibold">{nama}</div>
          <div className="truncate text-xs text-muted">{peran}</div>
        </div>
        <form action={logout}>
          <button type="submit" className="rounded-lg p-2 text-muted transition hover:bg-card hover:text-danger" aria-label="Keluar" title="Keluar">
            <LogOut size={16} />
          </button>
        </form>
      </div>
    </aside>
  );
}
