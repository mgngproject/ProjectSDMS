import type { createClient } from "@/lib/supabase/server";
import type { Mutasi } from "@/lib/types";

type Klien = Awaited<ReturnType<typeof createClient>>;

export type BarisMutasi = Mutasi & { karyawan: { id: number; np: string; nama: string; status: string; kategori: { nama: string } | null } };

export type FilterMutasi = { q?: string; kategori?: string; dari?: string; sampai?: string };

/** Riwayat mutasi semua karyawan yang boleh dilihat (RLS), terbaru di atas, sesuai filter. */
export async function ambilMutasi(supabase: Klien, f: FilterMutasi): Promise<BarisMutasi[]> {
  let q = supabase
    .from("mutasi")
    .select("*, karyawan:karyawan_id!inner(id, np, nama, status, kategori:kategori_id(nama))")
    .order("tanggal", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(2000);
  if (f.dari) q = q.gte("tanggal", f.dari);
  if (f.sampai) q = q.lte("tanggal", f.sampai);
  const { data } = await q;
  const cari = f.q?.trim().toLowerCase();
  return ((data ?? []) as unknown as BarisMutasi[]).filter((m) => {
    if (f.kategori && m.karyawan.kategori?.nama !== f.kategori) return false;
    if (!cari) return true;
    return [m.karyawan.np, m.karyawan.nama, m.unit_kerja_lama, m.unit_kerja_baru, m.kode_bagan_lama, m.kode_bagan_baru, m.keterangan]
      .some((v) => v?.toLowerCase().includes(cari));
  });
}
