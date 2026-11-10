"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { dengan, pesanGalat, text } from "@/lib/params";
import { createClient } from "@/lib/supabase/server";

const halaman = (karyawanId: number) => `/karyawan/${karyawanId}/mutasi`;

/** Catat mutasi: pindahkan karyawan ke unit tujuan pada tanggal efektif, sekaligus menyimpan riwayatnya. */
export async function catatMutasi(karyawanId: number, formData: FormData) {
  const kode = text(formData, "kode_bagan");
  const unit = text(formData, "unit_kerja");
  const tanggal = text(formData, "tanggal");
  if (!kode && !unit) redirect(dengan(halaman(karyawanId), "error", "Isi kode bagan atau unit kerja tujuan."));
  if (!tanggal) redirect(dengan(halaman(karyawanId), "error", "Tanggal mutasi wajib diisi."));

  const supabase = await createClient();
  const { error } = await supabase.rpc("mutasi_karyawan", {
    p_karyawan: karyawanId,
    p_kode: kode,
    p_unit: unit,
    p_tanggal: tanggal,
    p_keterangan: text(formData, "keterangan"),
  });
  if (error) redirect(dengan(halaman(karyawanId), "error", pesanGalat(error)));

  revalidatePath("/karyawan");
  revalidatePath("/mutasi");
  redirect(dengan(halaman(karyawanId), "ok", "Mutasi dicatat dan unit kerja karyawan diperbarui."));
}

/** Ubah tanggal atau keterangan satu riwayat mutasi (unit karyawan tidak berubah). */
export async function ubahMutasi(id: number, karyawanId: number, formData: FormData) {
  const tanggal = text(formData, "tanggal");
  if (!tanggal) redirect(dengan(halaman(karyawanId), "error", "Tanggal mutasi wajib diisi."));
  const supabase = await createClient();
  const { error } = await supabase.from("mutasi").update({ tanggal, keterangan: text(formData, "keterangan") }).eq("id", id);
  if (error) redirect(dengan(halaman(karyawanId), "error", pesanGalat(error)));
  revalidatePath("/mutasi");
  redirect(dengan(halaman(karyawanId), "ok", "Riwayat mutasi diperbarui."));
}

/** Hapus satu baris riwayat (mis. salah catat). Unit kerja karyawan saat ini tidak ikut berubah. */
export async function hapusMutasi(id: number, karyawanId: number, _formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("mutasi").delete().eq("id", id);
  if (error) redirect(dengan(halaman(karyawanId), "error", pesanGalat(error)));
  revalidatePath("/mutasi");
  redirect(dengan(halaman(karyawanId), "ok", "Riwayat mutasi dihapus. Unit kerja karyawan saat ini tidak berubah."));
}
