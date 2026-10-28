import { getProfile } from "@/lib/auth";
import { paramDariUrl } from "@/lib/filter";
import { pdfResponse } from "@/lib/respons-ekspor";
import { tabelKaryawan } from "@/lib/tabel";

export async function GET(request: Request) {
  const profile = await getProfile();
  const diminta = new URL(request.url).searchParams.get("kategori");
  // Admin selalu pada kategorinya; Super Admin boleh memilih satu kategori
  const namaKategori = profile.role === "superadmin" ? diminta : profile.kategori?.nama ?? null;
  return pdfResponse("DataKaryawan", (supabase) => tabelKaryawan(supabase, namaKategori, true, paramDariUrl(request.url)));
}
