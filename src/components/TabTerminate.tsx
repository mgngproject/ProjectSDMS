import Link from "next/link";

/** Dua tab di menu Terminate: data terminate saat ini, dan riwayat semua kejadiannya. */
export default function TabTerminate({ aktif, jumlah }: { aktif: "sekarang" | "riwayat"; jumlah?: number }) {
  const tab = (id: "sekarang" | "riwayat", href: string, label: string) => (
    <Link
      href={href} role="tab" aria-selected={aktif === id}
      className={`-mb-px flex items-center gap-2 border-b-2 px-3.5 py-2 text-sm font-semibold ${aktif === id ? "border-primary text-ink" : "border-transparent text-muted hover:text-ink"}`}
    >
      {label}
      {id === "riwayat" && jumlah != null && <span className="rounded-full bg-primary-soft px-2 text-xs font-bold text-primary">{jumlah}</span>}
    </Link>
  );
  return <div role="tablist" aria-label="Tampilan terminate" className="flex gap-1 border-b border-line">{tab("sekarang", "/terminate", "Terminate saat ini")}{tab("riwayat", "/terminate?tab=riwayat", "Riwayat")}</div>;
}
