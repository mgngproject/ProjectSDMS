import { pdfResponse } from "@/lib/respons-ekspor";
import { tabelTerminate } from "@/lib/tabel";

export async function GET() {
  return pdfResponse("DataTerminate", (supabase) => tabelTerminate(supabase, true));
}
