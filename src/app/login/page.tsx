import { Lock, Mail } from "lucide-react";
import Image from "next/image";
import AsciiBackground from "@/components/AsciiBackground";
import { login } from "./actions";

const PESAN: Record<string, string> = {
  kredensial: "Email atau password salah.",
  profil: "Akun belum memiliki profil. Hubungi Super Admin.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; detail?: string }> }) {
  const { error, detail } = await searchParams;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden p-4">
      <AsciiBackground avoidId="logo-login" />

      <div id="logo-login" className="relative z-10 flex flex-col items-center gap-2">
        <div className="absolute -inset-10 -z-10 rounded-full bg-primary/15 blur-3xl" />
        <Image src="/logo-peruri.png" alt="Peruri" width={941} height={333} priority className="h-auto w-64 dark:hidden sm:w-80" />
        <Image src="/logo-peruri-putih.png" alt="Peruri" width={1466} height={492} priority className="hidden h-auto w-64 dark:block sm:w-80" />
      </div>

      <form action={login} className="card relative z-10 w-full max-w-sm space-y-5 bg-card/85 p-8 backdrop-blur">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">SDMS</h1>
          <p className="text-sm text-muted">Masuk dengan akun kategori Anda.</p>
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
