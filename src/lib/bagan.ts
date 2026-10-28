// Daftar bagan: kode bagan dan nama unit kerja sebagai satu sumber acuan.
import type { Baris, Hasil } from "@/lib/impor";

export type Bagan = { id: number; kode: string; nama_unit: string; induk_kode: string | null; aktif: boolean };

/** Kode diseragamkan: spasi tepi dibuang dan huruf menjadi besar. */
export const normKode = (s: string | null | undefined): string => (s ?? "").trim().toUpperCase();

export function cariBagan<T extends { kode: string }>(daftar: T[], kode: string | null | undefined): T | undefined {
  const k = normKode(kode);
  return k ? daftar.find((b) => b.kode === k) : undefined;
}

/**
 * Memeriksa kode bagan terhadap daftar bagan yang aktif. Bila daftar masih kosong, atau kodenya kosong, tidak ada pembatasan.
 * Kode lama yang tidak diubah tetap diterima agar karyawan lama tetap bisa disimpan. `unit` adalah nama unit dari daftar.
 */
export function periksaKodeBagan(
  aktif: Pick<Bagan, "kode" | "nama_unit">[],
  kode: string | null,
  kodeLama?: string | null,
): { error: string | null; unit: string | null } {
  if (aktif.length === 0 || !kode) return { error: null, unit: null };
  const ketemu = cariBagan(aktif, kode);
  if (ketemu) return { error: null, unit: ketemu.nama_unit };
  if (kodeLama && normKode(kodeLama) === normKode(kode)) return { error: null, unit: null };
  return { error: `Kode bagan "${kode}" tidak ada di daftar bagan atau sudah tidak aktif.`, unit: null };
}

export type BaganImpor = { baris: number; kode: string; nama_unit: string; induk_kode: string | null };

const teks = (v: string | number | boolean | null | undefined): string | null => {
  if (v == null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
};

/** Membaca baris Excel daftar bagan. Judul kolom yang diterima mengikuti kebiasaan sheet kode bagan. */
export function bacaBagan(rows: Baris[]): Hasil<BaganImpor> {
  const data: BaganImpor[] = [];
  const galat: string[] = [];
  const dilihat = new Set<string>();
  rows.forEach((r, i) => {
    const baris = i + 2;
    const kode = normKode(teks(r.kode ?? r.kode_bagan));
    if (!kode) return; // baris kosong dilewati
    const nama = teks(r.nama_unit ?? r.unit_kerja ?? r.nama_bagan ?? r.nama ?? r.unit);
    if (!nama) return void galat.push(`Baris ${baris}: nama unit untuk kode ${kode} kosong`);
    if (dilihat.has(kode)) return void galat.push(`Baris ${baris}: kode ${kode} muncul dua kali di file`);
    dilihat.add(kode);
    const induk = normKode(teks(r.induk ?? r.induk_kode ?? r.atasan ?? r.kode_induk ?? r.kode_atasan));
    data.push({ baris, kode, nama_unit: nama, induk_kode: induk || null });
  });
  return { data, galat };
}
