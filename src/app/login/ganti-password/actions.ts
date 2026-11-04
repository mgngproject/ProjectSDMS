"use server";

import { createClient as createPlainClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { dengan, text } from "@/lib/params";
import { createClient } from "@/lib/supabase/server";

const HALAMAN = "/login/ganti-password";

const gagal = (pesan: string): never => redirect(dengan(HALAMAN, "error", pesan));

/**
 * Pemilik akun mengganti password-nya sendiri tanpa Super Admin.
 * Password lama diperiksa lewat klien sementara (tanpa cookie), jadi sesi di browser
 * tidak tersentuh sampai penggantian berhasil.
 */
export async function gantiPassword(formData: FormData) {
  const email = text(formData, "email")?.toLowerCase() ?? "";
  const lama = String(formData.get("password_lama") ?? "");
  const baru = String(formData.get("password_baru") ?? "");
  const ulang = String(formData.get("password_ulang") ?? "");

  if (!email || !lama) gagal("Email dan password lama wajib diisi.");
  if (baru.length < 8) gagal("Password baru minimal 8 karakter.");
  if (baru !== ulang) gagal("Konfirmasi password baru tidak sama.");
  if (baru === lama) gagal("Password baru harus berbeda dari password lama.");

  const supabase = createPlainClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error: galatMasuk } = await supabase.auth.signInWithPassword({ email, password: lama });
  if (galatMasuk) gagal("Email atau password lama salah, atau akun sedang nonaktif.");

  const { error: galatUbah } = await supabase.auth.updateUser({ password: baru });
  await supabase.auth.signOut({ scope: "local" });
  if (galatUbah) gagal(`Gagal mengganti password: ${galatUbah.message}`);

  // Akhiri sesi di browser ini agar pengguna masuk lagi dengan password baru
  await (await createClient()).auth.signOut({ scope: "local" });
  redirect(dengan("/login", "ok", "Password berhasil diganti. Silakan masuk dengan password baru."));
}
