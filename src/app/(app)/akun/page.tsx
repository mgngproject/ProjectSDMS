import { redirect } from "next/navigation";
import ConfirmSubmit from "@/components/ConfirmSubmit";
import Flash from "@/components/Flash";
import PageHeader from "@/components/PageHeader";
import { getProfile } from "@/lib/auth";
import { adminTersedia, createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ubahAkun, resetPassword, tambahAkun, ubahStatusAkun } from "./actions";

type Baris = { id: string; email: string; nonaktif: boolean; nama: string; role: "admin" | "superadmin"; kategori_id: number | null; terakhir: string | null; adaProfil: boolean };

const aksesNilai = (r: { role: string; kategori_id: number | null }) => (r.role === "superadmin" ? "super" : String(r.kategori_id ?? ""));

export default async function AkunPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const profile = await getProfile();
  // Akun hanya dikelola Super Admin
  if (profile.role !== "superadmin") redirect("/dashboard");

  const supabase = await createClient();
  const { data: kategori } = await supabase.from("kategori").select("id, nama").order("id");
  const namaKategori = new Map((kategori ?? []).map((k) => [k.id, k.nama]));

  let baris: Baris[] = [];
  if (adminTersedia()) {
    const admin = createAdminClient();
    const [{ data: users }, { data: profiles }] = await Promise.all([
      admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      admin.from("profiles").select("id, nama, role, kategori_id"),
    ]);
    const profil = new Map((profiles ?? []).map((p) => [p.id, p]));
    baris = (users?.users ?? [])
      .map((u) => {
        const p = profil.get(u.id);
        return {
          id: u.id,
          email: u.email ?? "-",
          nonaktif: !!u.banned_until && new Date(u.banned_until) > new Date(),
          nama: p?.nama ?? "",
          role: (p?.role ?? "admin") as "admin" | "superadmin",
          kategori_id: p?.kategori_id ?? null,
          terakhir: u.last_sign_in_at ?? null,
          adaProfil: !!p,
        };
      })
      .sort((a, b) => (a.role === b.role ? a.email.localeCompare(b.email) : a.role === "superadmin" ? -1 : 1));
  }

  const opsiAkses = (
    <>
      <option value="">-- Pilih akses --</option>
      <option value="super">Super Admin (semua kategori)</option>
      {(kategori ?? []).map((k) => <option key={k.id} value={k.id}>Admin {k.nama}</option>)}
    </>
  );

  return (
    <div className="space-y-4">
      <PageHeader title="Akun" />
      <Flash ok={sp.ok} error={sp.error} />

      {!adminTersedia() ? (
        <p className="rounded-xl bg-warning-soft p-4 text-sm text-warning">
          Pengelolaan akun belum aktif. Isi variabel <b>SUPABASE_SERVICE_ROLE_KEY</b> di Vercel (Settings → Environment Variables), lalu deploy ulang. Kunci ini hanya dibaca server dan tidak pernah dikirim ke browser.
        </p>
      ) : (
        <>
          <p className="text-sm text-muted">
            Buat, ubah akses, ganti password, dan nonaktifkan akun pengguna. Akun yang dinonaktifkan tidak bisa masuk, datanya tetap tersimpan.
          </p>

          <form action={tambahAkun} className="card grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-5">
            <label className="flex flex-col gap-1 text-sm"><span className="text-xs text-muted">Email</span><input className="input" name="email" type="email" required /></label>
            <label className="flex flex-col gap-1 text-sm"><span className="text-xs text-muted">Nama</span><input className="input" name="nama" required /></label>
            <label className="flex flex-col gap-1 text-sm"><span className="text-xs text-muted">Akses</span><select className="input" name="akses" required defaultValue="">{opsiAkses}</select></label>
            <label className="flex flex-col gap-1 text-sm"><span className="text-xs text-muted">Password (min. 8 karakter)</span><input className="input" name="password" type="password" minLength={8} autoComplete="new-password" required /></label>
            <div className="flex items-end"><button className="btn w-full" type="submit">Buat akun</button></div>
          </form>

          <div className="card overflow-x-auto">
            <table className="min-w-full divide-y divide-line">
              <thead><tr><th className="th">Email</th><th className="th">Nama dan akses</th><th className="th">Status</th><th className="th">Ganti password</th><th className="th" /></tr></thead>
              <tbody className="divide-y divide-line">
                {baris.map((r) => (
                  <tr key={r.id}>
                    <td className="td font-medium">
                      {r.email}
                      {r.id === profile.id && <span className="pill ml-2 bg-primary-soft text-primary">Anda</span>}
                      <div className="text-xs font-normal text-muted">
                        {!r.adaProfil ? <span className="text-danger">Belum punya profil: isi nama dan akses lalu Simpan</span> : r.role === "superadmin" ? "Super Admin" : `Admin ${namaKategori.get(r.kategori_id ?? 0) ?? "-"}`}
                      </div>
                    </td>
                    <td className="td">
                      <form action={ubahAkun.bind(null, r.id)} className="flex flex-wrap items-center gap-2">
                        <input className="input min-w-40 flex-1" name="nama" defaultValue={r.nama} aria-label={`Nama ${r.email}`} required />
                        <select className="input !w-auto" name="akses" defaultValue={r.adaProfil ? aksesNilai(r) : ""} aria-label={`Akses ${r.email}`} required>{opsiAkses}</select>
                        <button className="btn-secondary !px-3 !py-1.5" type="submit">Simpan</button>
                      </form>
                    </td>
                    <td className="td"><span className={r.nonaktif ? "pill-danger" : "pill-success"}>{r.nonaktif ? "Nonaktif" : "Aktif"}</span></td>
                    <td className="td">
                      <form action={resetPassword.bind(null, r.id)} className="flex items-center gap-2">
                        <input className="input !w-40" name="password" type="password" minLength={8} autoComplete="new-password" placeholder="Password baru" aria-label={`Password baru ${r.email}`} required />
                        <button className="btn-secondary !px-3 !py-1.5" type="submit">Ganti</button>
                      </form>
                    </td>
                    <td className="td">
                      {r.id !== profile.id && (
                        <form>
                          <ConfirmSubmit
                            label={r.nonaktif ? "Aktifkan" : "Nonaktifkan"}
                            className={r.nonaktif ? "btn-secondary !px-3 !py-1.5" : "btn-danger"}
                            message={r.nonaktif ? `Aktifkan kembali ${r.email}?` : `Nonaktifkan ${r.email}? Akun ini tidak bisa masuk sampai diaktifkan lagi.`}
                            formAction={ubahStatusAkun.bind(null, r.id, r.nonaktif)}
                          />
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
                {baris.length === 0 && <tr><td className="td text-center text-muted" colSpan={5}>Belum ada akun.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
