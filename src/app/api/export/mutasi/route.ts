import { getProfile } from "@/lib/auth";
import { excelResponse } from "@/lib/export";
import { ambilMutasi } from "@/lib/mutasi-data";

export async function GET(request: Request) {
  const superAdmin = (await getProfile()).role === "superadmin";
  const sp = new URL(request.url).searchParams;
  const f = { q: sp.get("q") ?? undefined, kategori: superAdmin ? sp.get("kategori") ?? undefined : undefined, dari: sp.get("dari") ?? undefined, sampai: sp.get("sampai") ?? undefined };
  return excelResponse("RiwayatMutasi", async (supabase) =>
    (await ambilMutasi(supabase, f)).map((m) => ({
      "Tanggal Mutasi": m.tanggal,
      NP: m.karyawan.np,
      Nama: m.karyawan.nama,
      Kategori: m.karyawan.kategori?.nama ?? "",
      "Kode Bagan Lama": m.kode_bagan_lama,
      "Unit Kerja Lama": m.unit_kerja_lama,
      "Kode Bagan Baru": m.kode_bagan_baru,
      "Unit Kerja Baru": m.unit_kerja_baru,
      Keterangan: m.keterangan,
    })),
  );
}
