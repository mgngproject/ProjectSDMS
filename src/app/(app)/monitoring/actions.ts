"use server";

import { revalidatePath } from "next/cache";
import { MONITORING_CHECKBOX, MONITORING_TEXT, monitoringStatus } from "@/lib/monitoring";
import { createClient } from "@/lib/supabase/server";

async function simpan(karyawanId: number, field: string, value: boolean | string | null) {
  const supabase = await createClient();
  await supabase.from("monitoring").update({ [field]: value }).eq("karyawan_id", karyawanId);

  // Status Selesai hanya bila semua isian lengkap
  const { data } = await supabase.from("monitoring").select("*").eq("karyawan_id", karyawanId).single();
  if (data) await supabase.from("monitoring").update({ status: monitoringStatus(data) }).eq("karyawan_id", karyawanId);
  revalidatePath("/monitoring");
  revalidatePath("/dashboard");
}

export async function toggleMonitoring(karyawanId: number, field: string, value: boolean) {
  if (!(field in MONITORING_CHECKBOX)) return;
  await simpan(karyawanId, field, value);
}

export async function saveMonitoringText(karyawanId: number, field: string, value: string) {
  if (!(field in MONITORING_TEXT) && field !== "keterangan") return;
  await simpan(karyawanId, field, value.trim());
}
