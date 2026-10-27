import { tambahBulan, tambahHari } from "@/lib/format";

// Konfigurasi kolom khusus per kategori. Kategori yang tidak terdaftar memakai kolom standar.
// Menambah kategori lain (PKWT, Inagov, ...) = tambah satu entri di sini dan satu tabel detail di database.

export type DetailField = {
  name: string;
  label: string;
  type: "text" | "date" | "select" | "textarea";
  options?: string[];
  required?: boolean;
};

export type KategoriConfig = {
  /** Tabel detail (1 baris per karyawan, kunci: karyawan_id). */
  tabel: string;
  /** Kolom standar karyawan yang tidak dipakai kategori ini (disembunyikan di form). */
  sembunyikan: string[];
  fields: DetailField[];
  /** Urutan kolom pada tabel dan export: kolom standar atau nama field detail. */
  kolomTabel: string[];
};

/** Label kolom standar karyawan. */
export const LABEL_INTI: Record<string, string> = {
  np: "NP",
  nama: "Nama",
  kategori: "Kategori",
  kode_bagan: "Kode Bagan",
  unit_kerja: "Unit Kerja",
  jabatan: "Jabatan",
  level: "Level",
  role: "Role",
  benefit_kesehatan: "Benefit Kesehatan",
  faskes: "Faskes",
  gross_per_month: "Gross per Bulan",
  kpi: "KPI",
  awal_kontrak: "Awal Kontrak",
  akhir_kontrak: "Akhir Kontrak",
  masa_kerja: "Masa Kerja",
  masa_kontrak: "Masa Kontrak",
  folder_link: "Link Folder",
};

export const KATEGORI_CONFIG: Record<string, KategoriConfig> = {
  IDE: {
    tabel: "karyawan_ide",
    sembunyikan: ["faskes"],
    fields: [],
    kolomTabel: [
      "np", "nama", "awal_kontrak", "akhir_kontrak", "masa_kerja", "masa_kontrak",
      "unit_kerja", "jabatan", "level", "role", "gross_per_month",
    ],
  },
  IDH: {
    tabel: "karyawan_idh",
    sembunyikan: ["faskes"],
    fields: [],
    kolomTabel: [
      "np", "nama", "awal_kontrak", "akhir_kontrak", "masa_kerja", "masa_kontrak",
      "unit_kerja", "jabatan", "level", "role", "gross_per_month",
    ],
  },
  "TPBW/TPP": {
    tabel: "karyawan_tpbw",
    sembunyikan: [],
    fields: [{ name: "status_tpbw", label: "Status", type: "select", options: ["TPBW", "TPP"], required: true }],
    kolomTabel: [
      "np", "nama", "status_tpbw", "awal_kontrak", "akhir_kontrak", "masa_kerja", "masa_kontrak",
      "unit_kerja", "jabatan", "level", "role", "gross_per_month",
    ],
  },
  Magang: {
    tabel: "karyawan_magang",
    sembunyikan: ["jabatan", "level", "role", "benefit_kesehatan", "faskes", "gross_per_month", "kpi"],
    fields: [
      { name: "jenis", label: "Kategori", type: "select", options: ["Magenta", "PKL", "Maganghub"], required: true },
      { name: "institusi", label: "Universitas/Sekolah", type: "text", required: true },
      { name: "jurusan", label: "Jurusan", type: "text" },
      { name: "penempatan", label: "Penempatan", type: "select", options: ["Jakarta", "Karawang"], required: true },
      { name: "status_magang", label: "Status", type: "select", options: ["Baru", "Alih Status", "Perpanjangan Maganghub"], required: true },
      { name: "awal_pendidikan", label: "Awal Pendidikan", type: "date" },
      { name: "akhir_pendidikan", label: "Akhir Pendidikan", type: "date" },
      { name: "catatan_titipan", label: "Catatan Titipan", type: "textarea" },
    ],
    kolomTabel: [
      "np", "nama", "jenis", "institusi", "jurusan", "awal_kontrak", "akhir_kontrak", "kode_bagan", "unit_kerja",
      "penempatan", "status_magang", "awal_pendidikan", "akhir_pendidikan", "catatan_titipan", "masa_kerja",
    ],
  },
};

export type Jendela = {
  /** Teks untuk judul dan label, mis. "2 bulan". */
  label: string;
  /** Batas akhir jendela (YYYY-MM-DD) dihitung dari hari ini. */
  sampai: (hariIni: string) => string;
  /** Dashboard menampilkan kartu "Berakhir" menggantikan kartu berkas. */
  fokus: boolean;
};

// Jendela "akan selesai" di dashboard per kategori; kategori lain memakai 60 hari.
const JENDELA_KHUSUS: Record<string, Jendela> = {
  Magang: { label: "30 hari", sampai: (h) => tambahHari(h, 30), fokus: true },
  "TPBW/TPP": { label: "2 bulan", sampai: (h) => tambahBulan(h, 2), fokus: true },
  IDE: { label: "1 bulan", sampai: (h) => tambahBulan(h, 1), fokus: true },
  IDH: { label: "1 bulan", sampai: (h) => tambahBulan(h, 1), fokus: true },
};
const JENDELA_UMUM: Jendela = { label: "60 hari", sampai: (h) => tambahHari(h, 60), fokus: false };

export function jendelaKategori(nama: string | null | undefined): Jendela {
  return (nama && JENDELA_KHUSUS[nama]) || JENDELA_UMUM;
}

export function configKategori(nama: string | null | undefined): KategoriConfig | null {
  return nama ? KATEGORI_CONFIG[nama] ?? null : null;
}

export function labelKolom(key: string, config: KategoriConfig): string {
  return config.fields.find((f) => f.name === key)?.label ?? LABEL_INTI[key] ?? key;
}
