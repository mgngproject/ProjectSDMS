import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import ConfirmSubmit from "@/components/ConfirmSubmit";
import Flash from "@/components/Flash";
import FilterBulanTahun from "@/components/FilterBulanTahun";
import { formatTanggal, formatRupiah, masaKerja, masaKontrak } from "@/lib/format";
import { filterBulanTahun } from "@/lib/params";
import { createClient } from "@/lib/supabase/server";
import type { Karyawan } from "@/lib/types";
import { bulkDeleteKaryawan, deleteKaryawan } from "./actions";

type Params = { q?: string; filter?: string; bulan?: string; tahun?: string; ok?: string; error?: string };

export default async function KaryawanPage({ searchParams }: { searchParams: Promise<Params> }) {
  const p = await searchParams;
  const supabase = await createClient();

  // Kontrak aktif yang sudah lewat otomatis menjadi selesai
  await supabase.rpc("expire_kontrak");

  let query = supabase.from("karyawan").select("*, kategori:kategori_id(nama)").eq("status", "aktif").order("nama");
  if (p.q) {
    const term = p.q.replace(/[,()%]/g, " ").trim();
    query = query.or(`nama.ilike.%${term}%,np.ilike.%${term}%`);
  }
  const { data } = await query;
  const rows = filterBulanTahun((data ?? []) as Karyawan[], p);

  return (
    <div className="space-y-4">
      <PageHeader title="Data Karyawan">
          <a className="btn-secondary" href="/api/export/karyawan">Export Excel</a>
          <Link className="btn" href="/karyawan/new">Tambah Karyawan</Link>
        </PageHeader>

      <Flash ok={p.ok} error={p.error} />

      <div className="flex flex-wrap gap-2">
        <form className="flex gap-2">
          <input className="input max-w-xs" name="q" defaultValue={p.q} placeholder="Cari nama / NP" />
          <button className="btn-secondary" type="submit">Cari</button>
        </form>
        <FilterBulanTahun filter={p.filter} bulan={p.bulan} tahun={p.tahun} />
      </div>

      <form className="space-y-2">
        <ConfirmSubmit label="Hapus yang dipilih" message="Hapus semua karyawan yang dicentang? Kontrak, data diri, dan monitoring ikut terhapus." formAction={bulkDeleteKaryawan} />
        <div className="card overflow-x-auto">
          <table className="min-w-full divide-y divide-line">
            <thead>
              <tr>
                <th className="th" />
                {["NP", "Nama", "Kategori", "Awal Kontrak Masuk", "Akhir Kontrak", "Masa Kerja", "Masa Kontrak", "Unit Kerja", "Jabatan", "Level", "Role", "Gross", "Link", ""].map((h) => (
                  <th key={h} className="th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="td"><input type="checkbox" name="ids" value={r.id} /></td>
                  <td className="td">{r.np}</td>
                  <td className="td font-medium">{r.nama}</td>
                  <td className="td">{r.kategori?.nama}</td>
                  <td className="td">{formatTanggal(r.awal_kontrak)}</td>
                  <td className="td">{formatTanggal(r.akhir_kontrak)}</td>
                  <td className="td">{masaKerja(r)}</td>
                  <td className="td">{masaKontrak(r)}</td>
                  <td className="td">{r.unit_kerja ?? "-"}</td>
                  <td className="td">{r.jabatan ?? "-"}</td>
                  <td className="td">{r.level ?? "-"}</td>
                  <td className="td">{r.role ?? "-"}</td>
                  <td className="td">{formatRupiah(r.gross_per_month)}</td>
                  <td className="td">
                    {r.folder_link ? <a className="link" href={r.folder_link} target="_blank" rel="noreferrer">Buka</a> : "-"}
                  </td>
                  <td className="td whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Link className="link" href={`/karyawan/${r.id}/edit`}>Ubah</Link>
                      <Link className="link" href={`/karyawan/${r.id}/kontrak`}>Kontrak</Link>
                      <Link className="link" href={`/karyawan/${r.id}/datadiri`}>Data Diri</Link>
                      <Link className="link" href={`/karyawan/${r.id}/terminate`}>Terminate</Link>
                      <ConfirmSubmit label="Hapus" message={`Hapus ${r.nama}?`} formAction={deleteKaryawan} name="id" value={r.id} />
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td className="td text-center text-muted" colSpan={15}>Belum ada data.</td></tr>}
            </tbody>
          </table>
        </div>
      </form>
    </div>
  );
}
