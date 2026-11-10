import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

type Klien = Awaited<ReturnType<typeof createClient>>;

/**
 * ID pengguna yang sedang login. `getClaims()` memeriksa tanda tangan token di server aplikasi tanpa bertanya ke Supabase
 * bila proyek memakai kunci asimetris (cepat); selain itu, atau bila gagal, kembali ke `getUser()`.
 */
export async function idPengguna(supabase: Klien): Promise<string | null> {
  const auth = supabase.auth as Klien["auth"] & { getClaims?: () => Promise<{ data: { claims?: { sub?: string } } | null }> };
  if (typeof auth.getClaims === "function") {
    try {
      const { data } = await auth.getClaims();
      if (data?.claims?.sub) return data.claims.sub;
    } catch {
      // lanjut ke pemeriksaan lewat server Supabase
    }
  }
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** Profil pengguna. Dibungkus `cache` agar layout dan halaman dalam satu permintaan hanya sekali bertanya ke Supabase. */
export const getProfile = cache(async (): Promise<Profile> => {
  const supabase = await createClient();
  const id = await idPengguna(supabase);
  if (!id) redirect("/login");

  const { data } = await supabase
    .from("profiles")
    .select("id, nama, jabatan, role, kategori_id, kategori:kategori_id(nama)")
    .eq("id", id)
    .single();

  // Akun Auth tanpa profil tidak boleh masuk. Cookie tidak bisa dihapus dari Server Component,
  // jadi middleware membiarkan /login?error=... terbuka agar tidak terjadi redirect berputar.
  if (!data) redirect("/login?error=profil");
  return data as unknown as Profile;
});
