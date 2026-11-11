import type { createClient } from "@/lib/supabase/server";
import type { KuotaRow, PesertaKuota } from "@/lib/kuota";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export async function ambilKuota(supabase: Supabase): Promise<KuotaRow[]> {
  const { data } = await supabase.from("kuota_divisi").select("awalan, kuota").order("awalan");
  return (data ?? []) as KuotaRow[];
}

/** Peserta Magang yang masih aktif, dibatasi RLS. `kecuali` mengeluarkan satu karyawan (saat ubah data). */
export async function ambilPesertaMagang(supabase: Supabase, kecuali?: number): Promise<PesertaKuota[]> {
  const hasil: PesertaKuota[] = [];
  // Dibaca per halaman 1000 baris karena batas bawaan Supabase
  for (let dari = 0; ; dari += 1000) {
    const { data } = await supabase
      .from("karyawan")
      .select("id, kode_bagan, awal_kontrak, awal_kontrak_aktif, akhir_kontrak, kategori:kategori_id!inner(nama)")
      .eq("status", "aktif")
      .eq("kategori.nama", "Magang")
      .order("id")
      .range(dari, dari + 999);
    type Baris = { id: number; kode_bagan: string | null; awal_kontrak: string | null; awal_kontrak_aktif: string | null; akhir_kontrak: string | null };
    const bagian = (data ?? []) as unknown as Baris[];
    for (const r of bagian) {
      if (r.id !== kecuali) hasil.push({ id: r.id, kode: r.kode_bagan, awal: r.awal_kontrak_aktif ?? r.awal_kontrak, akhir: r.akhir_kontrak });
    }
    if (bagian.length < 1000) return hasil;
  }
}
