import { formatRupiah, formatTanggal, masaKerja, masaKontrak } from "@/lib/format";
import type { KategoriConfig } from "@/lib/kategori-config";
import type { Detail, Karyawan } from "@/lib/types";

/** Karyawan dengan nama kategori dan, bila ada, baris detail kategorinya. */
export type BarisKaryawan = Karyawan & { detail?: Detail | null };

/** Menyeragamkan hasil embed detail dari PostgREST (objek untuk relasi satu-satu, larik bila berbeda). */
export function normalisasi(rows: BarisKaryawan[]): BarisKaryawan[] {
  return rows.map((r) => ({ ...r, detail: Array.isArray(r.detail) ? (r.detail[0] ?? null) : r.detail ?? null }));
}

/** Kolom tabel untuk kategori tanpa konfigurasi khusus. */
export const KOLOM_STANDAR = [
  "np", "nama", "kategori", "awal_kontrak", "akhir_kontrak", "masa_kerja", "masa_kontrak",
  "kode_bagan", "unit_kerja", "jabatan", "level", "role", "benefit_kesehatan", "gross_per_month", "kpi",
];

/**
 * Nilai sebuah kolom sebagai teks. `format` true untuk tampilan (tanggal dan rupiah diformat),
 * false untuk export (tanggal mentah YYYY-MM-DD, angka apa adanya).
 */
export function nilaiKolom(row: BarisKaryawan, key: string, config: KategoriConfig | null, format: boolean): string | number | null {
  const field = config?.fields.find((f) => f.name === key);
  if (field) {
    const v = row.detail?.[key] ?? null;
    if (v != null && field.type === "number") return format ? formatRupiah(Number(v)) : Number(v);
    return v && field.type === "date" && format ? formatTanggal(v) : v;
  }
  switch (key) {
    case "kategori":
      return row.kategori?.nama ?? null;
    case "masa_kerja":
      return masaKerja(row);
    case "masa_kontrak":
      return masaKontrak(row);
    case "awal_kontrak":
    case "akhir_kontrak":
      return format ? formatTanggal(row[key]) : row[key];
    case "gross_per_month":
      return format ? formatRupiah(row.gross_per_month) : row.gross_per_month;
    default:
      return (row as unknown as Record<string, string | number | null>)[key] ?? null;
  }
}
