import { AlertTriangle, XCircle } from "lucide-react";
import type { JenisCatatan } from "@/lib/catatan-impor";
import { ambilCatatan } from "@/lib/catatan-impor-cookie";

const LABEL: Record<JenisCatatan, string> = { gagal: "Gagal disimpan", dilewati: "Tidak diimport", peringatan: "Diimport, ada isian diabaikan" };
const WARNA: Record<JenisCatatan, string> = {
  gagal: "bg-danger-soft text-danger",
  dilewati: "bg-danger-soft text-danger",
  peringatan: "bg-warning-soft text-warning",
};

/** Tabel rincian kesalahan import: di baris, NP, dan kolom mana masalahnya. */
export default async function LaporanImpor({ id }: { id?: string }) {
  const hasil = await ambilCatatan(id);
  if (!hasil || hasil.catatan.length === 0) return null;
  const { catatan, sisa } = hasil;
  const adaSheet = new Set(catatan.map((c) => c.sheet)).size > 1;
  const jumlahLewat = catatan.filter((c) => c.jenis !== "peringatan").length;
  const jumlahPeringatan = catatan.length - jumlahLewat;

  return (
    <section className="card space-y-3 p-4" aria-labelledby="judul-laporan-impor">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id="judul-laporan-impor" className="flex items-center gap-2 font-semibold">
            <AlertTriangle size={18} className="text-warning" /> Rincian kesalahan import
          </h2>
          <p className="text-sm text-muted">
            {jumlahLewat > 0 && <>{jumlahLewat} baris tidak diimport. </>}
            {jumlahPeringatan > 0 && <>{jumlahPeringatan} baris diimport dengan isian yang diabaikan. </>}
            Perbaiki sel yang disebut di file Excel, lalu import ulang. Nomor baris mengikuti nomor baris di Excel.
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead>
            <tr>
              {adaSheet && <th className="th">Sheet</th>}
              <th className="th">Baris</th>
              <th className="th">NP</th>
              <th className="th">Kolom</th>
              <th className="th">Isi sel</th>
              <th className="th">Masalah</th>
              <th className="th">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {catatan.map((c, i) => (
              <tr key={i}>
                {adaSheet && <td className="td">{c.sheet}</td>}
                <td className="td font-mono">{c.baris ?? "-"}</td>
                <td className="td font-mono">{c.np ?? "-"}</td>
                <td className="td">{c.kolom ?? "-"}</td>
                <td className="td max-w-48 truncate font-mono" title={c.nilai ?? undefined}>{c.nilai == null ? <span className="text-muted">(kosong)</span> : c.nilai}</td>
                <td className="td">{c.pesan}</td>
                <td className="td">
                  <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs ${WARNA[c.jenis]}`}>
                    {c.jenis !== "peringatan" && <XCircle size={12} />} {LABEL[c.jenis]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sisa > 0 && <p className="text-xs text-muted">Dan {sisa} catatan lain tidak ditampilkan. Perbaiki yang di atas lalu import ulang untuk melihat sisanya.</p>}
    </section>
  );
}
