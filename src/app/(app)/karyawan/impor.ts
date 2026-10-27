"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { hariIni } from "@/lib/format";
import {
  BATAS_BARIS, BATAS_BYTE, bacaDataDiri, bacaKaryawan, bacaSheetKontrak, bacaTerminate, bacaWorkbook,
  type Baris, type Kontrak,
} from "@/lib/impor";
import { configKategori } from "@/lib/kategori-config";
import { dengan, pesanGalat } from "@/lib/params";
import { createClient } from "@/lib/supabase/server";

const UKURAN_POTONGAN = 200;
const potong = <T,>(daftar: T[], n = UKURAN_POTONGAN): T[][] =>
  Array.from({ length: Math.ceil(daftar.length / n) }, (_, i) => daftar.slice(i * n, (i + 1) * n));

type Klien = Awaited<ReturnType<typeof createClient>>;

/** Status kontrak hasil import: hanya kontrak terbaru yang belum berakhir yang aktif. */
function statusKontrak(daftar: Kontrak[]) {
  const hari = hariIni();
  const urut = [...daftar].sort((a, b) => a.awal_kontrak.localeCompare(b.awal_kontrak));
  return urut.map((k, i) => ({ ...k, status: i === urut.length - 1 && k.akhir_kontrak >= hari ? "aktif" : "selesai" }));
}

async function petaNpKeId(supabase: Klien, daftarNp: string[]): Promise<Map<string, number>> {
  const peta = new Map<string, number>();
  for (const bagian of potong(daftarNp)) {
    const { data } = await supabase.from("karyawan").select("id, np").in("np", bagian);
    for (const r of data ?? []) peta.set(r.np, r.id);
  }
  return peta;
}

export async function importExcel(formData: FormData) {
  const profile = await getProfile();
  const berkas = formData.get("file");
  const kembali = (kunci: "ok" | "error", pesan: string): never => redirect(dengan("/karyawan", kunci, pesan.slice(0, 900)));

  if (!(berkas instanceof File) || berkas.size === 0) kembali("error", "Pilih file Excel terlebih dahulu.");
  const file = berkas as File;
  if (!/\.(xlsx|xls|csv)$/i.test(file.name)) kembali("error", "Format file harus .xlsx, .xls, atau .csv.");
  if (file.size > BATAS_BYTE) kembali("error", "Ukuran file maksimal 3 MB.");

  const supabase = await createClient();
  const kategoriId = profile.role === "superadmin" ? Number(formData.get("kategori_id")) || null : profile.kategori_id;
  if (!kategoriId) kembali("error", "Pilih kategori untuk data yang diimport.");
  const { data: kat } = await supabase.from("kategori").select("nama").eq("id", kategoriId!).maybeSingle();
  const config = configKategori(kat?.nama);

  let sheets: Record<string, Baris[]>;
  try {
    sheets = bacaWorkbook(await file.arrayBuffer());
  } catch {
    return kembali("error", "File tidak dapat dibaca. Pastikan file Excel atau CSV yang valid.");
  }
  const dikenal = ["database", "mail_merge", "terminate", "kontrak"];
  const adaDikenal = dikenal.some((n) => sheets[n]);
  const sheetDatabase = sheets.database ?? (adaDikenal ? [] : Object.values(sheets)[0] ?? []);
  const total = sheetDatabase.length + (sheets.terminate?.length ?? 0) + (sheets.mail_merge?.length ?? 0) + (sheets.kontrak?.length ?? 0);
  if (total === 0) kembali("error", "File tidak berisi data.");
  if (total > BATAS_BARIS * 2) kembali("error", `Terlalu banyak baris (maksimal ${BATAS_BARIS} per sheet).`);

  const galat: string[] = [];
  const hitung = { karyawan: 0, kontrak: 0, terminate: 0, dataDiri: 0 };
  const hari = hariIni();

  // 1. Sheet Database: karyawan, kolom khusus kategori, dan kontrak
  const kar = bacaKaryawan(sheetDatabase, config);
  galat.push(...kar.galat);
  const idDisentuh = new Set<number>();

  if (kar.data.length > 0) {
    const dasar = (k: (typeof kar.data)[number]) => ({
      np: k.np, nama: k.nama, kategori_id: kategoriId, kode_bagan: k.kode_bagan, unit_kerja: k.unit_kerja, jabatan: k.jabatan,
      level: k.level, role: k.role, benefit_kesehatan: k.benefit_kesehatan, faskes: k.faskes, gross_per_month: k.gross_per_month, kpi: k.kpi,
    });
    // Tanggal kontrak hanya ikut diperbarui bila file memuatnya; kelompok dipisah agar kolom tanggal tidak tertimpa kosong
    const denganKontrak = kar.data.filter((k) => k.kontrak.length > 0);
    const tanpaKontrak = kar.data.filter((k) => k.kontrak.length === 0);
    const idPerNp = new Map<string, number>();

    for (const [kelompok, tambah] of [
      [denganKontrak, (k: (typeof kar.data)[number]) => ({ awal_kontrak: k.awal_kontrak, awal_kontrak_aktif: k.awal_kontrak_aktif, akhir_kontrak: k.akhir_kontrak })],
      [tanpaKontrak, () => ({})],
    ] as const) {
      for (const bagian of potong(kelompok)) {
        const { data, error } = await supabase
          .from("karyawan")
          .upsert(bagian.map((k) => ({ ...dasar(k), ...tambah(k) })), { onConflict: "np" })
          .select("id, np");
        if (error) return kembali("error", `Import dihentikan: ${pesanGalat(error)} (mungkin ada NP yang sudah dipakai kategori lain).`);
        for (const r of data ?? []) { idPerNp.set(r.np, r.id); idDisentuh.add(r.id); }
      }
    }
    hitung.karyawan = idPerNp.size;

    if (config) {
      const baris = kar.data.filter((k) => idPerNp.has(k.np)).map((k) => ({ karyawan_id: idPerNp.get(k.np)!, ...k.detail }));
      for (const bagian of potong(baris)) {
        const { error } = await supabase.from(config.tabel).upsert(bagian, { onConflict: "karyawan_id" });
        if (error) galat.push(`Kolom ${kat?.nama}: ${pesanGalat(error)}`);
      }
    }

    // Kontrak dari sheet Database hanya untuk karyawan yang belum punya riwayat; sheet Kontrak (bila ada) menggantikan semuanya
    const adaSheetKontrak = !!sheets.kontrak;
    const sudahAda = new Set<number>();
    for (const bagian of potong([...idPerNp.values()])) {
      const { data } = await supabase.from("kontrak").select("karyawan_id").in("karyawan_id", bagian);
      for (const r of data ?? []) sudahAda.add(r.karyawan_id);
    }
    const kontrakBaru = kar.data.flatMap((k) => {
      const id = idPerNp.get(k.np);
      if (!id || k.kontrak.length === 0 || sudahAda.has(id) || adaSheetKontrak) return [];
      return statusKontrak(k.kontrak).map((c) => ({ karyawan_id: id, np: k.np, ...c }));
    });
    for (const bagian of potong(kontrakBaru)) {
      const { error } = await supabase.from("kontrak").insert(bagian);
      if (error) galat.push(`Kontrak: ${pesanGalat(error)}`);
      else hitung.kontrak += bagian.length;
    }
  }

  // 2. Sheet Terminate: lewati karyawan yang masih aktif (sama seperti Laravel)
  if (sheets.terminate) {
    const t = bacaTerminate(sheets.terminate);
    galat.push(...t.galat);
    const ada = new Map<string, string>();
    for (const bagian of potong(t.data.map((x) => x.np))) {
      const { data } = await supabase.from("karyawan").select("np, status").in("np", bagian);
      for (const r of data ?? []) ada.set(r.np, r.status);
    }
    const siap = t.data.filter((x) => {
      if (ada.get(x.np) === "aktif") { galat.push(`Terminate baris ${x.baris}: ${x.np} masih aktif, dilewati`); return false; }
      if (!ada.has(x.np) && !x.nama) { galat.push(`Terminate baris ${x.baris}: nama kosong untuk NP baru`); return false; }
      return true;
    });
    for (const bagian of potong(siap)) {
      const { data, error } = await supabase
        .from("karyawan")
        .upsert(bagian.map(({ baris, ...x }) => ({ ...x, kategori_id: kategoriId, status: "terminate" })), { onConflict: "np" })
        .select("id");
      if (error) { galat.push(`Terminate: ${pesanGalat(error)}`); continue; }
      const ids = (data ?? []).map((r) => r.id);
      await supabase.from("kontrak").update({ status: "terminate" }).in("karyawan_id", ids);
      hitung.terminate += ids.length;
    }
  }

  // 3. Sheet Kontrak: menggantikan riwayat kontrak karyawan yang tercantum
  if (sheets.kontrak) {
    const daftar = bacaSheetKontrak(sheets.kontrak);
    const peta = await petaNpKeId(supabase, daftar.map((d) => d.np));
    const dipakai = daftar.filter((d) => peta.has(d.np) && d.kontrak.length > 0);
    for (const bagian of potong(dipakai)) {
      const ids = bagian.map((d) => peta.get(d.np)!);
      const { error: hapusError } = await supabase.from("kontrak").delete().in("karyawan_id", ids);
      if (hapusError) { galat.push(`Kontrak: ${pesanGalat(hapusError)}`); continue; }
      const baris = bagian.flatMap((d) => statusKontrak(d.kontrak).map((c) => ({ karyawan_id: peta.get(d.np)!, np: d.np, ...c })));
      const { error } = await supabase.from("kontrak").insert(baris);
      if (error) galat.push(`Kontrak: ${pesanGalat(error)}`);
      else { hitung.kontrak += baris.length; ids.forEach((id) => idDisentuh.add(id)); }
    }
    for (const d of daftar) if (!peta.has(d.np)) galat.push(`Kontrak: NP ${d.np} tidak ditemukan`);
  }

  // 4. Samakan data karyawan dengan kontrak yang baru
  for (const bagian of potong([...idDisentuh])) {
    await supabase.rpc("sync_kontrak_semua", { ids: bagian });
  }

  // 5. Sheet Mail Merge: data diri
  if (sheets.mail_merge) {
    const dd = bacaDataDiri(sheets.mail_merge);
    const peta = await petaNpKeId(supabase, dd.map((d) => d.np));
    for (const d of dd) {
      if (d.peringatan) galat.push(d.peringatan);
    }
    const baris = dd.filter((d) => peta.has(d.np)).map((d) => ({ karyawan_id: peta.get(d.np)!, ktp: d.ktp, ...d.nilai }));
    for (const d of dd) if (!peta.has(d.np)) galat.push(`Data diri: NP ${d.np} tidak ditemukan`);
    for (const bagian of potong(baris)) {
      const { error } = await supabase.from("data_diri").upsert(bagian, { onConflict: "karyawan_id" });
      if (!error) { hitung.dataDiri += bagian.length; continue; }
      // Satu KTP ganda menggagalkan satu potongan; ulangi per baris agar baris lain tetap masuk
      for (const satu of bagian) {
        const { error: e } = await supabase.from("data_diri").upsert(satu, { onConflict: "karyawan_id" });
        if (e) galat.push(`Data diri karyawan ${satu.karyawan_id}: ${pesanGalat(e)}`);
        else hitung.dataDiri++;
      }
    }
  }

  revalidatePath("/karyawan");
  revalidatePath("/terminate");
  revalidatePath("/datadiri");
  revalidatePath("/kontrak");

  const ringkas = `Import selesai: ${hitung.karyawan} karyawan, ${hitung.kontrak} kontrak, ${hitung.terminate} terminate, ${hitung.dataDiri} data diri.`;
  const dilewati = galat.length ? ` ${galat.length} catatan: ${galat.slice(0, 5).join("; ")}${galat.length > 5 ? "; ..." : ""}` : "";
  const sukses = hitung.karyawan + hitung.kontrak + hitung.terminate + hitung.dataDiri > 0;
  return kembali(sukses ? "ok" : "error", sukses ? ringkas + dilewati : `Tidak ada data yang diimport.${dilewati}`);
}
