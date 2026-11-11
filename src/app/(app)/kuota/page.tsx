import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import KuotaDaftar, { type ItemDivisi } from "@/components/KuotaDaftar";
import PageHeader from "@/components/PageHeader";
import { getProfile } from "@/lib/auth";
import { normKode } from "@/lib/bagan";
import { ambilBagan } from "@/lib/bagan-data";
import { hariIni } from "@/lib/format";
import { awalanKode, bulanDari, bulanValid, geserBulan, namaBulan, pesertaDiBulan, susunDivisi } from "@/lib/kuota";
import { ambilKuota, ambilPesertaMagang } from "@/lib/kuota-data";
import { createClient } from "@/lib/supabase/server";

export default async function KuotaPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const profile = await getProfile();
  // Kuota hanya untuk PIC Magang
  if (profile.role === "superadmin" || profile.kategori?.nama !== "Magang") redirect("/dashboard");

  const supabase = await createClient();
  const [bagan, kuota, peserta] = await Promise.all([ambilBagan(supabase, true), ambilKuota(supabase), ambilPesertaMagang(supabase)]);
  const bulan = bulanValid(sp.bulan) ? sp.bulan : bulanDari(hariIni());

  const divisi = susunDivisi(bagan);
  const kuotaPer = new Map(kuota.map((k) => [k.awalan, k.kuota]));
  const awalanDikenal = new Set(divisi.map((d) => d.awalan));
  const aktifBulanIni = peserta.filter((p) => p.awal && p.akhir && bulanDari(p.awal) <= bulan && bulanDari(p.akhir) >= bulan);

  const item = (d: { awalan: string; kode: string | null; nama: string; units: { kode: string; nama: string }[] }, yatim: boolean): ItemDivisi => ({
    awalan: d.awalan,
    kode: d.kode,
    nama: d.nama,
    terisi: pesertaDiBulan(peserta, d.awalan, bulan).length,
    kuota: kuotaPer.get(d.awalan) ?? null,
    units: d.units.map((u) => ({ ...u, jumlah: aktifBulanIni.filter((p) => normKode(p.kode) === u.kode).length })),
    yatim,
  });
  const items: ItemDivisi[] = [
    ...divisi.map((d) => item(d, false)),
    // Kuota tersimpan untuk awalan yang tidak ada lagi di daftar bagan (mis. setelah restrukturisasi)
    ...kuota.filter((k) => !awalanDikenal.has(k.awalan)).map((k) => item({ awalan: k.awalan, kode: null, nama: `Divisi ${k.awalan}`, units: [] }, true)),
  ];

  const totalKuota = items.reduce((n, d) => n + (d.kuota ?? 0), 0);
  const totalTerisi = items.reduce((n, d) => n + (d.kuota === null ? 0 : d.terisi), 0);
  const penuh = items.filter((d) => d.kuota !== null && d.terisi >= d.kuota).length;
  const tanpaDivisi = aktifBulanIni.filter((p) => !p.kode || !awalanDikenal.has(awalanKode(p.kode)));
  const kodeTanpaDivisi = [...new Set(tanpaDivisi.map((p) => normKode(p.kode) || "(tanpa kode)"))];

  return (
    <div className="space-y-4">
      <PageHeader title="Kuota">
        <div className="flex items-center gap-1">
          <Link className="btn-secondary px-2" href={`/kuota?bulan=${geserBulan(bulan, -1)}`} aria-label="Bulan sebelumnya"><ChevronLeft size={16} /></Link>
          <span className="min-w-36 text-center text-sm font-medium">{namaBulan(bulan)}</span>
          <Link className="btn-secondary px-2" href={`/kuota?bulan=${geserBulan(bulan, 1)}`} aria-label="Bulan berikutnya"><ChevronRight size={16} /></Link>
        </div>
      </PageHeader>

      <p className="text-sm text-muted">
        Kuota diatur per divisi. Divisi diambil dari Kode Bagan: kode seperti 10000 dan 20000 adalah divisi, dan unit kerja yang dua angka depan kodenya sama masuk ke divisi itu.
        Peserta dihitung lewat Kode Bagan-nya dan memakai satu slot selama seluruh masa kontraknya. Klik satu divisi untuk melihat unit kerjanya.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card p-5"><div className="text-sm text-muted">Total kuota</div><div className="mt-2 text-3xl font-bold tabular-nums">{totalKuota}</div></div>
        <div className="card p-5"><div className="text-sm text-muted">Terisi</div><div className="mt-2 text-3xl font-bold tabular-nums">{totalTerisi} <span className="text-base font-medium text-muted">/ {totalKuota}</span></div></div>
        <div className="card p-5"><div className="text-sm text-muted">Sisa slot</div><div className={`mt-2 text-3xl font-bold tabular-nums ${totalKuota - totalTerisi < 0 ? "text-danger" : ""}`}>{totalKuota - totalTerisi}</div></div>
        <div className="card p-5"><div className="text-sm text-muted">Divisi penuh</div><div className="mt-2 text-3xl font-bold tabular-nums">{penuh}</div></div>
      </div>

      {tanpaDivisi.length > 0 && (
        <p className="rounded-2xl bg-warning-soft p-4 text-sm font-medium text-warning" role="status">
          {tanpaDivisi.length} peserta aktif belum dihitung di kuota mana pun karena Kode Bagan-nya tidak punya divisi di daftar ({kodeTanpaDivisi.join(", ")}).
          Perbaiki kode bagan pesertanya, atau minta Super Admin melengkapi daftar di menu Kode Bagan.
        </p>
      )}

      <KuotaDaftar key={bulan} items={items} />

      <p className="text-xs text-muted">Unit kerja dan divisi dikelola Super Admin di menu Kode Bagan. Halaman ini hanya membaca daftar itu.</p>
    </div>
  );
}
