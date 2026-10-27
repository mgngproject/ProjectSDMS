import { excelResponse } from "@/lib/export";
import { tabelDataDiri } from "@/lib/tabel";

export async function GET() {
  return excelResponse("DatadiriKaryawan", async (supabase) => (await tabelDataDiri(supabase)).baris);
}
