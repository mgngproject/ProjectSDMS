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
    <form action={action} className="card p-5">
      <KaryawanFields {...fields} />
      {/* Tombol menempel di bawah layar saat form panjang digulir */}
      <div className="sticky bottom-0 -mx-5 -mb-5 mt-5 flex gap-2 rounded-b-2xl border-t border-line bg-card/90 px-5 py-3 backdrop-blur">
        <button className="btn" type="submit">Simpan</button>
        <a className="btn-secondary" href={batal}>Batal</a>
      </div>
    </form>
  );
}
