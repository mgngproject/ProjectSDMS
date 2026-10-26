export default function Flash({ ok, error }: { ok?: string; error?: string }) {
  if (!ok && !error) return null;
  return (
    <p className={`rounded-xl p-3 text-sm ${error ? "bg-danger-soft text-danger" : "bg-success-soft text-success"}`}>
      {error ?? ok}
    </p>
  );
}
