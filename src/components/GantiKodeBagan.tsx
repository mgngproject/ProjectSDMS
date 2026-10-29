"use client";

import { useRef, useState } from "react";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  kode: string;
  nama: string;
  /** Jumlah karyawan (semua status) yang memakai kode ini dan beberapa nama contoh. */
  jumlah: number;
  contoh: string[];
  bawahan: { kode: string; nama: string }[];
  semuaKode: string[];
};

/** Tombol Ganti kode: dialog dengan kolom kode baru, pratinjau dampak, dan konfirmasi. */
export default function GantiKodeBagan({ action, kode, nama, jumlah, contoh, bawahan, semuaKode }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [nilai, setNilai] = useState("");
  const baru = nilai.trim().toUpperCase();

  const galat = !baru
    ? null
    : baru === kode
      ? "Kode baru sama dengan kode lama."
      : !/^[A-Z0-9]{3,12}$/.test(baru)
        ? "Kode hanya boleh huruf dan angka, 3 sampai 12 karakter."
        : semuaKode.includes(baru)
          ? `Kode ${baru} sudah dipakai unit lain.`
          : null;
  const valid = !!baru && !galat;

  return (
    <>
      <button type="button" className="btn-secondary !px-3 !py-1.5" aria-label={`Ganti kode ${kode}, ${nama}`} onClick={() => { setNilai(""); dialog.current?.showModal(); }}>
        Ganti kode
      </button>
      <dialog ref={dialog} className="w-[min(92vw,520px)] rounded-2xl border border-line bg-card p-0 text-ink shadow-2xl backdrop:bg-black/40" onClick={(e) => { if (e.target === dialog.current) dialog.current?.close(); }}>
        <form action={action} className="space-y-4 p-5">
          <div>
            <h2 className="text-lg font-semibold">Ganti kode</h2>
            <p className="text-sm text-muted">Unit "{nama}" tetap bernama sama; hanya kodenya yang berubah.</p>
          </div>
          <div>
            <label className="label" htmlFor={`kode-baru-${kode}`}>Kode baru</label>
            <input
              id={`kode-baru-${kode}`} name="kode_baru" className="input font-bold uppercase" value={nilai} onChange={(e) => setNilai(e.target.value)}
              autoComplete="off" spellCheck={false} placeholder="Contoh: 20AB11" aria-describedby={`pesan-${kode}`} autoFocus
            />
            <p id={`pesan-${kode}`} aria-live="polite" className={`mt-1 min-h-[1.25rem] text-xs ${galat ? "font-medium text-danger" : "font-medium text-success"}`}>
              {galat ?? (valid ? `Kode ${baru} tersedia.` : "")}
            </p>
          </div>
          <div className="rounded-xl border border-line p-3 text-sm">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-base font-bold">
              <s className="font-medium text-muted">{kode}</s><span aria-hidden="true">→</span><span className="text-primary">{valid ? baru : baru || "…"}</span>
            </div>
            <div className="flex justify-between gap-3"><span>Karyawan yang kodenya ikut berubah</span><b>{jumlah}</b></div>
            <div className="flex justify-between gap-3"><span>Unit bawahan yang atasannya ikut berubah</span><b>{bawahan.length}</b></div>
            <div className="flex justify-between gap-3"><span>Nama unit</span><b>tetap</b></div>
            {contoh.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {contoh.map((n) => <span key={n} className="rounded-full border border-line bg-soft px-2.5 py-0.5 text-xs">{n}</span>)}
                {jumlah > contoh.length && <span className="rounded-full border border-line bg-soft px-2.5 py-0.5 text-xs">+{jumlah - contoh.length} lainnya</span>}
              </div>
            )}
            {bawahan.length > 0 && <ul className="mt-2 list-disc pl-5 text-xs text-muted">{bawahan.map((b) => <li key={b.kode}>{b.kode} {b.nama}</li>)}</ul>}
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn disabled:cursor-not-allowed disabled:opacity-45" disabled={!valid}>Ganti kode</button>
            <button type="button" className="btn-secondary" onClick={() => dialog.current?.close()}>Batal</button>
          </div>
        </form>
      </dialog>
    </>
  );
}
