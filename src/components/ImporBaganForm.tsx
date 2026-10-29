"use client";

import { FileSpreadsheet } from "lucide-react";
import { useState } from "react";

/** Form import daftar bagan. Pilihan "ganti seluruh daftar" menghapus kode lama yang tidak ada di file, jadi meminta konfirmasi. */
export default function ImporBaganForm({ action, jumlahKode }: { action: (formData: FormData) => void | Promise<void>; jumlahKode: number }) {
  const [ganti, setGanti] = useState(false);
  return (
    <details className="group relative">
      <summary className="btn-secondary cursor-pointer list-none"><FileSpreadsheet size={16} /> Import Excel</summary>
      <form
        action={action}
        className="card absolute right-0 z-20 mt-2 w-80 space-y-3 p-4"
        onSubmit={(e) => {
          if (ganti && !window.confirm(`Seluruh daftar (${jumlahKode} kode) akan diganti dengan isi file. Kode yang tidak ada di file dihapus. Lanjutkan?`)) e.preventDefault();
        }}
      >
        <p className="text-sm text-muted">
          Judul kolom: <b>Kode</b>, <b>Nama Unit</b>, dan (opsional) <b>Atasan</b>. Kode yang sudah ada diperbarui, yang baru ditambahkan. Unit kerja karyawan ikut disamakan.
        </p>
        <input className="input" name="file" type="file" accept=".xlsx,.xls,.csv" required aria-label="File daftar bagan" />
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="ganti" value="1" className="mt-1" checked={ganti} onChange={(e) => setGanti(e.target.checked)} />
          <span>
            <b>Ganti seluruh daftar</b>
            <span className="block text-xs text-muted">Kode lama yang tidak ada di file ikut dihapus, dan semua kode di file diaktifkan. Data karyawan tidak dihapus.</span>
          </span>
        </label>
        <button className={ganti ? "btn-danger !px-4 !py-2 !text-sm" : "btn"} type="submit">{ganti ? "Ganti seluruh daftar" : "Import"}</button>
      </form>
    </details>
  );
}
