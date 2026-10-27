import * as XLSX from "xlsx";
import { getProfile } from "@/lib/auth";
import { LABEL_INTI, configKategori, kolomDisembunyikan } from "@/lib/kategori-config";

/** Template import: judul kolom sesuai kategori, plus satu baris contoh. */
export async function GET(request: Request) {
  const profile = await getProfile();
  const diminta = new URL(request.url).searchParams.get("kategori");
  const namaKategori = profile.role === "superadmin" ? diminta : profile.kategori?.nama ?? null;
  const config = configKategori(namaKategori);

  const standar = ["kode_bagan", "unit_kerja", "jabatan", "level", "role", "benefit_kesehatan", "faskes", "gross_per_month", "kpi"]
    .filter((k) => !kolomDisembunyikan(namaKategori).includes(k))
    .map((k) => LABEL_INTI[k]);
  const detail = (config?.fields ?? []).map((f) => f.label);
  const judul = ["NP", "Nama", ...detail, "Awal Kontrak", "Akhir Kontrak", "Awal Kontrak 2", "Akhir Kontrak 2", ...standar];
  const contoh = judul.map((j) => {
    const f = config?.fields.find((x) => x.label === j);
    if (j === "NP") return "123456";
    if (j === "Nama") return "Nama Karyawan";
    if (j.startsWith("Awal Kontrak")) return j.endsWith("2") ? "" : "2026-01-01";
    if (j.startsWith("Akhir Kontrak")) return j.endsWith("2") ? "" : "2026-12-31";
    if (f?.type === "select") return f.options?.[0] ?? "";
    if (f?.type === "date") return "2026-01-01";
    return "";
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([judul, contoh]), "Database");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["NP", "Nama", "Tanggal Keluar", "Alasan Keluar", "Awal Kontrak", "Akhir Kontrak", "Unit Kerja", "Jabatan"]]), "Terminate");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["NP", "No KTP", "Tempat", "Tanggal Lahir", "Alamat", "RT", "RW", "Kelurahan", "Kecamatan", "Kabupaten", "Provinsi", "Jenjang", "Jurusan", "Nama Perguruan Tinggi", "Jenjang Terakhir", "Jurusan Terakhir", "Nama Perguruan Tinggi Terakhir"]]), "Mail Merge");
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="Template_Import${namaKategori ? `_${namaKategori.replace(/\W+/g, "")}` : ""}.xlsx"`,
    },
  });
}
