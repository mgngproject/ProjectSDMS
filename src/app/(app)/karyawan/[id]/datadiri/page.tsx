import Link from "next/link";
import { notFound } from "next/navigation";
import Flash from "@/components/Flash";
import { createClient } from "@/lib/supabase/server";
import { saveDataDiri } from "../../../datadiri/actions";

const FIELDS: [string, string, string?][] = [
  ["ktp", "No. KTP (16 digit)"],
  ["tempat_lahir", "Tempat Lahir"],
  ["tanggal_lahir", "Tanggal Lahir", "date"],
  ["alamat", "Alamat"],
  ["rt", "RT"],
  ["rw", "RW"],
  ["kelurahan", "Kelurahan"],
  ["kecamatan", "Kecamatan"],
  ["kabupaten", "Kabupaten/Kota"],
  ["provinsi", "Provinsi"],
  ["jenjang_1", "Jenjang Pendidikan 1"],
  ["jurusan_1", "Jurusan 1"],
  ["kampus_1", "Kampus 1"],
  ["jenjang_2", "Jenjang Pendidikan 2"],
  ["jurusan_2", "Jurusan 2"],
  ["kampus_2", "Kampus 2"],
];

export default async function DataDiriFormPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: karyawan } = await supabase.from("karyawan").select("id, np, nama").eq("id", Number(id)).maybeSingle();
  if (!karyawan) notFound();
  const { data } = await supabase.from("data_diri").select("*").eq("karyawan_id", karyawan.id).maybeSingle();
  const values = (data ?? {}) as Record<string, string | null>;

  return (
    <div className="space-y-4">
      <div>
        <Link className="text-sm text-blue-600 hover:underline" href="/datadiri">← Kembali</Link>
        <h1 className="text-xl font-bold">Data Diri: {karyawan.nama} ({karyawan.np})</h1>
      </div>
      <Flash error={error} />
      <form action={saveDataDiri.bind(null, karyawan.id)} className="grid max-w-3xl gap-3 rounded bg-white p-4 shadow-sm sm:grid-cols-2">
        {FIELDS.map(([name, label, type]) => (
          <div key={name}>
            <label className="label" htmlFor={name}>{label}</label>
            <input
              className="input"
              id={name}
              name={name}
              type={type ?? "text"}
              maxLength={name === "ktp" ? 16 : undefined}
              inputMode={name === "ktp" ? "numeric" : undefined}
              defaultValue={values[name] ?? ""}
            />
          </div>
        ))}
        <div className="sm:col-span-2"><button className="btn" type="submit">Simpan</button></div>
      </form>
    </div>
  );
}
