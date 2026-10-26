import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/server";

type Baris = Record<string, string | number | null>;

/** Membuat respons Excel; menolak pengguna yang belum login. RLS membatasi baris sesuai kategori. */
export async function excelResponse(
  namaFile: string,
  ambil: (supabase: Awaited<ReturnType<typeof createClient>>) => Promise<Baris[]>,
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const rows = (await ambil(supabase)).map((r, i) => ({ No: i + 1, ...r }));
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(rows), "Data");
  const buffer = XLSX.write(book, { type: "buffer", bookType: "xlsx" });

  const cap = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta", day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  }).format(new Date()).replace(/[/:, ]+/g, "-");

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${namaFile}_${cap}.xlsx"`,
    },
  });
}
