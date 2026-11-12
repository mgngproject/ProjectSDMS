import { FileSpreadsheet } from "lucide-react";
import TombolKirim from "@/components/TombolKirim";

/** Tombol import laporan perpanjangan kontrak (hanya ditampilkan untuk Super Admin). */
export default function ImporPerpanjanganForm({ action }: { action: (formData: FormData) => void | Promise<void> }) {
  return (
    <details className="group relative">
      <summary className="btn-secondary cursor-pointer list-none">
        <FileSpreadsheet size={16} /> Import Laporan Perpanjangan
      </summary>
      <form action={action} className="card absolute right-0 z-20 mt-2 w-80 space-y-3 p-4">
        <p className="text-sm text-muted">
          Satu baris = satu kontrak baru untuk satu NP (<b>NP</b>, <b>Awal Kontrak</b>, <b>Akhir Kontrak</b>; Kontrak Ke, Penilaian, Folder opsional).
          Kontrak ditambahkan ke riwayat tanpa menghapus yang lama.
        </p>
        <div>
          <label className="label" htmlFor="impor_perpanjangan">File (.xlsx, .xls, .csv — maks 3 MB)</label>
          <input className="input" id="impor_perpanjangan" name="file" type="file" accept=".xlsx,.xls,.csv" required />
        </div>
        <div className="flex items-center justify-between gap-2">
          <TombolKirim className="btn">Import</TombolKirim>
          <a className="link text-sm" href="/api/template/perpanjangan">Unduh template</a>
        </div>
      </form>
    </details>
  );
}
