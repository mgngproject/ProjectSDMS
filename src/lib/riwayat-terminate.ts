// Riwayat terminate (tabel riwayat_terminate, migrasi 0025). Pencatatan dilakukan trigger di database.
export type Kejadian = "terminate" | "diubah" | "diaktifkan_kembali" | "dihapus";

export type RiwayatTerminate = {
  id: number;
  karyawan_id: number;
  np: string;
  nama: string;
  kejadian: Kejadian;
  tanggal: string;
  tanggal_keluar: string | null;
  alasan: string | null;
  keterangan: string | null;
  dibuat_oleh_nama: string | null;
  kategori: { nama: string } | null;
};

export const KEJADIAN: Record<Kejadian, { label: string; kelas: string }> = {
  terminate: { label: "Terminate", kelas: "pill-danger" },
  diubah: { label: "Diubah", kelas: "pill-warning" },
  diaktifkan_kembali: { label: "Diaktifkan kembali", kelas: "pill-success" },
  dihapus: { label: "Dihapus dari data", kelas: "pill bg-soft text-muted" },
};

export const KOLOM_RIWAYAT = "id, karyawan_id, np, nama, kejadian, tanggal, tanggal_keluar, alasan, keterangan, dibuat_oleh_nama, kategori:kategori_id(nama)";
