import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import ConfirmSubmit from "@/components/ConfirmSubmit";
import Flash from "@/components/Flash";
import PageHeader from "@/components/PageHeader";
import { getProfile } from "@/lib/auth";
import { hariIni } from "@/lib/format";
import { bulanDari, bulanValid, geserBulan, namaBulan, pesertaDiBulan, singkatBulan, statusKuota, TEMPAT } from "@/lib/kuota";
import { ambilKuota, ambilPesertaMagang } from "@/lib/kuota-data";
import { createClient } from "@/lib/supabase/server";
import { hapusKuota, tambahKuota, ubahKuota } from "./actions";

const CHIP = { success: "bg-success-soft text-success", warning: "bg-warning-soft text-warning", danger: "bg-danger-soft text-danger" } as const;

export default async function KuotaPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const profile = await getProfile();
  // Kuota hanya untuk PIC Magang
  if (profile.role === "superadmin" || profile.kategori?.nama !== "Magang") redirect("/dashboard");

  const supabase = await createClient();
  const [kuota, peserta] = await Promise.all([ambilKuota(supabase), ambilPesertaMagang(supabase)]);
  const bulan = bulanValid(sp.bulan) ? sp.bulan : bulanDari(hariIni());
  const rentang = Array.from({ length: 6 }, (_, i) => geserBulan(bulan, i - 1));

  const hitung = (unit: string, tempat: string, ym: string) => pesertaDiBulan(peserta, unit, tempat, ym).length;
  const total = Object.fromEntries(TEMPAT.map((t) => [t, { kuota: 0, terisi: 0 }]));
  let penuh = 0;
  for (const k of kuota) {
    const terisi = hitung(k.unit_kerja, k.penempatan, bulan);
    total[k.penempatan].kuota += k.kuota;
    total[k.penempatan].terisi += terisi;
    if (terisi >= k.kuota) penuh++;
  }
  const sisa = TEMPAT.reduce((n, t) => n + total[t].kuota - total[t].terisi, 0);
  const daftarUnit = [...new Set([...kuota.map((k) => k.unit_kerja), ...peserta.map((p) => p.unit_kerja?.trim()).filter((u): u is string => !!u)])].sort();

  return (
    <div className="space-y-4">
      <PageHeader title="Kuota">
        <div className="flex items-center gap-1">
          <Link className="btn-secondary px-2" href={`/kuota?bulan=${geserBulan(bulan, -1)}`} aria-label="Bulan sebelumnya"><ChevronLeft size={16} /></Link>
          <span className="min-w-36 text-center text-sm font-medium">{namaBulan(bulan)}</span>
          <Link className="btn-secondary px-2" href={`/kuota?bulan=${geserBulan(bulan, 1)}`} aria-label="Bulan berikutnya"><ChevronRight size={16} /></Link>
        </div>
      </PageHeader>
      <Flash ok={sp.ok} error={sp.error} />

      <p className="text-sm text-muted">
        Kuota adalah batas peserta Magang yang aktif bersamaan di satu unit kerja pada satu penempatan. Setiap peserta memakai satu slot selama seluruh masa
        kontraknya. Jumlah terisi dihitung otomatis dari data karyawan.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {TEMPAT.map((t) => (
          <div key={t} className="card p-5">
            <div className="text-sm text-muted">{t}: terisi / kuota</div>
            <div className="mt-2 text-3xl font-bold tabular-nums">{total[t].terisi} <span className="text-base font-medium text-muted">/ {total[t].kuota}</span></div>
          </div>
        ))}
        <div className="card p-5">
          <div className="text-sm text-muted">Sisa slot</div>
          <div className={`mt-2 text-3xl font-bold tabular-nums ${sisa < 0 ? "text-danger" : ""}`}>{sisa}</div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-muted">Unit penuh</div>
          <div className="mt-2 text-3xl font-bold tabular-nums">{penuh}</div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-line">
          <thead>
            <tr>
              <th className="th">Unit kerja</th>
              <th className="th">Kuota</th>
              <th className="th">Terisi</th>
              <th className="th">Sisa</th>
              <th className="th">Terisi per bulan</th>
              <th className="th">Status</th>
              <th className="th" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {TEMPAT.map((t) => {
              const baris = kuota.filter((k) => k.penempatan === t);
              return [
                <tr key={`h-${t}`} className="bg-soft">
                  <td colSpan={7} className="td font-semibold">
                    {t}
                    <span className="ml-2 text-xs font-normal text-muted">{total[t].terisi} dari {total[t].kuota} slot terisi · {baris.length} unit kerja</span>
                  </td>
                </tr>,
                ...baris.map((k) => {
                  const terisi = hitung(k.unit_kerja, t, bulan);
                  const st = statusKuota(k.kuota, terisi);
                  return (
                    <tr key={k.id}>
                      <td className="td font-medium">{k.unit_kerja}</td>
                      <td className="td">
                        <form action={ubahKuota.bind(null, k.id)} className="flex items-center gap-2">
                          <input className="input !w-20" type="number" name="kuota" min={0} step={1} defaultValue={k.kuota} aria-label={`Kuota ${k.unit_kerja} ${t}`} />
                          <button className="btn-secondary !px-3 !py-1.5" type="submit">Simpan</button>
                          <ConfirmSubmit label="Hapus" message={`Hapus kuota ${k.unit_kerja} di ${t}?`} formAction={hapusKuota.bind(null, k.id)} />
                        </form>
                      </td>
                      <td className="td tabular-nums">{terisi}</td>
                      <td className="td tabular-nums">{k.kuota - terisi}</td>
                      <td className="td">
                        <div className="flex gap-1">
                          {rentang.map((ym) => {
                            const n = hitung(k.unit_kerja, t, ym);
                            return (
                              <span key={ym} title={`${namaBulan(ym)}: ${n}/${k.kuota}`} className={`whitespace-nowrap rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${CHIP[statusKuota(k.kuota, n).nada]} ${ym === bulan ? "ring-2 ring-primary" : ""}`}>
                                {singkatBulan(ym)} {n}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="td">
                        <span className={st.nada === "success" ? "pill-success" : st.nada === "warning" ? "pill-warning" : "pill-danger"}>{st.label}</span>
                      </td>
                      <td className="td" />
                    </tr>
                  );
                }),
                baris.length === 0 && (
                  <tr key={`k-${t}`}><td colSpan={7} className="td text-center text-muted">Belum ada unit kerja di {t}.</td></tr>
                ),
              ];
            })}
          </tbody>
        </table>
      </div>

      <form action={tambahKuota} className="card flex flex-wrap items-end gap-2 p-4">
        <label className="space-y-1 text-sm">
          <span className="text-xs text-muted">Unit kerja</span>
          <input className="input" name="unit_kerja" list="daftar-unit" required />
          <datalist id="daftar-unit">{daftarUnit.map((u) => <option key={u} value={u} />)}</datalist>
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-xs text-muted">Penempatan</span>
          <select className="input" name="penempatan">{TEMPAT.map((t) => <option key={t}>{t}</option>)}</select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-xs text-muted">Kuota</span>
          <input className="input !w-24" type="number" name="kuota" min={0} step={1} defaultValue={3} required />
        </label>
        <button className="btn" type="submit">Tambah kuota</button>
        <p className="w-full text-xs text-muted">Unit yang tidak ada di suatu penempatan tidak perlu ditambahkan di sana. Nama unit harus sama dengan isian Unit Kerja peserta agar terhitung.</p>
      </form>
    </div>
  );
}
