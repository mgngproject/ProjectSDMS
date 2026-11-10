"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (error) redirect(`/login?error=kredensial&detail=${encodeURIComponent(error.message)}`);
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

const HALAMAN_LUPA = "/login/lupa-password";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const keLupa = (params: Record<string, string>): never => redirect(`${HALAMAN_LUPA}?${new URLSearchParams(params).toString()}`);

/**
 * Langkah 1 lupa password: kirim kode verifikasi ke email akun.
 * Pesan sukses selalu sama agar tidak membocorkan email mana yang terdaftar.
 */
export async function kirimKodeReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL.test(email)) keLupa({ error: "Email tidak valid." });

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  // Batas pengiriman (mis. tunggu 60 detik) tetap disampaikan; galat lain disamarkan
  if (error && /rate limit|seconds|too many/i.test(error.message)) {
    keLupa({ email, langkah: "kode", error: "Terlalu sering meminta kode. Tunggu sekitar 1 menit lalu coba lagi." });
  }
  if (error) console.error("resetPasswordForEmail:", error.message);
  keLupa({ email, langkah: "kode", ok: "Jika email terdaftar, kode verifikasi sudah dikirim. Cek kotak masuk dan folder Spam." });
}

/** Langkah 2 lupa password: cocokkan kode dari email lalu simpan password baru. */
export async function resetDenganKode(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const kode = String(formData.get("kode") ?? "").replace(/\s+/g, "");
  const baru = String(formData.get("password_baru") ?? "");
  const ulang = String(formData.get("password_ulang") ?? "");
  const gagalKode = (pesan: string): never => keLupa({ email, langkah: "kode", error: pesan });

  if (!EMAIL.test(email)) keLupa({ error: "Email tidak valid." });
  if (!/^\d{6,10}$/.test(kode)) gagalKode("Kode verifikasi berupa angka dari email.");
  if (baru.length < 8) gagalKode("Password baru minimal 8 karakter.");
  if (baru !== ulang) gagalKode("Konfirmasi password baru tidak sama.");

  const supabase = await createClient();
  const { error: galatKode } = await supabase.auth.verifyOtp({ email, token: kode, type: "recovery" });
  if (galatKode) gagalKode("Kode salah atau sudah kedaluwarsa. Minta kode baru bila perlu.");

  const { error } = await supabase.auth.updateUser({ password: baru });
  await supabase.auth.signOut();
  if (error) gagalKode(`Gagal menyimpan password: ${error.message}`);

  redirect(`/login?ok=${encodeURIComponent("Password berhasil diatur ulang. Silakan masuk dengan password baru.")}`);
}
