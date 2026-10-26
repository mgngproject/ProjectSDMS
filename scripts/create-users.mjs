// Membuat akun Supabase Auth + profil untuk tiap kategori dan Super Admin.
// Jalankan lokal: node --env-file=.env scripts/create-users.mjs
// Password diambil dari env (lihat daftar di bawah), tidak disimpan di repo.
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di .env");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

// [nama kategori | null untuk superadmin, nama akun, email, nama variabel password]
const accounts = [
  ["IDE", "Admin IDE", "adminide@peruri.com", "PASSWORD_IDE"],
  ["IDH", "Admin IDH", "adminidh@peruri.com", "PASSWORD_IDH"],
  ["BGN", "Admin BGN", "adminbgn@peruri.com", "PASSWORD_BGN"],
  ["TPBW/TPP", "Admin TPBW/TPP", "admintpbw@peruri.com", "PASSWORD_TPBW"],
  ["Magang", "PIC Magang", "picmagang@peruri.com", "PASSWORD_MAGANG"],
  ["PKWT", "PIC PKWT", "picpkwt@peruri.com", "PASSWORD_PKWT"],
  ["Inagov", "Admin Inagov", "admininagov@peruri.com", "PASSWORD_INAGOV"],
  [null, "Super Admin", "superadminsdms@peruri.com", "PASSWORD_SUPERADMIN"],
];

const { data: kategori, error: katError } = await supabase.from("kategori").select("id, nama");
if (katError) throw katError;
const kategoriId = Object.fromEntries(kategori.map((k) => [k.nama, k.id]));

for (const [kat, nama, email, passVar] of accounts) {
  const password = process.env[passVar];
  if (!password) {
    console.warn(`Lewati ${email}: ${passVar} belum diisi`);
    continue;
  }
  const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) {
    console.warn(`Gagal ${email}: ${error.message}`);
    continue;
  }
  const { error: profError } = await supabase.from("profiles").insert({
    id: data.user.id,
    nama,
    jabatan: kat ? "Admin" : "Superadmin",
    role: kat ? "admin" : "superadmin",
    kategori_id: kat ? kategoriId[kat] : null,
  });
  console.log(profError ? `Profil ${email} gagal: ${profError.message}` : `OK ${email}`);
}
