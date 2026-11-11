// Perhitungan kuota Magang per divisi. Struktur diambil dari Kode Bagan: satu angka depan = direktorat (mis. 50000),
// dua angka depan = divisi (mis. 52000), dan unit kerja (mis. 52A00) ikut divisi lewat dua karakter depannya.
// Satu peserta memakai satu slot selama seluruh masa kontraknya.
import { normKode } from "@/lib/bagan";

export type KuotaRow = { awalan: string; kuota: number };
export type PesertaKuota = { id: number; kode: string | null; awal: string | null; akhir: string | null };
export type BaganKuota = { kode: string; nama_unit: string };
export type Divisi = { awalan: string; kode: string | null; nama: string; units: { kode: string; nama: string }[] };

const NAMA_BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

/** "2026-10" -> nomor bulan berurutan. */
const nomor = (ym: string) => Number(ym.slice(0, 4)) * 12 + Number(ym.slice(5, 7)) - 1;
const dariNomor = (n: number) => `${Math.floor(n / 12)}-${String((n % 12) + 1).padStart(2, "0")}`;

export const bulanDari = (tanggal: string) => tanggal.slice(0, 7);
export const geserBulan = (ym: string, n: number) => dariNomor(nomor(ym) + n);
export const namaBulan = (ym: string) => `${NAMA_BULAN[Number(ym.slice(5, 7)) - 1]} ${ym.slice(0, 4)}`;
export const singkatBulan = (ym: string) => NAMA_BULAN[Number(ym.slice(5, 7)) - 1].slice(0, 3);
export const bulanValid = (ym: string | undefined): ym is string => !!ym && /^\d{4}-(0[1-9]|1[0-2])$/.test(ym);

/** Dua karakter depan kode, yang menentukan divisinya. */
export const awalanKode = (kode: string | null | undefined) => normKode(kode).slice(0, 2);
/** Satu karakter depan kode, yang menentukan direktoratnya. */
export const awalanDirektorat = (kode: string | null | undefined) => normKode(kode).slice(0, 1);
/** Kode direktorat: satu angka lalu nol semua, mis. 50000. */
export const kodeDirektorat = (kode: string | null | undefined) => /^\d0+$/.test(normKode(kode));
/** Kode divisi: dua angka (angka kedua bukan nol) lalu nol semua, mis. 52000. */
export const kodeDivisi = (kode: string | null | undefined) => /^\d[1-9]0+$/.test(normKode(kode));

export type Direktorat = { awalan: string; kode: string | null; nama: string; divisi: Divisi[] };

/**
 * Menyusun direktorat > divisi > unit kerja dari daftar bagan. Satu angka depan menentukan direktorat, dua angka depan
 * menentukan divisi. Unit yang angka keduanya nol (mis. 50A00) tidak punya divisi sendiri, jadi ditaruh di divisi
 * "Langsung di bawah direktorat" milik direktoratnya. Awalan tanpa kode resmi tetap muncul dengan nama bawaan.
 */
export function susunDirektorat(bagan: BaganKuota[]): Direktorat[] {
  const dirs = new Map<string, Direktorat>();
  for (const b of bagan) {
    const kode = normKode(b.kode);
    if (!kode) continue;
    const da = awalanDirektorat(kode);
    const dir = dirs.get(da) ?? { awalan: da, kode: null, nama: `Direktorat ${da}`, divisi: [] };
    dirs.set(da, dir);
    if (kodeDirektorat(kode)) {
      dir.kode = kode;
      dir.nama = b.nama_unit;
      continue;
    }
    const a = awalanKode(kode);
    let d = dir.divisi.find((x) => x.awalan === a);
    if (!d) {
      d = { awalan: a, kode: null, nama: a[1] === "0" ? "Langsung di bawah direktorat" : `Divisi ${a}`, units: [] };
      dir.divisi.push(d);
    }
    if (kodeDivisi(kode)) {
      d.kode = kode;
      d.nama = b.nama_unit;
    } else {
      d.units.push({ kode, nama: b.nama_unit });
    }
  }
  const urut = [...dirs.values()].sort((x, y) => x.awalan.localeCompare(y.awalan));
  for (const d of urut) d.divisi.sort((x, y) => x.awalan.localeCompare(y.awalan));
  return urut;
}

/** Daftar divisi saja (tanpa direktorat), urut menurut awalan. */
export const susunDivisi = (bagan: BaganKuota[]): Divisi[] => susunDirektorat(bagan).flatMap((d) => d.divisi).sort((x, y) => x.awalan.localeCompare(y.awalan));

/** Peserta di divisi itu yang kontraknya mencakup bulan tersebut (sebagian bulan pun dihitung). */
export function pesertaDiBulan(peserta: PesertaKuota[], awalan: string, ym: string): PesertaKuota[] {
  return peserta.filter((p) => !!p.kode && awalanKode(p.kode) === awalan && p.awal && p.akhir && bulanDari(p.awal) <= ym && bulanDari(p.akhir) >= ym);
}

/**
 * Peringatan bila peserta baru membuat divisinya penuh di salah satu bulan masa kontraknya, atau bila tidak bisa
 * diperiksa (tanpa kode bagan, atau kuota divisinya belum diatur). Null bila aman atau kuota belum dipakai sama sekali.
 */
export function peringatanKuota(
  kuota: KuotaRow[],
  peserta: PesertaKuota[],
  bagan: BaganKuota[],
  baru: { kode: string | null; awal: string; akhir: string },
): string | null {
  if (kuota.length === 0) return null;
  const kode = normKode(baru.kode);
  if (!kode) return "Karyawan belum punya Kode Bagan, jadi tidak dihitung di kuota divisi mana pun.";
  const a = awalanKode(kode);
  const nama = susunDivisi(bagan).find((d) => d.awalan === a)?.nama ?? `Divisi ${a}`;
  const baris = kuota.find((k) => k.awalan === a);
  if (!baris) return `Kuota ${nama} belum diatur.`;

  const penuh: string[] = [];
  const mulai = nomor(bulanDari(baru.awal));
  const sampai = Math.min(nomor(bulanDari(baru.akhir)), mulai + 35);
  for (let n = mulai; n <= sampai; n++) {
    const ym = dariNomor(n);
    const terisi = pesertaDiBulan(peserta, a, ym).length;
    if (terisi >= baris.kuota) penuh.push(`${singkatBulan(ym)} ${ym.slice(0, 4)} (${terisi}/${baris.kuota})`);
  }
  return penuh.length ? `${nama} sudah penuh pada ${penuh.join(", ")}.` : null;
}

export function statusKuota(kuota: number, terisi: number): { nada: "success" | "warning" | "danger"; label: string } {
  if (terisi > kuota) return { nada: "danger", label: `Melebihi +${terisi - kuota}` };
  if (terisi === kuota) return { nada: "danger", label: "Penuh" };
  if (kuota > 0 && terisi / kuota >= 0.8) return { nada: "warning", label: "Hampir penuh" };
  return { nada: "success", label: "Tersedia" };
}
