import { getProfile } from "@/lib/auth";
import { excelResponse } from "@/lib/export";
import { paramDariUrl } from "@/lib/filter";
import { tabelDataDiri } from "@/lib/tabel";

export async function GET(request: Request) {
  const superAdmin = (await getProfile()).role === "superadmin";
  const p = paramDariUrl(request.url);
  return excelResponse("DatadiriKaryawan", async (supabase) => (await tabelDataDiri(supabase, p, superAdmin)).baris);
}
