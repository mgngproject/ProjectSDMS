"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { dengan, pesanGalat, text } from "@/lib/params";
import { createClient } from "@/lib/supabase/server";

function bacaKontrak(f: FormData, statusBoleh: string[]) {
  return {
    kontrak_ke: text(f, "kontrak_ke"),
    np: text(f, "np"),
    awal_kontrak: text(f, "awal_kontrak"),
    akhir_kontrak: text(f, "akhir_kontrak"),
    status: statusBoleh.includes(String(f.get("status"))) ? String(f.get("status")) : "aktif",
    penilaian: text(f, "penilaian"),
    folder_link: text(f, "folder_link"),
  };
}

function galat(p: ReturnType<typeof bacaKontrak>): string | null {
  if (!p.kontrak_ke || !p.np) return "Kontrak ke dan NP wajib diisi.";
  if (!p.awal_kontrak || !p.akhir_kontrak) return "Awal dan akhir kontrak wajib diisi.";
  if (p.akhir_kontrak <= p.awal_kontrak) return "Akhir kontrak harus setelah awal kontrak.";
  if (p.folder_link && !/^https?:\/\/\S+$/.test(p.folder_link)) return "Link folder tidak valid.";
  return null;
}

async function sinkron(karyawanId: number, np: string | null) {
  const supabase = await createClient();
  if (np) await supabase.from("karyawan").update({ np }).eq("id", karyawanId).neq("np", np);
  await supabase.rpc("sync_kontrak", { kid: karyawanId });
  revalidatePath("/karyawan");
  revalidatePath("/kontrak");
  revalidatePath(`/karyawan/${karyawanId}/kontrak`);
}

export async function createKontrak(karyawanId: number, formData: FormData) {
  const back = `/karyawan/${karyawanId}/kontrak`;
  const p = bacaKontrak(formData, ["aktif", "selesai"]);
  const pesan = galat(p);
  if (pesan) redirect(dengan(back, "error", pesan));

  const supabase = await createClient();
  if (p.status === "aktif") {
    await supabase.from("kontrak").update({ status: "selesai" }).eq("karyawan_id", karyawanId).eq("status", "aktif");
  }
  const { error } = await supabase.from("kontrak").insert({ karyawan_id: karyawanId, ...p });
  if (error) redirect(dengan(back, "error", pesanGalat(error)));

  await sinkron(karyawanId, p.np);
  redirect(dengan(back, "ok", "Kontrak berhasil ditambahkan"));
}

export async function updateKontrak(id: number, karyawanId: number, formData: FormData) {
  const back = `/karyawan/${karyawanId}/kontrak`;
  const p = bacaKontrak(formData, ["aktif", "selesai", "terminate"]);
  const pesan = galat(p);
  if (pesan) redirect(dengan(`/kontrak/${id}/edit`, "error", pesan));

  const supabase = await createClient();
  if (p.status === "aktif") {
    await supabase.from("kontrak").update({ status: "selesai" }).eq("karyawan_id", karyawanId).eq("status", "aktif").neq("id", id);
  }
  const { error } = await supabase.from("kontrak").update(p).eq("id", id);
  if (error) redirect(dengan(`/kontrak/${id}/edit`, "error", pesanGalat(error)));

  await sinkron(karyawanId, p.np);
  redirect(dengan(back, "ok", "Kontrak berhasil diupdate"));
}

export async function deleteKontrak(formData: FormData) {
  const id = Number(formData.get("id"));
  const karyawanId = Number(formData.get("karyawan_id"));
  const back = `/karyawan/${karyawanId}/kontrak`;

  const supabase = await createClient();
  const { error } = await supabase.from("kontrak").delete().eq("id", id);
  if (error) redirect(dengan(back, "error", pesanGalat(error)));

  await sinkron(karyawanId, null);
  redirect(dengan(back, "ok", "Kontrak berhasil dihapus"));
}
