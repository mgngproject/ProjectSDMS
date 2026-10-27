import { formatTanggal, masaKerja } from "@/lib/format";
import { LABEL_INTI, configKategori, labelKolom } from "@/lib/kategori-config";
import { KOLOM_STANDAR, nilaiKolom, normalisasi, type BarisKaryawan } from "@/lib/kolom";
import type { DataDiri } from "@/lib/types";
import type { createClient } from "@/lib/supabase/server";

type Klien = Awaited<ReturnType<typeof createClient>>;
export type Sel = string | number | null;
export type Tabel = { judul: string; baris: Record<string, Sel>[] };

/**
 * Data tabel untuk export Excel dan PDF. `format` true = tanggal dan rupiah diformat (PDF),
 * false = nilai mentah (Excel). Baris dibatasi RLS sesuai kategori pengguna.
 */
export async function tabelKaryawan(supabase: Klien, namaKategori: string | null, format: boolean): Promise<Tabel> {
  const config = configKategori(namaKategori);
  const kolom = config ? config.kolomTabel : KOLOM_STANDAR;
  const relasi = config ? `, detail:${config.tabel}(*)` : "";
  let query = supabase.from("karyawan").select(`*, kategori:kategori_id(nama)${relasi}`).eq("status", "aktif").order("nama");
  if (namaKategori) {
    const { data: kat } = await supabase.from("kategori").select("id").eq("nama", namaKategori).maybeSingle();
    if (kat) query = query.eq("kategori_id", kat.id);
  }
  const { data } = await query;
  return {
    judul: `Data Karyawan${namaKategori ? ` ${namaKategori}` : ""}`,
    baris: normalisasi((data ?? []) as unknown as BarisKaryawan[]).map((r) =>
      Object.fromEntries(kolom.map((k) => [config ? labelKolom(k, config) : LABEL_INTI[k] ?? k, nilaiKolom(r, k, config, format)])),
    ),
  };
}

export async function tabelTerminate(supabase: Klien, format: boolean): Promise<Tabel> {
  const { data } = await supabase.from("karyawan").select("*, kategori:kategori_id(nama)").eq("status", "terminate").order("nama");
  const tgl = (v: string | null) => (format ? formatTanggal(v) : v);
  return {
    judul: "Data Terminate",
    baris: ((data ?? []) as unknown as BarisKaryawan[]).map((k) => ({
      NP: k.np,
      Nama: k.nama,
      Kategori: k.kategori?.nama ?? "",
      "Masa Kerja": masaKerja(k),
      "Awal Kontrak Masuk": tgl(k.awal_kontrak),
      "Akhir Kontrak": tgl(k.akhir_kontrak),
      "Kode Bagan": k.kode_bagan,
      "Unit Kerja": k.unit_kerja,
      Jabatan: k.jabatan,
      Level: k.level,
      Role: k.role,
      "Tanggal Keluar": tgl(k.tanggal_keluar),
      "Alasan Keluar": k.alasan_keluar,
    })),
  };
}

type BarisDataDiri = DataDiri & { karyawan: { np: string; nama: string } };

export async function tabelDataDiri(supabase: Klien): Promise<Tabel> {
  const { data } = await supabase
    .from("data_diri")
    .select("*, karyawan:karyawan_id!inner(np, nama, status)")
    .eq("karyawan.status", "aktif");
  return {
    judul: "Data Diri Karyawan",
    baris: ((data ?? []) as unknown as BarisDataDiri[])
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
      }),
  };
}
