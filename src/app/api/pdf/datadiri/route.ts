import { pdfResponse } from "@/lib/respons-ekspor";
import { tabelDataDiri } from "@/lib/tabel";

export async function GET() {
  return pdfResponse("DatadiriKaryawan", (supabase) => tabelDataDiri(supabase));
}
