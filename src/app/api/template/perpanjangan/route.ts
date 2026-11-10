import * as XLSX from "xlsx";
import { getProfile } from "@/lib/auth";

/** Template laporan perpanjangan: satu baris = satu kontrak baru untuk satu NP. */
export async function GET() {
  const profile = await getProfile();
  if (profile.role !== "superadmin") return new Response("Hanya Super Admin.", { status: 403 });

  const judul = ["NP", "Nama", "Kontrak Ke", "Awal Kontrak", "Akhir Kontrak", "Penilaian", "Folder"];
  const contoh = ["123456", "Nama Karyawan (opsional)", "", "2027-01-01", "2027-12-31", "", ""];
  const petunjuk = [
    ["Petunjuk"],
    ["Satu baris = satu kontrak perpanjangan untuk satu karyawan (NP harus sudah terdaftar dan aktif)."],
    ["Wajib: NP, Awal Kontrak, Akhir Kontrak. Format tanggal YYYY-MM-DD, DD/MM/YYYY, atau tanggal Excel."],
    ["Kontrak Ke boleh dikosongkan: otomatis diberi nomor berikutnya (mis. Kontrak 3)."],
    ["Nama hanya untuk memudahkan membaca; tidak dipakai saat import."],
    ["Riwayat lama tidak dihapus. Kontrak yang awal kontraknya sudah ada di riwayat akan dilewati."],
    ["Kontrak terbaru yang belum berakhir menjadi kontrak aktif; kontrak aktif sebelumnya otomatis selesai."],
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([judul, contoh]), "Perpanjangan");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(petunjuk), "Petunjuk");
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="Template_Laporan_Perpanjangan.xlsx"',
    },
  });
}
