import { cookies } from "next/headers";
import Sidebar from "@/components/Sidebar";
import { logout } from "@/app/login/actions";
import { getProfile } from "@/lib/auth";
import { COOKIE_SIDEBAR } from "@/lib/sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  const isSuperAdmin = profile.role === "superadmin";
  const peran = isSuperAdmin ? "Super Admin" : `PIC ${profile.kategori?.nama ?? ""}`;
  const awalTertutup = (await cookies()).get(COOKIE_SIDEBAR)?.value === "tutup";

  // Submenu Karyawan per kategori (Super Admin): daftar kategori dengan jumlah karyawan aktif
  let menuKategori: { nama: string; jumlah: number }[] | undefined;
  if (isSuperAdmin) {
    const supabase = await createClient();
    const [{ data: daftar }, { data: aktif }] = await Promise.all([
      supabase.from("kategori").select("id, nama").order("id"),
      supabase.from("karyawan").select("kategori_id").eq("status", "aktif"),
    ]);
    const jumlah = new Map<number, number>();
    for (const r of aktif ?? []) jumlah.set(r.kategori_id, (jumlah.get(r.kategori_id) ?? 0) + 1);
    menuKategori = (daftar ?? []).map((k) => ({ nama: k.nama, jumlah: jumlah.get(k.id) ?? 0 }));
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar kategori={menuKategori} tampilKuota={!isSuperAdmin && profile.kategori?.nama === "Magang"} nama={profile.nama} peran={peran} awalTertutup={awalTertutup} logout={logout} />
      <main className="min-w-0 flex-1 space-y-5 p-4 md:p-8">{children}</main>
    </div>
  );
}
