import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import ConfirmSubmit from "@/components/ConfirmSubmit";
import FilterBulanTahun from "@/components/FilterBulanTahun";
import Flash from "@/components/Flash";
import { formatTanggal, masaKerja } from "@/lib/format";
import { filterBulanTahun } from "@/lib/params";
import { createClient } from "@/lib/supabase/server";
import type { Karyawan } from "@/lib/types";
import { bulkDeleteTerminate, deleteTerminate } from "./actions";

type Params = { filter?: string; bulan?: string; tahun?: string; ok?: string; error?: string };

export default async function TerminatePage({ searchParams }: { searchParams: Promise<Params> }) {
  const p = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("karyawan")
    .select("*, kategori:kategori_id(nama)")
    .eq("status", "terminate")
    .order("tanggal_keluar", { ascending: false });
  const rows = filterBulanTahun((data ?? []) as Karyawan[], p);

  return (
    <div className="space-y-4">
      <PageHeader title="Data Terminate">
          <a className="btn-secondary" href="/api/export/terminate">Export Excel</a>
        <a className="btn-secondary" href="/api/pdf/terminate" target="_blank" rel="noreferrer">Export PDF</a>
          <Link className="btn" href="/terminate/new">Tambah Data Terminate</Link>
        </PageHeader>
      <Flash ok={p.ok} error={p.error} />
      <FilterBulanTahun filter={p.filter} bulan={p.bulan} tahun={p.tahun} />

      <form className="space-y-2">
        <ConfirmSubmit label="Hapus yang dipilih" message="Hapus semua data terminate yang dicentang?" formAction={bulkDeleteTerminate} />
        <div className="card overflow-x-auto">
          <table className="min-w-full divide-y divide-line">
            <thead>
              <tr>
                <th className="th" />
                {["NP", "Nama", "Kategori", "Awal Kontrak Masuk", "Akhir Kontrak", "Masa Kerja", "Unit Kerja", "Jabatan", "Tanggal Keluar", "Alasan", ""].map((h) => <th key={h} className="th">{h}</th>)}
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
                  <td className="td">{r.unit_kerja ?? "-"}</td>
                  <td className="td">{r.jabatan ?? "-"}</td>
                  <td className="td">{formatTanggal(r.tanggal_keluar)}</td>
                  <td className="td">{r.alasan_keluar ?? "-"}</td>
                  <td className="td whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Link className="link" href={`/terminate/${r.id}/edit`}>Ubah</Link>
                      <ConfirmSubmit label="Hapus" message={`Hapus data terminate ${r.nama}?`} formAction={deleteTerminate} name="id" value={r.id} />
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td className="td text-center text-muted" colSpan={12}>Belum ada data.</td></tr>}
            </tbody>
          </table>
        </div>
      </form>
    </div>
  );
}
