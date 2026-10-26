import { login } from "./actions";

const PESAN: Record<string, string> = {
  kredensial: "Email atau password salah.",
  profil: "Akun belum memiliki profil. Hubungi Super Admin.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form action={login} className="w-full max-w-sm space-y-4 rounded-lg bg-white p-6 shadow">
        <h1 className="text-xl font-bold">SDMS</h1>
        <p className="text-sm text-gray-500">Masuk dengan akun kategori Anda.</p>
        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{PESAN[error] ?? "Gagal masuk."}</p>}
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input className="input" id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input className="input" id="password" name="password" type="password" required autoComplete="current-password" />
        </div>
        <button className="btn w-full" type="submit">Masuk</button>
      </form>
    </main>
  );
}
