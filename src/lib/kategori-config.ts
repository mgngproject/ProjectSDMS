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
  /** Jendela "akan selesai" di dashboard (hari). */
  jendelaHari: number;
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
  Magang: {
    tabel: "karyawan_magang",
    sembunyikan: ["jabatan", "level", "role", "benefit_kesehatan", "faskes", "gross_per_month", "kpi"],
    jendelaHari: 30,
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

export function configKategori(nama: string | null | undefined): KategoriConfig | null {
  return nama ? KATEGORI_CONFIG[nama] ?? null : null;
}

export function labelKolom(key: string, config: KategoriConfig): string {
  return config.fields.find((f) => f.name === key)?.label ?? LABEL_INTI[key] ?? key;
}
