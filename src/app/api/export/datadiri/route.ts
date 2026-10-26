import { excelResponse } from "@/lib/export";
import { formatTanggal } from "@/lib/format";
import type { DataDiri } from "@/lib/types";

type Row = DataDiri & { karyawan: { np: string; nama: string } };

export async function GET() {
  return excelResponse("DatadiriKaryawan", async (supabase) => {
    const { data } = await supabase
      .from("data_diri")
      .select("*, karyawan:karyawan_id!inner(np, nama, status)")
      .eq("karyawan.status", "aktif");
    return ((data ?? []) as unknown as Row[])
      .sort((a, b) => a.karyawan.nama.localeCompare(b.karyawan.nama))
      .map((d) => {
        const t = d.jenjang_2 ? { j: d.jenjang_2, s: d.jurusan_2, k: d.kampus_2 } : { j: d.jenjang_1, s: d.jurusan_1, k: d.kampus_1 };
        const alamat = [d.alamat, d.rt && `RT ${d.rt}`, d.rw && `RW ${d.rw}`, d.kelurahan, d.kecamatan, d.kabupaten, d.provinsi].filter(Boolean).join(", ");
        return {
          NP: d.karyawan.np,
          Nama: d.karyawan.nama,
          "No KTP": d.ktp ?? "-",
          "Tempat Tanggal Lahir": d.tempat_lahir && d.tanggal_lahir ? `${d.tempat_lahir}, ${formatTanggal(d.tanggal_lahir)}` : "-",
          Alamat: alamat || "-",
          Jenjang: t.j,
          Jurusan: t.s,
          "Nama PT": t.k,
        };
      });
  });
}
