import { getProfile } from "@/lib/auth";
import { excelResponse } from "@/lib/export";
import { paramDariUrl } from "@/lib/filter";
import { tabelTerminate } from "@/lib/tabel";

export async function GET(request: Request) {
  const superAdmin = (await getProfile()).role === "superadmin";
  const p = paramDariUrl(request.url);
  return excelResponse("DataTerminate", async (supabase) => (await tabelTerminate(supabase, false, p, superAdmin)).baris);
}
