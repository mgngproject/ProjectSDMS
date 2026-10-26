import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatBulan, formatTanggal, selisihBulan, sisaHari } from "@/lib/format";
import type { Karyawan } from "@/lib/types";
import { deleteKaryawan } from "./actions";

export default async function KaryawanPage({ searchParams }: { searchParams: Promise<{ q?: string; filter?: string }> }) {
  const { q, filter } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("karyawan")
    .select("*, kategori:kategori_id(nama)")
    .eq("status", "aktif")
    .order("nama");

  if (q) {
    const term = q.replace(/[,()%]/g, " ").trim();
    query = query.or(`nama.ilike.%${term}%,np.ilike.%${term}%`);
  }
  const { data } = await query;
  let rows = (data ?? []) as Karyawan[];
  if (filter === "habis") rows = rows.filter((r) => (sisaHari(r.akhir_kontrak) ?? 999) <= 90);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold">Data Karyawan</h1>
        <div className="flex gap-2">
          <a className="btn-secondary" href="/api/export/karyawan">Export Excel</a>
          <Link className="btn" href="/karyawan/new">Tambah Karyawan</Link>
        </div>
      </div>

      <form className="flex gap-2">
        <input className="input max-w-xs" name="q" defaultValue={q} placeholder="Cari nama / NP" />
        <select className="input max-w-xs" name="filter" defaultValue={filter ?? ""}>
          <option value="">Semua</option>
          <option value="habis">Kontrak habis ≤ 90 hari</option>
        </select>
        <button className="btn-secondary" type="submit">Cari</button>
      </form>

      <div className="overflow-x-auto rounded bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              {["NP", "Nama", "Kategori", "Unit Kerja", "Jabatan", "Masa Kerja", "Akhir Kontrak", ""].map((h) => (
                <th key={h} className="th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="td">{r.np}</td>
                <td className="td font-medium">{r.nama}</td>
                <td className="td">{r.kategori?.nama}</td>
                <td className="td">{r.unit_kerja ?? "-"}</td>
                <td className="td">{r.jabatan ?? "-"}</td>
                <td className="td">{formatBulan(selisihBulan(r.awal_kontrak))}</td>
                <td className="td">{formatTanggal(r.akhir_kontrak)}</td>
                <td className="td whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Link className="text-blue-600 hover:underline" href={`/karyawan/${r.id}/edit`}>Ubah</Link>
                    <Link className="text-blue-600 hover:underline" href={`/karyawan/${r.id}/kontrak`}>Kontrak</Link>
                    <Link className="text-blue-600 hover:underline" href={`/karyawan/${r.id}/datadiri`}>Data Diri</Link>
                    <form action={deleteKaryawan.bind(null, r.id)}>
                      <button className="btn-danger" type="submit">Hapus</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td className="td text-center text-gray-500" colSpan={8}>Belum ada data.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
