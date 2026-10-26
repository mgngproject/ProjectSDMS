import MonitoringCheckbox from "@/components/MonitoringCheckbox";
import { createClient } from "@/lib/supabase/server";

const KOLOM: [string, string][] = [
  ["nde_konfirmasi", "NDE Konfirmasi"],
  ["nde_jawaban", "NDE Jawaban"],
  ["nde_laporan", "NDE Laporan"],
  ["offering_letter", "Offering Letter"],
  ["izin_prinsip_nde", "Izin Prinsip NDE"],
  ["izin_prinsip_manual", "Izin Prinsip Manual"],
  ["nde_penyampaian_unit_kerja", "NDE Unit Kerja"],
  ["nde_penyampaian_sdmo", "NDE SDMO"],
  ["upload_ess", "Upload ESS"],
  ["data_diri", "Data Diri"],
];

type Row = { karyawan_id: number; status: string; karyawan: { np: string; nama: string } | null } & Record<string, unknown>;

export default async function MonitoringPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("monitoring")
    .select("*, karyawan:karyawan_id(np, nama, status)")
    .order("karyawan_id");
  const rows = ((data ?? []) as unknown as (Row & { karyawan: { status: string } })[]).filter((r) => r.karyawan?.status === "aktif");

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Monitoring</h1>
      <div className="overflow-x-auto rounded bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="th">NP</th>
              <th className="th">Nama</th>
              {KOLOM.map(([, label]) => <th key={label} className="th">{label}</th>)}
              <th className="th">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => (
              <tr key={r.karyawan_id}>
                <td className="td">{r.karyawan?.np}</td>
                <td className="td font-medium">{r.karyawan?.nama}</td>
                {KOLOM.map(([field]) => (
                  <td key={field} className="td text-center">
                    <MonitoringCheckbox karyawanId={r.karyawan_id} field={field} checked={Boolean(r[field])} />
                  </td>
                ))}
                <td className="td">{r.status}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td className="td text-center text-gray-500" colSpan={KOLOM.length + 3}>Belum ada data.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
