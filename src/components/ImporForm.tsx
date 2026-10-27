import { FileSpreadsheet } from "lucide-react";
import type { Kategori } from "@/lib/types";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  /** Hanya Super Admin yang memilih kategori; admin selalu memakai kategorinya. */
  kategori?: Kategori[];
  kategoriDipilih?: string | null;
};

export default function ImporForm({ action, kategori, kategoriDipilih }: Props) {
  const templateHref = `/api/template/karyawan${kategoriDipilih ? `?kategori=${encodeURIComponent(kategoriDipilih)}` : ""}`;

  return (
    <details className="group relative">
      <summary className="btn-secondary cursor-pointer list-none">
        <FileSpreadsheet size={16} /> Import Excel
      </summary>
      <form action={action} className="card absolute right-0 z-20 mt-2 w-80 space-y-3 p-4">
        <p className="text-sm text-muted">
          Format sama dengan versi lama: sheet <b>Database</b>, <b>Mail Merge</b>, <b>Terminate</b>, dan <b>Kontrak</b>. File tanpa nama sheet dibaca sebagai Database.
        </p>
        {kategori && (
          <div>
            <label className="label" htmlFor="impor_kategori">Kategori data</label>
            <select className="input" id="impor_kategori" name="kategori_id" required defaultValue={kategori.find((k) => k.nama === kategoriDipilih)?.id ?? ""}>
              <option value="">-- Pilih Kategori --</option>
              {kategori.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="label" htmlFor="impor_file">File (.xlsx, .xls, .csv — maks 3 MB)</label>
          <input className="input" id="impor_file" name="file" type="file" accept=".xlsx,.xls,.csv" required />
        </div>
        <div className="flex items-center justify-between gap-2">
          <button className="btn" type="submit">Import</button>
          <a className="link text-sm" href={templateHref}>Unduh template</a>
        </div>
      </form>
    </details>
  );
}
