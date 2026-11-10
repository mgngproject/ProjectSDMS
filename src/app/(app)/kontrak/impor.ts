"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { hariIni } from "@/lib/format";
import { BATAS_BARIS, BATAS_BYTE, bacaPerpanjangan, bacaWorkbook, type Baris, type PerpanjanganImpor } from "@/lib/impor";
import { catatan } from "@/lib/catatan-impor";
import { simpanCatatan } from "@/lib/catatan-impor-cookie";
import { dengan, pesanGalat } from "@/lib/params";
import { createClient } from "@/lib/supabase/server";

const POTONGAN = 200;
const potong = <T,>(daftar: T[], n = POTONGAN): T[][] =>
  Array.from({ length: Math.ceil(daftar.length / n) }, (_, i) => daftar.slice(i * n, (i + 1) * n));

type KontrakLama = { karyawan_id: number; awal_kontrak: string | null; status: string };

/**
 * Import laporan perpanjangan (hanya Super Admin): setiap baris menambah satu kontrak baru
 * ke riwayat karyawan dengan NP tersebut. Riwayat lama tidak dihapus; baris dengan awal kontrak
 * yang sudah ada di riwayat dilewati sehingga file yang sama aman diimport ulang.
 */
export async function importPerpanjangan(formData: FormData) {
  const kembali = (kunci: "ok" | "error", pesan: string, idCatatan: string | null = null): never =>
    redirect(dengan("/kontrak", kunci, pesan.slice(0, 900)) + (idCatatan ? `&impor=${idCatatan}#laporan-impor` : ""));
  const profile = await getProfile();
  if (profile.role !== "superadmin") kembali("error", "Hanya Super Admin yang dapat mengimport laporan perpanjangan.");

  const berkas = formData.get("file");
  if (!(berkas instanceof File) || berkas.size === 0) kembali("error", "Pilih file laporan perpanjangan terlebih dahulu.");
  const file = berkas as File;
  if (!/\.(xlsx|xls|csv)$/i.test(file.name)) kembali("error", "Format file harus .xlsx, .xls, atau .csv.");
  if (file.size > BATAS_BYTE) kembali("error", "Ukuran file maksimal 3 MB.");

  let sheets: Record<string, Baris[]>;
  try {
    sheets = bacaWorkbook(await file.arrayBuffer());
  } catch {
    return kembali("error", "File tidak dapat dibaca. Pastikan file Excel atau CSV yang valid.");
  }
  // Sheet bernama "Perpanjangan" dipakai bila ada; selain itu sheet pertama
  const rows = sheets.perpanjangan ?? sheets.laporan_perpanjangan ?? Object.values(sheets)[0] ?? [];
  if (rows.length === 0) kembali("error", "File tidak berisi data.");
  if (rows.length > BATAS_BARIS) kembali("error", `Terlalu banyak baris (maksimal ${BATAS_BARIS}).`);

  const { data: dibaca, galat } = bacaPerpanjangan(rows);
  if (dibaca.length === 0) kembali("error", "Tidak ada baris yang bisa diimport. Lihat tabel Rincian kesalahan import di bawah.", await simpanCatatan(galat));

  const supabase = await createClient();
  const daftarNp = [...new Set(dibaca.map((d) => d.np))];

  // Karyawan dan riwayat kontraknya
  const karyawan = new Map<string, { id: number; status: string }>();
  for (const bagian of potong(daftarNp)) {
    const { data } = await supabase.from("karyawan").select("id, np, status").in("np", bagian);
    for (const k of data ?? []) karyawan.set(k.np, { id: k.id, status: k.status });
  }
  // NP yang belum cocok dicari lagi tanpa membedakan huruf besar-kecil dan spasi di ujung
  for (const np of daftarNp.filter((n) => !karyawan.has(n)).slice(0, 100)) {
    const { data } = await supabase.from("karyawan").select("id, np, status").ilike("np", np.replace(/[%_\\]/g, "\\$&")).limit(1);
    if (data?.[0]) karyawan.set(np, { id: data[0].id, status: data[0].status });
  }
  const riwayat = new Map<number, KontrakLama[]>();
  for (const bagian of potong([...karyawan.values()].map((k) => k.id))) {
    const { data } = await supabase.from("kontrak").select("karyawan_id, awal_kontrak, status").in("karyawan_id", bagian);
    for (const k of (data ?? []) as KontrakLama[]) riwayat.set(k.karyawan_id, [...(riwayat.get(k.karyawan_id) ?? []), k]);
  }

  const hari = hariIni();
  const baru: (Omit<PerpanjanganImpor, "baris" | "kontrak_ke"> & { karyawan_id: number; kontrak_ke: string; status: string })[] = [];
  const tutupLama: number[] = [];
  let dilewati = 0;

  // Kelompokkan per NP, urut dari kontrak paling awal
  const perNp = new Map<string, PerpanjanganImpor[]>();
  for (const d of dibaca) perNp.set(d.np, [...(perNp.get(d.np) ?? []), d]);

  for (const [np, daftar] of perNp) {
    const k = karyawan.get(np);
    if (!k) {
      for (const d of daftar) galat.push(catatan("Perpanjangan", "dilewati", "NP tidak ditemukan di Data Karyawan (tambahkan karyawannya dulu)", { baris: d.baris, np, kolom: "NP", nilai: np }));
      dilewati += daftar.length;
      continue;
    }
    if (k.status !== "aktif") {
      for (const d of daftar) galat.push(catatan("Perpanjangan", "dilewati", "Karyawan sudah terminate, kontrak tidak bisa diperpanjang", { baris: d.baris, np, kolom: "NP", nilai: np }));
      dilewati += daftar.length;
      continue;
    }

    const lama = riwayat.get(k.id) ?? [];
    const awalLama = new Set(lama.map((x) => x.awal_kontrak));
    const urut = [...daftar].sort((a, b) => a.awal_kontrak.localeCompare(b.awal_kontrak));
    const dipakai = urut.filter((d) => {
      if (awalLama.has(d.awal_kontrak)) { galat.push(catatan("Perpanjangan", "dilewati", "Kontrak dengan Awal Kontrak ini sudah ada di riwayat (atau ganda di file)", { baris: d.baris, np, kolom: "Awal Kontrak", nilai: d.awal_kontrak })); dilewati++; return false; }
      awalLama.add(d.awal_kontrak);
      return true;
    });
    if (dipakai.length === 0) continue;

    // Kontrak terbaru (lama maupun baru) yang belum berakhir menjadi satu-satunya kontrak aktif
    const awalTerbaruLama = lama.reduce((m, x) => (x.awal_kontrak && x.awal_kontrak > m ? x.awal_kontrak : m), "");
    const terakhir = dipakai[dipakai.length - 1];
    const baruPalingAkhir = terakhir.awal_kontrak > awalTerbaruLama;
    if (baruPalingAkhir && lama.some((x) => x.status === "aktif")) tutupLama.push(k.id);

    dipakai.forEach((d, i) => {
      baru.push({
        karyawan_id: k.id,
        np,
        kontrak_ke: d.kontrak_ke ?? `Kontrak ${lama.length + i + 1}`,
        awal_kontrak: d.awal_kontrak,
        akhir_kontrak: d.akhir_kontrak,
        penilaian: d.penilaian,
        folder_link: d.folder_link,
        status: baruPalingAkhir && d === terakhir && d.akhir_kontrak >= hari ? "aktif" : "selesai",
      });
    });
  }

  for (const bagian of potong(tutupLama)) {
    const { error } = await supabase.from("kontrak").update({ status: "selesai" }).in("karyawan_id", bagian).eq("status", "aktif");
    if (error) return kembali("error", `Import dihentikan: ${pesanGalat(error)}`);
  }

  let masuk = 0;
  const disentuh = new Set<number>();
  for (const bagian of potong(baru)) {
    const { error } = await supabase.from("kontrak").insert(bagian);
    if (error) { galat.push(catatan("Perpanjangan", "gagal", `Simpan kontrak: ${pesanGalat(error)}`)); continue; }
    masuk += bagian.length;
    bagian.forEach((b) => disentuh.add(b.karyawan_id));
  }

  // Samakan awal/akhir kontrak di data karyawan dengan riwayat yang baru
  for (const bagian of potong([...disentuh])) await supabase.rpc("sync_kontrak_semua", { ids: bagian });

  revalidatePath("/kontrak");
  revalidatePath("/karyawan");
  revalidatePath("/dashboard");

  const idCatatan = await simpanCatatan(galat);
  const keterangan = galat.length ? ` Ada ${galat.length} catatan kesalahan: lihat tabel Rincian kesalahan import di bawah untuk baris dan kolomnya.` : "";
  if (masuk === 0) return kembali("error", `Tidak ada kontrak yang ditambahkan.${keterangan}`, idCatatan);
  return kembali("ok", `Import laporan perpanjangan selesai: ${masuk} kontrak ditambahkan untuk ${disentuh.size} karyawan${dilewati ? `, ${dilewati} baris dilewati` : ""}.${keterangan}`, idCatatan);
}
