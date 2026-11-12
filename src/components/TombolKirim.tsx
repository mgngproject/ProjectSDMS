"use client";

import { useFormStatus } from "react-dom";
import KembangLoading from "@/components/KembangLoading";

/** Tombol submit untuk form dengan server action: saat diproses ia dinonaktifkan dan menampilkan kembang bergerak. */
export default function TombolKirim({ className = "btn", children, ...sisa }: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type">) {
  const { pending } = useFormStatus();
  return (
    <button {...sisa} type="submit" className={`${className} ${pending ? "cursor-wait opacity-80" : ""}`} disabled={pending || sisa.disabled} aria-busy={pending}>
      {pending && <KembangLoading lebar={30} className="mr-1.5 align-middle" />}
      {children}
    </button>
  );
}
