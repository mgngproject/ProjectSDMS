"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";

/** Isian password dengan tombol untuk menampilkan atau menyembunyikan isinya. */
export default function PasswordInput({ id, name }: { id: string; name: string }) {
  const [tampil, setTampil] = useState(false);

  return (
    <div className="relative">
      <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
      <input
        className="input pl-9 pr-10"
        id={id}
        name={name}
        type={tampil ? "text" : "password"}
        required
        autoComplete="current-password"
      />
      <button
        type="button"
        onClick={() => setTampil((v) => !v)}
        aria-label={tampil ? "Sembunyikan password" : "Tampilkan password"}
        aria-pressed={tampil}
        title={tampil ? "Sembunyikan password" : "Tampilkan password"}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted transition hover:bg-soft hover:text-ink"
      >
        {tampil ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
