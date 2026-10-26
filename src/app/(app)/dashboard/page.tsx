import Link from "next/link";
import { GrafikBulanan, GrafikKampus, GrafikKategori, GrafikPendidikan } from "@/components/DashboardCharts";
import { getProfile } from "@/lib/auth";
import { hitungDashboard } from "@/lib/dashboard";
import { NAMA_BULAN, formatTanggal, hariIni } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

type Params = { bulan?: string; tahun_masuk?: string; tahun_habis?: string; kategori?: string };

function geser(bulan: string, delta: number): string {
  const [y, m] = bulan.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Params> }) {
  const p = await searchParams;
  const profile = await getProfile();
  const isSuperAdmin = profile.role === "superadmin";
  const supabase = await createClient();
  await supabase.rpc("expire_kontrak");

  const sekarang = hariIni();
  const bulan = /^\d{4}-\d{2}$/.test(p.bulan ?? "") ? p.bulan! : sekarang.slice(0, 7);
  const tahunMasuk = Number(p.tahun_masuk) || Number(sekarang.slice(0, 4));
  const tahunHabis = Number(p.tahun_habis) || Number(sekarang.slice(0, 4));

  const [{ data: kategori }, { data: karyawanData }, { data: dataDiri }, { data: monitoring }] = await Promise.all([
    supabase.from("kategori").select("id, nama").order("id"),
    supabase.from("karyawan").select("id, np, nama, status, tanggal_keluar, awal_kontrak, akhir_kontrak, kategori:kategori_id(nama)"),
    supabase.from("data_diri").select("karyawan_id, jenjang_1, jenjang_2, kampus_1, kampus_2"),
    supabase.from("monitoring").select("karyawan_id, status"),
  ]);

  // Filter kategori hanya untuk Super Admin; admin sudah dibatasi RLS
  const filterKategori = isSuperAdmin ? p.kategori : undefined;
  const karyawan = ((karyawanData ?? []) as unknown as Parameters<typeof hitungDashboard>[0]["karyawan"]).filter(
    (k) => !filterKategori || k.kategori?.nama === filterKategori,
  );

  const d = hitungDashboard({
    karyawan,
    dataDiri: dataDiri ?? [],
    monitoring: monitoring ?? [],
    bulan,
    tahunMasuk,
    tahunHabis,
  });

  const [tahunB, bulanB] = bulan.split("-").map(Number);
  const namaBulan = `${NAMA_BULAN[bulanB - 1]} ${tahunB}`;
  const q = (extra: Record<string, string>) =>
    "?" + new URLSearchParams({ ...(filterKategori ? { kategori: filterKategori } : {}), tahun_masuk: String(tahunMasuk), tahun_habis: String(tahunHabis), bulan, ...extra }).toString();
  const tahunIni = Number(sekarang.slice(0, 4));
  const daftarTahun = Array.from({ length: 6 }, (_, i) => tahunIni + 1 - i);

  const kartu: [string, number][] = [
    ["Karyawan Aktif", d.totalAktif],
    [`Karyawan Masuk (${namaBulan})`, d.masukBulan],
    [`Kontrak Habis (${namaBulan})`, d.habisBulan],
    ["Berkas Belum Lengkap", d.berkasBelumLengkap],
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Link className="btn-secondary" href={q({ bulan: geser(bulan, -1) })}>←</Link>
          <span className="text-sm font-medium">{namaBulan}</span>
          <Link className="btn-secondary" href={q({ bulan: geser(bulan, 1) })}>→</Link>
          {isSuperAdmin && (
            <form className="flex gap-2">
              <input type="hidden" name="bulan" value={bulan} />
              <select className="input w-auto" name="kategori" defaultValue={filterKategori ?? ""}>
                <option value="">Semua kategori</option>
                {(kategori ?? []).map((c) => <option key={c.id} value={c.nama}>{c.nama}</option>)}
              </select>
              <button className="btn-secondary" type="submit">Terapkan</button>
            </form>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kartu.map(([label, nilai]) => (
          <div key={label} className="rounded bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-500">{label}</div>
            <div className="text-3xl font-bold">{nilai}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">Karyawan Masuk per Bulan</h2>
            <form className="flex gap-1">
              <input type="hidden" name="bulan" value={bulan} />
              {filterKategori && <input type="hidden" name="kategori" value={filterKategori} />}
              <input type="hidden" name="tahun_habis" value={tahunHabis} />
              <select className="input w-auto py-1" name="tahun_masuk" defaultValue={tahunMasuk}>
                {daftarTahun.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <button className="btn-secondary py-1" type="submit">OK</button>
            </form>
          </div>
          <GrafikBulanan data={d.chartMasuk} />
        </section>

        <section className="rounded bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">Kontrak Habis per Bulan ({d.totalHabisChart})</h2>
            <form className="flex gap-1">
              <input type="hidden" name="bulan" value={bulan} />
              {filterKategori && <input type="hidden" name="kategori" value={filterKategori} />}
              <input type="hidden" name="tahun_masuk" value={tahunMasuk} />
              <select className="input w-auto py-1" name="tahun_habis" defaultValue={tahunHabis}>
                {daftarTahun.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <button className="btn-secondary py-1" type="submit">OK</button>
            </form>
          </div>
          <GrafikBulanan data={d.chartHabis} warna="#dc2626" />
        </section>

        <section className="rounded bg-white p-4 shadow-sm">
          <h2 className="mb-2 font-semibold">Pendidikan Terakhir</h2>
          <GrafikPendidikan data={d.pendidikan} />
        </section>

        <section className="rounded bg-white p-4 shadow-sm">
          <h2 className="mb-2 font-semibold">10 Kampus Teratas</h2>
          <GrafikKampus data={d.kampus} />
        </section>

        <section className="rounded bg-white p-4 shadow-sm">
          <h2 className="mb-2 font-semibold">Karyawan Aktif per Kategori</h2>
          <GrafikKategori data={d.perKategori} />
        </section>

        <section className="rounded bg-white p-4 shadow-sm">
          <h2 className="mb-2 font-semibold">Kontrak Habis dalam 60 Hari</h2>
          <ul className="divide-y divide-gray-100 text-sm">
            {d.kontrakHabis.map((r) => (
              <li key={r.id} className="flex justify-between py-2">
                <span>{r.nama} ({r.np}){isSuperAdmin ? ` · ${r.kategori?.nama}` : ""}</span>
                <span>{formatTanggal(r.akhir_kontrak)}</span>
              </li>
            ))}
            {d.kontrakHabis.length === 0 && <li className="py-2 text-gray-500">Tidak ada.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
