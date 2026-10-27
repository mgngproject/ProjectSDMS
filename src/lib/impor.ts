import * as XLSX from "xlsx";
import { pilihanStandar, type KategoriConfig } from "@/lib/kategori-config";

// Format file sama dengan versi Laravel: satu workbook dengan sheet
// "Database" (karyawan + kontrak berurutan), "Mail Merge" (data diri), "Terminate", dan "Kontrak".

export const BATAS_BARIS = 1000;
export const BATAS_BYTE = 3 * 1024 * 1024;

type Sel = string | number | boolean | null;
export type Baris = Record<string, Sel>;

/** "No KTP" -> "no_ktp", "Universitas/Sekolah" -> "universitas_sekolah" (sama seperti Laravel Excel). */
export function slug(teks: string): string {
  return teks.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

const BULAN: Record<string, number> = {
  jan: 1, januari: 1, feb: 2, februari: 2, mar: 3, maret: 3, apr: 4, april: 4, mei: 5, may: 5, jun: 6, juni: 6,
  jul: 7, juli: 7, agu: 8, agt: 8, agustus: 8, aug: 8, sep: 9, sept: 9, september: 9, okt: 10, oktober: 10, oct: 10,
  nov: 11, november: 11, des: 12, desember: 12, dec: 12,
};

const dua = (n: number) => String(n).padStart(2, "0");

function valid(y: number, m: number, d: number): string | null {
  if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1) return null;
  const hariDalamBulan = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return d <= hariDalamBulan ? `${y}-${dua(m)}-${dua(d)}` : null;
}

/** Tanggal dari serial Excel atau teks (YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, "1 Jan 2026"). Null bila kosong atau tidak valid. */
export function parseTanggal(v: Sel | undefined): string | null {
  if (v == null || v === "") return null;
  if (typeof v === "number") {
    const k = XLSX.SSF.parse_date_code(v);
    return k ? valid(k.y, k.m, k.d) : null;
  }
  const s = String(v).trim();
  let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (m) return valid(+m[1], +m[2], +m[3]);
  m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (m) return valid(+m[3], +m[2], +m[1]);
  m = s.match(/^(\d{1,2})\s+([A-Za-z]+)\.?\s+(\d{4})$/);
  if (m && BULAN[m[2].toLowerCase()]) return valid(+m[3], BULAN[m[2].toLowerCase()], +m[1]);
  return null;
}

const teks = (v: Sel | undefined): string | null => {
  if (v == null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
};

const angka = (v: Sel | undefined): number | null => {
  if (v == null || v === "") return null;
  if (typeof v === "number") return Math.round(v);
  const digit = String(v).replace(/[^0-9]/g, "");
  return digit ? Number(digit) : null;
};

/** Membaca workbook menjadi baris per sheet; kunci kolom sudah dinormalkan dengan `slug`. */
export function bacaWorkbook(buffer: ArrayBuffer): Record<string, Baris[]> {
  const wb = XLSX.read(buffer, { type: "array", cellDates: false });
  const hasil: Record<string, Baris[]> = {};
  for (const nama of wb.SheetNames) {
    const mentah = XLSX.utils.sheet_to_json<Record<string, Sel>>(wb.Sheets[nama], { defval: null, raw: true });
    hasil[slug(nama)] = mentah.map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [slug(k), v])));
  }
  return hasil;
}

export type Kontrak = { kontrak_ke: string; awal_kontrak: string; akhir_kontrak: string; penilaian: string | null; folder_link: string | null };

export type KaryawanImpor = {
  baris: number;
  np: string;
  nama: string;
  kode_bagan: string | null;
  unit_kerja: string | null;
  jabatan: string | null;
  level: string | null;
  role: string | null;
  benefit_kesehatan: string | null;
  faskes: string | null;
  gross_per_month: number | null;
  kpi: string | null;
  awal_kontrak: string | null;
  awal_kontrak_aktif: string | null;
  akhir_kontrak: string | null;
  kontrak: Kontrak[];
  detail: Record<string, string | null>;
};

export type Hasil<T> = { data: T[]; galat: string[] };

/** Pasangan kolom kontrak berurutan: awal_kontrak/akhir_kontrak, awal_kontrak2/akhir_kontrak2, ... (maksimal 10). */
function bacaKontrakBerurutan(r: Baris): Kontrak[] {
  // Judul "awal_kontrak2" (format Laravel) maupun "Awal Kontrak 2" (-> awal_kontrak_2) diterima
  const ambil = (dasar: string, i: number) => (i === 1 ? r[dasar] : r[`${dasar}${i}`] ?? r[`${dasar}_${i}`]);
  const daftar: Kontrak[] = [];
  for (let i = 1; i <= 10; i++) {
    const awal = parseTanggal(ambil("awal_kontrak", i));
    const akhir = parseTanggal(ambil("akhir_kontrak", i));
    if (awal && akhir) {
      daftar.push({
        kontrak_ke: `Kontrak ${teks(ambil("kontrak", i)) ?? daftar.length + 1}`,
        awal_kontrak: awal,
        akhir_kontrak: akhir,
        penilaian: teks(ambil("penilaian", i)),
        folder_link: teks(ambil("folder", i)),
      });
    }
  }
  return daftar;
}

export function bacaKaryawan(rows: Baris[], config: KategoriConfig | null, namaKategori: string | null = null): Hasil<KaryawanImpor> {
  const pilihan = pilihanStandar(namaKategori);
  const data: KaryawanImpor[] = [];
  const galat: string[] = [];
  const dilihat = new Set<string>();

  rows.forEach((r, i) => {
    const baris = i + 2; // baris 1 = judul kolom
    const np = teks(r.np);
    if (!np) return; // baris kosong dilewati diam-diam, seperti di Laravel
    const nama = teks(r.nama);
    if (!nama) return void galat.push(`Baris ${baris}: nama kosong`);
    if (dilihat.has(np)) return void galat.push(`Baris ${baris}: NP ${np} muncul dua kali di file`);
    dilihat.add(np);

    const kontrak = bacaKontrakBerurutan(r);
    for (const k of kontrak) {
      if (k.akhir_kontrak <= k.awal_kontrak) return void galat.push(`Baris ${baris}: ${k.kontrak_ke} berakhir sebelum mulai`);
    }

    const detail: Record<string, string | null> = {};
    for (const f of config?.fields ?? []) {
      const nilai = f.type === "date" ? parseTanggal(r[slug(f.label)] ?? r[f.name]) : teks(r[slug(f.label)] ?? r[f.name]);
      if (nilai && f.type === "select" && !f.options?.map((o) => o.toLowerCase()).includes(nilai.toLowerCase())) {
        return void galat.push(`Baris ${baris}: ${f.label} "${nilai}" tidak valid (pilihan: ${f.options?.join(", ")})`);
      }
      if (f.required && !nilai) return void galat.push(`Baris ${baris}: ${f.label} wajib diisi`);
      // seragamkan huruf besar-kecil ke pilihan resmi
      detail[f.name] = nilai && f.type === "select" ? (f.options?.find((o) => o.toLowerCase() === nilai.toLowerCase()) ?? nilai) : nilai;
    }
    if (detail.awal_pendidikan && detail.akhir_pendidikan && detail.akhir_pendidikan < detail.awal_pendidikan) {
      return void galat.push(`Baris ${baris}: akhir pendidikan sebelum awal pendidikan`);
    }

    // Kolom standar berpilihan (mis. Level di IDH): wajib salah satu pilihan, huruf besar-kecil diseragamkan
    let level = teks(r.level);
    const opsiLevel = pilihan.level;
    if (opsiLevel) {
      const cocok = opsiLevel.find((o) => o.toLowerCase() === level?.toLowerCase());
      if (!cocok) return void galat.push(`Baris ${baris}: Level ${level ? `"${level}" tidak valid` : "wajib diisi"} (pilihan: ${opsiLevel.join(", ")})`);
      level = cocok;
    }

    const terakhir = kontrak[kontrak.length - 1];
    data.push({
      baris,
      np,
      nama,
      kode_bagan: teks(r.kode_bagan),
      unit_kerja: teks(r.unit_kerja),
      jabatan: teks(r.jabatan),
      level,
      role: teks(r.role),
      benefit_kesehatan: teks(r.benefit_kesehatan),
      faskes: teks(r.faskes),
      gross_per_month: angka(r.gross_per_month),
      kpi: teks(r.kpi),
      awal_kontrak: kontrak[0]?.awal_kontrak ?? null,
      awal_kontrak_aktif: terakhir?.awal_kontrak ?? null,
      akhir_kontrak: terakhir?.akhir_kontrak ?? null,
      kontrak,
      detail,
    });
  });
  return { data, galat };
}

export type TerminateImpor = { baris: number; np: string; nama: string | null; awal_kontrak: string | null; akhir_kontrak: string | null; kode_bagan: string | null; unit_kerja: string | null; jabatan: string | null; level: string | null; role: string | null; tanggal_keluar: string | null; alasan_keluar: string | null };

export function bacaTerminate(rows: Baris[]): Hasil<TerminateImpor> {
  const data: TerminateImpor[] = [];
  const galat: string[] = [];
  rows.forEach((r, i) => {
    const np = teks(r.np);
    if (!np) return;
    const tanggal = parseTanggal(r.tanggal_keluar);
    if (!tanggal) return void galat.push(`Terminate baris ${i + 2}: tanggal keluar kosong atau tidak valid`);
    data.push({
      baris: i + 2, np, nama: teks(r.nama), awal_kontrak: parseTanggal(r.awal_kontrak), akhir_kontrak: parseTanggal(r.akhir_kontrak),
      kode_bagan: teks(r.kode_bagan), unit_kerja: teks(r.unit_kerja), jabatan: teks(r.jabatan), level: teks(r.level), role: teks(r.role),
      tanggal_keluar: tanggal, alasan_keluar: teks(r.alasan_keluar),
    });
  });
  return { data, galat };
}

export type KontrakImpor = { np: string; kontrak: Kontrak[] };

/** Sheet "Kontrak": kolom kontrak, awal_kontrak, akhir_kontrak, penilaian, folder (+ akhiran 2..10). */
export function bacaSheetKontrak(rows: Baris[]): KontrakImpor[] {
  return rows.flatMap((r) => {
    const np = teks(r.np);
    if (!np) return [];
    const kontrak = bacaKontrakBerurutan(r);
    return [{ np, kontrak }];
  });
}

export type DataDiriImpor = { np: string; ktp: string | null; peringatan: string | null; nilai: Record<string, string | null> };

export function bacaDataDiri(rows: Baris[]): DataDiriImpor[] {
  return rows.flatMap((r, i) => {
    const np = teks(r.np);
    if (!np) return [];
    const digit = teks(r.no_ktp)?.replace(/\D/g, "") ?? null;
    const ktpValid = digit && digit.length === 16 ? digit : null;
    return [{
      np,
      ktp: ktpValid,
      peringatan: digit && !ktpValid ? `Data diri baris ${i + 2}: No KTP ${np} tidak 16 digit, dikosongkan` : null,
      nilai: {
        tempat_lahir: teks(r.tempat),
        tanggal_lahir: parseTanggal(r.tanggal_lahir),
        alamat: teks(r.alamat),
        rt: teks(r.rt),
        rw: teks(r.rw),
        kelurahan: teks(r.kelurahan),
        kecamatan: teks(r.kecamatan),
        kabupaten: teks(r.kabupaten),
        provinsi: teks(r.provinsi),
        jenjang_1: teks(r.jenjang),
        jurusan_1: teks(r.jurusan),
        kampus_1: teks(r.nama_perguruan_tinggi),
        jenjang_2: teks(r.jenjang_terakhir),
        jurusan_2: teks(r.jurusan_terakhir),
        kampus_2: teks(r.nama_perguruan_tinggi_terakhir),
      },
    }];
  });
}
