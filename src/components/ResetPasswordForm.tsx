"use client";

import { Check, Copy, Shuffle } from "lucide-react";
import { useState } from "react";

// Tanpa huruf/angka yang mirip (0/O, 1/l/I) agar mudah dibacakan ke PIC
const HURUF = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

function acak(panjang = 10) {
  const angka = new Uint32Array(panjang);
  crypto.getRandomValues(angka);
  return Array.from(angka, (n) => HURUF[n % HURUF.length]).join("");
}

/** Form reset password oleh Super Admin untuk akun yang lupa password. */
export default function ResetPasswordForm({
  email,
  action,
}: {
  email: string;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [password, setPassword] = useState("");
  const [tersalin, setTersalin] = useState(false);

  const salin = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setTersalin(true);
      setTimeout(() => setTersalin(false), 1500);
    } catch {
      /* clipboard tidak tersedia: password tetap terlihat di isian */
    }
  };

  return (
    <form
      action={action}
      className="flex items-center gap-1.5"
      onSubmit={(e) => {
        if (!window.confirm(`Reset password ${email}? Password lamanya tidak berlaku lagi.\n\nPassword sementara: ${password}`)) e.preventDefault();
      }}
    >
      <input
        className="input !w-36 font-mono"
        name="password"
        type="text"
        minLength={8}
        autoComplete="off"
        spellCheck={false}
        placeholder="Password sementara"
        aria-label={`Password sementara ${email}`}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="button" className="btn-secondary !px-2 !py-1.5" title="Buat password acak" aria-label="Buat password acak" onClick={() => setPassword(acak())}>
        <Shuffle size={14} />
      </button>
      <button type="button" className="btn-secondary !px-2 !py-1.5" title="Salin" aria-label="Salin password" onClick={salin} disabled={!password}>
        {tersalin ? <Check size={14} /> : <Copy size={14} />}
      </button>
      <button className="btn-secondary !px-3 !py-1.5" type="submit">Reset</button>
    </form>
  );
}
