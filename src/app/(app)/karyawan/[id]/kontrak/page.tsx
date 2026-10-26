import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import { notFound } from "next/navigation";
import ConfirmSubmit from "@/components/ConfirmSubmit";
import Flash from "@/components/Flash";
import KontrakForm from "@/components/KontrakForm";
import { formatTanggal, masaKerja, masaKontrak } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Kontrak } from "@/lib/types";
import { createKontrak, deleteKontrak } from "../../../kontrak/actions";

export default async function KontrakPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { id } = await params;
  const p = await searchParams;
  const supabase = await createClient();

  // Kontrak yang sudah lewat otomatis selesai, lalu data karyawan disinkronkan
  await supabase.rpc("sync_kontrak", { kid: Number(id) });

  const { data: karyawan } = await supabase.from("karyawan").select("*").eq("id", Number(id)).maybeSingle();
  if (!karyawan) notFound();
  const { data } = await supabase.from("kontrak").select("*").eq("karyawan_id", karyawan.id).order("awal_kontrak", { ascending: false });
  const kontrak = (data ?? []) as Kontrak[];

  return (
    <div className="space-y-4">
      <div>
        <Link className="text-sm link" href="/karyawan">← Kembali</Link>
        <PageHeader title={`Riwayat Kontrak: ${karyawan.nama} (${karyawan.np})`} />
        <p className="text-sm text-muted">
          Masa kerja {masaKerja(karyawan)} · Masa kontrak aktif {masaKontrak(karyawan)}
        </p>
      </div>
      <Flash ok={p.ok} error={p.error} />

      <form className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-line">
          <thead>
            <tr>{["Kontrak ke", "NP", "Awal", "Akhir", "Status", "Penilaian", "Folder", ""].map((h) => <th key={h} className="th">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-line">
            {kontrak.map((c) => (
              <tr key={c.id}>
                <td className="td">{c.kontrak_ke}</td>
                <td className="td">{c.np ?? "-"}</td>
                <td className="td">{formatTanggal(c.awal_kontrak)}</td>
                <td className="td">{formatTanggal(c.akhir_kontrak)}</td>
                <td className="td">{c.status}</td>
                <td className="td">{c.penilaian ?? "-"}</td>
                <td className="td">
                  {c.folder_link ? <a className="link" href={c.folder_link} target="_blank" rel="noreferrer">Buka</a> : "-"}
                </td>
                <td className="td whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Link className="link" href={`/kontrak/${c.id}/edit`}>Ubah</Link>
                    <input type="hidden" name="karyawan_id" value={karyawan.id} />
                    <ConfirmSubmit label="Hapus" message={`Hapus ${c.kontrak_ke}?`} formAction={deleteKontrak} name="id" value={c.id} />
                  </div>
                </td>
              </tr>
            ))}
            {kontrak.length === 0 && <tr><td className="td text-center text-muted" colSpan={8}>Belum ada kontrak.</td></tr>}
          </tbody>
        </table>
      </form>

      <h2 className="font-semibold">Tambah Kontrak Baru</h2>
      <KontrakForm
        action={createKontrak.bind(null, karyawan.id)}
        np={karyawan.np}
        kontrakKeDefault={`Kontrak ${kontrak.length + 1}`}
        batal="/karyawan"
      />
    </div>
  );
}
