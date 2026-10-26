import { Lock, Mail } from "lucide-react";
import { login } from "./actions";

const PESAN: Record<string, string> = {
  kredensial: "Email atau password salah.",
  profil: "Akun belum memiliki profil. Hubungi Super Admin.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; detail?: string }> }) {
  const { error, detail } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form action={login} className="card w-full max-w-sm space-y-5 p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">SDMS</h1>
            <p className="text-sm text-muted">Masuk dengan akun kategori Anda.</p>
          </div>
        </div>

        {error && (
          <p className="rounded-xl bg-danger-soft p-3 text-sm text-danger">
            {PESAN[error] ?? "Gagal masuk."}
            {detail && <span className="mt-1 block text-xs opacity-80">Detail: {detail}</span>}
          </p>
        )}

        <div>
          <label className="label" htmlFor="email">Email</label>
          <div className="relative">
            <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input className="input pl-9" id="email" name="email" type="email" required autoComplete="email" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <div className="relative">
            <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input className="input pl-9" id="password" name="password" type="password" required autoComplete="current-password" />
          </div>
        </div>
        <button className="btn w-full py-2.5" type="submit">Masuk</button>
      </form>
    </main>
  );
}
