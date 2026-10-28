// Perhitungan kuota Magang. Kuota adalah batas peserta aktif bersamaan per unit kerja di tiap penempatan;
// satu peserta memakai satu slot selama seluruh masa kontraknya.

export const TEMPAT = ["Jakarta", "Karawang"] as const;

export type KuotaRow = { id: number; unit_kerja: string; penempatan: string; kuota: number };
export type PesertaKuota = { id: number; unit_kerja: string | null; penempatan: string | null; awal: string | null; akhir: string | null };

const NAMA_BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const norm = (s: string | null | undefined) => (s ?? "").trim().toLowerCase();

/** "2026-10" -> nomor bulan berurutan. */
const nomor = (ym: string) => Number(ym.slice(0, 4)) * 12 + Number(ym.slice(5, 7)) - 1;
const dariNomor = (n: number) => `${Math.floor(n / 12)}-${String((n % 12) + 1).padStart(2, "0")}`;

export const bulanDari = (tanggal: string) => tanggal.slice(0, 7);
export const geserBulan = (ym: string, n: number) => dariNomor(nomor(ym) + n);
export const namaBulan = (ym: string) => `${NAMA_BULAN[Number(ym.slice(5, 7)) - 1]} ${ym.slice(0, 4)}`;
export const singkatBulan = (ym: string) => NAMA_BULAN[Number(ym.slice(5, 7)) - 1].slice(0, 3);
export const bulanValid = (ym: string | undefined): ym is string => !!ym && /^\d{4}-(0[1-9]|1[0-2])$/.test(ym);

/** Peserta yang kontraknya mencakup bulan tersebut (sebagian bulan pun dihitung). */
export function pesertaDiBulan(peserta: PesertaKuota[], unit: string, tempat: string, ym: string): PesertaKuota[] {
  return peserta.filter(
    (p) => norm(p.unit_kerja) === norm(unit) && p.penempatan === tempat && p.awal && p.akhir && bulanDari(p.awal) <= ym && bulanDari(p.akhir) >= ym,
  );
}

/** Peringatan bila peserta baru membuat unit kerja di penempatan itu penuh. Null bila aman atau kuota belum dipakai. */
export function peringatanKuota(
  kuota: KuotaRow[],
  peserta: PesertaKuota[],
  baru: { unit_kerja: string | null; penempatan: string | null; awal: string; akhir: string },
): string | null {
  if (kuota.length === 0 || !baru.unit_kerja || !baru.penempatan) return null;
  const baris = kuota.find((k) => norm(k.unit_kerja) === norm(baru.unit_kerja) && k.penempatan === baru.penempatan);
  if (!baris) {
    const ada = kuota.filter((k) => norm(k.unit_kerja) === norm(baru.unit_kerja)).map((k) => k.penempatan);
    return `${baru.unit_kerja} belum punya kuota di ${baru.penempatan}${ada.length ? ` (kuota hanya ada di ${ada.join(" dan ")})` : ""}.`;
  }
  const penuh: string[] = [];
  const mulai = nomor(bulanDari(baru.awal));
  const sampai = Math.min(nomor(bulanDari(baru.akhir)), mulai + 35);
  for (let n = mulai; n <= sampai; n++) {
    const ym = dariNomor(n);
    const terisi = pesertaDiBulan(peserta, baru.unit_kerja, baru.penempatan, ym).length;
    if (terisi >= baris.kuota) penuh.push(`${singkatBulan(ym)} ${ym.slice(0, 4)} (${terisi}/${baris.kuota})`);
  }
  return penuh.length ? `${baru.unit_kerja} di ${baru.penempatan} sudah penuh pada ${penuh.join(", ")}.` : null;
}

export function statusKuota(kuota: number, terisi: number): { nada: "success" | "warning" | "danger"; label: string } {
  if (terisi > kuota) return { nada: "danger", label: `Melebihi +${terisi - kuota}` };
  if (terisi === kuota) return { nada: "danger", label: "Penuh" };
  if (kuota > 0 && terisi / kuota >= 0.8) return { nada: "warning", label: "Hampir penuh" };
  return { nada: "success", label: "Tersedia" };
}
