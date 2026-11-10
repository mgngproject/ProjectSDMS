import { AlertTriangle } from "lucide-react";
import { ambilCatatan } from "@/lib/catatan-impor-cookie";

/** Daftar singkat data yang salah saat import: baris Excel, NP, dan kesalahannya. */
export default async function LaporanImpor({ id }: { id?: string }) {
  const hasil = await ambilCatatan(id);
  if (!hasil || hasil.catatan.length === 0) return null;
  const { catatan, sisa } = hasil;
  const adaSheet = new Set(catatan.map((c) => c.sheet)).size > 1;

  return (
    <section className="card space-y-2 p-4" aria-labelledby="judul-laporan-impor">
      <h2 id="judul-laporan-impor" className="flex items-center gap-2 font-semibold">
        <AlertTriangle size={18} className="text-warning" /> Data yang salah
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead>
            <tr>
              {adaSheet && <th className="th">Sheet</th>}
              <th className="th">Baris</th>
              <th className="th">NP</th>
              <th className="th">Kesalahan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {catatan.map((c, i) => (
              <tr key={i}>
                {adaSheet && <td className="td">{c.sheet}</td>}
                <td className="td">{c.baris ?? "-"}</td>
                <td className="td">{c.np ?? "-"}</td>
                <td className="td">
                  {c.kolom && <b>{c.kolom}: </b>}
                  {c.pesan}
                  {c.jenis === "peringatan" && <span className="text-muted"> (data tetap masuk)</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sisa > 0 && <p className="text-xs text-muted">+{sisa} kesalahan lain.</p>}
    </section>
  );
}
