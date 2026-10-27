import { excelResponse } from "@/lib/export";
import { tabelTerminate } from "@/lib/tabel";

export async function GET() {
  return excelResponse("DataTerminate", async (supabase) => (await tabelTerminate(supabase, false)).baris);
}
