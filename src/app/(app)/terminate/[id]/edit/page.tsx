import { notFound } from "next/navigation";
import Flash from "@/components/Flash";
import { createClient } from "@/lib/supabase/server";
import { updateTerminate } from "../../actions";

export default async function EditTerminatePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: k } = await supabase.from("karyawan").select("*").eq("id", Number(id)).eq("status", "terminate").maybeSingle();
  if (!k) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Ubah Data Terminate: {k.nama} ({k.np})</h1>
      <Flash error={error} />
      <form action={updateTerminate.bind(null, k.id)} className="grid max-w-xl gap-3 rounded bg-white p-4 shadow-sm">
        <div>
          <label className="label" htmlFor="akhir_kontrak">Akhir Kontrak</label>
          <input className="input" id="akhir_kontrak" name="akhir_kontrak" type="date" defaultValue={k.akhir_kontrak ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="tanggal_keluar">Tanggal Keluar</label>
          <input className="input" id="tanggal_keluar" name="tanggal_keluar" type="date" defaultValue={k.tanggal_keluar ?? ""} required />
        </div>
        <div>
          <label className="label" htmlFor="alasan_keluar">Alasan Keluar</label>
          <textarea className="input" id="alasan_keluar" name="alasan_keluar" rows={3} maxLength={500} defaultValue={k.alasan_keluar ?? ""} required />
        </div>
        <div className="flex gap-2">
          <button className="btn" type="submit">Simpan</button>
          <a className="btn-secondary" href="/terminate">Batal</a>
        </div>
      </form>
    </div>
  );
}
