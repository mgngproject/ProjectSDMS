import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import { notFound } from "next/navigation";
import Flash from "@/components/Flash";
import { createClient } from "@/lib/supabase/server";
import { terminateKaryawan } from "../../actions";

export default async function TerminateKaryawanPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: karyawan } = await supabase.from("karyawan").select("id, np, nama, status").eq("id", Number(id)).maybeSingle();
  if (!karyawan) notFound();

  return (
    <div className="space-y-4">
      <div>
        <Link className="text-sm link" href="/karyawan">← Kembali</Link>
        <PageHeader title={`Terminate: ${karyawan.nama} (${karyawan.np})`} />
      </div>
      <Flash error={error} />
      <form action={terminateKaryawan.bind(null, karyawan.id)} className="grid max-w-xl gap-3 card p-4">
        <div>
          <label className="label" htmlFor="tanggal_keluar">Tanggal Keluar</label>
          <input className="input" id="tanggal_keluar" name="tanggal_keluar" type="date" required />
        </div>
        <div>
          <label className="label" htmlFor="alasan_keluar">Alasan Keluar</label>
          <textarea className="input" id="alasan_keluar" name="alasan_keluar" rows={3} maxLength={500} required />
        </div>
        <div><button className="btn-danger px-4 py-2 text-sm" type="submit">Terminate Karyawan</button></div>
      </form>
    </div>
  );
}
