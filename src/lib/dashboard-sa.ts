// Perhitungan dashboard Super Admin. Semua fungsi murni (tanggal diberikan lewat parameter `hari`, format YYYY-MM-DD).
import { selisihHari, tambahHari } from "@/lib/format";

export type Orang = {
  id: number;
  np: string;
  nama: string;
  kat: string;
  unit: string | null;
  kode: string | null;
  statusK: "aktif" | "terminate";
  masuk: string | null;
  berakhir: string | null;
  keluar: string | null;
  alasan: string | null;
  /** Tanggal akhir tiap kontrak, urut dari kontrak pertama. */
  kontrak: string[];
  lengkap: boolean;
  lahir: string | null;
  jenjang: string | null;
  dataDiri: boolean;
  direktorat: string;
  divisi: string;
};

export type BaganRow = { kode: string; nama_unit: string; induk_kode: string | null };

export const normKode = (s: string | null | undefined) => (s ?? "").trim().toUpperCase();

// ---------- tanggal ----------
export const bulanDari = (tgl: string) => tgl.slice(0, 7);
const nomor = (ym: string) => Number(ym.slice(0, 4)) * 12 + Number(ym.slice(5, 7)) - 1;
const dariNomor = (n: number) => `${Math.floor(n / 12)}-${String((n % 12) + 1).padStart(2, "0")}`;
export const geserBulan = (ym: string, n: number) => dariNomor(nomor(ym) + n);
export const akhirBulan = (ym: string) => new Date(Date.UTC(Number(ym.slice(0, 4)), Number(ym.slice(5, 7)), 0)).toISOString().slice(0, 10);
const NAMA = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
export const labelBulan = (ym: string) => `${NAMA[Number(ym.slice(5, 7)) - 1]} ${ym.slice(2, 4)}`;
/** 12 bulan berakhir di bulan `hari`, dari yang terlama. */
export const dua_belas_bulan = (hari: string, mundur = 0) => Array.from({ length: 12 }, (_, i) => geserBulan(bulanDari(hari), -(11 - i) - mundur));

// ---------- status ----------
/** Tanggal berhenti aktif: tanggal keluar bila ada, selain itu akhir kontrak terakhir. */
export const berakhirDi = (o: Orang) => o.keluar ?? o.berakhir;

/** Aktif: status aktif, belum keluar, kontrak belum lewat (sama dengan dashboard PIC). */
export const isAktif = (o: Orang, hari: string) => o.statusK === "aktif" && !o.keluar && (!o.berakhir || o.berakhir >= hari);

/** Aktif pada akhir bulan `ym` (bulan berjalan: aktif hari ini). */
export function aktifAkhirBulan(o: Orang, ym: string, hari: string): boolean {
  if (!o.masuk) return false;
  const sekarang = bulanDari(hari) === ym;
  const tgl = sekarang ? hari : akhirBulan(ym);
  const lewat = sekarang ? tambahHari(hari, -1) : tgl;
  const end = berakhirDi(o);
  return o.masuk <= tgl && (end == null || end > lewat);
}
/** Berhenti aktif pada bulan `ym` (bulan berjalan: yang sudah lewat hari ini). */
export function keluarDiBulan(o: Orang, ym: string, hari: string): boolean {
  const end = berakhirDi(o);
  if (!end || !o.masuk || bulanDari(end) !== ym) return false;
  return bulanDari(hari) === ym ? end < hari : true;
}
export const masukDiBulan = (o: Orang, ym: string) => !!o.masuk && bulanDari(o.masuk) === ym;
/** Kontrak berakhir di bulan itu (status aktif, belum keluar); bulan depan belum dihitung. */
export const berakhirDiBulan = (o: Orang, ym: string, hari: string) =>
  ym <= bulanDari(hari) && o.statusK === "aktif" && !o.keluar && !!o.berakhir && bulanDari(o.berakhir) === ym;

// ---------- kartu ----------
export function kartu(orang: Orang[], hari: string) {
  const sekarang = bulanDari(hari);
  const bulan12 = dua_belas_bulan(hari);
  const aktifBln = bulan12.map((v) => orang.filter((o) => aktifAkhirBulan(o, v, hari)).length);
  const keluarBln = bulan12.map((v) => orang.filter((o) => keluarDiBulan(o, v, hari)).length);
  const masukBln = bulan12.map((v) => orang.filter((o) => masukDiBulan(o, v)).length);
  const berakhirBln = bulan12.map((v) => orang.filter((o) => berakhirDiBulan(o, v, hari)).length);
  const lalu = geserBulan(sekarang, -1);
  const turnoverPersen = (bulan: string[]) => {
    const keluar = bulan.reduce((t, v) => t + orang.filter((o) => keluarDiBulan(o, v, hari)).length, 0);
    const rata = bulan.reduce((t, v) => t + orang.filter((o) => aktifAkhirBulan(o, v, hari)).length, 0) / bulan.length;
    return { keluar, persen: rata ? (keluar / rata) * 100 : 0 };
  };
  const t12 = turnoverPersen(bulan12);
  const tLalu = turnoverPersen(dua_belas_bulan(hari, 12));
  return {
    aktif: orang.filter((o) => isAktif(o, hari)).length,
    masuk: masukBln[11],
    masukLalu: orang.filter((o) => masukDiBulan(o, lalu)).length,
    berakhir: berakhirBln[11],
    berakhirLalu: orang.filter((o) => berakhirDiBulan(o, lalu, hari)).length,
    turnover: t12,
    turnoverLalu: tLalu,
    sparkAktif: aktifBln,
    sparkMasuk: masukBln,
    sparkBerakhir: berakhirBln,
    sparkTurnover: bulan12.map((_, i) => (aktifBln[i] ? (keluarBln[i] / aktifBln[i]) * 100 : 0)),
  };
}

// ---------- tren ----------
export function tren(orang: Orang[], hari: string) {
  const bulan = dua_belas_bulan(hari);
  return bulan.map((v) => ({
    ym: v,
    aktif: orang.filter((o) => aktifAkhirBulan(o, v, hari)).length,
    masuk: orang.filter((o) => masukDiBulan(o, v)),
    keluar: orang.filter((o) => keluarDiBulan(o, v, hari)),
  }));
}

// ---------- tindak lanjut ----------
export const berkasBelumLengkap = (orang: Orang[], hari: string) => orang.filter((o) => isAktif(o, hari) && !o.lengkap);
export const terminate = (orang: Orang[]) => orang.filter((o) => o.statusK === "terminate");
export function akanBerakhir(orang: Orang[], hari: string, sampai: string) {
  return orang
    .filter((o) => o.statusK === "aktif" && !o.keluar && o.berakhir && o.berakhir >= hari && o.berakhir <= sampai)
    .sort((a, b) => (a.berakhir ?? "").localeCompare(b.berakhir ?? ""));
}

// ---------- risiko perpanjangan ----------
export function risiko(orang: Orang[], hari: string, kategori: string[], batasHari = 30) {
  const sampai = tambahHari(hari, batasHari);
  const L = akanBerakhir(orang, hari, sampai);
  return kategori.map((kat) => {
    const x = L.filter((o) => o.kat === kat);
    return { kat, lengkap: x.filter((o) => o.lengkap), belum: x.filter((o) => !o.lengkap) };
  });
}

// ---------- corong perpanjangan ----------
export function corong(orang: Orang[], hari: string) {
  const selesai = (k: number) => orang.filter((o) => o.kontrak.length >= k && o.kontrak[k - 1] < hari);
  const lanjut = (k: number) => selesai(k).filter((o) => o.kontrak.length > k);
  const k1 = selesai(1), l2 = lanjut(1), k2 = selesai(2), l3 = lanjut(2);
  const pct = (a: Orang[], b: Orang[]) => (b.length ? Math.round((a.length / b.length) * 100) : 0);
  return {
    tahap: [
      { nama: "Kontrak 1 selesai", orang: k1, dari: null as Orang[] | null },
      { nama: "Lanjut Kontrak 2", orang: l2, dari: k1 },
      { nama: "Kontrak 2 selesai", orang: k2, dari: null as Orang[] | null },
      { nama: "Lanjut Kontrak 3", orang: l3, dari: k2 },
    ],
    pct,
    tidakLanjut1: k1.length - l2.length,
    tidakLanjut2: k2.length - l3.length,
    persenLanjut1: pct(l2, k1),
  };
}

// ---------- alasan keluar ----------
export const ALASAN_KONTRAK_HABIS = "Kontrak berakhir, tidak diperpanjang";
export function alasanKeluar(orang: Orang[], hari: string) {
  const bulan = dua_belas_bulan(hari);
  const peta = new Map<string, Orang[]>();
  for (const o of orang) {
    if (!bulan.some((v) => keluarDiBulan(o, v, hari))) continue;
    const alasan = o.keluar ? (o.alasan?.trim() || "Tidak dicatat") : ALASAN_KONTRAK_HABIS;
    peta.set(alasan, [...(peta.get(alasan) ?? []), o]);
  }
  return [...peta.entries()].map(([alasan, L]) => ({ alasan, orang: L })).sort((a, b) => b.orang.length - a.orang.length);
}

// ---------- profil ----------
export function usiaTahun(lahir: string | null, hari: string): number | null {
  if (!lahir) return null;
  let u = Number(hari.slice(0, 4)) - Number(lahir.slice(0, 4));
  if (hari.slice(5) < lahir.slice(5, 10)) u--;
  return u >= 0 && u < 100 ? u : null;
}
export const KELOMPOK_USIA: [string, number, number][] = [["< 25", 0, 24], ["25–29", 25, 29], ["30–34", 30, 34], ["35–39", 35, 39], ["40–44", 40, 44], ["45–49", 45, 49], ["50+", 50, 200]];
export const KELOMPOK_USIA_3: [string, number, number][] = [["< 30", 0, 29], ["30–39", 30, 39], ["40+", 40, 200]];
export const KELOMPOK_MASA: [string, number, number][] = [["< 6 bln", 0, 182], ["6–12 bln", 183, 365], ["1–2 th", 366, 730], ["2–3 th", 731, 1095], ["> 3 th", 1096, 99999]];

export function sebaranUsia(aktif: Orang[], hari: string) {
  const ada = aktif.map((o) => ({ o, u: usiaTahun(o.lahir, hari) })).filter((x): x is { o: Orang; u: number } => x.u != null);
  return {
    kolom: KELOMPOK_USIA.map(([nama, lo, hi]) => ({ nama, orang: ada.filter((x) => x.u >= lo && x.u <= hi).map((x) => x.o) })),
    kosong: aktif.length - ada.length,
    rata: ada.length ? Math.round(ada.reduce((t, x) => t + x.u, 0) / ada.length) : 0,
  };
}
export function pendidikanUsia(aktif: Orang[], hari: string, urutan: string[]) {
  const baris = urutan.map((j) => {
    const x = aktif.filter((o) => o.jenjang === j);
    return {
      jenjang: j,
      segmen: KELOMPOK_USIA_3.map(([nama, lo, hi]) => ({ nama, orang: x.filter((o) => { const u = usiaTahun(o.lahir, hari); return u != null && u >= lo && u <= hi; }) })),
      tanpaUsia: x.filter((o) => usiaTahun(o.lahir, hari) == null).length,
      total: x.length,
    };
  });
  return baris.filter((b) => b.total > 0);
}
export function masaKerja(aktif: Orang[], hari: string) {
  const ada = aktif.filter((o) => o.masuk).map((o) => ({ o, h: selisihHari(o.masuk!, hari) }));
  return {
    kolom: KELOMPOK_MASA.map(([nama, lo, hi]) => ({ nama, orang: ada.filter((x) => x.h >= lo && x.h <= hi).map((x) => x.o) })),
    rataTahun: ada.length ? ada.reduce((t, x) => t + x.h, 0) / ada.length / 365 : 0,
  };
}
export function kelengkapan(aktif: Orang[], hari: string, kategori: string[]) {
  const pct = (x: number, t: number) => (t ? Math.round((x / t) * 100) : 0);
  return {
    berkas: pct(aktif.filter((o) => o.lengkap).length, aktif.length),
    dataDiri: pct(aktif.filter((o) => o.dataDiri).length, aktif.length),
    lahir: pct(aktif.filter((o) => usiaTahun(o.lahir, hari) != null).length, aktif.length),
    perKategori: kategori.map((kat) => {
      const L = aktif.filter((o) => o.kat === kat);
      return { kat, total: L.length, belum: L.filter((o) => !o.dataDiri), persen: pct(L.filter((o) => o.dataDiri).length, L.length) };
    }),
  };
}

// ---------- direktorat dan divisi ----------
export const TANPA_BAGAN = "Belum dipetakan";

/** Menentukan direktorat dan divisi dari kode bagan. Direktorat = atasan tertinggi di daftar; bila daftar tidak punya atasan, dua karakter depan kode. */
export function peta(bagan: BaganRow[]) {
  const byKode = new Map(bagan.map((b) => [normKode(b.kode), b]));
  const akar = (kode: string): string => {
    let k = kode;
    for (let i = 0; i < 10; i++) {
      const induk = normKode(byKode.get(k)?.induk_kode);
      if (!induk || !byKode.has(induk)) break;
      k = induk;
    }
    return k;
  };
  return (kodeAsli: string | null, unit: string | null): { direktorat: string; divisi: string } => {
    const kode = normKode(kodeAsli);
    const b = kode ? byKode.get(kode) : undefined;
    if (!b) return { direktorat: TANPA_BAGAN, divisi: unit?.trim() || (kode ? kode : "Tanpa unit kerja") };
    const root = akar(kode);
    if (root !== kode) return { direktorat: byKode.get(root)!.nama_unit, divisi: b.nama_unit };
    const awalan = kode.slice(0, 2);
    const pucuk = bagan.find((x) => /^\d{2}0+$/.test(normKode(x.kode)) && normKode(x.kode).startsWith(awalan));
    if (pucuk && normKode(pucuk.kode) !== kode) return { direktorat: pucuk.nama_unit, divisi: b.nama_unit };
    return { direktorat: b.nama_unit, divisi: b.nama_unit };
  };
}

export function kelompokDivisi(aktif: Orang[], maksDirektorat = 6) {
  const per = new Map<string, Map<string, Orang[]>>();
  for (const o of aktif) {
    const d = per.get(o.direktorat) ?? new Map<string, Orang[]>();
    d.set(o.divisi, [...(d.get(o.divisi) ?? []), o]);
    per.set(o.direktorat, d);
  }
  const daftar = [...per.entries()]
    .map(([nama, d]) => ({ nama, total: [...d.values()].reduce((t, x) => t + x.length, 0), divisi: [...d.entries()].map(([dv, orang]) => ({ nama: dv, orang })) }))
    .sort((a, b) => (a.nama === TANPA_BAGAN ? 1 : b.nama === TANPA_BAGAN ? -1 : b.total - a.total));
  if (daftar.length <= maksDirektorat) return daftar;
  const atas = daftar.slice(0, maksDirektorat - 1), sisa = daftar.slice(maksDirektorat - 1);
  return [...atas, { nama: "Direktorat lain", total: sisa.reduce((t, x) => t + x.total, 0), divisi: sisa.flatMap((x) => x.divisi) }];
}

// ---------- treemap ----------
export type Kotak<T> = { item: T; x: number; y: number; w: number; h: number };
export function squarify<T extends { v: number }>(items: T[], x: number, y: number, w: number, h: number): Kotak<T>[] {
  const out: Kotak<T>[] = [];
  let sisa = items.filter((i) => i.v > 0).sort((a, b) => b.v - a.v);
  const total = sisa.reduce((t, i) => t + i.v, 0);
  if (!total || w <= 0 || h <= 0) return out;
  let skala = (w * h) / total;
  const terburuk = (baris: T[], sisi: number) => {
    const ar = baris.map((i) => i.v * skala), jml = ar.reduce((t, v) => t + v, 0), mx = Math.max(...ar), mn = Math.min(...ar);
    return Math.max((sisi * sisi * mx) / (jml * jml), (jml * jml) / (sisi * sisi * mn));
  };
  while (sisa.length) {
    const mendatar = w >= h, sisi = Math.min(w, h);
    let baris: T[] = [], terbaik = Infinity;
    for (const it of sisa) {
      const t = [...baris, it], wr = terburuk(t, sisi);
      if (baris.length && wr > terbaik) break;
      baris = t; terbaik = wr;
    }
    sisa = sisa.slice(baris.length);
    const luas = baris.reduce((t, i) => t + i.v * skala, 0), tebal = luas / sisi;
    let off = 0;
    for (const it of baris) {
      const len = (it.v * skala) / tebal;
      out.push(mendatar ? { item: it, x, y: y + off, w: tebal, h: len } : { item: it, x: x + off, y, w: len, h: tebal });
      off += len;
    }
    if (mendatar) { x += tebal; w -= tebal; } else { y += tebal; h -= tebal; }
    const rem = sisa.reduce((t, i) => t + i.v, 0);
    if (rem) skala = (w * h) / rem;
  }
  return out;
}
