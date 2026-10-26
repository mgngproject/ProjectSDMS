import { createClient } from "@/lib/supabase/server";
import { formatTanggal } from "@/lib/format";
import type { Karyawan } from "@/lib/types";

export default async function TerminatePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("karyawan")
    .select("*, kategori:kategori_id(nama)")
    .eq("status", "terminate")
    .order("tanggal_keluar", { ascending: false });
  const rows = (data ?? []) as Karyawan[];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Karyawan Terminate</h1>
      <div className="overflow-x-auto rounded bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>{["NP", "Nama", "Kategori", "Unit Kerja", "Tanggal Keluar", "Alasan"].map((h) => <th key={h} className="th">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="td">{r.np}</td>
                <td className="td font-medium">{r.nama}</td>
                <td className="td">{r.kategori?.nama}</td>
                <td className="td">{r.unit_kerja ?? "-"}</td>
                <td className="td">{formatTanggal(r.tanggal_keluar)}</td>
                <td className="td">{r.alasan_keluar ?? "-"}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td className="td text-center text-gray-500" colSpan={6}>Belum ada data.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
