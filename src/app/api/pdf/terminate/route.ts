import { getProfile } from "@/lib/auth";
import { paramDariUrl } from "@/lib/filter";
import { pdfResponse } from "@/lib/respons-ekspor";
import { tabelTerminate } from "@/lib/tabel";

export async function GET(request: Request) {
  const superAdmin = (await getProfile()).role === "superadmin";
  const p = paramDariUrl(request.url);
  return pdfResponse("DataTerminate", (supabase) => tabelTerminate(supabase, true, p, superAdmin));
}
