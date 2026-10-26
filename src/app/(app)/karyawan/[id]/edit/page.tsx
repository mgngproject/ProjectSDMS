import { notFound } from "next/navigation";
import KaryawanForm from "@/components/KaryawanForm";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Karyawan } from "@/lib/types";
import { terminateKaryawan, updateKaryawan } from "../../actions";

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
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Ubah Karyawan</h1>
      <KaryawanForm
        action={updateKaryawan.bind(null, Number(id))}
        kategori={kategori ?? []}
        isSuperAdmin={profile.role === "superadmin"}
        kategoriAdmin={profile.kategori?.nama}
        karyawan={karyawan as Karyawan}
        error={error}
      />

      <form action={terminateKaryawan.bind(null, Number(id))} className="max-w-3xl space-y-3 rounded bg-white p-4 shadow-sm">
        <h2 className="font-semibold">Terminate Karyawan</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="tanggal_keluar">Tanggal Keluar</label>
            <input className="input" id="tanggal_keluar" name="tanggal_keluar" type="date" required />
          </div>
          <div>
            <label className="label" htmlFor="alasan_keluar">Alasan</label>
            <input className="input" id="alasan_keluar" name="alasan_keluar" />
          </div>
        </div>
        <button className="btn-danger" type="submit">Terminate</button>
      </form>
    </div>
  );
}
