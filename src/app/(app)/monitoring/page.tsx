import FilterBar, { PilihanFilter } from "@/components/FilterBar";
import PageHeader from "@/components/PageHeader";
import MonitoringBoard from "@/components/MonitoringBoard";
import { getProfile } from "@/lib/auth";
import { cocokDasar, cocokMonitoring, paramFilter } from "@/lib/filter";
import { formatTanggal } from "@/lib/format";
import { MONITORING_CHECKBOX, MONITORING_TEXT, type MonitoringRow } from "@/lib/monitoring";
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

      <MonitoringBoard
        key={JSON.stringify(p)}
        rows={rows.map((r) => ({
          karyawanId: r.karyawan_id,
          np: r.karyawan.np,
          nama: r.karyawan.nama,
          akhir: formatTanggal(r.karyawan.akhir_kontrak),
          sisaHari: r.karyawan.akhir_kontrak ? Math.round((new Date(r.karyawan.akhir_kontrak).getTime() - Date.now()) / 864e5) : null,
          values: Object.fromEntries([
            ...Object.keys(MONITORING_CHECKBOX).map((f) => [f, Boolean(r[f])]),
            ...Object.keys(MONITORING_TEXT).map((f) => [f, String(r[f] ?? "")]),
          ]),
          keterangan: r.keterangan ?? "",
        }))}
      />
    </div>
  );
}
