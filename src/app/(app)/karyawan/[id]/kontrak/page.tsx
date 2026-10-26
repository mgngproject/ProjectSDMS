import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatTanggal } from "@/lib/format";
import { addKontrak } from "../../actions";

export default async function KontrakPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: karyawan } = await supabase.from("karyawan").select("id, np, nama").eq("id", Number(id)).maybeSingle();
  if (!karyawan) notFound();
  const { data: kontrak } = await supabase.from("kontrak").select("*").eq("karyawan_id", karyawan.id).order("awal_kontrak", { ascending: false });

  return (
    <div className="space-y-4">
      <div>
        <Link className="text-sm text-blue-600 hover:underline" href="/karyawan">← Kembali</Link>
        <h1 className="text-xl font-bold">Kontrak: {karyawan.nama} ({karyawan.np})</h1>
      </div>

      <div className="overflow-x-auto rounded bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>{["Kontrak ke", "Awal", "Akhir", "Status", "Penilaian"].map((h) => <th key={h} className="th">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(kontrak ?? []).map((c) => (
              <tr key={c.id}>
                <td className="td">{c.kontrak_ke}</td>
                <td className="td">{formatTanggal(c.awal_kontrak)}</td>
                <td className="td">{formatTanggal(c.akhir_kontrak)}</td>
                <td className="td">{c.status}</td>
                <td className="td">{c.penilaian ?? "-"}</td>
              </tr>
            ))}
            {(kontrak ?? []).length === 0 && <tr><td className="td text-center text-gray-500" colSpan={5}>Belum ada kontrak.</td></tr>}
          </tbody>
        </table>
      </div>

      <form action={addKontrak.bind(null, karyawan.id)} className="grid max-w-3xl gap-3 rounded bg-white p-4 shadow-sm sm:grid-cols-2">
        <h2 className="font-semibold sm:col-span-2">Tambah Kontrak Baru</h2>
        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700 sm:col-span-2">{error}</p>}
        <input type="hidden" name="np" value={karyawan.np} />
        <div>
          <label className="label" htmlFor="kontrak_ke">Kontrak ke</label>
          <input className="input" id="kontrak_ke" name="kontrak_ke" required />
        </div>
        <div>
          <label className="label" htmlFor="folder_link">Link Folder</label>
          <input className="input" id="folder_link" name="folder_link" type="url" />
        </div>
        <div>
          <label className="label" htmlFor="awal_kontrak">Awal Kontrak</label>
          <input className="input" id="awal_kontrak" name="awal_kontrak" type="date" required />
        </div>
        <div>
          <label className="label" htmlFor="akhir_kontrak">Akhir Kontrak</label>
          <input className="input" id="akhir_kontrak" name="akhir_kontrak" type="date" required />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="penilaian">Penilaian</label>
          <textarea className="input" id="penilaian" name="penilaian" rows={2} />
        </div>
        <div className="sm:col-span-2"><button className="btn" type="submit">Simpan Kontrak</button></div>
      </form>
    </div>
  );
}
