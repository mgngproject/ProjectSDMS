import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export async function getProfile(): Promise<Profile> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("profiles")
    .select("id, nama, jabatan, role, kategori_id, kategori:kategori_id(nama)")
    .eq("id", user.id)
    .single();

  // Akun Auth tanpa profil tidak boleh masuk. Cookie tidak bisa dihapus dari Server Component,
  // jadi middleware membiarkan /login?error=... terbuka agar tidak terjadi redirect berputar.
  if (!data) redirect("/login?error=profil");
  return data as unknown as Profile;
}
