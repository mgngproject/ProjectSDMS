import { LogOut } from "lucide-react";
import { Suspense } from "react";
import SidebarNav from "@/components/SidebarNav";
import { logout } from "@/app/login/actions";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  const isSuperAdmin = profile.role === "superadmin";
  const judul = `Dashboard ${isSuperAdmin ? "Super Admin" : profile.kategori?.nama ?? ""}`;
  const peran = isSuperAdmin ? "Super Admin" : `PIC ${profile.kategori?.nama ?? ""}`;

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
      <aside className="flex flex-col gap-4 border-b border-line bg-card p-4 md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:border-b-0 md:border-r md:p-5">
        <div className="flex items-center gap-3">
          <span className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500" />
          <span className="text-lg font-bold leading-tight">{judul}</span>
        </div>

        <Suspense fallback={null}>
          <SidebarNav kategori={menuKategori} />
        </Suspense>

        <div className="mt-auto flex items-center gap-3 rounded-2xl bg-primary-soft p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-card text-sm font-bold text-primary">
            {profile.nama.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{profile.nama}</div>
            <div className="truncate text-xs text-muted">{peran}</div>
          </div>
          <form action={logout}>
            <button type="submit" className="rounded-lg p-2 text-muted transition hover:bg-card hover:text-danger" aria-label="Keluar" title="Keluar">
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-1 space-y-5 p-4 md:p-8">{children}</main>
    </div>
  );
}
