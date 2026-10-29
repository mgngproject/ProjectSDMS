"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { dengan, pesanGalat, text } from "@/lib/params";
import { adminTersedia, createAdminClient } from "@/lib/supabase/admin";

const BAN_SELAMANYA = "876000h";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Akun hanya dikelola Super Admin; kembalikan profil pemanggil. */
async function pastikanSuperAdmin() {
  const profile = await getProfile();
  if (profile.role !== "superadmin") redirect(dengan("/akun", "error", "Hanya Super Admin yang dapat mengelola akun."));
  if (!adminTersedia()) redirect(dengan("/akun", "error", "SUPABASE_SERVICE_ROLE_KEY belum diisi di Vercel."));
  return profile;
}

const selesai = (kunci: "ok" | "error", pesan: string): never => {
  revalidatePath("/akun");
  return redirect(dengan("/akun", kunci, pesan.slice(0, 600)));
};

/** Nilai kolom "akses": "super" untuk Super Admin, selain itu id kategori. */
function bacaAkses(f: FormData): { role: "admin" | "superadmin"; kategori_id: number | null; error: string | null } {
  const akses = text(f, "akses");
  if (akses === "super") return { role: "superadmin", kategori_id: null, error: null };
  const id = Number(akses);
  if (!akses || !Number.isInteger(id) || id <= 0) return { role: "admin", kategori_id: null, error: "Pilih kategori atau Super Admin." };
  return { role: "admin", kategori_id: id, error: null };
}

const cekPassword = (p: string | null) => (!p || p.length < 8 ? "Password minimal 8 karakter." : null);

export async function tambahAkun(formData: FormData) {
  await pastikanSuperAdmin();
  const email = text(formData, "email")?.toLowerCase() ?? "";
  const nama = text(formData, "nama");
  const jabatan = text(formData, "jabatan");
  const password = text(formData, "password");
  const akses = bacaAkses(formData);
  if (!EMAIL.test(email)) selesai("error", "Email tidak valid.");
  if (!nama) selesai("error", "Nama wajib diisi.");
  if (akses.error) selesai("error", akses.error);
  const salahPassword = cekPassword(password);
  if (salahPassword) selesai("error", salahPassword);

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({ email, password: password!, email_confirm: true });
  if (error || !data.user) selesai("error", `Gagal membuat akun: ${error?.message ?? "tidak diketahui"}`);
  const { error: profError } = await admin.from("profiles").insert({
    id: data!.user!.id,
    nama,
    jabatan: jabatan ?? (akses.role === "superadmin" ? "Superadmin" : "Admin"),
    role: akses.role,
    kategori_id: akses.kategori_id,
  });
  if (profError) {
    await admin.auth.admin.deleteUser(data!.user!.id);
    selesai("error", `Gagal menyimpan profil: ${pesanGalat(profError)}`);
  }
  selesai("ok", `Akun ${email} dibuat.`);
}

// Id disematkan lewat bind(): nama dan nilai tombol tidak ikut terkirim bersama aksi server
export async function ubahAkun(id: string, formData: FormData) {
  const saya = await pastikanSuperAdmin();
  const nama = text(formData, "nama");
  const akses = bacaAkses(formData);
  if (!nama) selesai("error", "Nama wajib diisi.");
  if (akses.error) selesai("error", akses.error);
  if (id === saya.id && akses.role !== "superadmin") selesai("error", "Anda tidak dapat mencabut peran Super Admin dari akun Anda sendiri.");

  const { error } = await createAdminClient().from("profiles").update({ nama, role: akses.role, kategori_id: akses.kategori_id }).eq("id", id);
  if (error) selesai("error", pesanGalat(error));
  selesai("ok", "Akun disimpan. Perubahan akses berlaku saat pengguna memuat ulang halaman.");
}

export async function resetPassword(id: string, formData: FormData) {
  await pastikanSuperAdmin();
  const password = text(formData, "password");
  const salah = cekPassword(password);
  if (salah) selesai("error", salah);
  const { error } = await createAdminClient().auth.admin.updateUserById(id, { password: password! });
  if (error) selesai("error", `Gagal mengganti password: ${error.message}`);
  selesai("ok", "Password diganti. Sampaikan password baru kepada pemilik akun.");
}

export async function ubahStatusAkun(id: string, aktif: boolean, _formData: FormData) {
  const saya = await pastikanSuperAdmin();
  if (!aktif && id === saya.id) selesai("error", "Anda tidak dapat menonaktifkan akun Anda sendiri.");
  const { error } = await createAdminClient().auth.admin.updateUserById(id, { ban_duration: aktif ? "none" : BAN_SELAMANYA });
  if (error) selesai("error", `Gagal mengubah status: ${error.message}`);
  selesai("ok", aktif ? "Akun diaktifkan." : "Akun dinonaktifkan. Sesi yang sedang berjalan berakhir paling lama sekitar 1 jam.");
}
