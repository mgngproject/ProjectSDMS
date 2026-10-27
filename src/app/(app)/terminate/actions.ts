"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { hapusFotoKaryawan } from "@/lib/foto";
import { dengan, pesanGalat, text } from "@/lib/params";
import { createClient } from "@/lib/supabase/server";

export async function createTerminate(formData: FormData) {
  const profile = await getProfile();
  const kategori_id = profile.role === "superadmin" ? Number(formData.get("kategori_id")) || null : profile.kategori_id;
  const np = text(formData, "np");
  const nama = text(formData, "nama");
  const tanggal = text(formData, "tanggal_keluar");
  const alasan = text(formData, "alasan_keluar");
  const awal = text(formData, "awal_kontrak");
  const akhir = text(formData, "akhir_kontrak");

  const salah =
    !np || !nama || !kategori_id ? "NP, nama, dan kategori wajib diisi."
    : !tanggal || !alasan ? "Tanggal keluar dan alasan wajib diisi."
    : awal && akhir && akhir < awal ? "Akhir kontrak tidak boleh sebelum awal kontrak."
    : null;
  if (salah) redirect(dengan("/terminate/new", "error", salah));

  const supabase = await createClient();
  const { error } = await supabase.from("karyawan").insert({
    np,
    nama,
    kategori_id,
    kode_bagan: text(formData, "kode_bagan"),
    unit_kerja: text(formData, "unit_kerja"),
    jabatan: text(formData, "jabatan"),
    level: text(formData, "level"),
    role: text(formData, "role"),
    awal_kontrak: awal,
    akhir_kontrak: akhir,
    tanggal_keluar: tanggal,
    alasan_keluar: alasan,
    status: "terminate",
  });
  if (error) redirect(dengan("/terminate/new", "error", pesanGalat(error)));

  revalidatePath("/terminate");
  redirect(dengan("/terminate", "ok", "Data terminate berhasil ditambahkan"));
}

export async function updateTerminate(id: number, formData: FormData) {
  const tanggal = text(formData, "tanggal_keluar");
  const alasan = text(formData, "alasan_keluar");
  if (!tanggal || !alasan) redirect(dengan(`/terminate/${id}/edit`, "error", "Tanggal keluar dan alasan wajib diisi."));

  const supabase = await createClient();
  const { error } = await supabase
    .from("karyawan")
    .update({ tanggal_keluar: tanggal, alasan_keluar: alasan, akhir_kontrak: text(formData, "akhir_kontrak"), status: "terminate" })
    .eq("id", id);
  if (error) redirect(dengan(`/terminate/${id}/edit`, "error", pesanGalat(error)));

  revalidatePath("/terminate");
  redirect(dengan("/terminate", "ok", "Data terminate berhasil diupdate"));
}

export async function deleteTerminate(formData: FormData) {
  const supabase = await createClient();
  await hapusFotoKaryawan(supabase, [Number(formData.get("id"))]);
  const { error } = await supabase.from("karyawan").delete().eq("id", Number(formData.get("id"))).eq("status", "terminate");
  revalidatePath("/terminate");
  redirect(error ? dengan("/terminate", "error", pesanGalat(error)) : dengan("/terminate", "ok", "Data karyawan terminate berhasil dihapus"));
}

export async function bulkDeleteTerminate(formData: FormData) {
  const ids = formData.getAll("ids").map(Number).filter(Boolean);
  if (ids.length === 0) redirect(dengan("/terminate", "error", "Tidak ada data yang dipilih"));
  const supabase = await createClient();
  await hapusFotoKaryawan(supabase, ids);
  const { data, error } = await supabase.from("karyawan").delete().in("id", ids).eq("status", "terminate").select("id");
  revalidatePath("/terminate");
  redirect(
    error || !data?.length
      ? dengan("/terminate", "error", "Tidak ada data yang bisa dihapus atau Anda tidak memiliki akses")
      : dengan("/terminate", "ok", `Berhasil menghapus ${data.length} data karyawan terminate`),
  );
}
