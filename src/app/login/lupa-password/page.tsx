import { ArrowLeft, KeyRound, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import AsciiBackground from "@/components/AsciiBackground";
import PasswordInput from "@/components/PasswordInput";
import { kirimKodeReset, resetDenganKode } from "../actions";

type Params = { email?: string; langkah?: string; ok?: string; error?: string };

export default async function LupaPasswordPage({ searchParams }: { searchParams: Promise<Params> }) {
  const { email = "", langkah, ok, error } = await searchParams;
  const tahapKode = langkah === "kode" && !!email;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden p-4">
      <AsciiBackground avoidId="logo-login" />

      <div id="logo-login" className="relative z-10 flex flex-col items-center gap-2">
        <div className="absolute -inset-10 -z-10 rounded-full bg-primary/15 blur-3xl" />
        <Image src="/logo-peruri.png" alt="Peruri" width={941} height={333} priority className="h-auto w-64 dark:hidden sm:w-80" />
        <Image src="/logo-peruri-putih.png" alt="Peruri" width={1466} height={492} priority className="hidden h-auto w-64 dark:block sm:w-80" />
      </div>

      <div className="card relative z-10 w-full max-w-sm space-y-5 bg-card/85 p-8 backdrop-blur">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Lupa Password</h1>
          <p className="text-sm text-muted">
            {tahapKode ? <>Masukkan kode yang dikirim ke <b className="text-ink">{email}</b> dan password baru Anda.</> : "Masukkan email akun Anda. Kami kirimkan kode verifikasi untuk membuat password baru."}
          </p>
        </div>

        {ok && !error && <p className="rounded-xl bg-success-soft p-3 text-sm text-success">{ok}</p>}
        {error && <p className="rounded-xl bg-danger-soft p-3 text-sm text-danger">{error}</p>}

        {!tahapKode ? (
          <form action={kirimKodeReset} className="space-y-5">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input className="input pl-9" id="email" name="email" type="email" required autoComplete="email" defaultValue={email} />
              </div>
            </div>
            <button className="btn w-full py-2.5" type="submit">Kirim kode</button>
          </form>
        ) : (
          <>
            <form action={resetDenganKode} className="space-y-5">
              <input type="hidden" name="email" value={email} />
              <div>
                <label className="label" htmlFor="kode">Kode verifikasi</label>
                <div className="relative">
                  <KeyRound size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    className="input pl-9 font-mono tracking-[0.3em]"
                    id="kode"
                    name="kode"
                    inputMode="numeric"
                    pattern="[0-9 ]{6,12}"
                    maxLength={12}
                    autoComplete="one-time-code"
                    placeholder="123456"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="password_baru">Password baru (min. 8 karakter)</label>
                <PasswordInput id="password_baru" name="password_baru" autoComplete="new-password" minLength={8} />
              </div>
              <div>
                <label className="label" htmlFor="password_ulang">Ulangi password baru</label>
                <PasswordInput id="password_ulang" name="password_ulang" autoComplete="new-password" minLength={8} />
              </div>
              <button className="btn w-full py-2.5" type="submit">Simpan password baru</button>
            </form>
            <form action={kirimKodeReset} className="flex items-center justify-between text-xs text-muted">
              <input type="hidden" name="email" value={email} />
              <span>Belum menerima kode?</span>
              <span className="flex gap-3">
                <button type="submit" className="text-primary hover:underline">Kirim ulang</button>
                <Link href="/login/lupa-password" className="hover:text-ink hover:underline">Ganti email</Link>
              </span>
            </form>
          </>
        )}

        <p className="text-center text-xs text-muted">Tidak bisa membuka email akun? Hubungi Super Admin untuk reset password.</p>
        <Link href="/login" className="flex items-center justify-center gap-1 text-sm text-muted hover:text-ink">
          <ArrowLeft size={14} /> Kembali ke halaman masuk
        </Link>
      </div>
    </main>
  );
}
