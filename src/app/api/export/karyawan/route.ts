import { getProfile } from "@/lib/auth";
import { excelResponse } from "@/lib/export";
import { tabelKaryawan } from "@/lib/tabel";

export async function GET(request: Request) {
  const profile = await getProfile();
  const diminta = new URL(request.url).searchParams.get("kategori");
  // Admin selalu pada kategorinya; Super Admin boleh memilih satu kategori
  const namaKategori = profile.role === "superadmin" ? diminta : profile.kategori?.nama ?? null;
  return excelResponse(namaKategori ? `Data${namaKategori.replace(/\W+/g, "")}` : "DataKaryawan", async (supabase) => (await tabelKaryawan(supabase, namaKategori, false)).baris);
}
