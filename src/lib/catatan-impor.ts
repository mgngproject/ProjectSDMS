/**
 * Catatan kesalahan import yang ditampilkan sebagai tabel: sheet, baris Excel, NP, kolom, isi sel, dan masalahnya.
 * - dilewati: baris tidak diimport
 * - peringatan: baris diimport, tetapi ada isian yang dikosongkan/diabaikan
 * - gagal: kesalahan saat menyimpan ke database
 */
export type JenisCatatan = "dilewati" | "peringatan" | "gagal";

export type Catatan = {
  sheet: string;
  baris: number | null;
  np: string | null;
  kolom: string | null;
  nilai: string | null;
  pesan: string;
  jenis: JenisCatatan;
};

export type HasilBaca<T> = { data: T[]; galat: Catatan[] };

export function catatan(
  sheet: string,
  jenis: JenisCatatan,
  pesan: string,
  rinci: { baris?: number | null; np?: string | null; kolom?: string | null; nilai?: unknown } = {},
): Catatan {
  const nilai = rinci.nilai == null || rinci.nilai === "" ? null : String(rinci.nilai).slice(0, 80);
  return { sheet, baris: rinci.baris ?? null, np: rinci.np ?? null, kolom: rinci.kolom ?? null, nilai, pesan, jenis };
}
