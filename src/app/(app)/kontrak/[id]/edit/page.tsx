import PageHeader from "@/components/PageHeader";
import { notFound } from "next/navigation";
import Flash from "@/components/Flash";
import KontrakForm from "@/components/KontrakForm";
import { createClient } from "@/lib/supabase/server";
import type { Kontrak } from "@/lib/types";
import { updateKontrak } from "../../actions";

export default async function EditKontrakPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from("kontrak").select("*, karyawan:karyawan_id(np, nama)").eq("id", Number(id)).maybeSingle();
  if (!data) notFound();
  const kontrak = data as unknown as Kontrak & { karyawan: { np: string; nama: string } };

  return (
    <div className="space-y-4">
      <PageHeader title={`Ubah Kontrak: ${kontrak.karyawan.nama}`} />
      <Flash error={error} />
      <KontrakForm
        action={updateKontrak.bind(null, kontrak.id, kontrak.karyawan_id)}
        np={kontrak.karyawan.np}
        kontrak={kontrak}
        allowTerminate
        batal={`/karyawan/${kontrak.karyawan_id}/kontrak`}
      />
    </div>
  );
}
