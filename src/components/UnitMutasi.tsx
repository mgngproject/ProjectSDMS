/** Menampilkan unit kerja beserta kode bagannya, mis. "Divisi SDM (SDM01)". */
export default function UnitMutasi({ kode, unit }: { kode: string | null; unit: string | null }) {
  if (!kode && !unit) return <span className="text-muted">-</span>;
  return (
    <span>
      {unit ?? "-"}
      {kode && <span className="text-muted"> ({kode})</span>}
    </span>
  );
}
