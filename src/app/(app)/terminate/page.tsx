import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import ConfirmSubmit from "@/components/ConfirmSubmit";
import FilterBar from "@/components/FilterBar";
import Flash from "@/components/Flash";
import { getProfile } from "@/lib/auth";
import { cocokDasar, cocokTerminate, paramFilter, queryString } from "@/lib/filter";
import { formatTanggal, masaKerja } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Karyawan } from "@/lib/types";
import { aktifkanKembali, aktifkanKembaliBanyak, bulkDeleteTerminate, deleteTerminate } from "./actions";

type Params = Record<string, string | undefined>;

export default async function TerminatePage({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const p = paramFilter(sp);
  const profile = await getProfile();
  const isSuperAdmin = profile.role === "superadmin";
  const supabase = await createClient();
  const { data: daftarKategori } = await supabase.from("kategori").select("id, nama").order("id");
  const { data } = await supabase
    .from("karyawan")
    .select("*, kategori:kategori_id(nama)")
    .eq("status", "terminate")
    .order("tanggal_keluar", { ascending: false });
  const rows = ((data ?? []) as Karyawan[]).filter((r) => cocokDasar(r, p, { kategoriBerlaku: isSuperAdmin, jenisBawaan: "keluar" }) && cocokTerminate(r, p));

  return (
    <div className="space-y-4">
      <PageHeader title="Data Terminate">
          <a className="btn-secondary" href={`/api/export/terminate${queryString(p)}`}>Export Excel</a>
        <a className="btn-secondary" href={`/api/pdf/terminate${queryString(p)}`} target="_blank" rel="noreferrer">Export PDF</a>
          <Link className="btn" href="/terminate/new">Tambah Data Terminate</Link>
        </PageHeader>
      <Flash ok={sp.ok} error={sp.error} />
      <FilterBar key={JSON.stringify(p)} p={p} kategori={isSuperAdmin ? daftarKategori ?? [] : undefined} periode={["keluar", "masuk", "habis"]} resetHref="/terminate">
        <input className="input max-w-[200px]" name="alasan" defaultValue={p.alasan ?? ""} placeholder="Alasan keluar" aria-label="Alasan keluar" />
      </FilterBar>

      <form className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <ConfirmSubmit
            label="Aktifkan kembali yang dipilih"
            message="Aktifkan kembali semua karyawan yang dicentang? Tanggal keluar dan alasan akan dihapus."
            className="btn-secondary"
            formAction={aktifkanKembaliBanyak}
          />
          <ConfirmSubmit label="Hapus yang dipilih" message="Hapus semua data terminate yang dicentang?" formAction={bulkDeleteTerminate} />
        </div>
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
                      <ConfirmSubmit
                        label="Aktifkan kembali"
                        message={`Aktifkan kembali ${r.nama}? Tanggal keluar dan alasan akan dihapus.`}
                        className="btn-secondary px-3 py-1 text-xs"
                        formAction={aktifkanKembali.bind(null, r.id)}
                      />
                      <ConfirmSubmit label="Hapus" message={`Hapus data terminate ${r.nama}?`} formAction={deleteTerminate.bind(null, r.id)} />
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
