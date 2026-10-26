import PageHeader from "@/components/PageHeader";
import MonitoringCheckbox from "@/components/MonitoringCheckbox";
import MonitoringText from "@/components/MonitoringText";
import { NAMA_BULAN, formatTanggal } from "@/lib/format";
import { MONITORING_CHECKBOX, MONITORING_TEXT, monitoringKurang, type MonitoringRow } from "@/lib/monitoring";
import { createClient } from "@/lib/supabase/server";

type Row = MonitoringRow & { karyawan: { np: string; nama: string; status: string; akhir_kontrak: string | null } };

export default async function MonitoringPage({ searchParams }: { searchParams: Promise<{ bulan?: string; status?: string }> }) {
  const p = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase
    .from("monitoring")
    .select("*, karyawan:karyawan_id!inner(np, nama, status, akhir_kontrak)")
    .eq("karyawan.status", "aktif");
  let rows = ((data ?? []) as unknown as Row[]).sort((a, b) => a.karyawan.nama.localeCompare(b.karyawan.nama));

  if (p.bulan) rows = rows.filter((r) => r.karyawan.akhir_kontrak && Number(r.karyawan.akhir_kontrak.split("-")[1]) === Number(p.bulan));
  if (p.status) rows = rows.filter((r) => r.status === p.status);

  return (
    <div className="space-y-4">
      <PageHeader title="Monitoring Berkas Karyawan" />

      <form className="flex flex-wrap gap-2">
        <select className="input w-auto" name="bulan" defaultValue={p.bulan ?? ""}>
          <option value="">Semua bulan akhir kontrak</option>
          {NAMA_BULAN.map((n, i) => <option key={n} value={i + 1}>{n}</option>)}
        </select>
        <select className="input w-auto" name="status" defaultValue={p.status ?? ""}>
          <option value="">Semua status</option>
          <option value="Selesai">Selesai</option>
          <option value="Belum Lengkap">Belum Lengkap</option>
        </select>
        <button className="btn-secondary" type="submit">Terapkan</button>
      </form>

      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-line">
          <thead>
            <tr>
              <th className="th">NP</th>
              <th className="th">Nama</th>
              <th className="th">Akhir Kontrak</th>
              {Object.values(MONITORING_CHECKBOX).map((l) => <th key={l} className="th">{l}</th>)}
              {Object.values(MONITORING_TEXT).map((l) => <th key={l} className="th">{l}</th>)}
              <th className="th">Status</th>
              <th className="th">Catatan</th>
              <th className="th">Keterangan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => {
              const kurang = monitoringKurang(r);
              return (
                <tr key={r.karyawan_id}>
                  <td className="td">{r.karyawan.np}</td>
                  <td className="td font-medium">{r.karyawan.nama}</td>
                  <td className="td">{formatTanggal(r.karyawan.akhir_kontrak)}</td>
                  {Object.keys(MONITORING_CHECKBOX).map((field) => (
                    <td key={field} className="td text-center">
                      <MonitoringCheckbox karyawanId={r.karyawan_id} field={field} checked={Boolean(r[field])} />
                    </td>
                  ))}
                  {Object.keys(MONITORING_TEXT).map((field) => (
                    <td key={field} className="td">
                      <MonitoringText karyawanId={r.karyawan_id} field={field} value={String(r[field] ?? "")} />
                    </td>
                  ))}
                  <td className="td">
                    <span className={r.status === "Selesai" ? "pill-success" : "pill-warning"}>
                      {r.status}
                    </span>
                  </td>
                  <td className="td text-xs text-danger">
                    {kurang.length === 0 ? <span className="text-success">Selesai</span> : kurang.map((k) => <div key={k}>• {k}</div>)}
                  </td>
                  <td className="td">
                    <MonitoringText karyawanId={r.karyawan_id} field="keterangan" value={r.keterangan ?? ""} />
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td className="td text-center text-muted" colSpan={20}>Belum ada data.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
