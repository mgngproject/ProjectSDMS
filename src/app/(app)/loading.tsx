import KembangLoading from "@/components/KembangLoading";

/** Tampil seketika saat berpindah halaman, selama data halaman tujuan dimuat. */
export default function Loading() {
  return (
    <div className="space-y-5" role="status" aria-live="polite" aria-label="Memuat halaman">
      <div className="flex flex-col items-center gap-2 py-6">
        <KembangLoading lebar={140} />
        <p className="text-sm text-muted">Memuat…</p>
      </div>
      <div className="space-y-5 opacity-60">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="card h-28" />)}
        </div>
        <div className="card space-y-3 p-5">
          <div className="h-5 w-40 rounded-lg bg-line" />
          {[0, 1, 2, 3, 4].map((i) => <div key={i} className="h-9 rounded-xl bg-soft" />)}
        </div>
      </div>
    </div>
  );
}
