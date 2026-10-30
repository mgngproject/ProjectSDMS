import { createClient } from "@supabase/supabase-js";

// Klien dengan service role: melewati RLS dan boleh mengelola akun Auth.
// Hanya dipakai dari server action/halaman server yang sudah memastikan penggunanya Super Admin.
// Jangan diimpor dari komponen klien dan jangan memberi awalan NEXT_PUBLIC_ pada kuncinya.

export const adminTersedia = () => !!process.env.SUPABASE_SERVICE_ROLE_KEY;

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_SERVICE_ROLE_KEY belum diisi di environment server.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
