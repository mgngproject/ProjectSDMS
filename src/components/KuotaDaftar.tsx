"use client";

import { ChevronDown } from "lucide-react";
import { useState, useTransition } from "react";
import { hapusKuota, simpanKuota } from "@/app/(app)/kuota/actions";
import { statusKuota } from "@/lib/kuota";

export type ItemDivisi = {
  awalan: string;
  kode: string | null;
  nama: string;
  /** Peserta aktif di divisi ini pada bulan yang dipilih. */
  terisi: number;
  /** Kuota yang sudah disimpan; null bila belum diatur. */
  kuota: number | null;
  units: { kode: string; nama: string; jumlah: number }[];
  /** Kuota tersimpan tetapi divisinya tidak ada lagi di daftar bagan. */
  yatim: boolean;
};

const PILL = { success: "pill-success", warning: "pill-warning", danger: "pill-danger" } as const;
const BAR = { success: "bg-success", warning: "bg-warning", danger: "bg-danger" } as const;

/** Daftar divisi memanjang; klik satu divisi membuka unit kerjanya di bawahnya. Kuota diubah langsung di barisnya. */
export default function KuotaDaftar({ items }: { items: ItemDivisi[] }) {
  const [kuota, setKuota] = useState<Record<string, number | null>>(() => Object.fromEntries(items.map((d) => [d.awalan, d.kuota])));
  const [terbuka, setTerbuka] = useState<Set<string>>(new Set());
  const [galat, setGalat] = useState<string | null>(null);
  const [, mulai] = useTransition();

  const ubah = (awalan: string, nilai: number) => {
    const sebelum = kuota[awalan] ?? null;
    if (!Number.isInteger(nilai) || nilai < 0 || nilai === sebelum) return;
    setKuota((k) => ({ ...k, [awalan]: nilai }));
    setGalat(null);
    mulai(async () => {
      const r = await simpanKuota(awalan, nilai);
      if (r.error) {
        setKuota((k) => ({ ...k, [awalan]: sebelum }));
        setGalat(r.error);
      }
    });
  };
  const buang = (awalan: string) =>
    mulai(async () => {
      const r = await hapusKuota(awalan);
      if (r.error) setGalat(r.error);
    });
  const geser = (awalan: string) =>
    setTerbuka((s) => {
      const n = new Set(s);
      if (!n.delete(awalan)) n.add(awalan);
      return n;
    });

  return (
    <div className="card overflow-hidden">
      {galat && <p className="border-b border-line bg-danger-soft p-3 text-sm text-danger" role="alert">{galat}</p>}
      <div className="hidden grid-cols-[minmax(0,1fr)_120px_180px_150px] gap-3 border-b border-line px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted md:grid">
        <span>Divisi</span><span>Terisi / kuota</span><span>Penggunaan</span><span>Kuota</span>
      </div>
      {items.length === 0 && <p className="p-6 text-center text-sm text-muted">Daftar Kode Bagan masih kosong. Minta Super Admin mengisinya di menu Kode Bagan.</p>}
      {items.map((d) => {
        const k = kuota[d.awalan] ?? null;
        const st = k === null ? null : statusKuota(k, d.terisi);
        const pct = k ? Math.min(100, (d.terisi / k) * 100) : d.terisi ? 100 : 0;
        const buka = terbuka.has(d.awalan);
        return (
          <div key={d.awalan} className="border-b border-line last:border-b-0">
            <div className="grid items-center gap-3 px-4 py-3 md:grid-cols-[minmax(0,1fr)_120px_180px_150px]">
              <button
                type="button" aria-expanded={buka} aria-controls={`unit-${d.awalan}`} onClick={() => geser(d.awalan)}
                className="group flex min-w-0 items-center gap-2.5 text-left"
              >
                <ChevronDown size={18} className={`shrink-0 text-muted transition ${buka ? "rotate-180" : ""}`} aria-hidden="true" />
                <span className="min-w-0">
                  <b className="font-semibold group-hover:text-primary">{d.nama}</b>
                  {d.kode && <span className="ml-1.5 text-xs tabular-nums text-muted">{d.kode}</span>}
                  <small className="block text-xs text-muted">{d.yatim ? "Tidak ada di daftar Kode Bagan" : `${d.units.length} unit kerja`}</small>
                </span>
              </button>
              <div>
                <div className="h-2 overflow-hidden rounded-full bg-soft" aria-hidden="true">
                  <i className={`block h-full rounded-full ${st ? BAR[st.nada] : "bg-muted"}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-0.5 text-xs tabular-nums text-muted">{d.terisi} / {k ?? "-"} · {k === null ? "kuota belum diatur" : `sisa ${k - d.terisi}`}</div>
              </div>
              <div>{st ? <span className={PILL[st.nada]}>{st.label}</span> : <span className="pill-warning">Belum diatur</span>}</div>
              <div className="flex items-center gap-1">
                <button type="button" className="btn-secondary !h-7 !w-7 !p-0" aria-label={`Kurangi kuota ${d.nama}`} onClick={() => ubah(d.awalan, Math.max(0, (k ?? 0) - 1))}>−</button>
                <input
                  key={`${d.awalan}-${k}`} className="input !w-14 !px-1 !py-1 text-center" type="number" min={0} step={1} defaultValue={k ?? ""} placeholder="-"
                  aria-label={`Kuota ${d.nama}`}
                  onBlur={(e) => { const n = e.target.value === "" ? NaN : Number(e.target.value); if (!Number.isNaN(n)) ubah(d.awalan, n); }}
                  onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
                />
                <button type="button" className="btn-secondary !h-7 !w-7 !p-0" aria-label={`Tambah kuota ${d.nama}`} onClick={() => ubah(d.awalan, (k ?? 0) + 1)}>+</button>
                {d.yatim && <button type="button" className="btn-danger ml-1" onClick={() => buang(d.awalan)}>Hapus</button>}
              </div>
            </div>
            {buka && (
              <div id={`unit-${d.awalan}`} className="border-t border-line bg-soft px-4 pb-3 pt-1 md:pl-11">
                {d.units.length === 0 ? (
                  <p className="py-2 text-xs text-muted">{d.yatim ? "Divisi ini sudah tidak ada di daftar Kode Bagan." : "Belum ada unit kerja untuk divisi ini di daftar Kode Bagan."}</p>
                ) : (
                  d.units.map((u) => (
                    <div key={u.kode} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-line py-2 text-sm last:border-b-0">
                      <span><b className="mr-2 tabular-nums">{u.kode}</b>{u.nama}</span>
                      <span className="font-semibold tabular-nums" title="Peserta aktif pada bulan yang dipilih">{u.jumlah} peserta</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
