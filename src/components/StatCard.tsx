import type { LucideIcon } from "lucide-react";

const NADA = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
} as const;

export default function StatCard({ label, nilai, catatan, icon: Icon, nada }: {
  label: string;
  nilai: number;
  catatan?: string;
  icon: LucideIcon;
  nada: keyof typeof NADA;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${NADA[nada]}`}>
          <Icon size={20} />
        </span>
        <span className="text-sm text-muted">{label}</span>
      </div>
      <div className="mt-3 text-4xl font-bold tracking-tight">{nilai}</div>
      {catatan && <div className="mt-1 text-sm text-muted">{catatan}</div>}
    </div>
  );
}
