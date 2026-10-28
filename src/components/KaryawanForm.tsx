import KaryawanFields from "@/components/KaryawanFields";
import type { Detail, Karyawan, Kategori } from "@/lib/types";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  kategori: Kategori[];
  isSuperAdmin: boolean;
  kategoriAdmin?: string | null;
  karyawan?: Karyawan;
  detail?: Detail | null;
  /** Kategori yang terpilih sejak awal (mis. dari submenu Super Admin). */
  kategoriAwalId?: number;
  /** `baru`: awal dan akhir kontrak wajib. `ubah`: tanggal kontrak diatur lewat menu Kontrak. */
  mode: "baru" | "ubah";
  /** Daftar bagan aktif untuk pilihan Kode Bagan. */
  bagan?: { kode: string; nama_unit: string }[];
  batal: string;
};

export default function KaryawanForm({ action, batal, ...fields }: Props) {
  return (
    <form action={action} className="card grid max-w-3xl gap-4 p-5 sm:grid-cols-2">
      <KaryawanFields {...fields} />
      <div className="flex gap-2 sm:col-span-2">
        <button className="btn" type="submit">Simpan</button>
        <a className="btn-secondary" href={batal}>Batal</a>
      </div>
    </form>
  );
}
