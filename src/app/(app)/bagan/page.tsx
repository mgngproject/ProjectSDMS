import Link from "next/link";
import { redirect } from "next/navigation";
import ConfirmSubmit from "@/components/ConfirmSubmit";
import Flash from "@/components/Flash";
import ImporBaganForm from "@/components/ImporBaganForm";
import PageHeader from "@/components/PageHeader";
import { getProfile } from "@/lib/auth";
import { cariBagan, normKode } from "@/lib/bagan";
import { ambilBagan } from "@/lib/bagan-data";
import { createClient } from "@/lib/supabase/server";
import { hapusBagan, importBagan, samakanSemuaUnit, tambahBagan, ubahBagan, ubahStatusBagan } from "./actions";

type Pegawai = { id: number; np: string; nama: string; kode_bagan: string | null; unit_kerja: string | null; kategori: { nama: string } | null };

const BATAS_DAFTAR = 100;

/** Seluruh karyawan aktif, dibaca per halaman 1000 baris karena batas bawaan Supabase. */
async function semuaKaryawanAktif(supabase: Awaited<ReturnType<typeof createClient>>): Promise<Pegawai[]> {
  const hasil: Pegawai[] = [];
  for (let dari = 0; ; dari += 1000) {
    const { data } = await supabase
      .from("karyawan")
      .select("id, np, nama, kode_bagan, unit_kerja, kategori:kategori_id(nama)")
      .eq("status", "aktif")
      .order("id")
      .range(dari, dari + 999);
    const bagian = (data ?? []) as unknown as Pegawai[];
    hasil.push(...bagian);
    if (bagian.length < 1000) return hasil;
  }
}

export default async function BaganPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const profile = await getProfile();
  // Daftar bagan hanya dikelola Super Admin
  if (profile.role !== "superadmin") redirect("/dashboard");

  const supabase = await createClient();
  const [daftar, pegawai] = await Promise.all([ambilBagan(supabase), semuaKaryawanAktif(supabase)]);
  const q = (sp.q ?? "").trim().toLowerCase();

  const pemakai = new Map<string, number>();
  const perluDibereskan: { p: Pegawai; alasan: string }[] = [];
  let unitBeda = 0;
  for (const p of pegawai) {
    const kode = normKode(p.kode_bagan);
    if (!kode) continue;
    const b = cariBagan(daftar, kode);
    pemakai.set(kode, (pemakai.get(kode) ?? 0) + 1);
    if (!b) perluDibereskan.push({ p, alasan: "Kode tidak ada di daftar" });
    else if (!b.aktif) perluDibereskan.push({ p, alasan: "Kode sudah tidak aktif" });
    else if ((p.unit_kerja ?? "").trim() !== b.nama_unit) unitBeda++;
  }
  const tanpaKode = pegawai.filter((p) => !normKode(p.kode_bagan)).length;
  const tampil = daftar.filter((b) => !q || b.kode.toLowerCase().includes(q) || b.nama_unit.toLowerCase().includes(q));
  const aktifCount = daftar.filter((b) => b.aktif).length;

  return (
    <div className="space-y-4">
      <PageHeader title="Kode Bagan">
        <ImporBaganForm action={importBagan} jumlahKode={daftar.length} />
      </PageHeader>
      <Flash ok={sp.ok} error={sp.error} />

      <p className="text-sm text-muted">
        Daftar ini satu-satunya acuan kode bagan dan nama unit. PIC memilih kode dari daftar ini saat mengisi karyawan, dan Unit Kerja terisi otomatis. Hanya Super Admin yang mengubahnya.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card p-5"><div className="text-sm text-muted">Kode bagan</div><div className="mt-2 text-3xl font-bold tabular-nums">{daftar.length}</div><div className="text-sm text-muted">{aktifCount} aktif</div></div>
        <div className="card p-5"><div className="text-sm text-muted">Karyawan aktif memakai kode</div><div className="mt-2 text-3xl font-bold tabular-nums">{pegawai.length - tanpaKode}</div><div className="text-sm text-muted">{tanpaKode} belum punya kode</div></div>
        <div className="card p-5"><div className="text-sm text-muted">Perlu dibereskan</div><div className={`mt-2 text-3xl font-bold tabular-nums ${perluDibereskan.length ? "text-danger" : ""}`}>{perluDibereskan.length}</div><div className="text-sm text-muted">kode tidak dikenal atau tidak aktif</div></div>
        <div className="card p-5">
          <div className="text-sm text-muted">Unit kerja beda dari daftar</div>
          <div className="mt-2 text-3xl font-bold tabular-nums">{unitBeda}</div>
          {unitBeda > 0 && (
            <form action={samakanSemuaUnit} className="mt-1"><button className="link text-sm" type="submit">Samakan sekarang</button></form>
          )}
        </div>
      </div>

      <form action={tambahBagan} className="card flex flex-wrap items-end gap-2 p-4">
        <label className="flex flex-col gap-1 text-sm"><span className="text-xs text-muted">Kode</span><input className="input !w-36 uppercase" name="kode" required /></label>
        <label className="flex min-w-56 flex-1 flex-col gap-1 text-sm"><span className="text-xs text-muted">Nama unit</span><input className="input" name="nama_unit" required /></label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs text-muted">Atasan (kode, opsional)</span>
          <input className="input !w-36 uppercase" name="induk_kode" list="kode-bagan" />
          <datalist id="kode-bagan">{daftar.map((b) => <option key={b.id} value={b.kode}>{b.nama_unit}</option>)}</datalist>
        </label>
        <button className="btn" type="submit">Tambah kode</button>
      </form>

      <form className="flex gap-2" role="search">
        <input className="input max-w-sm" name="q" defaultValue={sp.q ?? ""} placeholder="Cari kode atau nama unit" aria-label="Cari kode atau nama unit" />
        <button className="btn" type="submit">Cari</button>
        <Link className="btn-secondary" href="/bagan">Reset</Link>
      </form>

      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-line">
          <thead>
            <tr><th className="th">Kode</th><th className="th">Nama unit</th><th className="th">Atasan</th><th className="th">Karyawan</th><th className="th">Status</th><th className="th" /></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {tampil.map((b) => (
              <tr key={b.id}>
                <td className="td font-medium tabular-nums">{b.kode}</td>
                <td className="td" colSpan={2}>
                  <form action={ubahBagan.bind(null, b.id)} className="flex flex-wrap items-center gap-2">
                    <input className="input min-w-48 flex-1" name="nama_unit" defaultValue={b.nama_unit} aria-label={`Nama unit ${b.kode}`} required />
                    <input className="input !w-28 uppercase" name="induk_kode" defaultValue={b.induk_kode ?? ""} list="kode-bagan" placeholder="Atasan" aria-label={`Atasan ${b.kode}`} />
                    <button className="btn-secondary !px-3 !py-1.5" type="submit">Simpan</button>
                  </form>
                </td>
                <td className="td tabular-nums">{pemakai.get(b.kode) ?? 0}</td>
                <td className="td"><span className={b.aktif ? "pill-success" : "pill-warning"}>{b.aktif ? "Aktif" : "Tidak aktif"}</span></td>
                <td className="td">
                  <form className="flex gap-2">
                    <ConfirmSubmit
                      label={b.aktif ? "Nonaktifkan" : "Aktifkan"}
                      className="btn-secondary !px-3 !py-1.5"
                      message={b.aktif ? `Nonaktifkan kode ${b.kode}? Karyawan yang memakainya akan muncul di daftar perlu dibereskan.` : `Aktifkan kode ${b.kode}?`}
                      formAction={ubahStatusBagan.bind(null, b.id, !b.aktif)}
                    />
                    <ConfirmSubmit label="Hapus" message={`Hapus kode ${b.kode}?`} formAction={hapusBagan.bind(null, b.id)} />
                  </form>
                </td>
              </tr>
            ))}
            {tampil.length === 0 && (
              <tr><td className="td text-center text-muted" colSpan={6}>{daftar.length === 0 ? "Daftar bagan masih kosong. Import dari spreadsheet kode bagan atau tambah satu per satu." : "Tidak ada kode yang cocok."}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {perluDibereskan.length > 0 && (
        <div className="card overflow-x-auto" id="perlu-dibereskan">
          <div className="border-b border-line p-4">
            <h2 className="font-semibold">Perlu dibereskan</h2>
            <p className="text-sm text-muted">
              Karyawan aktif yang kode bagannya tidak ada di daftar atau sudah tidak aktif. Perbarui kodenya lewat Ubah, atau tambahkan kodenya ke daftar.
              {perluDibereskan.length > BATAS_DAFTAR && ` Menampilkan ${BATAS_DAFTAR} dari ${perluDibereskan.length}.`}
            </p>
          </div>
          <table className="min-w-full divide-y divide-line">
            <thead><tr><th className="th">NP</th><th className="th">Nama</th><th className="th">Kategori</th><th className="th">Kode bagan</th><th className="th">Unit kerja</th><th className="th">Masalah</th><th className="th" /></tr></thead>
            <tbody className="divide-y divide-line">
              {perluDibereskan.slice(0, BATAS_DAFTAR).map(({ p, alasan }) => (
                <tr key={p.id}>
                  <td className="td">{p.np}</td><td className="td font-medium">{p.nama}</td><td className="td">{p.kategori?.nama ?? "-"}</td>
                  <td className="td">{p.kode_bagan}</td><td className="td">{p.unit_kerja ?? "-"}</td>
                  <td className="td"><span className="pill-danger">{alasan}</span></td>
                  <td className="td"><Link className="link text-sm" href={`/karyawan/${p.id}/edit`}>Ubah</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
