import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import { formatTanggal, masaKerja, masaKontrak } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Karyawan, Kontrak } from "@/lib/types";

type Row = Karyawan & { kontrak_aktif: Kontrak[] };

export default async function RiwayatKontrakPage() {
  const supabase = await createClient();
  await supabase.rpc("expire_kontrak");

  const { data } = await supabase
    .from("karyawan")
    .select("*, kategori:kategori_id(nama), kontrak_aktif:kontrak(*)")
    .eq("status", "aktif")
    .eq("kontrak.status", "aktif")
    .order("nama");
  const rows = (data ?? []) as unknown as Row[];

  return (
    <div className="space-y-4">
      <PageHeader title="Riwayat Kontrak" />
      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-line">
          <thead>
            <tr>{["NP", "Nama", "Kategori", "Kontrak Aktif", "Awal", "Akhir", "Masa Kerja", "Masa Kontrak", ""].map((h) => <th key={h} className="th">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => {
              const aktif = r.kontrak_aktif[0];
              return (
                <tr key={r.id}>
                  <td className="td">{r.np}</td>
                  <td className="td font-medium">{r.nama}</td>
                  <td className="td">{r.kategori?.nama}</td>
                  <td className="td">{aktif?.kontrak_ke ?? "-"}</td>
                  <td className="td">{formatTanggal(aktif?.awal_kontrak ?? r.awal_kontrak_aktif)}</td>
                  <td className="td">{formatTanggal(aktif?.akhir_kontrak ?? r.akhir_kontrak)}</td>
                  <td className="td">{masaKerja(r)}</td>
                  <td className="td">{masaKontrak(r)}</td>
                  <td className="td"><Link className="link" href={`/karyawan/${r.id}/kontrak`}>Riwayat</Link></td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td className="td text-center text-muted" colSpan={9}>Belum ada data.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
