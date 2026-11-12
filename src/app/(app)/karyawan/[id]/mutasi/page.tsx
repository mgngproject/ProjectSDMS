import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ConfirmSubmit from "@/components/ConfirmSubmit";
import Flash from "@/components/Flash";
import PageHeader from "@/components/PageHeader";
import UnitMutasi from "@/components/UnitMutasi";
import { ambilBagan } from "@/lib/bagan-data";
import { formatTanggal, hariIni } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Mutasi } from "@/lib/types";
import { catatMutasi, hapusMutasi, ubahMutasi } from "../../../mutasi/actions";
import TombolKirim from "@/components/TombolKirim";

export default async function RiwayatMutasiKaryawanPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { id } = await params;
  const p = await searchParams;
  const supabase = await createClient();

  const { data: karyawan } = await supabase.from("karyawan").select("id, np, nama, kode_bagan, unit_kerja").eq("id", Number(id)).maybeSingle();
  if (!karyawan) notFound();
  const { data } = await supabase
    .from("mutasi")
    .select("*")
    .eq("karyawan_id", karyawan.id)
    .order("tanggal", { ascending: false })
    .order("created_at", { ascending: false });
  const riwayat = (data ?? []) as Mutasi[];
  const bagan = await ambilBagan(supabase, true);

  return (
    <div className="space-y-4">
      <div>
        <Link className="link text-sm" href="/karyawan">← Kembali</Link>
        <PageHeader title={`Riwayat Mutasi: ${karyawan.nama} (${karyawan.np})`} />
        <p className="text-sm text-muted">
          Unit kerja sekarang: <UnitMutasi kode={karyawan.kode_bagan} unit={karyawan.unit_kerja} />
        </p>
      </div>
      <Flash ok={p.ok} error={p.error} />

      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-line">
          <thead>
            <tr>{["Tanggal", "Dari", "", "Ke", "Keterangan", ""].map((h, i) => <th key={i} className="th">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-line">
            {riwayat.map((m) => (
              <tr key={m.id}>
                <td className="td whitespace-nowrap">{formatTanggal(m.tanggal)}</td>
                <td className="td"><UnitMutasi kode={m.kode_bagan_lama} unit={m.unit_kerja_lama} /></td>
                <td className="td text-muted"><ArrowRight size={14} /></td>
                <td className="td font-medium"><UnitMutasi kode={m.kode_bagan_baru} unit={m.unit_kerja_baru} /></td>
                <td className="td">{m.keterangan ?? <span className="text-muted">-</span>}</td>
                <td className="td whitespace-nowrap">
                  <details className="relative inline-block">
                    <summary className="link cursor-pointer list-none">Ubah</summary>
                    <form action={ubahMutasi.bind(null, m.id, karyawan.id)} className="card absolute right-0 z-20 mt-2 w-72 space-y-3 p-4">
                      <div>
                        <label className="label" htmlFor={`tgl-${m.id}`}>Tanggal mutasi</label>
                        <input className="input" id={`tgl-${m.id}`} name="tanggal" type="date" defaultValue={m.tanggal} required />
                      </div>
                      <div>
                        <label className="label" htmlFor={`ket-${m.id}`}>Keterangan</label>
                        <input className="input" id={`ket-${m.id}`} name="keterangan" defaultValue={m.keterangan ?? ""} placeholder="mis. No. SK" />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <TombolKirim className="btn">Simpan</TombolKirim>
                        <ConfirmSubmit
                          label="Hapus"
                          message="Hapus riwayat mutasi ini? Unit kerja karyawan saat ini tidak berubah."
                          formAction={hapusMutasi.bind(null, m.id, karyawan.id)}
                        />
                      </div>
                    </form>
                  </details>
                </td>
              </tr>
            ))}
            {riwayat.length === 0 && <tr><td className="td text-center text-muted" colSpan={6}>Belum ada riwayat mutasi.</td></tr>}
          </tbody>
        </table>
      </div>

      <h2 className="font-semibold">Catat Mutasi</h2>
      <form action={catatMutasi.bind(null, karyawan.id)} className="card grid gap-4 p-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="kode_bagan">Kode bagan tujuan</label>
          <input className="input uppercase" id="kode_bagan" name="kode_bagan" list="daftar-bagan-mutasi" placeholder="Pilih atau ketik kode" autoComplete="off" />
          {bagan.length > 0 && (
            <datalist id="daftar-bagan-mutasi">
              {bagan.map((b) => <option key={b.kode} value={b.kode}>{b.nama_unit}</option>)}
            </datalist>
          )}
          <p className="mt-1 text-xs text-muted">Unit kerja mengikuti daftar Kode Bagan.</p>
        </div>
        {bagan.length === 0 && (
          <div>
            <label className="label" htmlFor="unit_kerja">Unit kerja tujuan</label>
            <input className="input" id="unit_kerja" name="unit_kerja" />
          </div>
        )}
        <div>
          <label className="label" htmlFor="tanggal">Tanggal mutasi</label>
          <input className="input" id="tanggal" name="tanggal" type="date" defaultValue={hariIni()} required />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="keterangan">Keterangan (opsional)</label>
          <input className="input" id="keterangan" name="keterangan" placeholder="mis. No. SK, alasan mutasi" />
        </div>
        <div className="sm:col-span-2">
          <TombolKirim className="btn">Simpan mutasi</TombolKirim>
        </div>
      </form>
      <p className="text-xs text-muted">Perubahan kode bagan lewat menu Ubah data atau Import Excel juga tercatat otomatis di riwayat ini dengan tanggal hari itu.</p>
    </div>
  );
}
