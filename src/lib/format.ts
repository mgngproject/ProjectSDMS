export function formatTanggal(value: string | null | undefined): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatRupiah(value: number | null | undefined): string {
  if (value == null) return "-";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
}

/** Selisih bulan penuh dari `dari` ke `sampai` (default hari ini). */
export function selisihBulan(dari: string | null, sampai?: string | null): number | null {
  if (!dari) return null;
  const a = new Date(dari);
  const b = sampai ? new Date(sampai) : new Date();
  let bulan = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) bulan -= 1;
  return Math.max(bulan, 0);
}

export function formatBulan(bulan: number | null): string {
  if (bulan == null) return "-";
  const tahun = Math.floor(bulan / 12);
  const sisa = bulan % 12;
  return [tahun ? `${tahun} tahun` : "", sisa || !tahun ? `${sisa} bulan` : ""].filter(Boolean).join(" ");
}

/** Sisa hari sampai tanggal; negatif bila sudah lewat. */
export function sisaHari(tanggal: string | null): number | null {
  if (!tanggal) return null;
  return Math.ceil((new Date(tanggal).getTime() - Date.now()) / 86_400_000);
}
