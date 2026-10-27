import { getProfile } from "@/lib/auth";
import { excelResponse } from "@/lib/export";
import { LABEL_INTI, configKategori, labelKolom } from "@/lib/kategori-config";
import { KOLOM_STANDAR, nilaiKolom, normalisasi, type BarisKaryawan } from "@/lib/kolom";

export async function GET(request: Request) {
  const profile = await getProfile();
  const diminta = new URL(request.url).searchParams.get("kategori");
  // Admin selalu pada kategorinya; Super Admin boleh memilih satu kategori
  const namaKategori = profile.role === "superadmin" ? diminta : profile.kategori?.nama ?? null;
  const config = configKategori(namaKategori);
  const kolom = config ? config.kolomTabel : [...KOLOM_STANDAR, "kode_bagan", "benefit_kesehatan", "kpi"];

  return excelResponse(config ? `Data${namaKategori}` : "DataKaryawan", async (supabase) => {
    const relasi = config ? `, detail:${config.tabel}(*)` : "";
    let query = supabase.from("karyawan").select(`*, kategori:kategori_id(nama)${relasi}`).eq("status", "aktif").order("nama");
    if (namaKategori) {
      const { data: kat } = await supabase.from("kategori").select("id").eq("nama", namaKategori).maybeSingle();
      if (kat) query = query.eq("kategori_id", kat.id);
    }
    const { data } = await query;
    return normalisasi((data ?? []) as unknown as BarisKaryawan[]).map((r) =>
      Object.fromEntries(kolom.map((k) => [config ? labelKolom(k, config) : LABEL_INTI[k] ?? k, nilaiKolom(r, k, config, false)])),
    );
  });
}
