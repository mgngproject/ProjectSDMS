import PageHeader from "@/components/PageHeader";
import { notFound } from "next/navigation";
import Flash from "@/components/Flash";
import KaryawanForm from "@/components/KaryawanForm";
import { getProfile } from "@/lib/auth";
import { ambilBagan } from "@/lib/bagan-data";
import { configKategori } from "@/lib/kategori-config";
import { createClient } from "@/lib/supabase/server";
import type { Detail, Karyawan } from "@/lib/types";
import { updateKaryawan } from "../../actions";

export default async function EditKaryawanPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const profile = await getProfile();
  const supabase = await createClient();

  const [{ data: karyawan }, { data: kategori }] = await Promise.all([
    supabase.from("karyawan").select("*").eq("id", Number(id)).maybeSingle(),
    supabase.from("kategori").select("id, nama").order("id"),
  ]);
  if (!karyawan) notFound();
  const bagan = await ambilBagan(supabase, true);

  // Kolom khusus kategori (mis. Magang)
  const namaKategori = (kategori ?? []).find((c) => c.id === karyawan.kategori_id)?.nama;
  const config = configKategori(namaKategori);
  const { data: detail } = config
    ? await supabase.from(config.tabel).select("*").eq("karyawan_id", karyawan.id).maybeSingle()
    : { data: null };

  return (
    <div className="space-y-4">
      <PageHeader title="Ubah Karyawan" />
      <Flash error={error} />
      <KaryawanForm
        mode="ubah"
        action={updateKaryawan.bind(null, Number(id))}
        batal="/karyawan"
        kategori={kategori ?? []}
        isSuperAdmin={profile.role === "superadmin"}
        kategoriAdmin={profile.kategori?.nama}
        bagan={bagan}
        karyawan={karyawan as Karyawan}
        detail={detail as Detail | null}
      />
      <p className="text-sm text-muted">Tanggal kontrak diatur lewat menu Kontrak.</p>
    </div>
  );
}
