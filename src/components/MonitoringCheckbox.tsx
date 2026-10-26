"use client";

import { useTransition } from "react";
import { toggleMonitoring } from "@/app/(app)/karyawan/actions";

export default function MonitoringCheckbox({ karyawanId, field, checked }: { karyawanId: number; field: string; checked: boolean }) {
  const [pending, start] = useTransition();
  return (
    <input
      type="checkbox"
      checked={checked}
      disabled={pending}
      onChange={(e) => start(() => toggleMonitoring(karyawanId, field, e.target.checked))}
    />
  );
}
