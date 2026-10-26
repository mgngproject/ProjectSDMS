export function formatTanggal(value: string | null | undefined): string {
  if (!value) return "-";
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
}

export function formatRupiah(value: number | null | undefined): string {
  if (value == null) return "-";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
}

/** Tanggal hari ini (zona Asia/Jakarta) dalam format YYYY-MM-DD. */
export function hariIni(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());
}

/**
 * Selisih bulan antara dua tanggal setelah keduanya dibulatkan ke awal bulan
 * (sama dengan `startOfMonth()->diffInMonths()` di Laravel).
 */
export function bulanAntara(awal: string | null, akhir: string | null): number | null {
  if (!awal || !akhir) return null;
  const [y1, m1] = awal.split("-").map(Number);
  const [y2, m2] = akhir.split("-").map(Number);
  return Math.abs((y2 - y1) * 12 + (m2 - m1));
}

export function formatBulan(bulan: number | null): string {
  if (bulan == null) return "-";
  return `${Math.floor(bulan / 12)} Tahun ${bulan % 12} Bulan`;
}

/** Masa kerja = awal kontrak pertama sampai akhir kontrak; kosong bila akhir kontrak kosong. */
export function masaKerja(k: { awal_kontrak: string | null; akhir_kontrak: string | null }): string {
  return formatBulan(bulanAntara(k.awal_kontrak, k.akhir_kontrak));
}

/** Masa kontrak = awal kontrak aktif sampai akhir kontrak. */
export function masaKontrak(k: { awal_kontrak_aktif: string | null; akhir_kontrak: string | null }): string {
  return formatBulan(bulanAntara(k.awal_kontrak_aktif, k.akhir_kontrak));
}

export const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
