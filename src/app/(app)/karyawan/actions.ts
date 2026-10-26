"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const text = (f: FormData, k: string) => {
  const v = String(f.get(k) ?? "").trim();
  return v === "" ? null : v;
};

async function karyawanPayload(f: FormData) {
  const profile = await getProfile();
  const gross = text(f, "gross_per_month");
  return {
    np: text(f, "np"),
    nama: text(f, "nama"),
    // Admin selalu terkunci ke kategorinya; hanya superadmin yang boleh memilih
    kategori_id: profile.role === "superadmin" ? Number(f.get("kategori_id")) : profile.kategori_id,
    kode_bagan: text(f, "kode_bagan"),
    unit_kerja: text(f, "unit_kerja"),
    jabatan: text(f, "jabatan"),
    level: text(f, "level"),
    role: text(f, "role"),
    benefit_kesehatan: text(f, "benefit_kesehatan"),
    faskes: text(f, "faskes"),
    gross_per_month: gross ? Number(gross) : null,
    kpi: text(f, "kpi"),
    folder_link: text(f, "folder_link"),
    awal_kontrak: text(f, "awal_kontrak"),
    awal_kontrak_aktif: text(f, "awal_kontrak_aktif"),
    akhir_kontrak: text(f, "akhir_kontrak"),
  };
}

export async function createKaryawan(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("karyawan").insert(await karyawanPayload(formData));
  if (error) redirect(`/karyawan/new?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/karyawan");
  redirect("/karyawan");
}

export async function updateKaryawan(id: number, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("karyawan").update(await karyawanPayload(formData)).eq("id", id);
  if (error) redirect(`/karyawan/${id}/edit?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/karyawan");
  redirect("/karyawan");
}

export async function deleteKaryawan(id: number) {
  const supabase = await createClient();
  await supabase.from("karyawan").delete().eq("id", id);
  revalidatePath("/karyawan");
}

export async function terminateKaryawan(id: number, formData: FormData) {
  const supabase = await createClient();
  await supabase
    .from("karyawan")
    .update({ status: "terminate", tanggal_keluar: text(formData, "tanggal_keluar"), alasan_keluar: text(formData, "alasan_keluar") })
    .eq("id", id);
  revalidatePath("/karyawan");
  revalidatePath("/terminate");
  redirect("/terminate");
}

export async function addKontrak(karyawanId: number, formData: FormData) {
  const supabase = await createClient();
  const awal = text(formData, "awal_kontrak");
  const akhir = text(formData, "akhir_kontrak");

  // Kontrak sebelumnya otomatis selesai; kontrak baru menjadi kontrak aktif
  await supabase.from("kontrak").update({ status: "selesai" }).eq("karyawan_id", karyawanId).eq("status", "aktif");
  const { error } = await supabase.from("kontrak").insert({
    karyawan_id: karyawanId,
    kontrak_ke: text(formData, "kontrak_ke"),
    np: text(formData, "np"),
    awal_kontrak: awal,
    akhir_kontrak: akhir,
    penilaian: text(formData, "penilaian"),
    folder_link: text(formData, "folder_link"),
    status: "aktif",
  });
  if (error) redirect(`/karyawan/${karyawanId}/kontrak?error=${encodeURIComponent(error.message)}`);

  await supabase.from("karyawan").update({ awal_kontrak_aktif: awal, akhir_kontrak: akhir }).eq("id", karyawanId);
  revalidatePath(`/karyawan/${karyawanId}/kontrak`);
  revalidatePath("/karyawan");
}

export async function saveDataDiri(karyawanId: number, formData: FormData) {
  const supabase = await createClient();
  const fields = [
    "ktp", "tempat_lahir", "tanggal_lahir", "alamat", "rt", "rw", "kelurahan", "kecamatan", "kabupaten", "provinsi",
    "jenjang_1", "jurusan_1", "kampus_1", "jenjang_2", "jurusan_2", "kampus_2",
  ];
  const payload = Object.fromEntries(fields.map((k) => [k, text(formData, k)]));
  const { error } = await supabase.from("data_diri").upsert({ karyawan_id: karyawanId, ...payload }, { onConflict: "karyawan_id" });
  if (error) redirect(`/karyawan/${karyawanId}/datadiri?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/karyawan/${karyawanId}/datadiri`);
  redirect(`/karyawan/${karyawanId}/datadiri?saved=1`);
}

export async function toggleMonitoring(karyawanId: number, field: string, value: boolean) {
  const allowed = [
    "nde_konfirmasi", "nde_jawaban", "nde_laporan", "offering_letter", "izin_prinsip_nde", "izin_prinsip_manual",
    "nde_penyampaian_unit_kerja", "nde_penyampaian_sdmo", "upload_ess", "data_diri",
  ];
  if (!allowed.includes(field)) return;
  const supabase = await createClient();
  await supabase.from("monitoring").update({ [field]: value }).eq("karyawan_id", karyawanId);

  const { data } = await supabase.from("monitoring").select(allowed.join(",")).eq("karyawan_id", karyawanId).single();
  if (data) {
    const lengkap = Object.values(data as unknown as Record<string, boolean>).every(Boolean);
    await supabase.from("monitoring").update({ status: lengkap ? "Selesai" : "Belum Selesai" }).eq("karyawan_id", karyawanId);
  }
  revalidatePath("/monitoring");
}
