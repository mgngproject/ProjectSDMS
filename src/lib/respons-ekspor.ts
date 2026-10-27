import { getProfile } from "@/lib/auth";
import { buatPdf } from "@/lib/pdf";
import type { Tabel } from "@/lib/tabel";
import { createClient } from "@/lib/supabase/server";

type Klien = Awaited<ReturnType<typeof createClient>>;

/** Respons PDF dari tabel; nama berkas memuat waktu cetak. Baris dibatasi RLS. */
export async function pdfResponse(namaFile: string, ambil: (supabase: Klien) => Promise<Tabel>) {
  const profile = await getProfile();
  const supabase = await createClient();
  const tabel = await ambil(supabase);
  const cap = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta", day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  }).format(new Date()).replace(/[/:, ]+/g, "-");

  return new Response(buatPdf(tabel, profile.nama), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${namaFile}_${cap}.pdf"`,
    },
  });
}
