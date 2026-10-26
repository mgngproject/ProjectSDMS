import HeaderTools from "@/components/HeaderTools";

/** Judul halaman di kiri; aksi halaman dan alat header (tanggal, muat ulang, tema) di kanan. */
export default function PageHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <div className="flex flex-wrap items-center gap-2">
        {children}
        <HeaderTools />
      </div>
    </div>
  );
}
