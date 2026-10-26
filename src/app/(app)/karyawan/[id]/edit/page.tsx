import { notFound } from "next/navigation";
import Flash from "@/components/Flash";
import KaryawanForm from "@/components/KaryawanForm";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Karyawan } from "@/lib/types";
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

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Ubah Karyawan</h1>
      <Flash error={error} />
      <KaryawanForm
        mode="ubah"
        action={updateKaryawan.bind(null, Number(id))}
        batal="/karyawan"
        kategori={kategori ?? []}
        isSuperAdmin={profile.role === "superadmin"}
        kategoriAdmin={profile.kategori?.nama}
        karyawan={karyawan as Karyawan}
      />
      <p className="text-sm text-gray-500">Tanggal kontrak diatur lewat menu Kontrak.</p>
    </div>
  );
}
