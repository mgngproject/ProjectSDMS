export type Profile = {
  id: string;
  nama: string;
  jabatan: string | null;
  role: "admin" | "superadmin";
  kategori_id: number | null;
  kategori: { nama: string } | null;
};

export type Kategori = { id: number; nama: string };

export type Karyawan = {
  id: number;
  np: string;
  nama: string;
  kategori_id: number;
  kode_bagan: string | null;
  unit_kerja: string | null;
  jabatan: string | null;
  level: string | null;
  role: string | null;
  benefit_kesehatan: string | null;
  faskes: string | null;
  gross_per_month: number | null;
  kpi: string | null;
  folder_link: string | null;
  awal_kontrak: string | null;
  awal_kontrak_aktif: string | null;
  akhir_kontrak: string | null;
  status: "aktif" | "terminate";
  tanggal_keluar: string | null;
  alasan_keluar: string | null;
  kategori?: { nama: string } | null;
};

export type Kontrak = {
  id: number;
  karyawan_id: number;
  kontrak_ke: string;
  np: string | null;
  awal_kontrak: string | null;
  akhir_kontrak: string | null;
  penilaian: string | null;
  folder_link: string | null;
  status: "aktif" | "selesai" | "terminate";
};

export type DataDiri = {
  id: number;
  karyawan_id: number;
  ktp: string | null;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  alamat: string | null;
  rt: string | null;
  rw: string | null;
  kelurahan: string | null;
  kecamatan: string | null;
  kabupaten: string | null;
  provinsi: string | null;
  jenjang_1: string | null;
  jurusan_1: string | null;
  kampus_1: string | null;
  jenjang_2: string | null;
  jurusan_2: string | null;
  kampus_2: string | null;
};
