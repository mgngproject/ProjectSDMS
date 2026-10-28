"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { saveMonitoringText, toggleMonitoring } from "@/app/(app)/monitoring/actions";
import { MONITORING_LABEL, MONITORING_TAHAP, MONITORING_TEXT } from "@/lib/monitoring";

export type BarisMonitoring = {
  karyawanId: number;
  np: string;
  nama: string;
  akhir: string;
  sisaHari: number | null;
  values: Record<string, boolean | string>;
  keterangan: string;
};

const FIELDS = Object.keys(MONITORING_LABEL);
const terisi = (v: boolean | string | undefined) => (typeof v === "string" ? v.trim() !== "" : Boolean(v));
const jumlah = (b: BarisMonitoring) => FIELDS.filter((f) => terisi(b.values[f])).length;
const kurang = (b: BarisMonitoring) => FIELDS.filter((f) => !terisi(b.values[f]));

export default function MonitoringBoard({ rows: awal }: { rows: BarisMonitoring[] }) {
  const [rows, setRows] = useState(awal);
  const [terpilih, setTerpilih] = useState<number | null>(null);
  // Layar lebar langsung menampilkan rincian baris pertama; di HP panel baru muncul setelah baris diketuk
  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) setTerpilih(awal[0]?.karyawanId ?? null);
  }, [awal]);
  const simpanKe = useRef<Record<string, string>>({});
  const total = FIELDS.length;
  const dipilih = rows.find((r) => r.karyawanId === terpilih) ?? null;

  const ubah = (id: number, f: (b: BarisMonitoring) => BarisMonitoring) => setRows((rs) => rs.map((r) => (r.karyawanId === id ? f(r) : r)));

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-line">
          <thead>
            <tr>
              <th className="th">Karyawan</th>
              <th className="th">Akhir Kontrak</th>
              <th className="th">Kemajuan</th>
              <th className="th">Status</th>
              <th className="th hidden md:table-cell">Yang belum ada</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => {
              const n = jumlah(r);
              const k = kurang(r);
              const selesai = n === total;
              return (
                <tr
                  key={r.karyawanId}
                  tabIndex={0}
                  onClick={() => setTerpilih(r.karyawanId)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setTerpilih(r.karyawanId);
                    }
                  }}
                  className={`cursor-pointer hover:bg-soft ${terpilih === r.karyawanId ? "bg-soft" : ""}`}
                >
                  <td className="td">
                    <div className="font-medium">{r.nama}</div>
                    <div className="text-xs text-muted">NP {r.np}</div>
                  </td>
                  <td className="td whitespace-nowrap">
                    {r.akhir}
                    {r.sisaHari !== null && <div className={`text-xs ${r.sisaHari <= 14 ? "font-semibold text-danger" : "text-muted"}`}>{r.sisaHari} hari lagi</div>}
                  </td>
                  <td className="td">
                    <div className="flex min-w-32 items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-soft"><div className={`h-full rounded-full ${selesai ? "bg-success" : "bg-primary"}`} style={{ width: `${(n / total) * 100}%` }} /></div>
                      <span className="text-xs font-semibold tabular-nums">{n}/{total}</span>
                    </div>
                  </td>
                  <td className="td"><span className={`whitespace-nowrap ${selesai ? "pill-success" : "pill-warning"}`}>{selesai ? "Selesai" : "Belum Lengkap"}</span></td>
                  <td className="td hidden text-xs text-muted md:table-cell">
                    {k.length === 0 ? "Lengkap" : <><b className="font-semibold text-ink">{k.slice(0, 2).map((f) => MONITORING_LABEL[f]).join(", ")}</b>{k.length > 2 && ` +${k.length - 2}`}</>}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td className="td text-center text-muted" colSpan={5}>Belum ada data.</td></tr>}
          </tbody>
        </table>
      </div>

      {dipilih && (
        <aside className="card fixed inset-x-0 bottom-0 z-30 max-h-[78vh] space-y-3 overflow-y-auto rounded-b-none p-4 shadow-2xl lg:sticky lg:inset-auto lg:top-4 lg:z-auto lg:max-h-[calc(100vh-2rem)] lg:rounded-b-xl lg:shadow-none">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">{dipilih.nama}</h2>
              <div className="text-xs text-muted">NP {dipilih.np} · berakhir {dipilih.akhir}</div>
            </div>
            <button type="button" aria-label="Tutup" className="btn-secondary !p-1.5 lg:hidden" onClick={() => setTerpilih(null)}><X size={16} /></button>
          </div>
          {(() => {
            const n = jumlah(dipilih);
            const selesai = n === total;
            return (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={selesai ? "pill-success" : "pill-warning"}>{selesai ? "Selesai" : "Belum Lengkap"}</span>
                  <span className="text-xs font-semibold tabular-nums">{n} dari {total} berkas</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-soft"><div className={`h-full rounded-full ${selesai ? "bg-success" : "bg-primary"}`} style={{ width: `${(n / total) * 100}%` }} /></div>
              </div>
            );
          })()}

          {MONITORING_TAHAP.map((t) => (
            <section key={t.nama} className="space-y-1.5 rounded-xl border border-line p-3">
              <h3 className="flex justify-between text-[11px] font-semibold uppercase tracking-wider text-muted">
                {t.nama}<span className="tabular-nums">{t.fields.filter((f) => terisi(dipilih.values[f])).length}/{t.fields.length}</span>
              </h3>
              {t.fields.map((f) =>
                f in MONITORING_TEXT ? (
                  <label key={f} className="block space-y-1 text-sm">
                    <span className="text-xs text-muted">{MONITORING_LABEL[f]}</span>
                    <input
                      className="input w-full"
                      defaultValue={String(dipilih.values[f] ?? "")}
                      key={`${dipilih.karyawanId}-${f}`}
                      onChange={(e) => ubah(dipilih.karyawanId, (b) => ({ ...b, values: { ...b.values, [f]: e.target.value } }))}
                      onFocus={(e) => (simpanKe.current[`${dipilih.karyawanId}-${f}`] = e.target.value.trim())}
                      onBlur={(e) => {
                        if (simpanKe.current[`${dipilih.karyawanId}-${f}`] !== e.target.value.trim()) void saveMonitoringText(dipilih.karyawanId, f, e.target.value);
                      }}
                    />
                  </label>
                ) : (
                  <label key={f} className="flex cursor-pointer items-center gap-2.5 py-0.5 text-sm">
                    <input
                      type="checkbox"
                      checked={Boolean(dipilih.values[f])}
                      onChange={(e) => {
                        const nilai = e.target.checked;
                        ubah(dipilih.karyawanId, (b) => ({ ...b, values: { ...b.values, [f]: nilai } }));
                        void toggleMonitoring(dipilih.karyawanId, f, nilai);
                      }}
                    />
                    {MONITORING_LABEL[f]}
                  </label>
                ),
              )}
            </section>
          ))}

          <label className="block space-y-1 text-sm">
            <span className="text-xs text-muted">Keterangan</span>
            <textarea
              className="input w-full"
              rows={2}
              key={`ket-${dipilih.karyawanId}`}
              defaultValue={dipilih.keterangan}
              onBlur={(e) => {
                if (e.target.value.trim() !== dipilih.keterangan) {
                  ubah(dipilih.karyawanId, (b) => ({ ...b, keterangan: e.target.value.trim() }));
                  void saveMonitoringText(dipilih.karyawanId, "keterangan", e.target.value);
                }
              }}
            />
          </label>
        </aside>
      )}
    </div>
  );
}
