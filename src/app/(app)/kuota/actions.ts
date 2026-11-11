"use server";

import { revalidatePath } from "next/cache";
import { getProfile } from "@/lib/auth";
import { normKode } from "@/lib/bagan";
import { pesanGalat } from "@/lib/params";
import { createClient } from "@/lib/supabase/server";

type Hasil = { error?: string };

/** Kuota hanya untuk PIC Magang; Super Admin tidak punya akses. */
async function picMagang(): Promise<boolean> {
  const profile = await getProfile();
  return profile.role !== "superadmin" && profile.kategori?.nama === "Magang";
}

const AWALAN = /^[A-Z0-9]{2}$/;

/** Menyimpan kuota satu divisi (dua karakter depan kode bagan). Dipanggil langsung dari halaman, tanpa pindah halaman. */
export async function simpanKuota(awalan: string, kuota: number): Promise<Hasil> {
  if (!(await picMagang())) return { error: "Kuota hanya bisa diubah oleh PIC Magang." };
  const a = normKode(awalan);
  if (!AWALAN.test(a)) return { error: "Divisi tidak valid." };
  if (!Number.isInteger(kuota) || kuota < 0 || kuota > 9999) return { error: "Kuota harus berupa bilangan bulat 0 sampai 9999." };
  const supabase = await createClient();
  const { error } = await supabase.from("kuota_divisi").upsert({ awalan: a, kuota, updated_at: new Date().toISOString() }, { onConflict: "awalan" });
  if (error) return { error: error.code === "42P01" ? "Tabel kuota belum ada di database. Jalankan migrasi 0024_kuota_divisi.sql di Supabase SQL Editor." : pesanGalat(error) };
  revalidatePath("/kuota");
  return {};
}

/** Menghapus kuota satu divisi (mis. divisi yang sudah tidak ada di daftar bagan). */
export async function hapusKuota(awalan: string): Promise<Hasil> {
  if (!(await picMagang())) return { error: "Kuota hanya bisa diubah oleh PIC Magang." };
  const a = normKode(awalan);
  if (!AWALAN.test(a)) return { error: "Divisi tidak valid." };
  const supabase = await createClient();
  const { error } = await supabase.from("kuota_divisi").delete().eq("awalan", a);
  if (error) return { error: pesanGalat(error) };
  revalidatePath("/kuota");
  return {};
}
