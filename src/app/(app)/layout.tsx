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
    const { data: daftar } = await supabase.from("kategori").select("id, nama").order("id");
    // Hitung per kategori di database (tanpa menarik semua baris karyawan; batas bawaan 1000 baris juga membuat hitungan salah)
    menuKategori = await Promise.all(
      (daftar ?? []).map(async (k) => {
        const { count } = await supabase.from("karyawan").select("id", { count: "exact", head: true }).eq("kategori_id", k.id).eq("status", "aktif");
        return { nama: k.nama, jumlah: count ?? 0 };
      }),
    );
  }

  return (
    <div className="flex min-h-[calc(100vh/var(--zoom))] flex-col md:flex-row">
      <Sidebar kategori={menuKategori} tampilBagan={isSuperAdmin} tampilAkun={isSuperAdmin} tampilKuota={!isSuperAdmin && profile.kategori?.nama === "Magang"} nama={profile.nama} peran={peran} awalTertutup={awalTertutup} logout={logout} />
      <main className="min-w-0 flex-1 space-y-5 p-4 md:p-8">{children}</main>
    </div>
  );
}
