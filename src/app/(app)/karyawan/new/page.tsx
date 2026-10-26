import PageHeader from "@/components/PageHeader";
import Flash from "@/components/Flash";
import KaryawanForm from "@/components/KaryawanForm";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createKaryawan } from "../actions";

export default async function NewKaryawanPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const profile = await getProfile();
  const supabase = await createClient();
  const { data: kategori } = await supabase.from("kategori").select("id, nama").order("id");

  return (
    <div className="space-y-4">
      <PageHeader title="Tambah Karyawan" />
      <Flash error={error} />
      <KaryawanForm
        mode="baru"
        action={createKaryawan}
        batal="/karyawan"
        kategori={kategori ?? []}
        isSuperAdmin={profile.role === "superadmin"}
        kategoriAdmin={profile.kategori?.nama}
      />
    </div>
  );
}
