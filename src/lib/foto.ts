import type { createClient } from "@/lib/supabase/server";

type Klien = Awaited<ReturnType<typeof createClient>>;

export const BUCKET_FOTO = "foto-karyawan";
export const BATAS_FOTO = 2 * 1024 * 1024;
const JENIS: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png" };

/** Berkas foto dari form, atau null bila tidak ada yang dipilih. */
export function berkasFoto(f: FormData): File | null {
  const v = f.get("foto");
  return v instanceof File && v.size > 0 ? v : null;
}

/**
 * Mengunggah foto ke folder <karyawan_id>/ dan menyimpan jalurnya di data karyawan.
 * Foto lama dihapus setelah yang baru berhasil. Mengembalikan pesan galat, atau null bila berhasil.
 */
export async function simpanFoto(supabase: Klien, karyawanId: number, berkas: File, fotoLama: string | null): Promise<string | null> {
  const ekstensi = JENIS[berkas.type];
  if (!ekstensi) return "Foto harus berformat JPG atau PNG.";
  if (berkas.size > BATAS_FOTO) return "Ukuran foto maksimal 2 MB.";

  const jalur = `${karyawanId}/${Date.now()}.${ekstensi}`;
  const { error } = await supabase.storage.from(BUCKET_FOTO).upload(jalur, berkas, { contentType: berkas.type, upsert: false });
  if (error) return `Foto gagal diunggah: ${error.message}`;

  const { error: dbError } = await supabase.from("karyawan").update({ foto: jalur }).eq("id", karyawanId);
  if (dbError) {
    await supabase.storage.from(BUCKET_FOTO).remove([jalur]);
    return `Foto gagal disimpan: ${dbError.message}`;
  }
  if (fotoLama) await supabase.storage.from(BUCKET_FOTO).remove([fotoLama]);
  return null;
}

/** Menghapus semua foto milik karyawan. Panggil sebelum baris karyawan dihapus (hak akses bergantung padanya). */
export async function hapusFotoKaryawan(supabase: Klien, ids: number[]): Promise<void> {
  const jalur: string[] = [];
  for (const id of ids) {
    const { data } = await supabase.storage.from(BUCKET_FOTO).list(String(id));
    for (const berkas of data ?? []) jalur.push(`${id}/${berkas.name}`);
  }
  if (jalur.length > 0) await supabase.storage.from(BUCKET_FOTO).remove(jalur);
}

/** Tautan sementara (1 jam) untuk menampilkan foto; kunci peta = jalur foto. */
export async function tautanFoto(supabase: Klien, jalur: (string | null)[]): Promise<Map<string, string>> {
  const unik = [...new Set(jalur.filter((j): j is string => !!j))];
  const peta = new Map<string, string>();
  if (unik.length === 0) return peta;
  const { data } = await supabase.storage.from(BUCKET_FOTO).createSignedUrls(unik, 3600);
  for (const d of data ?? []) if (d.path && d.signedUrl) peta.set(d.path, d.signedUrl);
  return peta;
}
