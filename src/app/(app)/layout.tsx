import Link from "next/link";
import { getProfile } from "@/lib/auth";
import { logout } from "@/app/login/actions";

const MENU = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/karyawan", label: "Karyawan" },
  { href: "/kontrak", label: "Kontrak" },
  { href: "/datadiri", label: "Data Diri" },
  { href: "/monitoring", label: "Monitoring" },
  { href: "/terminate", label: "Terminate" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="bg-slate-800 p-4 text-white md:w-56">
        <div className="mb-4 text-lg font-bold">SDMS</div>
        <nav className="flex gap-3 md:flex-col">
          {MENU.map((m) => (
            <Link key={m.href} href={m.href} className="rounded px-2 py-1 text-sm hover:bg-slate-700">
              {m.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1">
        <header className="flex items-center justify-between bg-white px-4 py-3 shadow-sm">
          <div className="text-sm">
            <span className="font-medium">{profile.nama}</span>
            <span className="ml-2 text-gray-500">
              {profile.role === "superadmin" ? "Semua kategori" : profile.kategori?.nama}
            </span>
          </div>
          <form action={logout}>
            <button className="btn-secondary" type="submit">Keluar</button>
          </form>
        </header>
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
