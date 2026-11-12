import { ArrowLeft, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import AsciiBackground from "@/components/AsciiBackground";
import PasswordInput from "@/components/PasswordInput";
import { gantiPassword } from "../actions";

export default async function GantiPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <main className="relative flex min-h-[calc(100vh/var(--zoom))] flex-col items-center justify-center gap-8 overflow-hidden p-4">
      <AsciiBackground avoidId="logo-login" />

      <div id="logo-login" className="relative z-10 flex flex-col items-center gap-2">
        <div className="absolute -inset-10 -z-10 rounded-full bg-primary/15 blur-3xl" />
        <Image src="/logo-peruri.png" alt="Peruri" width={941} height={333} priority className="h-auto w-64 dark:hidden sm:w-80" />
        <Image src="/logo-peruri-putih.png" alt="Peruri" width={1466} height={492} priority className="hidden h-auto w-64 dark:block sm:w-80" />
      </div>

      <form action={gantiPassword} className="card relative z-10 w-full max-w-sm space-y-5 bg-card/85 p-8 backdrop-blur">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Ganti Password</h1>
          <p className="text-sm text-muted">Masukkan email dan password lama akun Anda.</p>
        </div>

        {error && <p className="rounded-xl bg-danger-soft p-3 text-sm text-danger">{error}</p>}

        <div>
          <label className="label" htmlFor="email">Email</label>
          <div className="relative">
            <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input className="input pl-9" id="email" name="email" type="email" required autoComplete="email" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="password_lama">Password lama</label>
          <PasswordInput id="password_lama" name="password_lama" />
        </div>
        <div>
          <label className="label" htmlFor="password_baru">Password baru (min. 8 karakter)</label>
          <PasswordInput id="password_baru" name="password_baru" autoComplete="new-password" minLength={8} />
        </div>
        <div>
          <label className="label" htmlFor="password_ulang">Ulangi password baru</label>
          <PasswordInput id="password_ulang" name="password_ulang" autoComplete="new-password" minLength={8} />
        </div>
        <button className="btn w-full py-2.5" type="submit">Ganti password</button>
        <Link href="/login" className="flex items-center justify-center gap-1 text-sm text-muted hover:text-ink">
          <ArrowLeft size={14} /> Kembali ke halaman masuk
        </Link>
      </form>
    </main>
  );
}
