import Link from "next/link";
import ConfirmSubmit from "@/components/ConfirmSubmit";
import FilterBulanTahun from "@/components/FilterBulanTahun";
import Flash from "@/components/Flash";
import PageHeader from "@/components/PageHeader";
import { getProfile } from "@/lib/auth";
import { KATEGORI_CONFIG, LABEL_INTI, configKategori, labelKolom } from "@/lib/kategori-config";
import { KOLOM_STANDAR, nilaiKolom, normalisasi, type BarisKaryawan } from "@/lib/kolom";
import { filterBulanTahun } from "@/lib/params";
import { createClient } from "@/lib/supabase/server";
import ImporForm from "@/components/ImporForm";
import { bulkDeleteKaryawan, deleteKaryawan } from "./actions";
import { importExcel } from "./impor";

// Import Excel dan pembaruan kontrak massal bisa memakan waktu
export const maxDuration = 60;

type Params = { q?: string; kategori?: string; filter?: string; bulan?: string; tahun?: string; ok?: string; error?: string };

export default async function KaryawanPage({ searchParams }: { searchParams: Promise<Params> }) {
  const p = await searchParams;
  const profile = await getProfile();
  const isSuperAdmin = profile.role === "superadmin";
  const supabase = await createClient();

  // Kontrak aktif yang sudah lewat otomatis menjadi selesai
  await supabase.rpc("expire_kontrak");

  const { data: daftarKategori } = await supabase.from("kategori").select("id, nama").order("id");
  // Admin selalu pada kategorinya; Super Admin boleh memilih satu kategori untuk melihat kolom khususnya
  const namaKategori = isSuperAdmin ? p.kategori || null : profile.kategori?.nama ?? null;
  const kategoriDipilih = (daftarKategori ?? []).find((c) => c.nama === namaKategori);
  const config = configKategori(namaKategori);

  const relasi = config ? `, detail:${config.tabel}(*)` : "";
  let query = supabase.from("karyawan").select(`*, kategori:kategori_id(nama)${relasi}`).eq("status", "aktif").order("nama");
  if (isSuperAdmin && kategoriDipilih) query = query.eq("kategori_id", kategoriDipilih.id);
  if (p.q) {
    const term = p.q.replace(/[,()%]/g, " ").trim();
    query = query.or(`nama.ilike.%${term}%,np.ilike.%${term}%`);
  }
  const { data } = await query;
  const rows = filterBulanTahun(normalisasi((data ?? []) as unknown as BarisKaryawan[]), p);

  // Kategori dengan kolom khusus tidak menampilkan kolom "Kategori" (semua barisnya sama)
  const kolom = config ? config.kolomTabel : KOLOM_STANDAR;
  const sufiks = isSuperAdmin && namaKategori ? `?kategori=${encodeURIComponent(namaKategori)}` : "";
  const exportHref = `/api/export/karyawan${sufiks}`;
  const pdfHref = `/api/pdf/karyawan${sufiks}`;

  return (
    <div className="space-y-4">
      <PageHeader title="Data Karyawan">
        <ImporForm action={importExcel} kategori={isSuperAdmin ? daftarKategori ?? [] : undefined} kategoriDipilih={namaKategori} />
        <a className="btn-secondary" href={exportHref}>Export Excel</a>
        <a className="btn-secondary" href={pdfHref} target="_blank" rel="noreferrer">Export PDF</a>
        <Link className="btn" href="/karyawan/new">Tambah Karyawan</Link>
      </PageHeader>

      <Flash ok={p.ok} error={p.error} />

      <div className="flex flex-wrap gap-2">
        <form className="flex gap-2">
          {isSuperAdmin && (
            <select className="input w-auto" name="kategori" defaultValue={namaKategori ?? ""}>
              <option value="">Semua kategori</option>
              {(daftarKategori ?? []).map((c) => (
                <option key={c.id} value={c.nama}>{c.nama}{KATEGORI_CONFIG[c.nama] ? " (kolom khusus)" : ""}</option>
              ))}
            </select>
          )}
          <input className="input max-w-xs" name="q" defaultValue={p.q} placeholder="Cari nama / NP" />
          <button className="btn-secondary" type="submit">Cari</button>
        </form>
        <FilterBulanTahun filter={p.filter} bulan={p.bulan} tahun={p.tahun} />
      </div>

      <form className="space-y-2">
        <ConfirmSubmit label="Hapus yang dipilih" message="Hapus semua karyawan yang dicentang? Kontrak, data diri, dan monitoring ikut terhapus." formAction={bulkDeleteKaryawan} />
        <div className="card overflow-x-auto">
          <table className="min-w-full divide-y divide-line">
            <thead>
              <tr>
                <th className="th" />
                {kolom.map((k) => <th key={k} className="th">{config ? labelKolom(k, config) : LABEL_INTI[k] ?? k}</th>)}
                <th className="th">Link</th>
                <th className="th" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-soft/60">
                  <td className="td"><input type="checkbox" name="ids" value={r.id} /></td>
                  {kolom.map((k) => (
                    <td key={k} className={`td ${k === "nama" ? "font-medium" : ""} ${k === "catatan_titipan" ? "min-w-48" : ""}`}>
                      {nilaiKolom(r, k, config, true) ?? "-"}
                    </td>
                  ))}
                  <td className="td">
                    {r.folder_link ? <a className="link" href={r.folder_link} target="_blank" rel="noreferrer">Buka</a> : "-"}
                  </td>
                  <td className="td whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Link className="link" href={`/karyawan/${r.id}/edit`}>Ubah</Link>
                      <Link className="link" href={`/karyawan/${r.id}/kontrak`}>Kontrak</Link>
                      <Link className="link" href={`/karyawan/${r.id}/datadiri`}>Data Diri</Link>
                      <Link className="link" href={`/karyawan/${r.id}/terminate`}>Terminate</Link>
                      <ConfirmSubmit label="Hapus" message={`Hapus ${r.nama}?`} formAction={deleteKaryawan} name="id" value={r.id} />
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td className="td text-center text-muted" colSpan={kolom.length + 3}>Belum ada data.</td></tr>}
            </tbody>
          </table>
        </div>
      </form>
    </div>
  );
}
