import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  // RLS membatasi baris sesuai kategori pengguna
  const { data, error } = await supabase
    .from("karyawan")
    .select("np, nama, unit_kerja, jabatan, level, awal_kontrak, akhir_kontrak, status, kategori:kategori_id(nama)")
    .order("nama");
  if (error) return new Response(error.message, { status: 500 });

  const rows = (data ?? []).map((r) => {
    const { kategori, ...rest } = r as unknown as { kategori: { nama: string } | null } & Record<string, unknown>;
    return { ...rest, kategori: kategori?.nama ?? "" };
  });
  const sheet = XLSX.utils.json_to_sheet(rows);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Karyawan");
  const buffer = XLSX.write(book, { type: "buffer", bookType: "xlsx" });

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="karyawan.xlsx"',
    },
  });
}
