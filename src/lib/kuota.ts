// Perhitungan kuota Magang per divisi. Divisi diambil dari Kode Bagan: kode berpola dua angka lalu nol semua
// (mis. 10000) adalah divisi, dan unit kerja yang dua karakter depan kodenya sama masuk ke divisi itu.
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
/** Kode divisi: dua angka lalu nol semua, mis. 10000 dan 20000. */
export const kodeDivisi = (kode: string | null | undefined) => /^\d{2}0+$/.test(normKode(kode));

/**
 * Menyusun divisi dari daftar bagan. Awalan yang punya unit tetapi tidak punya kode divisi di daftar tetap muncul,
 * dengan nama "Divisi <awalan>". Urut menurut awalan.
 */
export function susunDivisi(bagan: BaganKuota[]): Divisi[] {
  const peta = new Map<string, Divisi>();
  for (const b of bagan) {
    const kode = normKode(b.kode);
    if (!kode) continue;
    const a = awalanKode(kode);
    const d = peta.get(a) ?? { awalan: a, kode: null, nama: `Divisi ${a}`, units: [] };
    if (kodeDivisi(kode)) {
      d.kode = kode;
      d.nama = b.nama_unit;
    } else {
      d.units.push({ kode, nama: b.nama_unit });
    }
    peta.set(a, d);
  }
  return [...peta.values()].sort((x, y) => x.awalan.localeCompare(y.awalan));
}

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
