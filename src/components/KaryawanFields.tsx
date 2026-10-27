"use client";

import { useState } from "react";
import { configKategori, type DetailField } from "@/lib/kategori-config";
import type { Detail, Karyawan, Kategori } from "@/lib/types";

type Props = {
  kategori: Kategori[];
  isSuperAdmin: boolean;
  kategoriAdmin?: string | null;
  karyawan?: Karyawan;
  detail?: Detail | null;
  mode: "baru" | "ubah";
  /** Tautan sementara foto saat ini (mode ubah). */
  fotoUrl?: string | null;
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

function DetailInput({ field, value }: { field: DetailField; value: string | null | undefined }) {
  const id = `detail_${field.name}`;
  return (
    <div className={field.type === "textarea" ? "sm:col-span-2" : undefined}>
      <label className="label" htmlFor={id}>{field.label}</label>
      {field.type === "select" ? (
        <select className="input" id={id} name={id} defaultValue={value ?? ""} required={field.required}>
          <option value="">-- Pilih --</option>
          {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : field.type === "textarea" ? (
        <textarea className="input" id={id} name={id} rows={2} defaultValue={value ?? ""} required={field.required} />
      ) : (
        <input className="input" id={id} name={id} type={field.type} defaultValue={value ?? ""} required={field.required} />
      )}
    </div>
  );
}

/** Isian karyawan: kolom standar dan, bila kategorinya punya, kolom khusus kategori. */
export default function KaryawanFields({ kategori, isSuperAdmin, kategoriAdmin, karyawan: k, detail, mode, fotoUrl }: Props) {
  const [kategoriId, setKategoriId] = useState(String(k?.kategori_id ?? ""));
  const namaTerpilih = isSuperAdmin ? kategori.find((c) => String(c.id) === kategoriId)?.nama : kategoriAdmin;
  const config = configKategori(namaTerpilih);
  const tampil = (kolom: string) => !config?.sembunyikan.includes(kolom);

  return (
    <>
      <Field name="np" label="NP" defaultValue={k?.np} required />
      <Field name="nama" label="Nama" defaultValue={k?.nama} required />
      <div>
        <label className="label" htmlFor="kategori_id">Kategori</label>
        {isSuperAdmin ? (
          <select className="input" id="kategori_id" name="kategori_id" value={kategoriId} onChange={(e) => setKategoriId(e.target.value)} required>
            <option value="">-- Pilih Kategori --</option>
            {kategori.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
          </select>
        ) : (
          <input className="input bg-soft" value={kategoriAdmin ?? ""} readOnly />
        )}
      </div>

      {config && config.fields.map((f) => <DetailInput key={f.name} field={f} value={detail?.[f.name]} />)}

      {mode === "baru" && (
        <>
          <Field name="awal_kontrak" label="Awal Kontrak" type="date" required />
          <Field name="akhir_kontrak" label="Akhir Kontrak" type="date" required />
        </>
      )}
      <Field name="kode_bagan" label="Kode Bagan" defaultValue={k?.kode_bagan} />
      <Field name="unit_kerja" label="Unit Kerja" defaultValue={k?.unit_kerja} />
      {tampil("jabatan") && <Field name="jabatan" label="Jabatan" defaultValue={k?.jabatan} />}
      {tampil("level") && <Field name="level" label="Level" defaultValue={k?.level} />}
      {tampil("role") && <Field name="role" label="Role" defaultValue={k?.role} />}
      {tampil("benefit_kesehatan") && <Field name="benefit_kesehatan" label="Benefit Kesehatan" defaultValue={k?.benefit_kesehatan} />}
      {tampil("faskes") && <Field name="faskes" label="Faskes" defaultValue={k?.faskes} />}
      {tampil("gross_per_month") && <Field name="gross_per_month" label="Gross per Bulan" type="number" defaultValue={k?.gross_per_month} />}
      {tampil("kpi") && <Field name="kpi" label="KPI" defaultValue={k?.kpi} />}
      <Field name="folder_link" label="Link Folder Dokumen" type="url" defaultValue={k?.folder_link} />
      <div className="sm:col-span-2">
        <label className="label" htmlFor="foto">Foto (JPG atau PNG, maks 2 MB)</label>
        <div className="flex items-center gap-3">
          {fotoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fotoUrl} alt="Foto saat ini" className="h-16 w-16 rounded-xl object-cover" />
          )}
          <input className="input" id="foto" name="foto" type="file" accept="image/jpeg,image/png" />
        </div>
        {fotoUrl && <p className="mt-1 text-xs text-muted">Pilih berkas baru untuk mengganti foto.</p>}
      </div>
    </>
  );
}

