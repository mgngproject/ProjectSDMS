"use client";

import { ArrowLeftRight, Ellipsis, FileText, IdCard, Pencil, Trash2, UserX } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

type Props = {
  id: number;
  nama: string;
  np: string;
  /** Server action hapus yang sudah di-bind dengan id; dikirim lewat formAction tombol di dalam form tabel. */
  hapus: (formData: FormData) => void | Promise<void>;
};

const ITEM = "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-ink hover:bg-primary-soft focus-visible:bg-primary-soft focus-visible:outline-none";

/**
 * Aksi satu baris tabel Karyawan: ikon Ubah, dan menu titik tiga untuk Kontrak, Mutasi, Data Diri, Terminate, dan Hapus (dengan konfirmasi).
 * Menu memakai posisi fixed agar tidak terpotong wadah tabel yang bisa digeser, dan membuka ke atas bila tidak muat di bawah.
 * Menu tetap berada di dalam form tabel supaya tombol Hapus bisa memakai formAction.
 */
export default function AksiBaris({ id, nama, np, hapus }: Props) {
  const [buka, setBuka] = useState(false);
  const [konfirmasi, setKonfirmasi] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const tombol = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  const tutup = useCallback((fokus = false) => {
    setBuka(false);
    setKonfirmasi(false);
    setPos(null);
    if (fokus) tombol.current?.focus({ preventScroll: true });
  }, []);

  // Posisi dihitung setelah menu tampil agar tingginya diketahui. Halaman diperkecil lewat CSS zoom (globals.css), jadi koordinat layar dibagi zoom.
  useLayoutEffect(() => {
    if (!buka || !tombol.current || !menu.current) return;
    const z = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
    const r = tombol.current.getBoundingClientRect();
    const w = menu.current.offsetWidth, h = menu.current.offsetHeight;
    const vw = window.innerWidth / z, vh = window.innerHeight / z;
    const kanan = r.right / z, atas = r.top / z, bawah = r.bottom / z;
    let x = kanan - w, y = bawah + 6;
    if (x < 8) x = 8;
    if (x + w > vw - 8) x = vw - w - 8;
    if (y + h > vh - 8) y = Math.max(8, atas - h - 6);
    setPos({ x, y });
  }, [buka, konfirmasi]);

  useEffect(() => {
    if (!buka) return;
    const luar = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menu.current?.contains(t) || tombol.current?.contains(t)) return;
      tutup();
    };
    const gulir = () => tutup();
    document.addEventListener("mousedown", luar);
    window.addEventListener("scroll", gulir, true);
    window.addEventListener("resize", gulir);
    return () => {
      document.removeEventListener("mousedown", luar);
      window.removeEventListener("scroll", gulir, true);
      window.removeEventListener("resize", gulir);
    };
  }, [buka, tutup]);

  // Fokus ke item pertama saat menu terbuka
  useEffect(() => {
    if (buka && pos) (menu.current?.querySelector("[role=menuitem], button") as HTMLElement | null)?.focus({ preventScroll: true });
    // hanya saat menu pertama kali tampil dan saat pindah ke konfirmasi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buka, konfirmasi, pos === null]);

  const tombolKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { e.preventDefault(); tutup(true); return; }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const item = [...(menu.current?.querySelectorAll<HTMLElement>("a, button") ?? [])];
      const i = item.indexOf(document.activeElement as HTMLElement);
      item[(i + (e.key === "ArrowDown" ? 1 : -1) + item.length) % item.length]?.focus({ preventScroll: true });
    }
  };

  return (
    <div className="flex items-center justify-end gap-0.5">
      <Link
        href={`/karyawan/${id}/edit`} title="Ubah" aria-label={`Ubah ${nama}`}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-primary-soft hover:text-primary"
      >
        <Pencil size={17} />
      </Link>
      <button
        ref={tombol} type="button" aria-label={`Aksi lainnya untuk ${nama}`} title="Aksi lainnya" aria-haspopup="menu" aria-expanded={buka}
        onClick={() => (buka ? tutup(true) : setBuka(true))}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-primary-soft hover:text-primary ${buka ? "bg-primary-soft text-primary" : "text-muted"}`}
      >
        <Ellipsis size={18} />
      </button>

      {buka && (
        <div
          ref={menu} role={konfirmasi ? "alertdialog" : "menu"} aria-label={`Aksi untuk ${nama}`} onKeyDown={tombolKey}
          className="fixed z-40 min-w-[200px] rounded-2xl border border-line bg-card p-1.5 shadow-2xl"
          style={{ left: pos?.x ?? 0, top: pos?.y ?? 0, visibility: pos ? "visible" : "hidden" }}
        >
          {konfirmasi ? (
            <div className="max-w-[250px] px-2.5 pb-1.5 pt-2 text-sm">
              <b>Hapus {nama}?</b>
              <p className="mt-0.5 text-xs text-muted">Kontrak, data diri, dan monitoring ikut terhapus.</p>
              <div className="mt-2.5 flex gap-1.5">
                <button type="submit" formAction={hapus} className="rounded-lg bg-danger px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90">Hapus</button>
                <button type="button" onClick={() => tutup(true)} className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold hover:bg-soft">Batal</button>
              </div>
            </div>
          ) : (
            <>
              <div className="max-w-[240px] truncate px-2.5 pb-1 pt-1.5 text-xs font-semibold text-muted">{nama} ({np})</div>
              {([
                ["kontrak", "Kontrak", FileText],
                ["mutasi", "Mutasi", ArrowLeftRight],
                ["datadiri", "Data Diri", IdCard],
                ["terminate", "Terminate", UserX],
              ] as const).map(([rute, label, Ikon]) => (
                <Link key={rute} role="menuitem" href={`/karyawan/${id}/${rute}`} className={ITEM} onClick={() => tutup()}>
                  <Ikon size={16} className="text-muted" />{label}
                </Link>
              ))}
              <hr className="mx-1 my-1.5 border-line" />
              <button type="button" role="menuitem" onClick={() => setKonfirmasi(true)} className={`${ITEM} !text-danger hover:!bg-danger-soft focus-visible:!bg-danger-soft`}>
                <Trash2 size={16} />Hapus
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
