"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import {
  KELOMPOK_USIA_3, TANPA_BAGAN, akanBerakhir, alasanKeluar, berkasBelumLengkap, corong, isAktif, kartu, kelengkapan, kelompokDivisi,
  labelBulan, masaKerja, pendidikanUsia, risiko, sebaranUsia, squarify, terminate, tren as hitungTren, type Orang,
} from "@/lib/dashboard-sa";
import { JENJANG } from "@/lib/filter";
import { formatTanggal, selisihHari } from "@/lib/format";

type Props = {
  orang: Orang[];
  hari: string;
  kategori: string[];
  jendela: Record<string, { label: string; sampai: string }>;
  baganTerisi: boolean;
};

// ---------- tooltip ----------
type BarisTip = { label: string; nilai: string | number; warna?: string; kotak?: boolean };
type Tip = { x: number; y: number; judul: string; baris: BarisTip[] } | null;
const TipCtx = createContext<{ tampil: (e: { clientX: number; clientY: number }, judul: string, baris: BarisTip[]) => void; sembunyi: () => void }>({ tampil: () => {}, sembunyi: () => {} });

function pasangTip(judul: string, baris: BarisTip[], t: { tampil: (e: { clientX: number; clientY: number }, judul: string, baris: BarisTip[]) => void; sembunyi: () => void }) {
  return {
    onPointerMove: (e: React.PointerEvent) => t.tampil(e, judul, baris),
    onPointerLeave: t.sembunyi,
    onFocus: (e: React.FocusEvent) => { const r = e.currentTarget.getBoundingClientRect(); t.tampil({ clientX: r.left + r.width / 2, clientY: r.bottom + 6 }, judul, baris); },
    onBlur: t.sembunyi,
  };
}

function useLebar<T extends HTMLElement>(awal = 640) {
  const ref = useRef<T>(null);
  const [w, setW] = useState(awal);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const baca = () => setW(Math.round(el.clientWidth) || awal);
    baca();
    const ro = new ResizeObserver(baca);
    ro.observe(el);
    return () => ro.disconnect();
  }, [awal]);
  return [ref, w] as const;
}

// ---------- potongan umum ----------
const C = (n: number) => `var(--chart-${n})`;
const persen = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

type Buka = (judul: string, orang: Orang[], link?: { href: string; label: string }) => void;

function Legend({ items }: { items: { warna: string; label: string; garis?: boolean }[] }) {
  return (
    <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1.5">
          <i className="inline-block rounded-sm" style={{ background: i.warna, width: i.garis ? 14 : 10, height: i.garis ? 2 : 10 }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

function KartuGrafik({ judul, tanya, legenda, tabel, kelas = "", children }: {
  judul: string; tanya: string; legenda?: ReactNode; tabel: { kolom: string[]; baris: (string | number)[][] }; kelas?: string; children: ReactNode;
}) {
  const [lihatTabel, setLihatTabel] = useState(false);
  return (
    <section className={`card min-w-0 p-5 ${kelas}`}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h2 className="font-semibold">{judul}</h2>
          <p className="text-xs text-muted">{tanya}</p>
        </div>
        <button type="button" className="btn-secondary !px-3 !py-1 !text-xs" aria-pressed={lihatTabel} onClick={() => setLihatTabel((v) => !v)}>
          {lihatTabel ? "Lihat grafik" : "Lihat tabel"}
        </button>
      </div>
      {lihatTabel ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr>{tabel.kolom.map((k, i) => <th key={k} className={`border-b border-line px-2 py-1.5 text-xs font-semibold text-muted ${i ? "text-right" : "text-left"}`}>{k}</th>)}</tr></thead>
            <tbody>{tabel.baris.map((r, j) => <tr key={j}>{r.map((c, i) => <td key={i} className={`border-b border-line px-2 py-1.5 tabular-nums ${i ? "text-right" : ""}`}>{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
      ) : (
        <>
          {legenda}
          {children}
        </>
      )}
    </section>
  );
}

/** Satu batang mendatar yang bisa diklik, dengan tooltip. */
function Segmen({ lebar, warna, teks, label, judul, baris, klik, akhir, minLebar = 4 }: {
  lebar: string; warna: string; teks?: ReactNode; label: string; judul: string; baris: BarisTip[]; klik: () => void; akhir?: boolean; minLebar?: number;
}) {
  const t = useContext(TipCtx);
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => { t.sembunyi(); klik(); }}
      {...pasangTip(judul, baris, t)}
      className="flex h-[22px] flex-none items-center justify-center text-[11.5px] font-semibold text-white hover:brightness-110 focus-visible:brightness-110"
      style={{ width: lebar, background: warna, borderRadius: akhir ? "0 4px 4px 0" : 0, minWidth: minLebar }}
    >
      {teks}
    </button>
  );
}

// ---------- kartu ringkasan ----------
function Spark({ nilai, warna }: { nilai: number[]; warna: string }) {
  const w = 100, h = 28, mn = Math.min(...nilai), mx = Math.max(...nilai), r = mx - mn || 1;
  const pts = nilai.map((v, i) => [2 + (i * (w - 8)) / (nilai.length - 1), h - 3 - ((v - mn) / r) * (h - 8)]);
  const e = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 block h-auto max-h-9 w-full overflow-visible" aria-hidden="true">
      <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke={warna} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={e[0]} cy={e[1]} r="3.5" fill={warna} stroke="rgb(var(--card))" strokeWidth="2" />
    </svg>
  );
}

function Delta({ skr, lalu }: { skr: number; lalu: number }) {
  const d = skr - lalu;
  return <div className="mt-0.5 text-xs text-muted"><b className="font-semibold text-ink/80">{d === 0 ? "sama dengan bulan lalu" : `${d > 0 ? "+" : ""}${d} dari bulan lalu`}</b> ({lalu})</div>;
}

// ---------- tren ----------
function kurva(pts: number[][]): string {
  const n = pts.length, dx: number[] = [], m: number[] = [], t: number[] = [];
  for (let i = 0; i < n - 1; i++) { dx[i] = pts[i + 1][0] - pts[i][0]; m[i] = (pts[i + 1][1] - pts[i][1]) / dx[i]; }
  t[0] = m[0]; t[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) { t[i] = 0; t[i + 1] = 0; continue; }
    const a = t[i] / m[i], b = t[i + 1] / m[i], h = a * a + b * b;
    if (h > 9) { const k = 3 / Math.sqrt(h); t[i] = k * a * m[i]; t[i + 1] = k * b * m[i]; }
  }
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < n - 1; i++) { const c = dx[i] / 3; d += ` C${pts[i][0] + c},${pts[i][1] + t[i] * c} ${pts[i + 1][0] - c},${pts[i + 1][1] - t[i + 1] * c} ${pts[i + 1][0]},${pts[i + 1][1]}`; }
  return d;
}

function Tren({ orang, hari, buka, judulBagian }: { orang: Orang[]; hari: string; buka: Buka; judulBagian: string }) {
  const t = useContext(TipCtx);
  const gid = useId().replace(/:/g, "");
  const [ref, W] = useLebar<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const data = useMemo(() => hitungTren(orang, hari), [orang, hari]);
  const kecil = W < 480, ph = kecil ? 170 : 210, bh = kecil ? 110 : 130, g = 26, top = 12, H = top + ph + g + bh + 26;
  const L = 38, Rr = 14, step = (W - L - Rr) / data.length;
  const mn = Math.min(...data.map((d) => d.aktif)), mx = Math.max(...data.map((d) => d.aktif));
  const lo = Math.max(0, Math.floor((mn - 4) / 10) * 10), hi = Math.ceil((mx + 4) / 10) * 10, tk = hi - lo > 60 ? 20 : 10;
  const yv = (v: number) => top + ph - ((v - lo) / (hi - lo || 1)) * ph;
  const mxb = Math.max(2, ...data.map((d) => Math.max(d.masuk.length, d.keluar.length)));
  const mid = top + ph + g + bh * 0.5, sc = (bh * 0.5 - 4) / mxb;
  const pts = data.map((d, i) => [L + step * i + step / 2, yv(d.aktif)]);
  const ticks: number[] = []; for (let v = lo; v <= hi; v += tk) ticks.push(v);
  const bw = Math.min(14, step / 2 - 3);

  return (
    <KartuGrafik
      kelas="lg:col-span-2"
      judul="Tren karyawan"
      tanya={judulBagian}
      legenda={<div className="mb-2 flex flex-wrap items-center justify-between gap-2"><Legend items={[{ warna: C(1), label: "Karyawan aktif", garis: true }]} /><Legend items={[{ warna: C(1), label: "Masuk" }, { warna: C(2), label: "Keluar" }]} /></div>}
      tabel={{ kolom: ["Bulan", "Aktif", "Masuk", "Keluar"], baris: data.map((d) => [labelBulan(d.ym), d.aktif, d.masuk.length, d.keluar.length]) }}
    >
      <div ref={ref} className="w-full">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full overflow-visible" role="img" aria-label="Tren karyawan aktif, masuk, dan keluar 12 bulan terakhir">
          <defs>
            <linearGradient id={`g${gid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={C(1)} stopOpacity=".32" />
              <stop offset="1" stopColor={C(1)} stopOpacity="0" />
            </linearGradient>
          </defs>
          {ticks.map((v) => (
            <g key={v}>
              <line x1={L} x2={W - Rr} y1={yv(v)} y2={yv(v)} stroke="var(--chart-grid)" />
              <text x={L - 6} y={yv(v) + 4} textAnchor="end" fontSize="11" fill="var(--chart-tick)">{v}</text>
            </g>
          ))}
          <path d={`${kurva(pts)} L${pts[pts.length - 1][0]},${top + ph} L${pts[0][0]},${top + ph}Z`} fill={`url(#g${gid})`} />
          <path d={kurva(pts)} fill="none" stroke={C(1)} strokeWidth="2.25" strokeLinecap="round" />
          {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="4" fill={C(1)} stroke="rgb(var(--card))" strokeWidth="2" />)}
          <text x={pts[pts.length - 1][0] - 8} y={pts[pts.length - 1][1] - 12} textAnchor="end" fontSize="12" fontWeight="600" fill="rgb(var(--ink))">{data[data.length - 1].aktif}</text>
          <line x1={L} x2={W - Rr} y1={mid} y2={mid} stroke="var(--chart-axis)" />
          <text x={L - 6} y={mid + 4} textAnchor="end" fontSize="11" fill="var(--chart-tick)">0</text>
          {data.map((d, i) => {
            const cx = L + step * i + step / 2, m = d.masuk.length, k = d.keluar.length;
            return (
              <g key={d.ym}>
                {m > 0 && <rect x={cx - bw - 1} y={mid - m * sc} width={bw} height={m * sc} rx="3" fill={C(1)} />}
                {k > 0 && <rect x={cx + 1} y={mid} width={bw} height={k * sc} rx="3" fill={C(2)} />}
                {(!kecil || i % 2 === 0) && <text x={cx} y={H - 6} textAnchor="middle" fontSize="11" fill="var(--chart-tick)">{labelBulan(d.ym)}</text>}
              </g>
            );
          })}
          {hover != null && <line x1={pts[hover][0]} x2={pts[hover][0]} y1={top} y2={top + ph + g + bh} stroke="var(--chart-axis)" pointerEvents="none" />}
          {data.map((d, i) => {
            const aksi = () => { t.sembunyi(); buka(`Masuk dan keluar ${labelBulan(d.ym)}`, [...d.masuk, ...d.keluar]); };
            const tip = pasangTip(labelBulan(d.ym), [{ label: "Karyawan aktif", nilai: d.aktif, warna: C(1) }, { label: "Masuk", nilai: d.masuk.length, warna: C(1), kotak: true }, { label: "Keluar", nilai: d.keluar.length, warna: C(2), kotak: true }], t);
            return (
              <rect
                key={d.ym} x={L + step * i} y={top} width={step} height={H - top - 18} fill="transparent" tabIndex={0} role="button" className="cursor-pointer outline-none focus-visible:stroke-[rgb(var(--primary))]"
                aria-label={`${labelBulan(d.ym)}: ${d.aktif} aktif, ${d.masuk.length} masuk, ${d.keluar.length} keluar. Buka daftar`}
                onClick={aksi} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); aksi(); } }}
                onPointerMove={(e) => { setHover(i); tip.onPointerMove(e); }} onPointerLeave={() => { setHover(null); tip.onPointerLeave(); }}
                onFocus={(e) => { setHover(i); tip.onFocus(e as unknown as React.FocusEvent); }} onBlur={() => { setHover(null); tip.onBlur(); }}
              />
            );
          })}
        </svg>
      </div>
    </KartuGrafik>
  );
}

// ---------- ringkasan ----------
function Risiko({ orang, hari, kategori, buka }: { orang: Orang[]; hari: string; kategori: string[]; buka: Buka }) {
  const per = useMemo(() => risiko(orang, hari, kategori), [orang, hari, kategori]);
  const mx = Math.max(1, ...per.map((x) => x.lengkap.length + x.belum.length));
  return (
    <KartuGrafik
      judul="Risiko perpanjangan"
      tanya="Kontrak habis dalam 30 hari, berkas sudah lengkap atau belum."
      legenda={<Legend items={[{ warna: C(1), label: "Berkas lengkap" }, { warna: C(2), label: "Berkas belum lengkap" }]} />}
      tabel={{ kolom: ["Kategori", "Lengkap", "Belum lengkap", "Total"], baris: per.map((x) => [x.kat, x.lengkap.length, x.belum.length, x.lengkap.length + x.belum.length]) }}
    >
      <div className="flex flex-col gap-1.5">
        {per.map((x) => {
          const tot = x.lengkap.length + x.belum.length;
          return (
            <div key={x.kat} className="grid grid-cols-[96px_minmax(0,1fr)] items-center gap-2.5">
              <div className="truncate text-[12.5px] text-muted">{x.kat}</div>
              <div className="flex h-6 items-center gap-0">
                {([["lengkap", "Berkas lengkap", C(1)], ["belum", "Berkas belum lengkap", C(2)]] as const).map(([key, lab, warna]) => {
                  const n = x[key].length;
                  if (!n) return null;
                  return (
                    <Segmen
                      key={key} lebar={`calc((100% - 70px) * ${n / mx})`} warna={warna} teks={n >= 2 ? n : ""} akhir={key === "belum" || !x.belum.length}
                      label={`${x.kat}, ${lab}: ${n} orang. Buka daftar`} judul={x.kat}
                      baris={[{ label: lab, nilai: n, warna, kotak: true }, { label: "Total habis ≤ 30 hari", nilai: tot }]}
                      klik={() => buka(`${x.kat}: ${lab.toLowerCase()}, habis ≤ 30 hari`, x[key], key === "belum" ? { href: `/monitoring?status=Belum%20Lengkap&kategori=${encodeURIComponent(x.kat)}`, label: "Buka di Monitoring" } : undefined)}
                    />
                  );
                })}
                <span className="ml-2 whitespace-nowrap text-xs font-semibold">{tot}</span>
              </div>
            </div>
          );
        })}
      </div>
    </KartuGrafik>
  );
}

function Corong({ orang, hari, buka }: { orang: Orang[]; hari: string; buka: Buka }) {
  const c = useMemo(() => corong(orang, hari), [orang, hari]);
  const mx = Math.max(1, c.tahap[0].orang.length);
  const warna = ["#86b6ef", "#3987e5", "#256abf", "#184f95"];
  return (
    <KartuGrafik
      judul="Corong perpanjangan"
      tanya="Dari kontrak yang sudah selesai, berapa persen yang lanjut ke kontrak berikutnya."
      tabel={{ kolom: ["Tahap", "Orang", "% lanjut"], baris: c.tahap.map((t) => [t.nama, t.orang.length, t.dari ? `${c.pct(t.orang, t.dari)}%` : "-"]) }}
    >
      <div className="flex flex-col gap-2.5">
        {c.tahap.map((t, i) => (
          <div key={t.nama} className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-2.5">
            <div className="text-[12.5px] text-muted">{t.nama}</div>
            <div className="flex h-6 items-center">
              <Segmen
                lebar={`calc((100% - 110px) * ${t.orang.length / mx})`} warna={warna[i]} akhir minLebar={6} label={`${t.nama}: ${t.orang.length} orang. Buka daftar`} judul={t.nama}
                baris={[{ label: "Orang", nilai: t.orang.length, warna: warna[i], kotak: true }, ...(t.dari ? [{ label: "Dari kontrak yang selesai", nilai: t.dari.length }, { label: "Lanjut", nilai: `${c.pct(t.orang, t.dari)}%` }] : [])]}
                klik={() => buka(t.nama, t.orang)}
              />
              <span className="ml-2 whitespace-nowrap text-xs font-semibold">{t.orang.length}{t.dari ? ` (${c.pct(t.orang, t.dari)}%)` : ""}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">Kontrak 1 yang tidak berlanjut: {c.tidakLanjut1} orang. Kontrak 2 yang tidak berlanjut: {c.tidakLanjut2} orang.</p>
    </KartuGrafik>
  );
}

function Alasan({ orang, hari, buka }: { orang: Orang[]; hari: string; buka: Buka }) {
  const daftar = useMemo(() => alasanKeluar(orang, hari), [orang, hari]);
  const total = daftar.reduce((t, x) => t + x.orang.length, 0);
  const mx = Math.max(1, ...daftar.map((x) => x.orang.length));
  return (
    <KartuGrafik
      kelas="lg:col-span-2"
      judul="Alasan keluar"
      tanya="Karyawan yang keluar dalam 12 bulan terakhir."
      tabel={{ kolom: ["Alasan", "Orang"], baris: daftar.map((x) => [x.alasan, x.orang.length]) }}
    >
      {daftar.length === 0 ? (
        <p className="text-sm text-muted">Tidak ada yang keluar dalam 12 bulan terakhir.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {daftar.map((x) => (
            <div key={x.alasan} className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-2.5">
              <div className="text-[12.5px] leading-tight text-muted">{x.alasan}</div>
              <div className="flex h-6 items-center">
                <Segmen
                  lebar={`calc((100% - 40px) * ${x.orang.length / mx})`} warna={C(1)} akhir minLebar={6} label={`${x.alasan}: ${x.orang.length} orang. Buka daftar`} judul={x.alasan}
                  baris={[{ label: "Orang", nilai: x.orang.length, warna: C(1), kotak: true }, { label: "Dari total keluar", nilai: `${persen(x.orang.length, total)}%` }]}
                  klik={() => buka(`Keluar: ${x.alasan}`, x.orang)}
                />
                <span className="ml-2 text-xs font-semibold">{x.orang.length}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </KartuGrafik>
  );
}

// ---------- profil ----------
function Kolom({ nilai, label, ket, buka, judul }: { nilai: Orang[][]; label: string[]; ket: string; buka: Buka; judul: (i: number) => string }) {
  const t = useContext(TipCtx);
  const mx = Math.max(1, ...nilai.map((n) => n.length));
  return (
    <div>
      <div className="flex h-[190px] items-end gap-2.5 border-b border-[var(--chart-axis)] pt-[18px]">
        {nilai.map((n, i) => (
          <div key={i} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end">
            <span className="mb-[3px] text-xs font-semibold">{n.length || ""}</span>
            <button
              type="button" aria-label={`${label[i]}: ${n.length} orang. Buka daftar`} onClick={() => { t.sembunyi(); buka(judul(i), n); }}
              {...pasangTip(label[i], [{ label: ket, nilai: n.length, warna: C(1), kotak: true }], t)}
              className="w-full max-w-[34px] rounded-t bg-[var(--chart-1)] hover:brightness-110 focus-visible:brightness-110"
              style={{ height: `calc((100% - 24px) * ${n.length / mx})`, minHeight: 2 }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-2.5">{label.map((l) => <span key={l} className="min-w-0 flex-1 text-center text-[11.5px] text-[var(--chart-tick)]">{l}</span>)}</div>
    </div>
  );
}

function Treemap({ aktif, buka }: { aktif: Orang[]; buka: Buka }) {
  const t = useContext(TipCtx);
  const [ref, W] = useLebar<HTMLDivElement>();
  const H = W < 640 ? 300 : 340;
  const grup = useMemo(() => kelompokDivisi(aktif, 6), [aktif]);
  const warna = (i: number, nama: string) => (nama === "Direktorat lain" || nama === TANPA_BAGAN ? "var(--chart-lain)" : C([1, 2, 3, 5, 7, 6][i]));
  const kotak = useMemo(() => {
    const atas = squarify(grup.map((g, i) => ({ v: g.total, g, i })), 0, 0, W, H);
    return atas.flatMap(({ item, x, y, w, h }) =>
      squarify(item.g.divisi.map((d) => ({ v: d.orang.length, d })), x + 1, y + 1, w - 2, h - 2).map((k, j) => ({ ...k, g: item.g, i: item.i, j })));
  }, [grup, W, H]);
  const total = aktif.length;
  return (
    <KartuGrafik
      kelas="lg:col-span-2"
      judul="Karyawan aktif per direktorat dan divisi"
      tanya="Luas kotak menunjukkan jumlah karyawan. Klik satu divisi untuk melihat orangnya."
      legenda={<Legend items={grup.map((g, i) => ({ warna: warna(i, g.nama), label: `${g.nama} (${g.total})` }))} />}
      tabel={{ kolom: ["Direktorat", "Divisi", "Aktif"], baris: grup.flatMap((g) => g.divisi.map((d) => [g.nama, d.nama, d.orang.length] as (string | number)[])).sort((a, b) => Number(b[2]) - Number(a[2])) }}
    >
      <div ref={ref} className="relative w-full overflow-hidden rounded-md" style={{ height: H }}>
        {kotak.map((k, idx) => {
          const d = k.item.d, g = k.g, w = k.w - 2, h = k.h - 2;
          return (
            <button
              key={idx} type="button" aria-label={`${g.nama}, ${d.nama}: ${d.orang.length} karyawan aktif. Buka daftar`} onClick={() => { t.sembunyi(); buka(`${g.nama}: ${d.nama}`, d.orang); }}
              {...pasangTip(d.nama, [{ label: g.nama, nilai: "", warna: warna(k.i, g.nama), kotak: true }, { label: "Karyawan aktif", nilai: d.orang.length }, { label: "Dari total", nilai: `${persen(d.orang.length, total)}%` }], t)}
              className="absolute overflow-hidden rounded-[3px] p-1.5 text-left text-xs font-semibold leading-tight text-white hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[rgb(var(--ink))]"
              style={{ left: k.x + 1, top: k.y + 1, width: Math.max(0, w), height: Math.max(0, h), background: `color-mix(in srgb, ${warna(k.i, g.nama)} ${100 - (k.j % 3) * 9}%, rgb(var(--card)))` }}
            >
              {w > 78 && h > 38 && <><span>{d.nama}</span><small className="block text-[11.5px] font-medium opacity-90">{d.orang.length} orang</small></>}
            </button>
          );
        })}
      </div>
    </KartuGrafik>
  );
}

function Pendidikan({ aktif, hari, buka }: { aktif: Orang[]; hari: string; buka: Buka }) {
  const t = useContext(TipCtx);
  const baris = useMemo(() => pendidikanUsia(aktif, hari, [...JENJANG, "Lainnya"]), [aktif, hari]);
  const mx = Math.max(1, ...baris.map((b) => b.total - b.tanpaUsia));
  const warna = [C(1), C(2), C(3)];
  return (
    <KartuGrafik
      judul="Pendidikan menurut kelompok usia"
      tanya="Pendidikan terakhir, dibagi tiga kelompok usia."
      legenda={<Legend items={KELOMPOK_USIA_3.map(([n], i) => ({ warna: warna[i], label: `${n} tahun` }))} />}
      tabel={{ kolom: ["Pendidikan", ...KELOMPOK_USIA_3.map(([n]) => n), "Usia kosong", "Total"], baris: baris.map((b) => [b.jenjang, ...b.segmen.map((s) => s.orang.length), b.tanpaUsia, b.total]) }}
    >
      {baris.length === 0 ? <p className="text-sm text-muted">Belum ada data pendidikan.</p> : (
        <div className="flex flex-col gap-1.5">
          {baris.map((b) => {
            const adaSeg = b.segmen.map((s, i) => (s.orang.length ? i : -1)).filter((i) => i >= 0);
            const akhir = adaSeg[adaSeg.length - 1];
            return (
              <div key={b.jenjang} className="grid grid-cols-[76px_minmax(0,1fr)] items-center gap-2.5">
                <div className="text-[12.5px] text-muted">{b.jenjang}</div>
                <div className="flex h-6 items-center">
                  {b.segmen.map((s, i) => s.orang.length > 0 && (
                    <Segmen
                      key={s.nama} lebar={`calc((100% - 44px) * ${s.orang.length / mx})`} warna={warna[i]} teks={s.orang.length >= 3 ? s.orang.length : ""} akhir={i === akhir}
                      label={`${b.jenjang}, usia ${s.nama}: ${s.orang.length} orang. Buka daftar`} judul={`${b.jenjang}, usia ${s.nama}`}
                      baris={[{ label: "Orang", nilai: s.orang.length, warna: warna[i], kotak: true }, { label: `Total ${b.jenjang}`, nilai: b.total }]}
                      klik={() => buka(`${b.jenjang}, usia ${s.nama}`, s.orang)}
                    />
                  ))}
                  <span className="ml-2 text-xs font-semibold">{b.total}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </KartuGrafik>
  );
}

function Meter({ label, nilai }: { label: string; nilai: number }) {
  return (
    <div>
      <div className="text-xs text-muted">{label}</div>
      <div className="text-2xl font-semibold">{nilai}%</div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full" style={{ background: "color-mix(in srgb, var(--chart-1) 16%, rgb(var(--card)))" }}>
        <i className="block h-full rounded-full" style={{ width: `${nilai}%`, background: C(1) }} />
      </div>
    </div>
  );
}

function Kelengkapan({ aktif, hari, kategori, buka }: { aktif: Orang[]; hari: string; kategori: string[]; buka: Buka }) {
  const k = useMemo(() => kelengkapan(aktif, hari, kategori), [aktif, hari, kategori]);
  return (
    <KartuGrafik
      judul="Kelengkapan data"
      tanya="Berapa persen karyawan aktif yang datanya sudah lengkap."
      tabel={{ kolom: ["Kategori", "Aktif", "Data diri lengkap", "%"], baris: k.perKategori.map((r) => [r.kat, r.total, r.total - r.belum.length, `${r.persen}%`]) }}
    >
      <div className="mb-3.5 grid gap-3.5 sm:grid-cols-3">
        <Meter label="Berkas monitoring lengkap" nilai={k.berkas} />
        <Meter label="Data diri lengkap" nilai={k.dataDiri} />
        <Meter label="Tanggal lahir terisi" nilai={k.lahir} />
      </div>
      <p className="mb-2 text-xs text-muted">Data diri lengkap per kategori</p>
      <div className="flex flex-col gap-1.5">
        {k.perKategori.map((r) => (
          <div key={r.kat} className="grid grid-cols-[96px_minmax(0,1fr)] items-center gap-2.5">
            <div className="truncate text-[12.5px] text-muted">{r.kat}</div>
            <div className="flex h-6 items-center">
              <Segmen
                lebar={`calc((100% - 50px) * ${r.persen / 100})`} warna={C(1)} akhir label={`${r.kat}: ${r.persen}% data diri lengkap. Buka yang belum lengkap`} judul={r.kat}
                baris={[{ label: "Data diri lengkap", nilai: `${r.persen}%`, warna: C(1), kotak: true }, { label: "Belum lengkap", nilai: r.belum.length }]}
                klik={() => buka(`${r.kat}: data diri belum lengkap`, r.belum, { href: `/datadiri?kelengkapan=belum&kategori=${encodeURIComponent(r.kat)}`, label: "Buka di Data Diri" })}
              />
              <span className="ml-2 text-xs font-semibold">{r.persen}%</span>
            </div>
          </div>
        ))}
      </div>
    </KartuGrafik>
  );
}

// ---------- daftar hasil klik ----------
function Daftar({ d, hari, tutup }: { d: { judul: string; orang: Orang[]; link?: { href: string; label: string } } | null; hari: string; tutup: () => void }) {
  if (!d) {
    return (
      <section className="card p-5">
        <h2 className="font-semibold">Daftar</h2>
        <p className="mt-1 text-sm text-muted">Klik batang atau kotak di grafik untuk melihat orangnya di sini.</p>
      </section>
    );
  }
  const urut = [...d.orang].sort((a, b) => (isAktif(a, hari) ? a.berakhir ?? "" : a.keluar ?? a.berakhir ?? "").localeCompare(isAktif(b, hari) ? b.berakhir ?? "" : b.keluar ?? b.berakhir ?? ""));
  return (
    <section className="card p-5">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h2 className="font-semibold">{d.judul}</h2>
          <p className="text-xs text-muted">{d.orang.length} orang</p>
        </div>
        <div className="flex gap-2">
          {d.link && <Link className="btn-secondary !px-3 !py-1 !text-xs" href={d.link.href}>{d.link.label}</Link>}
          <button type="button" className="btn-secondary !px-3 !py-1 !text-xs" onClick={tutup}>Tutup</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr>{["NP", "Nama", "Kategori", "Unit kerja", "Akhir kontrak / keluar", "Berkas"].map((h) => <th key={h} className="border-b border-line px-2 py-1.5 text-left text-xs font-semibold text-muted">{h}</th>)}</tr></thead>
          <tbody>
            {urut.slice(0, 12).map((o) => (
              <tr key={o.id}>
                <td className="border-b border-line px-2 py-1.5">{o.np}</td>
                <td className="border-b border-line px-2 py-1.5">{o.nama}</td>
                <td className="border-b border-line px-2 py-1.5">{o.kat}</td>
                <td className="border-b border-line px-2 py-1.5">{o.divisi}</td>
                <td className="border-b border-line px-2 py-1.5">{formatTanggal(o.keluar ?? o.berakhir)}{isAktif(o, hari) ? "" : " (keluar)"}</td>
                <td className="border-b border-line px-2 py-1.5">{isAktif(o, hari) ? <span className={o.lengkap ? "pill-success" : "pill-warning"}>{o.lengkap ? "Lengkap" : "Belum lengkap"}</span> : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {d.orang.length > 12 && <p className="mt-2 text-xs text-muted">dan {d.orang.length - 12} lainnya</p>}
    </section>
  );
}

// ---------- halaman ----------
export default function DashboardSA({ orang, hari, kategori, jendela, baganTerisi }: Props) {
  const [filter, setFilter] = useState("");
  const [tab, setTab] = useState<"ringkasan" | "profil">("ringkasan");
  const [daftar, setDaftar] = useState<{ judul: string; orang: Orang[]; link?: { href: string; label: string } } | null>(null);
  const [tip, setTip] = useState<Tip>(null);
  const daftarRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (window.location.hash === "#profil") setTab("profil"); }, []);
  const pilihTab = (t: "ringkasan" | "profil") => { setTab(t); setDaftar(null); try { history.replaceState(null, "", `#${t}`); } catch { /* abaikan */ } };

  const data = useMemo(() => (filter ? orang.filter((o) => o.kat === filter) : orang), [orang, filter]);
  const aktif = useMemo(() => data.filter((o) => isAktif(o, hari)), [data, hari]);
  const kategoriTampil = filter ? [filter] : kategori;
  const kt = useMemo(() => kartu(data, hari), [data, hari]);
  const j = jendela[filter] ?? jendela[""];
  const segera = useMemo(() => akanBerakhir(data, hari, j.sampai), [data, hari, j]);
  const belum = useMemo(() => berkasBelumLengkap(data, hari), [data, hari]);
  const keluar = useMemo(() => terminate(data), [data]);
  const usia = useMemo(() => sebaranUsia(aktif, hari), [aktif, hari]);
  const masa = useMemo(() => masaKerja(aktif, hari), [aktif, hari]);

  const buka: Buka = useCallback((judul, o, link) => {
    setDaftar({ judul, orang: o, link });
    requestAnimationFrame(() => daftarRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  }, []);

  const ctx = useMemo(() => ({
    tampil: (e: { clientX: number; clientY: number }, judul: string, baris: BarisTip[]) => setTip({ x: e.clientX, y: e.clientY, judul, baris }),
    sembunyi: () => setTip(null),
  }), []);

  const tabBtn = (t: "ringkasan" | "profil", label: string) => (
    <button
      type="button" role="tab" aria-selected={tab === t} onClick={() => pilihTab(t)}
      className={`-mb-px border-b-2 px-3.5 py-2 text-sm font-semibold ${tab === t ? "border-primary text-ink" : "border-transparent text-muted hover:text-ink"}`}
    >
      {label}
    </button>
  );
  const lingkup = filter ? ` di ${filter}` : "";

  return (
    <TipCtx.Provider value={ctx}>
      <div className="flex items-center gap-2">
        <label htmlFor="sa-kat" className="text-sm text-muted">Kategori</label>
        <select id="sa-kat" className="input !w-auto" value={filter} onChange={(e) => { setFilter(e.target.value); setDaftar(null); }}>
          <option value="">Semua kategori</option>
          {kategori.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      <div role="tablist" aria-label="Tampilan dashboard" className="flex gap-1 border-b border-line">{tabBtn("ringkasan", "Ringkasan")}{tabBtn("profil", "Profil")}</div>

      {tab === "ringkasan" ? (
        <div className="space-y-4" role="tabpanel">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <div className="card p-4"><div className="text-xs text-muted">Karyawan aktif</div><div className="mt-1 text-3xl font-semibold">{kt.aktif}</div><div className="mt-0.5 text-xs font-semibold text-ink/80">{filter || "Semua kategori"}</div><Spark nilai={kt.sparkAktif} warna={C(1)} /></div>
            <div className="card p-4"><div className="text-xs text-muted">Masuk bulan ini</div><div className="mt-1 text-3xl font-semibold">{kt.masuk}</div><Delta skr={kt.masuk} lalu={kt.masukLalu} /><Spark nilai={kt.sparkMasuk} warna={C(1)} /></div>
            <div className="card p-4"><div className="text-xs text-muted">Kontrak berakhir bulan ini</div><div className="mt-1 text-3xl font-semibold">{kt.berakhir}</div><Delta skr={kt.berakhir} lalu={kt.berakhirLalu} /><Spark nilai={kt.sparkBerakhir} warna={C(2)} /></div>
            <div className="card p-4"><div className="text-xs text-muted">Turnover 12 bulan</div><div className="mt-1 text-3xl font-semibold">{Math.round(kt.turnover.persen)}%</div><div className="mt-0.5 text-xs text-muted"><b className="font-semibold text-ink/80">{kt.turnover.keluar} orang keluar</b> (12 bulan sebelumnya {Math.round(kt.turnoverLalu.persen)}%)</div><Spark nilai={kt.sparkTurnover} warna={C(2)} /></div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Tren orang={data} hari={hari} buka={buka} judulBagian={`Jumlah karyawan aktif tiap akhir bulan${lingkup}, dan berapa yang masuk dan keluar.`} />

            <section className="card p-5">
              <h2 className="font-semibold">Perlu tindak lanjut</h2>
              <p className="mb-2 text-xs text-muted">Pekerjaan yang menunggu, dengan jalan pintas ke daftarnya.</p>
              <ul className="divide-y divide-line">
                {([
                  ["Berkas karyawan belum lengkap", belum, { href: `/monitoring?status=Belum%20Lengkap${filter ? `&kategori=${encodeURIComponent(filter)}` : ""}`, label: "Buka di Monitoring" }],
                  [`Kontrak habis dalam ${j.label}`, segera, undefined],
                  ["Karyawan terminate", keluar, { href: "/terminate", label: "Buka di Terminate" }],
                ] as [string, Orang[], { href: string; label: string } | undefined][]).map(([label, L, link]) => (
                  <li key={label} className="flex items-center gap-3 py-3">
                    <span className="flex-1 text-sm">{label}</span>
                    <span className={L.length === 0 ? "pill-success" : "pill-warning"}>{L.length}</span>
                    <button type="button" className="btn-secondary !px-4 !py-1.5" aria-label={`Buka daftar: ${label}`} onClick={() => buka(label, L, link)}>Buka</button>
                  </li>
                ))}
              </ul>
            </section>

            <section className="card p-5">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold">Kontrak habis dalam {j.label} ({segera.length})</h2>
                  <p className="text-xs text-muted">Jendela mengikuti kategori: Magang 30 hari, IDE 1 bulan, lainnya 2 bulan atau 60 hari.</p>
                </div>
                <button type="button" className="btn-secondary !px-3 !py-1 !text-xs" onClick={() => buka(`Kontrak habis dalam ${j.label}`, segera)}>Lihat semua</button>
              </div>
              <ul className="divide-y divide-line text-sm">
                {segera.slice(0, 6).map((o) => {
                  const sisa = selisihHari(hari, o.berakhir!);
                  return (
                    <li key={o.id}>
                      <button type="button" className="flex w-full items-center justify-between gap-3 py-2.5 text-left hover:bg-soft" onClick={() => buka(`Kontrak habis dalam ${j.label}`, [o])}>
                        <span className="min-w-0"><b className="block truncate font-semibold">{o.nama} ({o.np})</b><span className="text-xs text-muted">{o.kat} · {formatTanggal(o.berakhir)}</span></span>
                        <span className="flex shrink-0 items-center gap-2">
                          <span className={o.lengkap ? "pill bg-primary-soft text-primary" : "pill-warning"}>{o.lengkap ? "Berkas lengkap" : "Berkas belum lengkap"}</span>
                          <span className={`pill ${sisa <= 7 ? "bg-danger text-white" : sisa <= 30 ? "bg-warning-soft text-ink" : "bg-soft text-muted"}`}>{sisa === 0 ? "Hari ini" : `${sisa} hari`}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
                {segera.length === 0 && <li className="py-2 text-muted">Tidak ada.</li>}
              </ul>
            </section>

            <Risiko orang={data} hari={hari} kategori={kategoriTampil} buka={buka} />
            <Corong orang={data} hari={hari} buka={buka} />
            <Alasan orang={data} hari={hari} buka={buka} />
          </div>
        </div>
      ) : (
        <div className="space-y-4" role="tabpanel">
          {!baganTerisi && (
            <p className="rounded-2xl bg-warning-soft p-4 text-sm">
              Daftar bagan belum diisi, jadi karyawan dikelompokkan menurut isian Unit Kerja. <Link className="link font-medium" href="/bagan">Isi daftar Kode Bagan</Link> agar direktorat dan divisi akurat.
            </p>
          )}
          <div className="grid gap-4 lg:grid-cols-2">
            <Treemap aktif={aktif} buka={buka} />
            <KartuGrafik
              judul="Sebaran usia"
              tanya={`Rata-rata ${usia.rata} tahun. ${usia.kosong} karyawan belum punya tanggal lahir di Data Diri.`}
              tabel={{ kolom: ["Kelompok usia", "Orang"], baris: usia.kolom.map((k) => [k.nama, k.orang.length]) }}
            >
              <Kolom nilai={usia.kolom.map((k) => k.orang)} label={usia.kolom.map((k) => k.nama)} ket="Orang" buka={buka} judul={(i) => `Usia ${usia.kolom[i].nama}`} />
            </KartuGrafik>
            <Pendidikan aktif={aktif} hari={hari} buka={buka} />
            <KartuGrafik
              judul="Masa kerja"
              tanya={`Lama sejak kontrak pertama. Rata-rata ${masa.rataTahun.toFixed(1).replace(".", ",")} tahun.`}
              tabel={{ kolom: ["Masa kerja", "Orang"], baris: masa.kolom.map((k) => [k.nama, k.orang.length]) }}
            >
              <Kolom nilai={masa.kolom.map((k) => k.orang)} label={masa.kolom.map((k) => k.nama)} ket="Orang" buka={buka} judul={(i) => `Masa kerja ${masa.kolom[i].nama}`} />
            </KartuGrafik>
            <Kelengkapan aktif={aktif} hari={hari} kategori={kategoriTampil} buka={buka} />
          </div>
        </div>
      )}

      <div ref={daftarRef}><Daftar d={daftar} hari={hari} tutup={() => setDaftar(null)} /></div>

      {tip && (
        <div
          role="tooltip" className="pointer-events-none fixed z-50 max-w-[240px] rounded-xl border border-line bg-card px-2.5 py-2 text-xs shadow-xl"
          style={{ left: Math.min(tip.x + 14, (typeof window !== "undefined" ? window.innerWidth : 1200) - 250), top: tip.y + 14 }}
        >
          <div className="mb-1 text-muted">{tip.judul}</div>
          {tip.baris.map((b, i) => (
            <div key={i} className="flex items-center gap-2 whitespace-nowrap">
              {b.warna && <span className="inline-block rounded-sm" style={{ background: b.warna, width: 10, height: b.kotak ? 10 : 3 }} />}
              <span>{b.label}</span>
              <b className="ml-auto pl-2.5 text-sm">{b.nilai}</b>
            </div>
          ))}
        </div>
      )}
    </TipCtx.Provider>
  );
}
