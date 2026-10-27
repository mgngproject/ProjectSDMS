"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { hariIni } from "@/lib/format";
import { configKategori, periksaPilihanStandar, type KategoriConfig } from "@/lib/kategori-config";
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

/** Membaca dan memeriksa kolom khusus kategori dari form. */
function bacaDetail(config: KategoriConfig, f: FormData): { values: Record<string, string | null>; error: string | null } {
  const values: Record<string, string | null> = {};
  for (const field of config.fields) {
    const v = text(f, `detail_${field.name}`);
    if (field.required && !v) return { values, error: `${field.label} wajib diisi.` };
    if (v && field.type === "select" && !field.options?.includes(v)) return { values, error: `${field.label} tidak valid.` };
    values[field.name] = v;
  }
  const { awal_pendidikan: awal, akhir_pendidikan: akhir } = values;
  if (awal && akhir && akhir < awal) return { values, error: "Akhir pendidikan tidak boleh sebelum awal pendidikan." };
  return { values, error: null };
}

async function namaKategori(supabase: Awaited<ReturnType<typeof createClient>>, id: number | null) {
  if (!id) return null;
  const { data } = await supabase.from("kategori").select("nama").eq("id", id).maybeSingle();
  return data?.nama ?? null;
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
  const namaKat = await namaKategori(supabase, kategori_id);
  const config = configKategori(namaKat);
  const detail = config ? bacaDetail(config, formData) : null;
  if (detail?.error) redirect(dengan("/karyawan/new", "error", detail.error));
  const salahPilihan = periksaPilihanStandar(namaKat, { level: text(formData, "level") });
  if (salahPilihan) redirect(dengan("/karyawan/new", "error", salahPilihan));

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

  if (config && detail) {
    const { error: detailError } = await supabase.from(config.tabel).insert({ karyawan_id: karyawan.id, ...detail.values });
    if (detailError) {
      await supabase.from("karyawan").delete().eq("id", karyawan.id);
      redirect(dengan("/karyawan/new", "error", pesanGalat(detailError)));
    }
  }

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

  const namaKat = await namaKategori(supabase, kategori_id);
  const config = configKategori(namaKat);
  const detail = config ? bacaDetail(config, formData) : null;
  if (detail?.error) redirect(dengan(`/karyawan/${id}/edit`, "error", detail.error));
  const salahPilihan = periksaPilihanStandar(namaKat, { level: payload.level });
  if (salahPilihan) redirect(dengan(`/karyawan/${id}/edit`, "error", salahPilihan));

  const { error } = await supabase.from("karyawan").update(payload).eq("id", id);
  if (error) redirect(dengan(`/karyawan/${id}/edit`, "error", pesanGalat(error)));

  if (config && detail) {
    const { error: detailError } = await supabase.from(config.tabel).upsert({ karyawan_id: id, ...detail.values }, { onConflict: "karyawan_id" });
    if (detailError) redirect(dengan(`/karyawan/${id}/edit`, "error", pesanGalat(detailError)));
  }

  // NP pada riwayat kontrak ikut berubah
  await supabase.from("kontrak").update({ np: payload.np }).eq("karyawan_id", id);

  revalidatePath("/karyawan");
  redirect(dengan("/karyawan", "ok", "Data karyawan berhasil diupdate"));
}

// Nomor disematkan lewat bind(): nama dan nilai tombol tidak ikut terkirim bersama aksi server
export async function deleteKaryawan(id: number, _formData: FormData) {
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
