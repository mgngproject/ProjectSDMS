import { ArrowLeft, KeyRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import AsciiBackground from "@/components/AsciiBackground";

export default function LupaPasswordPage() {
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
          <p className="text-sm text-muted">Password dipulihkan oleh Super Admin.</p>
        </div>

        <ol className="list-decimal space-y-2 pl-5 text-sm">
          <li>Hubungi <b>Super Admin SDMS</b> dan sebutkan email akun Anda.</li>
          <li>Super Admin memberi Anda <b>password sementara</b>.</li>
          <li>Masuk dengan password sementara itu, atau langsung buka <b>Ganti password</b> dan pakai password sementara sebagai password lama.</li>
          <li>Buat password baru yang hanya Anda ketahui.</li>
        </ol>

        <Link href="/login/ganti-password" className="btn flex w-full items-center justify-center gap-2 py-2.5">
          <KeyRound size={16} /> Ganti password
        </Link>
        <Link href="/login" className="flex items-center justify-center gap-1 text-sm text-muted hover:text-ink">
          <ArrowLeft size={14} /> Kembali ke halaman masuk
        </Link>
      </div>
    </main>
  );
}
