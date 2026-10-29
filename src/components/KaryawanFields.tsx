"use client";

import { Fragment, useState } from "react";
import { configKategori, kolomDisembunyikan, pilihanStandar, type DetailField } from "@/lib/kategori-config";
import type { Detail, Karyawan, Kategori } from "@/lib/types";

type Props = {
  kategori: Kategori[];
  isSuperAdmin: boolean;
  kategoriAdmin?: string | null;
  karyawan?: Karyawan;
  detail?: Detail | null;
  kategoriAwalId?: number;
  mode: "baru" | "ubah";
  /** Daftar bagan aktif. Bila terisi, Kode Bagan dipilih dari daftar dan Unit Kerja terisi otomatis. */
  bagan?: { kode: string; nama_unit: string }[];
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

/** Satu kelompok isian: judul kecil dan grid dua kolom; kelompok setelah yang pertama dipisah garis tipis. */
function Bagian({ judul, lencana, children }: { judul: string; lencana?: string; children: React.ReactNode }) {
  return (
    <section className="[&:not(:first-child)]:border-t [&:not(:first-child)]:border-line [&:not(:first-child)]:pt-5">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">
        {judul}
        {lencana && <span className="ml-2 rounded-full bg-primary-soft px-2 py-0.5 align-[2px] text-[11px] font-semibold normal-case tracking-normal text-primary">{lencana}</span>}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
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
      ) : field.type === "number" ? (
        <input className="input" id={id} name={id} type="number" min={0} step={1} defaultValue={value ?? ""} required={field.required} />
      ) : (
        <input className="input" id={id} name={id} type={field.type} defaultValue={value ?? ""} required={field.required} />
      )}
    </div>
  );
}

/** Isian karyawan: kolom standar dan, bila kategorinya punya, kolom khusus kategori. */
export default function KaryawanFields({ kategori, isSuperAdmin, kategoriAdmin, karyawan: k, detail, mode, kategoriAwalId, bagan = [] }: Props) {
  const [kategoriId, setKategoriId] = useState(String(k?.kategori_id ?? kategoriAwalId ?? ""));
  const namaTerpilih = isSuperAdmin ? kategori.find((c) => String(c.id) === kategoriId)?.nama : kategoriAdmin;
  const config = configKategori(namaTerpilih);
  const disembunyikan = kolomDisembunyikan(namaTerpilih);
  const pilihan = pilihanStandar(namaTerpilih);
  const tampil = (kolom: string) => !disembunyikan.includes(kolom);
  const [kodeBagan, setKodeBagan] = useState(k?.kode_bagan ?? "");
  const [unitKerja, setUnitKerja] = useState(k?.unit_kerja ?? "");
  const unitDariDaftar = bagan.find((b) => b.kode === kodeBagan.trim().toUpperCase())?.nama_unit;

  const adaKompensasi = ["benefit_kesehatan", "faskes", "gross_per_month", "kpi"].some(tampil);

  return (
    <div className="space-y-5">
      <Bagian judul="Identitas">
        <Field name="np" label="NP" defaultValue={k?.np} required />
        <Field name="nama" label="Nama" defaultValue={k?.nama} required />
        <div>
          <label className="label" htmlFor="kategori_id">{config?.fields.some((f) => f.label === "Kategori") ? "Kategori Utama" : "Kategori"}</label>
          {isSuperAdmin ? (
            <select className="input" id="kategori_id" name="kategori_id" value={kategoriId} onChange={(e) => setKategoriId(e.target.value)} required>
              <option value="">-- Pilih Kategori --</option>
              {kategori.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
            </select>
          ) : (
            <input className="input bg-soft" value={kategoriAdmin ?? ""} readOnly />
          )}
        </div>
      </Bagian>

      {config && config.fields.length > 0 && (
        <Bagian judul="Data kategori" lencana={namaTerpilih ?? undefined}>
          {config.fields.map((f) => (
            <Fragment key={f.name}>
              {f.bagian && <h3 className="border-t border-line pt-4 font-semibold sm:col-span-2">{f.bagian}</h3>}
              <DetailInput field={f} value={detail?.[f.name]} />
            </Fragment>
          ))}
        </Bagian>
      )}

      {mode === "baru" && (
        <Bagian judul="Kontrak">
          <Field name="awal_kontrak" label="Awal Kontrak" type="date" required />
          <Field name="akhir_kontrak" label="Akhir Kontrak" type="date" required />
        </Bagian>
      )}

      <Bagian judul="Penempatan">
        <div>
          <label className="label" htmlFor="kode_bagan">Kode Bagan</label>
          <input
            className="input"
            id="kode_bagan"
            name="kode_bagan"
            value={kodeBagan}
            onChange={(e) => setKodeBagan(e.target.value)}
            list={bagan.length ? "daftar-bagan" : undefined}
            placeholder={bagan.length ? "Ketik kode atau nama unit" : undefined}
            autoComplete="off"
          />
          {bagan.length > 0 && <datalist id="daftar-bagan">{bagan.map((b) => <option key={b.kode} value={b.kode}>{b.nama_unit}</option>)}</datalist>}
        </div>
        <div>
          <label className="label" htmlFor="unit_kerja">Unit Kerja</label>
          <input
            className={`input ${unitDariDaftar ? "bg-soft" : ""}`}
            id="unit_kerja"
            name="unit_kerja"
            value={unitDariDaftar ?? unitKerja}
            onChange={(e) => setUnitKerja(e.target.value)}
            readOnly={Boolean(unitDariDaftar)}
          />
          {unitDariDaftar && <p className="mt-1 text-xs text-muted">Terisi otomatis dari daftar bagan.</p>}
        </div>
        {tampil("jabatan") && <Field name="jabatan" label="Jabatan" defaultValue={k?.jabatan} />}
        {tampil("level") && pilihan.level && (
          <div>
            <label className="label" htmlFor="level">Level</label>
            <select className="input" id="level" name="level" defaultValue={k?.level && pilihan.level.includes(k.level) ? k.level : ""} required>
              <option value="">-- Pilih Level --</option>
              {pilihan.level.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        )}
        {tampil("level") && !pilihan.level && <Field name="level" label="Level" defaultValue={k?.level} />}
        {tampil("role") && <Field name="role" label="Role" defaultValue={k?.role} />}
      </Bagian>

      {adaKompensasi && (
        <Bagian judul="Kompensasi">
          {tampil("benefit_kesehatan") && <Field name="benefit_kesehatan" label="Benefit Kesehatan" defaultValue={k?.benefit_kesehatan} />}
          {tampil("faskes") && <Field name="faskes" label="Faskes" defaultValue={k?.faskes} />}
          {tampil("gross_per_month") && <Field name="gross_per_month" label="Gross per Bulan" type="number" defaultValue={k?.gross_per_month} />}
          {tampil("kpi") && <Field name="kpi" label="KPI" defaultValue={k?.kpi} />}
        </Bagian>
      )}

      <Bagian judul="Lainnya">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="folder_link">Link Folder Dokumen</label>
          <input className="input" id="folder_link" name="folder_link" type="url" defaultValue={k?.folder_link ?? ""} placeholder="https://" />
        </div>
      </Bagian>
    </div>
  );
}

