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
