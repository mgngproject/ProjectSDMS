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

const HALAMAN_GANTI = "/login/ganti-password";
const gagal = (pesan: string): never => redirect(`${HALAMAN_GANTI}?error=${encodeURIComponent(pesan.slice(0, 600))}`);

/**
 * Ganti password oleh pemilik akun sendiri (semua PIC dan Super Admin).
 * Password lama diverifikasi dengan masuk lebih dulu; setelah diganti, semua sesi diakhiri
 * agar pengguna masuk ulang dengan password baru.
 */
export async function gantiPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const lama = String(formData.get("password_lama") ?? "");
  const baru = String(formData.get("password_baru") ?? "");
  const ulang = String(formData.get("password_ulang") ?? "");

  if (!email || !lama) gagal("Email dan password lama wajib diisi.");
  if (baru.length < 8) gagal("Password baru minimal 8 karakter.");
  if (baru !== ulang) gagal("Konfirmasi password baru tidak sama.");
  if (baru === lama) gagal("Password baru harus berbeda dari password lama.");

  const supabase = await createClient();
  const { error: galatMasuk } = await supabase.auth.signInWithPassword({ email, password: lama });
  if (galatMasuk) gagal("Email atau password lama salah.");

  const { error } = await supabase.auth.updateUser({ password: baru });
  // Sesi dari verifikasi di atas (dan sesi lain milik akun ini) diakhiri apa pun hasilnya
  await supabase.auth.signOut();
  if (error) gagal(`Gagal mengganti password: ${error.message}`);

  redirect(`/login?ok=${encodeURIComponent("Password berhasil diganti. Silakan masuk dengan password baru.")}`);
}
