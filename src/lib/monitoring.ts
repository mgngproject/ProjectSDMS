// Daftar isian monitoring dan aturan status (setara Monitoring::updateStatus di Laravel).

export const MONITORING_CHECKBOX: Record<string, string> = {
  nde_konfirmasi: "NDE Konfirmasi Perpanjangan",
  nde_jawaban: "NDE Jawaban (Unit Kerja)",
  nde_laporan: "NDE Laporan Perpanjangan/Laporan Masuk",
  offering_letter: "Offering Letter",
  izin_prinsip_nde: "Izin Prinsip (NDE)",
  izin_prinsip_manual: "Izin Prinsip (Manual)",
  nde_penyampaian_unit_kerja: "NDE Penyampaian SKEP ke Unit Kerja",
  nde_penyampaian_sdmo: "NDE Penyampaian SKEP ke SDMO",
  upload_ess: "Upload ESS",
  data_diri: "Data Diri",
};

export const MONITORING_TEXT: Record<string, string> = {
  usulan_remunerasi: "Usulan Remunerasi",
  sp: "SP",
  skep: "SKEP",
};

export type MonitoringRow = {
  id: number;
  karyawan_id: number;
  status: "Selesai" | "Belum Lengkap";
  keterangan: string | null;
} & Record<string, string | number | boolean | null>;

/** Daftar isian yang belum lengkap, urutan sama seperti di Laravel. */
export function monitoringKurang(m: Record<string, unknown>): string[] {
  const kurang: string[] = [];
  for (const [field, label] of Object.entries(MONITORING_CHECKBOX)) if (!m[field]) kurang.push(label);
  for (const [field, label] of Object.entries(MONITORING_TEXT)) if (!String(m[field] ?? "").trim()) kurang.push(label);
  return kurang;
}

export function monitoringStatus(m: Record<string, unknown>): "Selesai" | "Belum Lengkap" {
  return monitoringKurang(m).length === 0 ? "Selesai" : "Belum Lengkap";
}

/** Pengelompokan isian per tahap, dipakai panel rincian di halaman Monitoring. */
export const MONITORING_TAHAP: { nama: string; fields: string[] }[] = [
  { nama: "Perpanjangan", fields: ["nde_konfirmasi", "nde_jawaban", "nde_laporan"] },
  { nama: "Persetujuan", fields: ["usulan_remunerasi", "offering_letter", "izin_prinsip_nde", "izin_prinsip_manual"] },
  { nama: "Penetapan", fields: ["sp", "skep"] },
  { nama: "Penyampaian", fields: ["nde_penyampaian_unit_kerja", "nde_penyampaian_sdmo"] },
  { nama: "Administrasi", fields: ["upload_ess", "data_diri"] },
];

export const MONITORING_LABEL: Record<string, string> = { ...MONITORING_CHECKBOX, ...MONITORING_TEXT };
