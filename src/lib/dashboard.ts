import { hariIni } from "@/lib/format";
import type { DataDiri, Karyawan } from "@/lib/types";

// Alias nama kampus untuk grafik 10 kampus teratas (sama dengan Laravel)
const ALIAS_KAMPUS: Record<string, string[]> = {
  UGM: ["UGM", "Universitas Gadjah Mada", "Univ Gadjah Mada", "Univ. Gadjah Mada"],
  UI: ["UI", "Universitas Indonesia"],
  UNAIR: ["UNAIR", "Universitas Airlangga"],
  ITB: ["ITB", "Institut Teknologi Bandung"],
  UNS: ["UNS", "Universitas Sebelas Maret"],
  IPB: ["IPB", "Institut Pertanian Bogor", "IPB University"],
  ITS: ["ITS", "Institut Teknologi Sepuluh Nopember"],
  UNDIP: ["UNDIP", "Universitas Diponegoro"],
  UNPAD: ["UNPAD", "Universitas Padjadjaran", "Universitas Padjajaran"],
  UPI: ["UPI", "Universitas Pendidikan Indonesia"],
};

const normal = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
const LOOKUP = new Map(Object.entries(ALIAS_KAMPUS).flatMap(([key, list]) => list.map((a) => [normal(a), key] as const)));

type KaryawanRow = Pick<Karyawan, "id" | "np" | "nama" | "status" | "tanggal_keluar" | "awal_kontrak" | "akhir_kontrak"> & {
  kategori: { nama: string } | null;
};
type PendidikanRow = Pick<DataDiri, "karyawan_id" | "jenjang_1" | "jenjang_2" | "kampus_1" | "kampus_2">;
type MonitoringRow = { karyawan_id: number; status: string | null };

const ym = (tgl: string | null) => (tgl ? tgl.slice(0, 7) : "");
const tahunDari = (tgl: string | null) => (tgl ? Number(tgl.slice(0, 4)) : 0);
const bulanDari = (tgl: string | null) => (tgl ? Number(tgl.slice(5, 7)) : 0);

export function hitungDashboard(opts: {
  karyawan: KaryawanRow[];
  dataDiri: PendidikanRow[];
  monitoring: MonitoringRow[];
  bulan: string; // YYYY-MM
  tahunMasuk: number;
  tahunHabis: number;
}) {
  const hari = hariIni();
  const { karyawan, bulan } = opts;
  const ids = new Set(karyawan.map((k) => k.id));

  // Karyawan aktif: status aktif, belum keluar, kontrak belum lewat (atau kosong)
  const aktif = karyawan.filter(
    (k) => k.status === "aktif" && !k.tanggal_keluar && (!k.akhir_kontrak || k.akhir_kontrak >= hari),
  );

  const [tahunB, bulanB] = bulan.split("-").map(Number);
  const bulanIni = hari.slice(0, 7);

  const masukBulan = aktif.filter((k) => tahunDari(k.awal_kontrak) === tahunB && bulanDari(k.awal_kontrak) === bulanB).length;
  // Bulan di masa depan belum dihitung (sama seperti Laravel)
  const habisBulan =
    bulan <= bulanIni
      ? karyawan.filter(
          (k) => k.status === "aktif" && !k.tanggal_keluar && tahunDari(k.akhir_kontrak) === tahunB && bulanDari(k.akhir_kontrak) === bulanB,
        ).length
      : 0;

  const perBulan = (rows: KaryawanRow[], kolom: "awal_kontrak" | "akhir_kontrak", tahun: number) =>
    Array.from({ length: 12 }, (_, i) => rows.filter((k) => tahunDari(k[kolom]) === tahun && bulanDari(k[kolom]) === i + 1).length);

  const chartMasuk = perBulan(aktif, "awal_kontrak", opts.tahunMasuk);
  const chartHabis = perBulan(
    karyawan.filter((k) => k.status === "aktif" && !k.tanggal_keluar),
    "akhir_kontrak",
    opts.tahunHabis,
  );

  const statusMonitoring = new Map(opts.monitoring.map((m) => [m.karyawan_id, (m.status ?? "").trim().toLowerCase()]));
  const berkasBelumLengkap = aktif.filter((k) => statusMonitoring.get(k.id) !== "selesai").length;

  const batas = new Date(`${hari}T00:00:00Z`);
  batas.setUTCDate(batas.getUTCDate() + 60);
  const batas60 = batas.toISOString().slice(0, 10);
  const kontrakHabis = karyawan
    .filter((k) => k.status === "aktif" && k.akhir_kontrak && k.akhir_kontrak >= hari && k.akhir_kontrak <= batas60)
    .sort((a, b) => (a.akhir_kontrak ?? "").localeCompare(b.akhir_kontrak ?? ""));

  // Pendidikan dan kampus: karyawan yang belum keluar
  const belumKeluar = new Set(karyawan.filter((k) => !k.tanggal_keluar).map((k) => k.id));
  const pendidikan = opts.dataDiri.filter((d) => ids.has(d.karyawan_id) && belumKeluar.has(d.karyawan_id));

  const terakhir = (d: PendidikanRow) => (d.jenjang_2 ? d.jenjang_2 : d.jenjang_1);
  const s2 = pendidikan.filter((d) => terakhir(d) === "S2").length;
  const s1 = pendidikan.filter((d) => terakhir(d) === "S1").length;
  const lainnya = pendidikan.filter((d) => {
    const j = terakhir(d);
    return !!j && j !== "S1" && j !== "S2";
  }).length;

  const kampus = Object.fromEntries(Object.keys(ALIAS_KAMPUS).map((k) => [k, { s1: 0, s2: 0 }]));
  for (const d of pendidikan) {
    for (const [nama, jenjang] of [[d.kampus_1, d.jenjang_1], [d.kampus_2, d.jenjang_2]] as const) {
      if (!nama || !jenjang) continue;
      const key = LOOKUP.get(normal(nama));
      const j = jenjang.trim().toUpperCase();
      if (key && (j === "S1" || j === "S2")) kampus[key][j === "S1" ? "s1" : "s2"]++;
    }
  }

  const perKategori = Object.entries(
    aktif.reduce<Record<string, number>>((acc, k) => {
      const nama = k.kategori?.nama ?? "-";
      acc[nama] = (acc[nama] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([nama, total]) => ({ nama, total }));

  return {
    totalAktif: aktif.length,
    masukBulan,
    habisBulan,
    berkasBelumLengkap,
    kontrakHabis,
    chartMasuk,
    chartHabis,
    totalHabisChart: chartHabis.reduce((a, b) => a + b, 0),
    pendidikan: [
      { nama: "S2", total: s2 },
      { nama: "S1", total: s1 },
      { nama: "Lainnya", total: lainnya },
    ],
    kampus: Object.entries(kampus).map(([nama, v]) => ({ nama, S1: v.s1, S2: v.s2 })),
    perKategori,
  };
}

export { ym };
