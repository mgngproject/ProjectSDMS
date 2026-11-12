import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import TabTerminate from "@/components/TabTerminate";
import { formatTanggal, hariIni } from "@/lib/format";
import { KEJADIAN, KOLOM_RIWAYAT, type Kejadian, type RiwayatTerminate } from "@/lib/riwayat-terminate";
import { createClient } from "@/lib/supabase/server";

type Klien = Awaited<ReturnType<typeof createClient>>;
type Params = Record<string, string | undefined>;

const BATAS = 300;

/** Tab Riwayat di menu Terminate. Super Admin melihat semua kategori, PIC hanya kategorinya (dibatasi RLS). */
export default async function RiwayatTerminateView({ sp, isSuperAdmin, supabase }: { sp: Params; isSuperAdmin: boolean; supabase: Klien }) {
  const q = (sp.q ?? "").trim();
  const kejadian = sp.kejadian && sp.kejadian in KEJADIAN ? (sp.kejadian as Kejadian) : "";
  const periode = sp.periode === "30" || sp.periode === "90" ? Number(sp.periode) : 0;
  const orang = /^\d+$/.test(sp.orang ?? "") ? Number(sp.orang) : null;
  const kategoriId = isSuperAdmin && /^\d+$/.test(sp.kategori ?? "") ? Number(sp.kategori) : null;

  let query = supabase.from("riwayat_terminate").select(KOLOM_RIWAYAT, { count: "exact" }).order("created_at", { ascending: false }).order("id", { ascending: false }).limit(BATAS);
  if (q) {
    const aman = q.replace(/[%,()*\\]/g, " ").trim();
    if (aman) query = query.or(`nama.ilike.%${aman}%,np.ilike.%${aman}%`);
  }
  if (kejadian) query = query.eq("kejadian", kejadian);
  if (kategoriId) query = query.eq("kategori_id", kategoriId);
  if (orang) query = query.eq("karyawan_id", orang);
  if (periode) {
    const d = new Date(`${hariIni()}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - periode);
    query = query.gte("tanggal", d.toISOString().slice(0, 10));
  }

  const [{ data, count, error }, { data: daftarKategori }, { count: total }] = await Promise.all([
    query,
    isSuperAdmin ? supabase.from("kategori").select("id, nama").order("id") : Promise.resolve({ data: null }),
    supabase.from("riwayat_terminate").select("id", { count: "exact", head: true }),
  ]);
  const rows = (data ?? []) as unknown as RiwayatTerminate[];

  // Status karyawan sekarang; yang tidak ditemukan berarti sudah dihapus dari data
  const ids = [...new Set(rows.map((r) => r.karyawan_id))];
  const status = new Map<number, string>();
  if (ids.length > 0) {
    const { data: k } = await supabase.from("karyawan").select("id, status").in("id", ids);
    for (const x of (k ?? []) as { id: number; status: string }[]) status.set(x.id, x.status);
  }
  const statusKini = (id: number) => (status.get(id) === "terminate" ? ["Terminate", "pill-danger"] : status.has(id) ? ["Aktif", "pill-success"] : ["Dihapus dari data", "pill bg-soft text-muted"]);
  const namaOrang = orang ? rows[0]?.nama : null;

  return (
    <div className="space-y-4">
      <PageHeader title="Data Terminate" />
      <TabTerminate aktif="riwayat" jumlah={total ?? undefined} />

      <form className="flex flex-wrap items-center gap-2" action="/terminate">
        <input type="hidden" name="tab" value="riwayat" />
        {orang && <input type="hidden" name="orang" value={orang} />}
        <input className="input max-w-[220px]" name="q" defaultValue={q} placeholder="Cari nama atau NP" aria-label="Cari nama atau NP" />
        {isSuperAdmin && (
          <select className="input !w-auto" name="kategori" defaultValue={kategoriId ?? ""} aria-label="Kategori">
            <option value="">Semua kategori</option>
            {(daftarKategori ?? []).map((k: { id: number; nama: string }) => <option key={k.id} value={k.id}>{k.nama}</option>)}
          </select>
        )}
        <select className="input !w-auto" name="kejadian" defaultValue={kejadian} aria-label="Kejadian">
          <option value="">Semua kejadian</option>
          {Object.entries(KEJADIAN).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select className="input !w-auto" name="periode" defaultValue={periode ? String(periode) : ""} aria-label="Periode">
          <option value="">Semua waktu</option>
          <option value="30">30 hari terakhir</option>
          <option value="90">90 hari terakhir</option>
        </select>
        <button className="btn" type="submit">Cari</button>
        <Link className="btn-secondary" href="/terminate?tab=riwayat">Reset</Link>
        <span className="ml-auto text-sm text-muted">{count ?? rows.length} kejadian</span>
      </form>

      {orang && (
        <p className="flex flex-wrap items-center gap-3 rounded-2xl bg-primary-soft p-3 text-sm">
          <span>Riwayat <b>{namaOrang ?? `karyawan ${orang}`}</b> saja.</span>
          <Link className="link font-medium" href="/terminate?tab=riwayat">Tampilkan semua</Link>
        </p>
      )}
      {error && <p className="rounded-2xl bg-danger-soft p-3 text-sm text-danger" role="alert">Riwayat belum bisa dibaca. Pastikan migrasi 0025 sudah dijalankan di Supabase.</p>}

      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-line">
          <thead><tr>{["Tanggal", "Karyawan", "Kejadian", "Detail", "Dicatat oleh", "Status kini"].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => {
              const [sl, sk] = statusKini(r.karyawan_id);
              const kj = KEJADIAN[r.kejadian];
              return (
                <tr key={r.id} className="align-top">
                  <td className="td whitespace-nowrap">{formatTanggal(r.tanggal)}</td>
                  <td className="td">
                    <Link className="link font-medium" href={`/terminate?tab=riwayat&orang=${r.karyawan_id}`}>{r.nama}</Link>
                    <div className="text-xs text-muted">{r.np}{r.kategori?.nama ? ` · ${r.kategori.nama}` : ""}</div>
                  </td>
                  <td className="td"><span className={kj.kelas}>{kj.label}</span></td>
                  <td className="td">
                    {r.kejadian === "terminate" ? (r.alasan ?? "-") : (r.keterangan ?? r.alasan ?? "-")}
                    {r.kejadian === "terminate" && r.keterangan && <div className="text-xs text-muted">{r.keterangan}</div>}
                    {r.kejadian === "terminate" && r.tanggal_keluar && <div className="text-xs text-muted">Tanggal keluar {formatTanggal(r.tanggal_keluar)}</div>}
                  </td>
                  <td className="td">{r.dibuat_oleh_nama ?? "Sistem"}</td>
                  <td className="td"><span className={sk}>{sl}</span></td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td className="td text-center text-muted" colSpan={6}>{error ? "Belum bisa dibaca." : "Belum ada riwayat yang cocok."}</td></tr>}
          </tbody>
        </table>
      </div>
      {(count ?? 0) > BATAS && <p className="text-xs text-muted">Menampilkan {BATAS} kejadian terbaru. Persempit dengan pencarian atau filter untuk melihat yang lebih lama.</p>}
    </div>
  );
}
