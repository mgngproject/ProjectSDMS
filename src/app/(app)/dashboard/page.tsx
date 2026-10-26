import KategoriChart from "@/components/KategoriChart";
import { createClient } from "@/lib/supabase/server";
import { formatTanggal, sisaHari } from "@/lib/format";

type Row = { id: number; np: string; nama: string; akhir_kontrak: string | null; status: string; kategori: { nama: string } | null };

export default async function DashboardPage() {
  const supabase = await createClient();
  // RLS membatasi baris sesuai kategori pengguna
  const { data } = await supabase.from("karyawan").select("id, np, nama, akhir_kontrak, status, kategori:kategori_id(nama)");
  const semua = (data ?? []) as unknown as Row[];

  const aktif = semua.filter((r) => r.status === "aktif");
  const terminate = semua.length - aktif.length;
  const segeraHabis = aktif
    .filter((r) => (sisaHari(r.akhir_kontrak) ?? 999) <= 90)
    .sort((a, b) => (a.akhir_kontrak ?? "").localeCompare(b.akhir_kontrak ?? ""));

  const perKategori = Object.entries(
    aktif.reduce<Record<string, number>>((acc, r) => {
      const nama = r.kategori?.nama ?? "-";
      acc[nama] = (acc[nama] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([nama, total]) => ({ nama, total }));

  const kartu = [
    ["Karyawan Aktif", aktif.length],
    ["Kontrak Habis ≤ 90 Hari", segeraHabis.length],
    ["Terminate", terminate],
  ] as const;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {kartu.map(([label, nilai]) => (
          <div key={label} className="rounded bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-500">{label}</div>
            <div className="text-3xl font-bold">{nilai}</div>
          </div>
        ))}
      </div>

      <div className="rounded bg-white p-4 shadow-sm">
        <h2 className="mb-2 font-semibold">Karyawan Aktif per Kategori</h2>
        <KategoriChart data={perKategori} />
      </div>

      <div className="rounded bg-white p-4 shadow-sm">
        <h2 className="mb-2 font-semibold">Kontrak Segera Habis</h2>
        <ul className="divide-y divide-gray-100 text-sm">
          {segeraHabis.map((r) => (
            <li key={r.id} className="flex justify-between py-2">
              <span>{r.nama} ({r.np}) · {r.kategori?.nama}</span>
              <span>{formatTanggal(r.akhir_kontrak)}</span>
            </li>
          ))}
          {segeraHabis.length === 0 && <li className="py-2 text-gray-500">Tidak ada.</li>}
        </ul>
      </div>
    </div>
  );
}
