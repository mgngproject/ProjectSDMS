import FilterBar, { PilihanFilter } from "@/components/FilterBar";
import PageHeader from "@/components/PageHeader";
import MonitoringCheckbox from "@/components/MonitoringCheckbox";
import MonitoringText from "@/components/MonitoringText";
import { getProfile } from "@/lib/auth";
import { cocokDasar, cocokMonitoring, paramFilter } from "@/lib/filter";
import { formatTanggal } from "@/lib/format";
import { MONITORING_CHECKBOX, MONITORING_TEXT, monitoringKurang, type MonitoringRow } from "@/lib/monitoring";
import { createClient } from "@/lib/supabase/server";

type Row = MonitoringRow & { karyawan: { np: string; nama: string; status: string; awal_kontrak: string | null; akhir_kontrak: string | null; kategori: { nama: string } | null } };

export default async function MonitoringPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const p = paramFilter(await searchParams);
  const profile = await getProfile();
  const isSuperAdmin = profile.role === "superadmin";
  const supabase = await createClient();
  const { data: daftarKategori } = await supabase.from("kategori").select("id, nama").order("id");

  const { data } = await supabase
    .from("monitoring")
    .select("*, karyawan:karyawan_id!inner(np, nama, status, awal_kontrak, akhir_kontrak, kategori:kategori_id(nama))")
    .eq("karyawan.status", "aktif");
  const rows = ((data ?? []) as unknown as Row[])
    .filter((r) => cocokDasar(r.karyawan, p, { kategoriBerlaku: isSuperAdmin, jenisBawaan: "habis" }) && cocokMonitoring(r, p))
    .sort((a, b) => a.karyawan.nama.localeCompare(b.karyawan.nama));

  return (
    <div className="space-y-4">
      <PageHeader title="Monitoring Berkas Karyawan" />

      <FilterBar key={JSON.stringify(p)} p={p} kategori={isSuperAdmin ? daftarKategori ?? [] : undefined} resetHref="/monitoring">
        <PilihanFilter name="status" label="Semua status" nilai={p.status} options={[{ value: "Selesai", label: "Selesai" }, { value: "Belum Lengkap", label: "Belum Lengkap" }]} />
        <PilihanFilter
          name="kurang"
          label="Semua berkas"
          nilai={p.kurang}
          options={[...Object.entries(MONITORING_CHECKBOX), ...Object.entries(MONITORING_TEXT)].map(([value, label]) => ({ value, label: `Belum ada: ${label}` }))}
        />
      </FilterBar>

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
