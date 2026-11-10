import { ArrowRight } from "lucide-react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import UnitMutasi from "@/components/UnitMutasi";
import { getProfile } from "@/lib/auth";
import { formatTanggal } from "@/lib/format";
import { ambilMutasi, type FilterMutasi } from "@/lib/mutasi-data";
import { createClient } from "@/lib/supabase/server";

export default async function RiwayatMutasiPage({ searchParams }: { searchParams: Promise<FilterMutasi> }) {
  const f = await searchParams;
  const profile = await getProfile();
  const isSuperAdmin = profile.role === "superadmin";
  const supabase = await createClient();
  const { data: daftarKategori } = isSuperAdmin ? await supabase.from("kategori").select("id, nama").order("id") : { data: [] };
  const rows = await ambilMutasi(supabase, isSuperAdmin ? f : { ...f, kategori: undefined });
  const qs = new URLSearchParams(Object.entries(f).filter(([, v]) => v) as [string, string][]).toString();

  return (
    <div className="space-y-4">
      <PageHeader title="Riwayat Mutasi">
        <a className="btn-secondary" href={`/api/export/mutasi${qs ? `?${qs}` : ""}`}>Export Excel</a>
      </PageHeader>

      <form className="card flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-48 flex-1">
          <label className="label" htmlFor="q">Cari</label>
          <input className="input" id="q" name="q" defaultValue={f.q ?? ""} placeholder="NP, nama, unit kerja, keterangan" />
        </div>
        {isSuperAdmin && (
          <div>
            <label className="label" htmlFor="kategori">Kategori</label>
            <select className="input" id="kategori" name="kategori" defaultValue={f.kategori ?? ""}>
              <option value="">Semua</option>
              {(daftarKategori ?? []).map((k) => <option key={k.id} value={k.nama}>{k.nama}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="label" htmlFor="dari">Dari tanggal</label>
          <input className="input" id="dari" name="dari" type="date" defaultValue={f.dari ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="sampai">Sampai tanggal</label>
          <input className="input" id="sampai" name="sampai" type="date" defaultValue={f.sampai ?? ""} />
        </div>
        <div className="flex gap-2">
          <button className="btn" type="submit">Terapkan</button>
          <Link className="btn-secondary" href="/mutasi">Reset</Link>
        </div>
      </form>

      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-line">
          <thead>
            <tr>{["Tanggal", "NP", "Nama", ...(isSuperAdmin ? ["Kategori"] : []), "Dari", "", "Ke", "Keterangan", ""].map((h, i) => <th key={i} className="th">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((m) => (
              <tr key={m.id}>
                <td className="td whitespace-nowrap">{formatTanggal(m.tanggal)}</td>
                <td className="td">{m.karyawan.np}</td>
                <td className="td font-medium">
                  {m.karyawan.nama}
                  {m.karyawan.status !== "aktif" && <span className="text-xs text-muted"> (terminate)</span>}
                </td>
                {isSuperAdmin && <td className="td">{m.karyawan.kategori?.nama ?? "-"}</td>}
                <td className="td"><UnitMutasi kode={m.kode_bagan_lama} unit={m.unit_kerja_lama} /></td>
                <td className="td text-muted"><ArrowRight size={14} /></td>
                <td className="td"><UnitMutasi kode={m.kode_bagan_baru} unit={m.unit_kerja_baru} /></td>
                <td className="td">{m.keterangan ?? <span className="text-muted">-</span>}</td>
                <td className="td"><Link className="link" href={`/karyawan/${m.karyawan.id}/mutasi`}>Riwayat</Link></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td className="td text-center text-muted" colSpan={isSuperAdmin ? 9 : 8}>Belum ada riwayat mutasi.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
