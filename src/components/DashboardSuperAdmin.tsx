import DashboardSA from "@/components/DashboardSA";
import { dataDiriLengkap } from "@/lib/filter";
import { hariIni, tambahHari } from "@/lib/format";
import { JENJANG } from "@/lib/filter";
import { jendelaKategori } from "@/lib/kategori-config";
import { peta, normKode, type BaganRow, type Orang } from "@/lib/dashboard-sa";
import { createClient } from "@/lib/supabase/server";

type Klien = Awaited<ReturnType<typeof createClient>>;

/** Membaca seluruh baris per halaman 1000 (batas bawaan Supabase). */
async function semua<T>(ambil: (dari: number, sampai: number) => PromiseLike<{ data: unknown[] | null }>): Promise<T[]> {
  const hasil: T[] = [];
  for (let dari = 0; ; dari += 1000) {
    const { data } = await ambil(dari, dari + 999);
    const bagian = (data ?? []) as T[];
    hasil.push(...bagian);
    if (bagian.length < 1000) return hasil;
  }
}

type KaryawanRow = {
  id: number; np: string; nama: string; kode_bagan: string | null; unit_kerja: string | null; status: "aktif" | "terminate";
  tanggal_keluar: string | null; alasan_keluar: string | null; awal_kontrak: string | null; akhir_kontrak: string | null; kategori: { nama: string } | null;
};

export default async function DashboardSuperAdmin({ supabase }: { supabase: Klien }) {
  await supabase.rpc("expire_kontrak");
  const hari = hariIni();

  const [kategori, karyawan, kontrak, dataDiri, monitoring, bagan] = await Promise.all([
    supabase.from("kategori").select("id, nama").order("id").then((r) => (r.data ?? []) as { id: number; nama: string }[]),
    semua<KaryawanRow>((a, b) =>
      supabase.from("karyawan").select("id, np, nama, kode_bagan, unit_kerja, status, tanggal_keluar, alasan_keluar, awal_kontrak, akhir_kontrak, kategori:kategori_id(nama)").order("id").range(a, b)),
    semua<{ karyawan_id: number; awal_kontrak: string | null; akhir_kontrak: string | null }>((a, b) =>
      supabase.from("kontrak").select("karyawan_id, awal_kontrak, akhir_kontrak").order("id").range(a, b)),
    semua<{ karyawan_id: number; ktp: string | null; tempat_lahir: string | null; tanggal_lahir: string | null; alamat: string | null; jenjang_1: string | null; jenjang_2: string | null }>((a, b) =>
      supabase.from("data_diri").select("karyawan_id, ktp, tempat_lahir, tanggal_lahir, alamat, jenjang_1, jenjang_2").order("id").range(a, b)),
    semua<{ karyawan_id: number; status: string | null }>((a, b) => supabase.from("monitoring").select("karyawan_id, status").order("id").range(a, b)),
    // Tabel bagan baru ada setelah migrasi 0011; bila belum, dashboard tetap jalan tanpa pemetaan divisi
    semua<BaganRow>((a, b) => supabase.from("bagan").select("kode, nama_unit, induk_kode").eq("aktif", true).order("id").range(a, b)),
  ]);

  const kontrakPer = new Map<number, string[]>();
  for (const k of [...kontrak].sort((x, y) => (x.awal_kontrak ?? "").localeCompare(y.awal_kontrak ?? ""))) {
    if (!k.akhir_kontrak) continue;
    kontrakPer.set(k.karyawan_id, [...(kontrakPer.get(k.karyawan_id) ?? []), k.akhir_kontrak]);
  }
  const diri = new Map(dataDiri.map((d) => [d.karyawan_id, d]));
  const selesai = new Set(monitoring.filter((m) => (m.status ?? "").trim().toLowerCase() === "selesai").map((m) => m.karyawan_id));
  const unit = peta(bagan);

  const orang: Orang[] = karyawan.map((k) => {
    const d = diri.get(k.id);
    const { direktorat, divisi } = unit(k.kode_bagan, k.unit_kerja);
    const jenjang = d?.jenjang_2 || d?.jenjang_1 || null;
    return {
      id: k.id, np: k.np, nama: k.nama, kat: k.kategori?.nama ?? "-", unit: k.unit_kerja, kode: normKode(k.kode_bagan) || null,
      statusK: k.status, masuk: k.awal_kontrak, berakhir: k.akhir_kontrak, keluar: k.tanggal_keluar, alasan: k.alasan_keluar,
      kontrak: kontrakPer.get(k.id) ?? (k.akhir_kontrak ? [k.akhir_kontrak] : []),
      lengkap: selesai.has(k.id),
      lahir: d?.tanggal_lahir ?? null,
      jenjang: jenjang && JENJANG.includes(jenjang) ? jenjang : jenjang ? "Lainnya" : null,
      dataDiri: d ? dataDiriLengkap(d) : false,
      direktorat, divisi,
    };
  });

  // Jendela "akan selesai" mengikuti aturan tiap kategori; kunci kosong untuk semua kategori (60 hari)
  const jendela: Record<string, { label: string; sampai: string }> = { "": { label: "60 hari", sampai: tambahHari(hari, 60) } };
  for (const k of kategori) {
    const j = jendelaKategori(k.nama);
    jendela[k.nama] = { label: j.label, sampai: j.sampai(hari) };
  }

  return <DashboardSA orang={orang} hari={hari} kategori={kategori.map((k) => k.nama)} jendela={jendela} baganTerisi={bagan.length > 0} />;
}
