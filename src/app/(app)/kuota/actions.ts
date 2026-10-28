"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { TEMPAT } from "@/lib/kuota";
import { dengan, pesanGalat, text } from "@/lib/params";
import { createClient } from "@/lib/supabase/server";

/** Kuota hanya untuk PIC Magang; Super Admin tidak punya akses. */
async function pastikanPicMagang() {
  const profile = await getProfile();
  if (profile.role === "superadmin" || profile.kategori?.nama !== "Magang") redirect(dengan("/kuota", "error", "Kuota hanya bisa diubah oleh PIC Magang."));
}

function bacaKuota(f: FormData): number | null {
  const n = Number(text(f, "kuota"));
  return Number.isInteger(n) && n >= 0 ? n : null;
}

export async function tambahKuota(formData: FormData) {
  await pastikanPicMagang();
  const unit = text(formData, "unit_kerja");
  const tempat = text(formData, "penempatan");
  const kuota = bacaKuota(formData);
  if (!unit) redirect(dengan("/kuota", "error", "Unit kerja wajib diisi."));
  if (!tempat || !(TEMPAT as readonly string[]).includes(tempat)) redirect(dengan("/kuota", "error", "Penempatan tidak valid."));
  if (kuota === null) redirect(dengan("/kuota", "error", "Kuota harus berupa bilangan bulat 0 atau lebih."));

  const supabase = await createClient();
  const { error } = await supabase.from("kuota_magang").insert({ unit_kerja: unit, penempatan: tempat, kuota });
  if (error) redirect(dengan("/kuota", "error", error.code === "23505" ? `${unit} sudah punya kuota di ${tempat}.` : pesanGalat(error)));
  revalidatePath("/kuota");
  redirect(dengan("/kuota", "ok", "Kuota ditambahkan"));
}

// Nomor disematkan lewat bind(): nama dan nilai tombol tidak ikut terkirim bersama aksi server
export async function ubahKuota(id: number, formData: FormData) {
  await pastikanPicMagang();
  const kuota = bacaKuota(formData);
  if (kuota === null) redirect(dengan("/kuota", "error", "Kuota harus berupa bilangan bulat 0 atau lebih."));
  const supabase = await createClient();
  const { error } = await supabase.from("kuota_magang").update({ kuota }).eq("id", id);
  if (error) redirect(dengan("/kuota", "error", pesanGalat(error)));
  revalidatePath("/kuota");
  redirect(dengan("/kuota", "ok", "Kuota disimpan"));
}

export async function hapusKuota(id: number, _formData: FormData) {
  await pastikanPicMagang();
  const supabase = await createClient();
  const { error } = await supabase.from("kuota_magang").delete().eq("id", id);
  if (error) redirect(dengan("/kuota", "error", pesanGalat(error)));
  revalidatePath("/kuota");
  redirect(dengan("/kuota", "ok", "Kuota dihapus"));
}
