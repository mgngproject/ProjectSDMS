import { type KategoriConfig, pilihanStandar } from "@/lib/kategori-config";
import type { BarisKaryawan } from "@/lib/kolom";
import { MONITORING_CHECKBOX, MONITORING_TEXT } from "@/lib/monitoring";

export type ParamFilter = Record<string, string | undefined>;

/** Parameter alamat tanpa pesan (ok/error), agar hanya berisi pilihan filter. */
export function paramFilter(sp: Record<string, string | undefined>): ParamFilter {
  const { ok, error, ...sisa } = sp;
  void ok; void error;
  return sisa;
}

/** Parameter dari alamat (dipakai rute export dan PDF supaya hasilnya mengikuti filter di layar). */
export function paramDariUrl(url: string): ParamFilter {
  return paramFilter(Object.fromEntries(new URL(url).searchParams.entries()));
}

export function queryString(p: ParamFilter): string {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(p)) if (v) u.set(k, v);
  const s = u.toString();
  return s ? `?${s}` : "";
}

export type DasarFilter = {
  np: string;
  nama: string;
  kategori?: { nama: string } | null;
  awal_kontrak: string | null;
  akhir_kontrak: string | null;
  tanggal_keluar?: string | null;
};

type OpsiDasar = {
  /** Kategori hanya disaring untuk Super Admin; admin sudah dibatasi RLS. */
  kategoriBerlaku: boolean;
  /** Tanggal yang dipakai bila bulan atau tahun dipilih tanpa memilih jenis periode. */
  jenisBawaan: "masuk" | "habis" | "keluar";
};

/** Filter yang sama di semua halaman: cari nama/NP, kategori, dan periode (masuk, habis, keluar per bulan dan tahun). */
export function cocokDasar(r: DasarFilter, p: ParamFilter, opsi: OpsiDasar): boolean {
  if (p.q) {
    const q = p.q.trim().toLowerCase();
    if (q && !r.nama.toLowerCase().includes(q) && !r.np.toLowerCase().includes(q)) return false;
  }
  if (opsi.kategoriBerlaku && p.kategori && r.kategori?.nama !== p.kategori) return false;

  const jenis = p.filter || (p.bulan || p.tahun ? opsi.jenisBawaan : "");
  if (jenis === "masuk" || jenis === "habis" || jenis === "keluar") {
    const tgl = jenis === "masuk" ? r.awal_kontrak : jenis === "habis" ? r.akhir_kontrak : r.tanggal_keluar ?? null;
    if (!tgl) return false;
    const [y, m] = tgl.split("-");
    if (p.bulan && Number(m) !== Number(p.bulan)) return false;
    if (p.tahun && Number(y) !== Number(p.tahun)) return false;
  }
  return true;
}

/** Daftar isian pilihan yang bisa disaring untuk kategori: kolom khusus berpilihan dan kolom standar berpilihan (mis. Level). */
export function filterPilihan(config: KategoriConfig | null, namaKategori: string | null): { name: string; label: string; options: string[] }[] {
  const dariKhusus = (config?.fields ?? []).filter((f) => f.type === "select" && f.options).map((f) => ({ name: f.name, label: f.labelFilter ?? f.label, options: f.options! }));
  const dariStandar = Object.entries(pilihanStandar(namaKategori)).map(([name, options]) => ({ name, label: name === "level" ? "Level" : name, options }));
  return [...dariKhusus, ...dariStandar];
}

export function saringKaryawan(rows: BarisKaryawan[], p: ParamFilter, config: KategoriConfig | null, namaKategori: string | null, kategoriBerlaku: boolean): BarisKaryawan[] {
  const pilihan = filterPilihan(config, namaKategori);
  return rows.filter((r) => {
    if (!cocokDasar(r, p, { kategoriBerlaku, jenisBawaan: "habis" })) return false;
    for (const f of pilihan) {
      const nilai = p[`f_${f.name}`];
      if (!nilai) continue;
      const aktual = f.name === "level" ? r.level : r.detail?.[f.name];
      if (aktual !== nilai) return false;
    }
    return true;
  });
}

export const JENJANG = ["SMA/SMK", "D3", "D4", "S1", "S2", "S3"];

type DataDiriFilter = { ktp: string | null; tempat_lahir: string | null; tanggal_lahir: string | null; alamat: string | null; jenjang_1: string | null; jenjang_2: string | null };

/** Data diri dianggap lengkap bila KTP, tempat dan tanggal lahir, alamat, dan jenjang pendidikan terisi. */
export function dataDiriLengkap(d: DataDiriFilter): boolean {
  return !!(d.ktp && d.tempat_lahir && d.tanggal_lahir && d.alamat && d.jenjang_1);
}

export function cocokDataDiri(d: DataDiriFilter, p: ParamFilter): boolean {
  if (p.jenjang && d.jenjang_1 !== p.jenjang && d.jenjang_2 !== p.jenjang) return false;
  if (p.kelengkapan === "lengkap" && !dataDiriLengkap(d)) return false;
  if (p.kelengkapan === "belum" && dataDiriLengkap(d)) return false;
  return true;
}

export function cocokMonitoring(r: Record<string, unknown> & { status: string }, p: ParamFilter): boolean {
  if (p.status && r.status !== p.status) return false;
  if (p.kurang) {
    if (p.kurang in MONITORING_CHECKBOX && r[p.kurang]) return false;
    if (p.kurang in MONITORING_TEXT && String(r[p.kurang] ?? "").trim()) return false;
  }
  return true;
}

export function cocokTerminate(r: { alasan_keluar: string | null }, p: ParamFilter): boolean {
  if (p.alasan && !(r.alasan_keluar ?? "").toLowerCase().includes(p.alasan.trim().toLowerCase())) return false;
  return true;
}
