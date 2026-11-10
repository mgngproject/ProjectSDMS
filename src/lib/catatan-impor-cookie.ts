import { cookies } from "next/headers";
import type { Catatan, JenisCatatan } from "@/lib/catatan-impor";

const NAMA_COOKIE = "hasil_impor";
const BATAS_COOKIE = 3600; // byte setelah di-encode; batas cookie peramban sekitar 4 KB

type Paket = { id: string; c: Catatan[]; sisa: number };

/** Urutkan: yang dilewati/gagal dulu, lalu per sheet dan nomor baris. */
function urutkan(daftar: Catatan[]): Catatan[] {
  const bobot: Record<JenisCatatan, number> = { gagal: 0, dilewati: 1, peringatan: 2 };
  return [...daftar].sort((a, b) => bobot[a.jenis] - bobot[b.jenis] || a.sheet.localeCompare(b.sheet) || (a.baris ?? 0) - (b.baris ?? 0));
}

/**
 * Simpan catatan untuk ditampilkan di halaman tujuan (cookie singkat, 10 menit).
 * Mengembalikan id yang ikut dikirim di alamat (?impor=id) agar laporan hanya muncul sekali untuk import itu.
 */
export async function simpanCatatan(daftar: Catatan[]): Promise<string | null> {
  if (daftar.length === 0) return null;
  const id = Date.now().toString(36);
  const semua = urutkan(daftar);
  let c = semua;
  // Kurangi sampai muat di cookie; sisanya dihitung sebagai "tidak ditampilkan"
  while (c.length > 0 && encodeURIComponent(JSON.stringify({ id, c, sisa: semua.length - c.length } satisfies Paket)).length > BATAS_COOKIE) {
    c = c.slice(0, Math.max(0, Math.floor(c.length * 0.8)));
  }
  (await cookies()).set(NAMA_COOKIE, JSON.stringify({ id, c, sisa: semua.length - c.length } satisfies Paket), {
    path: "/",
    maxAge: 600,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return id;
}

/** Baca catatan import untuk id di alamat; null bila tidak ada atau sudah kedaluwarsa. */
export async function ambilCatatan(id: string | undefined): Promise<{ catatan: Catatan[]; sisa: number } | null> {
  if (!id) return null;
  const mentah = (await cookies()).get(NAMA_COOKIE)?.value;
  if (!mentah) return null;
  try {
    const paket = JSON.parse(mentah) as Paket;
    return paket.id === id ? { catatan: paket.c, sisa: paket.sisa } : null;
  } catch {
    return null;
  }
}
