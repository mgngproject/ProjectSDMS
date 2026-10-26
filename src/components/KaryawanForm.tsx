import type { Karyawan, Kategori } from "@/lib/types";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  kategori: Kategori[];
  isSuperAdmin: boolean;
  kategoriAdmin?: string | null;
  karyawan?: Karyawan;
  /** `baru`: awal dan akhir kontrak wajib. `ubah`: tanggal kontrak diatur lewat menu Kontrak. */
  mode: "baru" | "ubah";
  batal: string;
};

function Field({ name, label, type = "text", defaultValue, required }: {
  name: string; label: string; type?: string; defaultValue?: string | number | null; required?: boolean;
}) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input className="input" id={name} name={name} type={type} defaultValue={defaultValue ?? ""} required={required} />
    </div>
  );
}

export default function KaryawanForm({ action, kategori, isSuperAdmin, kategoriAdmin, karyawan: k, mode, batal }: Props) {
  return (
    <form action={action} className="grid max-w-3xl gap-4 card p-4 sm:grid-cols-2">
      <Field name="np" label="NP" defaultValue={k?.np} required />
      <Field name="nama" label="Nama" defaultValue={k?.nama} required />
      <div>
        <label className="label" htmlFor="kategori_id">Kategori</label>
        {isSuperAdmin ? (
          <select className="input" id="kategori_id" name="kategori_id" defaultValue={k?.kategori_id ?? ""} required>
            <option value="">-- Pilih Kategori --</option>
            {kategori.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
          </select>
        ) : (
          <input className="input bg-soft" value={kategoriAdmin ?? ""} readOnly />
        )}
      </div>
      {mode === "baru" && (
        <>
          <Field name="awal_kontrak" label="Awal Kontrak" type="date" required />
          <Field name="akhir_kontrak" label="Akhir Kontrak" type="date" required />
        </>
      )}
      <Field name="kode_bagan" label="Kode Bagan" defaultValue={k?.kode_bagan} />
      <Field name="unit_kerja" label="Unit Kerja" defaultValue={k?.unit_kerja} />
      <Field name="jabatan" label="Jabatan" defaultValue={k?.jabatan} />
      <Field name="level" label="Level" defaultValue={k?.level} />
      <Field name="role" label="Role" defaultValue={k?.role} />
      <Field name="benefit_kesehatan" label="Benefit Kesehatan" defaultValue={k?.benefit_kesehatan} />
      <Field name="faskes" label="Faskes" defaultValue={k?.faskes} />
      <Field name="gross_per_month" label="Gross per Bulan" type="number" defaultValue={k?.gross_per_month} />
      <Field name="kpi" label="KPI" defaultValue={k?.kpi} />
      <Field name="folder_link" label="Link Folder Dokumen" type="url" defaultValue={k?.folder_link} />
      <div className="flex gap-2 sm:col-span-2">
        <button className="btn" type="submit">Simpan</button>
        <a className="btn-secondary" href={batal}>Batal</a>
      </div>
    </form>
  );
}
