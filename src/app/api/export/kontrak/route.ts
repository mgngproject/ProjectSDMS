import { getProfile } from "@/lib/auth";
import { excelResponse } from "@/lib/export";
import { cocokDasar, paramDariUrl } from "@/lib/filter";
import type { Karyawan, Kontrak } from "@/lib/types";

type Baris = Karyawan & { kontrak: Kontrak[] };

/**
 * Export riwayat kontrak (hanya Super Admin): satu baris per kontrak, mengikuti filter di halaman Riwayat Kontrak.
 * Kolom awal sama dengan template Laporan Perpanjangan sehingga file bisa diedit lalu diimport kembali.
 */
export async function GET(request: Request) {
  const profile = await getProfile();
  if (profile.role !== "superadmin") return new Response("Hanya Super Admin.", { status: 403 });
  const p = paramDariUrl(request.url);

  return excelResponse("RiwayatKontrak", async (supabase) => {
    await supabase.rpc("expire_kontrak");
    const { data } = await supabase
      .from("karyawan")
      .select("*, kategori:kategori_id(nama), kontrak(*)")
      .eq("status", "aktif")
      .order("nama");
    return ((data ?? []) as unknown as Baris[])
      .filter((k) => cocokDasar(k, p, { kategoriBerlaku: true, jenisBawaan: "habis" }))
      .flatMap((k) =>
        [...k.kontrak]
          .sort((a, b) => (a.awal_kontrak ?? "").localeCompare(b.awal_kontrak ?? ""))
          .map((c) => ({
            NP: k.np,
            Nama: k.nama,
            "Kontrak Ke": c.kontrak_ke,
            "Awal Kontrak": c.awal_kontrak,
            "Akhir Kontrak": c.akhir_kontrak,
            Penilaian: c.penilaian,
            Folder: c.folder_link,
            Status: c.status === "aktif" ? "Aktif" : c.status === "selesai" ? "Selesai" : c.status,
            Kategori: k.kategori?.nama ?? "",
            "Unit Kerja": k.unit_kerja,
          })),
      );
  });
}
