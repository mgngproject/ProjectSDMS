import type { createClient } from "@/lib/supabase/server";
import type { KuotaRow, PesertaKuota } from "@/lib/kuota";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export async function ambilKuota(supabase: Supabase): Promise<KuotaRow[]> {
  const { data } = await supabase.from("kuota_magang").select("id, unit_kerja, penempatan, kuota").order("unit_kerja");
  return (data ?? []) as KuotaRow[];
}

/** Peserta Magang yang masih aktif, dibatasi RLS. `kecuali` mengeluarkan satu karyawan (saat ubah data). */
export async function ambilPesertaMagang(supabase: Supabase, kecuali?: number): Promise<PesertaKuota[]> {
  const { data } = await supabase
    .from("karyawan")
    .select("id, unit_kerja, awal_kontrak, awal_kontrak_aktif, akhir_kontrak, kategori:kategori_id!inner(nama), detail:karyawan_magang(penempatan)")
    .eq("status", "aktif")
    .eq("kategori.nama", "Magang");
  type Baris = { id: number; unit_kerja: string | null; awal_kontrak: string | null; awal_kontrak_aktif: string | null; akhir_kontrak: string | null; detail: { penempatan: string | null } | null };
  return ((data ?? []) as unknown as Baris[])
    .filter((r) => r.id !== kecuali)
    .map((r) => ({ id: r.id, unit_kerja: r.unit_kerja, penempatan: r.detail?.penempatan ?? null, awal: r.awal_kontrak_aktif ?? r.awal_kontrak, akhir: r.akhir_kontrak }));
}
