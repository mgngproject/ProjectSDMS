"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { dengan, pesanGalat, text } from "@/lib/params";
import { createClient } from "@/lib/supabase/server";

const FIELDS = [
  "ktp", "tempat_lahir", "tanggal_lahir", "alamat", "rt", "rw", "kelurahan", "kecamatan", "kabupaten", "provinsi",
  "jenjang_1", "jurusan_1", "kampus_1", "jenjang_2", "jurusan_2", "kampus_2",
];

export async function saveDataDiri(karyawanId: number, formData: FormData) {
  const back = `/karyawan/${karyawanId}/datadiri`;
  const payload = Object.fromEntries(FIELDS.map((k) => [k, text(formData, k)]));
  if (payload.ktp && !/^\d{16}$/.test(String(payload.ktp))) {
    redirect(dengan(back, "error", "No. KTP harus 16 digit angka."));
  }

  const supabase = await createClient();
  const { error } = await supabase.from("data_diri").upsert({ karyawan_id: karyawanId, ...payload }, { onConflict: "karyawan_id" });
  if (error) redirect(dengan(back, "error", pesanGalat(error)));

  revalidatePath("/datadiri");
  redirect(dengan("/datadiri", "ok", "Data diri karyawan berhasil diupdate"));
}
