"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { hariIni } from "@/lib/format";
import { dengan, pesanGalat, text } from "@/lib/params";
import { createClient } from "@/lib/supabase/server";

async function kategoriDipilih(f: FormData) {
  const profile = await getProfile();
  // Admin selalu terkunci ke kategorinya; hanya superadmin yang boleh memilih
  return profile.role === "superadmin" ? Number(f.get("kategori_id")) || null : profile.kategori_id;
}

function kolomUmum(f: FormData) {
  const gross = text(f, "gross_per_month");
  return {
    np: text(f, "np"),
    nama: text(f, "nama"),
    kode_bagan: text(f, "kode_bagan"),
    unit_kerja: text(f, "unit_kerja"),
    jabatan: text(f, "jabatan"),
    level: text(f, "level"),
    role: text(f, "role"),
    benefit_kesehatan: text(f, "benefit_kesehatan"),
    faskes: text(f, "faskes"),
    gross_per_month: gross ? Number(gross) : null,
    kpi: text(f, "kpi"),
  };
}

export async function createKaryawan(formData: FormData) {
  const awal = text(formData, "awal_kontrak");
  const akhir = text(formData, "akhir_kontrak");
  if (!text(formData, "np") || !text(formData, "nama")) redirect(dengan("/karyawan/new", "error", "NP dan nama wajib diisi."));
  if (!awal || !akhir) redirect(dengan("/karyawan/new", "error", "Awal dan akhir kontrak wajib diisi."));
  if (akhir <= awal) redirect(dengan("/karyawan/new", "error", "Akhir kontrak harus setelah awal kontrak."));

  const kategori_id = await kategoriDipilih(formData);
  if (!kategori_id) redirect(dengan("/karyawan/new", "error", "Kategori wajib dipilih."));

  const supabase = await createClient();
  const { data: karyawan, error } = await supabase
    .from("karyawan")
    .insert({
      ...kolomUmum(formData),
      kategori_id,
      folder_link: text(formData, "folder_link"),
      awal_kontrak: awal,
      awal_kontrak_aktif: awal,
      akhir_kontrak: akhir,
      status: "aktif",
    })
    .select("id, np")
    .single();
  if (error || !karyawan) redirect(dengan("/karyawan/new", "error", pesanGalat(error ?? { message: "Gagal menyimpan." })));

  // Monitoring dan data diri dibuat otomatis oleh trigger database
  const { error: kontrakError } = await supabase.from("kontrak").insert({
    karyawan_id: karyawan.id,
    kontrak_ke: "Kontrak 1",
    np: karyawan.np,
    awal_kontrak: awal,
    akhir_kontrak: akhir,
    status: akhir < hariIni() ? "selesai" : "aktif",
  });
  if (kontrakError) redirect(dengan("/karyawan", "error", `Karyawan tersimpan, tetapi kontrak gagal dibuat: ${pesanGalat(kontrakError)}`));

  revalidatePath("/karyawan");
  redirect(dengan("/karyawan", "ok", "Data karyawan berhasil ditambahkan"));
}

export async function updateKaryawan(id: number, formData: FormData) {
  const supabase = await createClient();
  const kategori_id = await kategoriDipilih(formData);
  const payload = { ...kolomUmum(formData), ...(kategori_id ? { kategori_id } : {}), folder_link: text(formData, "folder_link") };
  if (!payload.np || !payload.nama) redirect(dengan(`/karyawan/${id}/edit`, "error", "NP dan nama wajib diisi."));

  const { error } = await supabase.from("karyawan").update(payload).eq("id", id);
  if (error) redirect(dengan(`/karyawan/${id}/edit`, "error", pesanGalat(error)));

  // NP pada riwayat kontrak ikut berubah
  await supabase.from("kontrak").update({ np: payload.np }).eq("karyawan_id", id);
  revalidatePath("/karyawan");
  redirect(dengan("/karyawan", "ok", "Data karyawan berhasil diupdate"));
}

export async function deleteKaryawan(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = await createClient();
  const { error } = await supabase.from("karyawan").delete().eq("id", id);
  revalidatePath("/karyawan");
  revalidatePath("/terminate");
  redirect(error ? dengan("/karyawan", "error", pesanGalat(error)) : dengan("/karyawan", "ok", "Data karyawan berhasil dihapus"));
}

export async function bulkDeleteKaryawan(formData: FormData) {
  const ids = formData.getAll("ids").map(Number).filter(Boolean);
  if (ids.length === 0) redirect(dengan("/karyawan", "error", "Tidak ada data yang dipilih"));
  const supabase = await createClient();
  const { data, error } = await supabase.from("karyawan").delete().in("id", ids).select("id");
  revalidatePath("/karyawan");
  redirect(
    error || !data?.length
      ? dengan("/karyawan", "error", "Tidak ada data yang bisa dihapus atau Anda tidak memiliki akses")
      : dengan("/karyawan", "ok", `Berhasil menghapus ${data.length} data karyawan`),
  );
}

export async function terminateKaryawan(id: number, formData: FormData) {
  const tanggal = text(formData, "tanggal_keluar");
  const alasan = text(formData, "alasan_keluar");
  if (!tanggal || !alasan) redirect(dengan(`/karyawan/${id}/terminate`, "error", "Tanggal keluar dan alasan wajib diisi."));

  const supabase = await createClient();
  const { error } = await supabase
    .from("karyawan")
    .update({ status: "terminate", tanggal_keluar: tanggal, alasan_keluar: alasan })
    .eq("id", id);
  if (error) redirect(dengan(`/karyawan/${id}/terminate`, "error", pesanGalat(error)));

  await supabase.from("kontrak").update({ status: "terminate" }).eq("karyawan_id", id);
  revalidatePath("/karyawan");
  revalidatePath("/terminate");
  redirect(dengan("/terminate", "ok", "Karyawan berhasil di-terminate"));
}
