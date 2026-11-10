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

/**
 * Ringkasan kesalahan untuk pesan merah/hijau: "Baris 2 (T8881): Awal Kontrak format tanggal salah; ...".
 * Dibatasi panjangnya; sisanya ditulis "+N kesalahan lain".
 */
export function ringkasCatatan(daftar: Catatan[], batas = 650): string {
  if (daftar.length === 0) return "";
  const bagian = daftar.map((c) => {
    const letak = [c.sheet !== "Database" && c.sheet !== "Perpanjangan" ? c.sheet : null, c.baris ? `Baris ${c.baris}` : null].filter(Boolean).join(" ");
    const siapa = c.np ? ` (${c.np})` : "";
    // "Format tanggal salah" -> "Awal Kontrak format tanggal salah"; singkatan seperti "NP" tidak diubah
    const kecil = /^[A-Z][a-z]/.test(c.pesan) ? c.pesan.charAt(0).toLowerCase() + c.pesan.slice(1) : c.pesan;
    const isi = c.kolom ? `${c.kolom} ${kecil}` : c.pesan;
    return `${letak}${siapa}${letak || siapa ? ": " : ""}${isi}`;
  });
  const dipakai: string[] = [];
  let panjang = 0;
  for (const b of bagian) {
    if (panjang + b.length > batas && dipakai.length > 0) break;
    dipakai.push(b);
    panjang += b.length + 2;
  }
  const sisa = bagian.length - dipakai.length;
  return ` Kesalahan: ${dipakai.join("; ")}${sisa ? `; +${sisa} kesalahan lain` : ""}.`;
}
