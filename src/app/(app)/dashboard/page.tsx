import { CalendarClock, ChevronLeft, ChevronRight, ClipboardList, FolderOpen, Info, UserMinus, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { GrafikBulanan, GrafikKampus, GrafikKategori, GrafikPendidikan, GrafikSebaran } from "@/components/DashboardCharts";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { getProfile } from "@/lib/auth";
import { hitungDashboard, sebaranDetail, sebaranStandar } from "@/lib/dashboard";
import { NAMA_BULAN, formatTanggal, hariIni, selisihHari } from "@/lib/format";
import { LABEL_INTI, configKategori, jendelaKategori, pilihanStandar } from "@/lib/kategori-config";
import { createClient } from "@/lib/supabase/server";

type Params = { bulan?: string; tahun_masuk?: string; tahun_habis?: string; kategori?: string };

function geser(bulan: string, delta: number): string {
  const [y, m] = bulan.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + delta, 1)).toISOString().slice(0, 7);
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

  // Kategori yang sedang dilihat: kategori PIC, atau pilihan Super Admin
  const namaKategori = isSuperAdmin ? p.kategori || null : profile.kategori?.nama ?? null;
  const config = configKategori(namaKategori);
  const jendela = jendelaKategori(namaKategori);

  const [{ data: kategori }, { data: karyawanData }, { data: dataDiri }, { data: monitoring }, { data: detailData }] = await Promise.all([
    supabase.from("kategori").select("id, nama").order("id"),
    supabase.from("karyawan").select("id, np, nama, unit_kerja, jabatan, level, status, tanggal_keluar, awal_kontrak, akhir_kontrak, kategori:kategori_id(nama)"),
    supabase.from("data_diri").select("karyawan_id, jenjang_1, jenjang_2, kampus_1, kampus_2"),
    supabase.from("monitoring").select("karyawan_id, status"),
    config ? supabase.from(config.tabel).select("*") : Promise.resolve({ data: [] as Record<string, string | null>[] }),
  ]);
  const detail = (detailData ?? []) as unknown as ({ karyawan_id: number } & Record<string, string | null>)[];
  const detailPerKaryawan = new Map(detail.map((x) => [x.karyawan_id, x]));

  // Filter kategori hanya untuk Super Admin; admin sudah dibatasi RLS
  const filterKategori = isSuperAdmin ? p.kategori : undefined;
  const karyawan = ((karyawanData ?? []) as unknown as Parameters<typeof hitungDashboard>[0]["karyawan"]).filter(
    (k) => !filterKategori || k.kategori?.nama === filterKategori,
  );

  const d = hitungDashboard({ karyawan, dataDiri: dataDiri ?? [], monitoring: monitoring ?? [], bulan, tahunMasuk, tahunHabis, sampai: jendela.sampai(sekarang) });
  const idAktif = new Set(d.aktifIds);
  const sebaran = [
    ...(config ? sebaranDetail(config.fields, d.aktifIds, detail) : []),
    ...sebaranStandar(pilihanStandar(namaKategori), (k) => LABEL_INTI[k] ?? k, karyawan.filter((k) => idAktif.has(k.id))),
  ];

  const [tahunB, bulanB] = bulan.split("-").map(Number);
  const namaBulan = `${NAMA_BULAN[bulanB - 1]} ${tahunB}`;
  const q = (extra: Record<string, string>) =>
    "?" + new URLSearchParams({ ...(filterKategori ? { kategori: filterKategori } : {}), tahun_masuk: String(tahunMasuk), tahun_habis: String(tahunHabis), bulan, ...extra }).toString();
  const tahunIni = Number(sekarang.slice(0, 4));
  const daftarTahun = Array.from({ length: 6 }, (_, i) => tahunIni + 1 - i);

  const tindakLanjut = [
    { label: "Berkas karyawan belum lengkap", jumlah: d.berkasBelumLengkap, href: "/monitoring?status=Belum Lengkap", icon: FolderOpen },
    { label: `Kontrak habis dalam ${jendela.label}`, jumlah: d.kontrakHabis.length, href: "#kontrak-habis", icon: CalendarClock },
    { label: "Karyawan terminate", jumlah: d.totalTerminate, href: "/terminate", icon: UserMinus },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Dashboard">
        <div className="flex items-center gap-1">
          <Link className="btn-secondary px-2" href={q({ bulan: geser(bulan, -1) })} aria-label="Bulan sebelumnya"><ChevronLeft size={16} /></Link>
          <span className="min-w-32 text-center text-sm font-medium">{namaBulan}</span>
          <Link className="btn-secondary px-2" href={q({ bulan: geser(bulan, 1) })} aria-label="Bulan berikutnya"><ChevronRight size={16} /></Link>
        </div>
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
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Karyawan aktif" nilai={d.totalAktif} catatan={`${d.totalTerminate} terminate`} icon={Users} nada="primary" />
        <StatCard label="Masuk bulan ini" nilai={d.masukBulan} catatan={`Bulan lalu: ${d.masukBulanLalu}`} icon={UserPlus} nada="success" />
        <StatCard label="Kontrak berakhir bulan ini" nilai={d.habisBulan} catatan={`Bulan lalu: ${d.habisBulanLalu}`} icon={UserMinus} nada="danger" />
        {jendela.fokus ? (
          <StatCard label={`Berakhir ≤ ${jendela.label}`} nilai={d.kontrakHabis.length} catatan={`${d.berakhir7Hari} berakhir ≤ 7 hari`} icon={CalendarClock} nada="warning" />
        ) : (
          <StatCard label="Berkas belum lengkap" nilai={d.berkasBelumLengkap} catatan={`dari ${d.totalAktif} karyawan aktif`} icon={ClipboardList} nada="warning" />
        )}
      </div>

      <div className="flex items-start gap-3 rounded-2xl bg-primary-soft p-4 text-sm text-primary">
        <Info size={20} className="mt-0.5 shrink-0" />
        <p>
          Pada {namaBulan}, {d.masukBulan} karyawan masuk dan {d.habisBulan} kontrak berakhir. Saat ini ada {d.berkasBelumLengkap} berkas
          belum lengkap dan {d.kontrakHabis.length} kontrak yang habis dalam {jendela.label}.
        </p>
      </div>

      <section className="card p-5">
        <h2 className="mb-2 text-lg font-semibold">Perlu tindak lanjut</h2>
        <ul className="divide-y divide-line">
          {tindakLanjut.map(({ label, jumlah, href, icon: Icon }) => (
            <li key={label} className="flex items-center gap-3 py-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"><Icon size={16} /></span>
              <span className="flex-1 text-sm">{label}</span>
              <span className={jumlah === 0 ? "pill-success" : "pill-warning"}>{jumlah}</span>
              <Link className="btn-secondary px-4" href={href}>Buka</Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-semibold">Karyawan masuk per bulan</h2>
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

        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-semibold">Kontrak habis per bulan ({d.totalHabisChart})</h2>
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
          <GrafikBulanan data={d.chartHabis} warna="#f43f5e" />
        </section>

        {sebaran.map((sb) => (
          <section key={sb.name} className="card p-5">
            <h2 className="mb-3 font-semibold">Sebaran {sb.label}</h2>
            <GrafikSebaran data={sb.data} />
          </section>
        ))}

        <section className="card p-5">
          <h2 className="mb-3 font-semibold">Pendidikan terakhir</h2>
          <GrafikPendidikan data={d.pendidikan} />
        </section>

        <section className="card p-5">
          <h2 className="mb-3 font-semibold">10 kampus teratas</h2>
          <GrafikKampus data={d.kampus} />
        </section>

        {!config && (
          <section className="card p-5">
            <h2 className="mb-3 font-semibold">Karyawan aktif per kategori</h2>
            <GrafikKategori data={d.perKategori} />
          </section>
        )}

        <section id="kontrak-habis" className="card scroll-mt-4 p-5">
          <h2 className="mb-3 font-semibold">{jendela.fokus ? `Akan selesai dalam ${jendela.label}` : `Kontrak habis dalam ${jendela.label}`}</h2>
          <ul className="divide-y divide-line text-sm">
            {d.kontrakHabis.map((r) => {
              const sisa = selisihHari(sekarang, r.akhir_kontrak!);
              const info = detailPerKaryawan.get(r.id);
              return (
                <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0">
                    <span className="block truncate">{r.nama} ({r.np}){isSuperAdmin && !config ? ` · ${r.kategori?.nama}` : ""}</span>
                    <span className="block truncate text-xs text-muted">
                      {[info?.jenis, info?.status_tpbw, info?.level_jabatan, info?.institusi].filter(Boolean).join(" · ") || [r.unit_kerja, r.jabatan].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="text-muted">{formatTanggal(r.akhir_kontrak)}</span>
                    <span className={sisa <= 7 ? "pill-danger" : sisa <= 30 ? "pill-warning" : "pill bg-primary-soft text-primary"}>{sisa === 0 ? "Hari ini" : `${sisa} hari`}</span>
                  </span>
                </li>
              );
            })}
            {d.kontrakHabis.length === 0 && <li className="py-2 text-muted">Tidak ada.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
