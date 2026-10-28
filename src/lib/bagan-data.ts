import type { Bagan } from "@/lib/bagan";
import type { createClient } from "@/lib/supabase/server";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export async function ambilBagan(supabase: Supabase, hanyaAktif = false): Promise<Bagan[]> {
  let q = supabase.from("bagan").select("id, kode, nama_unit, induk_kode, aktif").order("kode");
  if (hanyaAktif) q = q.eq("aktif", true);
  const { data } = await q;
  return (data ?? []) as Bagan[];
}
