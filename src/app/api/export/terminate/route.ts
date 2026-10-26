import { excelResponse } from "@/lib/export";
import { masaKerja } from "@/lib/format";
import type { Karyawan } from "@/lib/types";

export async function GET() {
  return excelResponse("DataTerminate", async (supabase) => {
    const { data } = await supabase.from("karyawan").select("*, kategori:kategori_id(nama)").eq("status", "terminate").order("nama");
    return ((data ?? []) as Karyawan[]).map((k) => ({
      NP: k.np,
      Nama: k.nama,
      Kategori: k.kategori?.nama ?? "",
      "Masa Kerja": masaKerja(k),
      "Awal Kontrak Masuk": k.awal_kontrak,
      "Akhir Kontrak": k.akhir_kontrak,
      "Kode Bagan": k.kode_bagan,
      "Unit Kerja": k.unit_kerja,
      Jabatan: k.jabatan,
      Level: k.level,
      Role: k.role,
      "Tanggal Keluar": k.tanggal_keluar,
      "Alasan Keluar": k.alasan_keluar,
    }));
  });
}
