/** Tampil seketika saat berpindah halaman, selama data halaman tujuan dimuat. */
export default function Loading() {
  return (
    <div className="space-y-5 motion-safe:animate-pulse" role="status" aria-live="polite" aria-label="Memuat halaman">
      <div className="flex items-center justify-between gap-3">
        <div className="h-8 w-56 rounded-xl bg-line" />
        <div className="h-10 w-48 rounded-xl bg-line" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="card h-28" />)}
      </div>
      <div className="card space-y-3 p-5">
        <div className="h-5 w-40 rounded-lg bg-line" />
        {[0, 1, 2, 3, 4].map((i) => <div key={i} className="h-9 rounded-xl bg-soft" />)}
      </div>
      <span className="sr-only">Memuat…</span>
    </div>
  );
}
