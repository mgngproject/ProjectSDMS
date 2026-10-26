import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import Flash from "@/components/Flash";
import { formatTanggal } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { DataDiri } from "@/lib/types";

type Row = DataDiri & { karyawan: { np: string; nama: string; status: string; kategori: { nama: string } | null } };

export default async function DataDiriPage({ searchParams }: { searchParams: Promise<{ jenjang?: string; ok?: string; error?: string }> }) {
  const p = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("data_diri").select("*, karyawan:karyawan_id!inner(np, nama, status, kategori:kategori_id(nama))").eq("karyawan.status", "aktif");
  if (p.jenjang) query = query.or(`jenjang_1.eq.${p.jenjang},jenjang_2.eq.${p.jenjang}`);
  const { data } = await query;
  const rows = ((data ?? []) as unknown as Row[]).sort((a, b) => a.karyawan.nama.localeCompare(b.karyawan.nama));

  return (
    <div className="space-y-4">
      <PageHeader title="Data Diri Karyawan">
        <a className="btn-secondary" href="/api/export/datadiri">Export Excel</a>
      </PageHeader>
      <Flash ok={p.ok} error={p.error} />

      <form className="flex gap-2">
        <select className="input w-auto" name="jenjang" defaultValue={p.jenjang ?? ""}>
          <option value="">Semua jenjang</option>
          {["SMA/SMK", "D3", "D4", "S1", "S2", "S3"].map((j) => <option key={j} value={j}>{j}</option>)}
        </select>
        <button className="btn-secondary" type="submit">Terapkan</button>
      </form>

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
