import { RotateCcw, Search } from "lucide-react";
import Link from "next/link";
import { NAMA_BULAN } from "@/lib/format";
import type { ParamFilter } from "@/lib/filter";
import type { Kategori } from "@/lib/types";

const PERIODE = {
  masuk: "Kontrak masuk",
  habis: "Kontrak habis",
  keluar: "Tanggal keluar",
} as const;

type Props = {
  p: ParamFilter;
  /** Daftar kategori; hanya diberikan untuk Super Admin. */
  kategori?: Kategori[];
  /** Jenis periode yang tersedia (bawaan: masuk dan habis). */
  periode?: (keyof typeof PERIODE)[];
  resetHref: string;
  /** Filter tambahan khusus halaman, diletakkan sebelum tombol Cari. */
  children?: React.ReactNode;
};

/** Baris filter yang sama di semua halaman daftar: kategori (Super Admin), cari nama/NP, periode, filter khusus, Cari, Reset. */
export default function FilterBar({ p, kategori, periode = ["masuk", "habis"], resetHref, children }: Props) {
  const tahunIni = new Date().getFullYear();
  const daftarTahun = Array.from({ length: 8 }, (_, i) => tahunIni + 2 - i);

  return (
    <form className="flex flex-wrap items-center gap-2" role="search">
      {kategori && (
        <select className="input w-auto" name="kategori" defaultValue={p.kategori ?? ""} aria-label="Kategori">
          <option value="">Semua kategori</option>
          {kategori.map((c) => <option key={c.id} value={c.nama}>{c.nama}</option>)}
        </select>
      )}
      <input className="input max-w-xs" name="q" defaultValue={p.q ?? ""} placeholder="Cari nama / NP" aria-label="Cari nama atau NP" />
      <select className="input w-auto" name="filter" defaultValue={p.filter ?? ""} aria-label="Jenis periode">
        <option value="">Semua periode</option>
        {periode.map((j) => <option key={j} value={j}>{PERIODE[j]}</option>)}
      </select>
      <select className="input w-auto" name="bulan" defaultValue={p.bulan ?? ""} aria-label="Bulan">
        <option value="">Semua bulan</option>
        {NAMA_BULAN.map((n, i) => <option key={n} value={i + 1}>{n}</option>)}
      </select>
      <select className="input w-auto" name="tahun" defaultValue={p.tahun ?? ""} aria-label="Tahun">
        <option value="">Semua tahun</option>
        {daftarTahun.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      {children}
      <button className="btn" type="submit"><Search size={16} /> Cari</button>
      <Link className="btn-secondary" href={resetHref}><RotateCcw size={16} /> Reset</Link>
    </form>
  );
}

/** Pilihan filter tambahan: kotak pilihan dengan nama parameter sendiri. */
export function PilihanFilter({ name, label, options, nilai }: { name: string; label: string; options: { value: string; label: string }[]; nilai?: string }) {
  return (
    <select className="input w-auto" name={name} defaultValue={nilai ?? ""} aria-label={label}>
      <option value="">{label}</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
