import FilterBar, { PilihanFilter } from "@/components/FilterBar";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import Flash from "@/components/Flash";
import { getProfile } from "@/lib/auth";
import { JENJANG, cocokDasar, cocokDataDiri, paramFilter, queryString } from "@/lib/filter";
import { formatTanggal } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { DataDiri } from "@/lib/types";

type Row = DataDiri & { karyawan: { np: string; nama: string; status: string; awal_kontrak: string | null; akhir_kontrak: string | null; kategori: { nama: string } | null } };

export default async function DataDiriPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const p = paramFilter(sp);
  const profile = await getProfile();
  const isSuperAdmin = profile.role === "superadmin";
  const supabase = await createClient();
  const { data: daftarKategori } = await supabase.from("kategori").select("id, nama").order("id");

  let query = supabase.from("data_diri").select("*, karyawan:karyawan_id!inner(np, nama, status, awal_kontrak, akhir_kontrak, kategori:kategori_id(nama))").eq("karyawan.status", "aktif");
  const { data } = await query;
  const rows = ((data ?? []) as unknown as Row[])
    .filter((d) => cocokDasar({ ...d.karyawan }, p, { kategoriBerlaku: isSuperAdmin, jenisBawaan: "habis" }) && cocokDataDiri(d, p))
    .sort((a, b) => a.karyawan.nama.localeCompare(b.karyawan.nama));

  return (
    <div className="space-y-4">
      <PageHeader title="Data Diri Karyawan">
        <a className="btn-secondary" href={`/api/export/datadiri${queryString(p)}`}>Export Excel</a>
        <a className="btn-secondary" href={`/api/pdf/datadiri${queryString(p)}`} target="_blank" rel="noreferrer">Export PDF</a>
      </PageHeader>
      <Flash ok={sp.ok} error={sp.error} />

      <FilterBar key={JSON.stringify(p)} p={p} kategori={isSuperAdmin ? daftarKategori ?? [] : undefined} resetHref="/datadiri">
        <PilihanFilter name="jenjang" label="Semua jenjang" nilai={p.jenjang} options={JENJANG.map((j) => ({ value: j, label: j }))} />
        <PilihanFilter name="kelengkapan" label="Semua kelengkapan" nilai={p.kelengkapan} options={[{ value: "lengkap", label: "Data lengkap" }, { value: "belum", label: "Belum lengkap" }]} />
      </FilterBar>

      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-line">
          <thead>
            <tr>{["NP", "Nama", "Kategori", "No. KTP", "Tempat, Tanggal Lahir", "Alamat", "Jenjang", "Jurusan", "Kampus", ""].map((h) => <th key={h} className="th">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((d) => {
              const terakhir = d.jenjang_2 ? { j: d.jenjang_2, s: d.jurusan_2, k: d.kampus_2 } : { j: d.jenjang_1, s: d.jurusan_1, k: d.kampus_1 };
              const alamat = [d.alamat, d.rt && `RT ${d.rt}`, d.rw && `RW ${d.rw}`, d.kelurahan, d.kecamatan, d.kabupaten, d.provinsi].filter(Boolean).join(", ");
              return (
                <tr key={d.id}>
                  <td className="td">{d.karyawan.np}</td>
                  <td className="td font-medium">{d.karyawan.nama}</td>
                  <td className="td">{d.karyawan.kategori?.nama}</td>
                  <td className="td">{d.ktp ?? "-"}</td>
                  <td className="td">{d.tempat_lahir && d.tanggal_lahir ? `${d.tempat_lahir}, ${formatTanggal(d.tanggal_lahir)}` : "-"}</td>
                  <td className="td">{alamat || "-"}</td>
                  <td className="td">{terakhir.j ?? "-"}</td>
                  <td className="td">{terakhir.s ?? "-"}</td>
                  <td className="td">{terakhir.k ?? "-"}</td>
                  <td className="td"><Link className="link" href={`/karyawan/${d.karyawan_id}/datadiri`}>Ubah</Link></td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td className="td text-center text-muted" colSpan={10}>Belum ada data.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
