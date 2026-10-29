"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { bacaBagan, cariBagan, normKode } from "@/lib/bagan";
import { ambilBagan } from "@/lib/bagan-data";
import { BATAS_BARIS, BATAS_BYTE, bacaWorkbook, type Baris } from "@/lib/impor";
import { dengan, pesanGalat, text } from "@/lib/params";
import { createClient } from "@/lib/supabase/server";

/** Daftar bagan hanya diubah Super Admin (RLS juga menegakkannya). */
async function pastikanSuperAdmin() {
  const profile = await getProfile();
  if (profile.role !== "superadmin") redirect(dengan("/bagan", "error", "Hanya Super Admin yang dapat mengubah daftar bagan."));
}

const selesai = (kunci: "ok" | "error", pesan: string): never => {
  revalidatePath("/bagan");
  return redirect(dengan("/bagan", kunci, pesan.slice(0, 900)));
};

/** Kode dipakai sebagai pola ilike; karakter khusus pola dilepas agar dicocokkan apa adanya. */
const pola = (kode: string) => kode.replace(/[\\%_]/g, "\\$&");

type Klien = Awaited<ReturnType<typeof createClient>>;

/** Menyamakan Unit Kerja semua karyawan yang memakai kode itu dengan nama unit di daftar. */
async function samakanUnit(supabase: Klien, kode: string, nama: string) {
  await supabase.from("karyawan").update({ unit_kerja: nama }).ilike("kode_bagan", pola(kode));
}

export async function tambahBagan(formData: FormData) {
  await pastikanSuperAdmin();
  const kode = normKode(text(formData, "kode"));
  const nama = text(formData, "nama_unit");
  const induk = normKode(text(formData, "induk_kode"));
  if (!kode) selesai("error", "Kode wajib diisi.");
  if (!nama) selesai("error", "Nama unit wajib diisi.");
  const supabase = await createClient();
  if (induk && !cariBagan(await ambilBagan(supabase), induk)) selesai("error", `Kode atasan ${induk} tidak ada di daftar.`);
  const { error } = await supabase.from("bagan").insert({ kode, nama_unit: nama, induk_kode: induk || null });
  if (error) selesai("error", error.code === "23505" ? `Kode ${kode} sudah ada.` : pesanGalat(error));
  await samakanUnit(supabase, kode, nama!);
  selesai("ok", `Kode ${kode} ditambahkan`);
}

// Nomor disematkan lewat bind(): nama dan nilai tombol tidak ikut terkirim bersama aksi server
export async function ubahBagan(id: number, formData: FormData) {
  await pastikanSuperAdmin();
  const nama = text(formData, "nama_unit");
  const induk = normKode(text(formData, "induk_kode"));
  if (!nama) selesai("error", "Nama unit wajib diisi.");
  const supabase = await createClient();
  const daftar = await ambilBagan(supabase);
  const bagan = daftar.find((b) => b.id === id);
  if (!bagan) return selesai("error", "Kode tidak ditemukan.");
  if (induk === bagan.kode) selesai("error", "Atasan tidak boleh kode itu sendiri.");
  if (induk && !cariBagan(daftar, induk)) selesai("error", `Kode atasan ${induk} tidak ada di daftar.`);
  const { error } = await supabase.from("bagan").update({ nama_unit: nama, induk_kode: induk || null }).eq("id", id);
  if (error) selesai("error", pesanGalat(error));
  await samakanUnit(supabase, bagan.kode, nama!);
  selesai("ok", `Kode ${bagan.kode} disimpan. Unit kerja karyawan ikut disamakan.`);
}

export async function ubahStatusBagan(id: number, aktif: boolean, _formData: FormData) {
  await pastikanSuperAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("bagan").update({ aktif }).eq("id", id);
  if (error) selesai("error", pesanGalat(error));
  selesai("ok", aktif ? "Kode diaktifkan" : "Kode dinonaktifkan. Karyawan yang masih memakainya muncul di daftar perlu dibereskan.");
}

export async function hapusBagan(id: number, _formData: FormData) {
  await pastikanSuperAdmin();
  const supabase = await createClient();
  const { data: bagan } = await supabase.from("bagan").select("kode").eq("id", id).maybeSingle();
  if (!bagan) return selesai("error", "Kode tidak ditemukan.");
  const { count } = await supabase.from("karyawan").select("id", { count: "exact", head: true }).ilike("kode_bagan", pola(bagan.kode));
  if (count) selesai("error", `Kode ${bagan.kode} masih dipakai ${count} karyawan. Nonaktifkan saja, atau pindahkan karyawannya dulu.`);
  const { error } = await supabase.from("bagan").delete().eq("id", id);
  if (error) selesai("error", pesanGalat(error));
  selesai("ok", `Kode ${bagan.kode} dihapus`);
}

/** Menyamakan Unit Kerja semua karyawan dengan nama unit di daftar, untuk kode yang cocok. */
export async function samakanSemuaUnit(_formData: FormData) {
  await pastikanSuperAdmin();
  const supabase = await createClient();
  const daftar = await ambilBagan(supabase);
  for (const b of daftar) await samakanUnit(supabase, b.kode, b.nama_unit);
  selesai("ok", `Unit kerja karyawan disamakan dengan daftar untuk ${daftar.length} kode.`);
}

export async function importBagan(formData: FormData) {
  await pastikanSuperAdmin();
  const berkas = formData.get("file");
  if (!(berkas instanceof File) || berkas.size === 0) selesai("error", "Pilih file Excel terlebih dahulu.");
  const file = berkas as File;
  if (!/\.(xlsx|xls|csv)$/i.test(file.name)) selesai("error", "Format file harus .xlsx, .xls, atau .csv.");
  if (file.size > BATAS_BYTE) selesai("error", "Ukuran file maksimal 3 MB.");

  let sheets: Record<string, Baris[]>;
  try {
    sheets = bacaWorkbook(await file.arrayBuffer());
  } catch {
    return selesai("error", "File tidak dapat dibaca. Pastikan file Excel atau CSV yang valid.");
  }
  const rows = sheets.kode_bagan ?? sheets.bagan ?? Object.values(sheets)[0] ?? [];
  if (rows.length === 0) selesai("error", "File tidak berisi data.");
  if (rows.length > BATAS_BARIS * 5) selesai("error", `Terlalu banyak baris (maksimal ${BATAS_BARIS * 5}).`);

  const ganti = formData.get("ganti") === "1";
  const { data, galat } = bacaBagan(rows);
  // Mengganti seluruh daftar menghapus kode yang tidak ada di file; file yang sebagian barisnya bermasalah tidak boleh dipakai untuk itu
  if (ganti && galat.length > 0) selesai("error", `Daftar tidak diganti karena ada baris bermasalah. Perbaiki dulu: ${galat.slice(0, 5).join("; ")}${galat.length > 5 ? "; ..." : ""}`);
  if (data.length === 0) selesai("error", `Tidak ada baris yang bisa dibaca. Judul kolom yang dikenali: Kode, Nama Unit, Atasan. ${galat.slice(0, 5).join("; ")}`);

  const supabase = await createClient();
  const ada = new Map((await ambilBagan(supabase)).map((b) => [b.kode, b]));
  const baru = data.filter((d) => !ada.has(d.kode));
  const berubah = data.filter((d) => {
    const lama = ada.get(d.kode);
    return lama && (lama.nama_unit !== d.nama_unit || (lama.induk_kode ?? null) !== d.induk_kode);
  });

  for (let i = 0; i < data.length; i += 200) {
    // Saat mengganti seluruh daftar, semua kode di file juga diaktifkan kembali
    const { error } = await supabase
      .from("bagan")
      .upsert(data.slice(i, i + 200).map(({ kode, nama_unit, induk_kode }) => ({ kode, nama_unit, induk_kode, ...(ganti ? { aktif: true } : {}) })), { onConflict: "kode" });
    if (error) selesai("error", `Gagal menyimpan: ${pesanGalat(error)}`);
  }
  for (const d of [...baru, ...berubah]) await samakanUnit(supabase, d.kode, d.nama_unit);

  let dihapus = 0;
  if (ganti) {
    const dalamFile = new Set(data.map((d) => d.kode));
    const lama = [...ada.keys()].filter((k) => !dalamFile.has(k));
    for (let i = 0; i < lama.length; i += 200) {
      const { error } = await supabase.from("bagan").delete().in("kode", lama.slice(i, i + 200));
      if (error) selesai("error", `Kode baru sudah disimpan, tetapi kode lama gagal dihapus: ${pesanGalat(error)}`);
    }
    dihapus = lama.length;
  }

  const catatan = galat.length ? ` ${galat.length} baris dilewati: ${galat.slice(0, 5).join("; ")}${galat.length > 5 ? "; ..." : ""}` : "";
  selesai(galat.length ? "error" : "ok", `${baru.length} kode baru, ${berubah.length} diperbarui, ${data.length - baru.length - berubah.length} tidak berubah${ganti ? `, ${dihapus} kode lama dihapus` : ""}.${ganti && dihapus ? " Karyawan yang masih memakai kode lama muncul di Perlu dibereskan." : ""}${catatan}`);
}
