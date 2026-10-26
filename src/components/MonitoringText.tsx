"use client";

import { useTransition } from "react";
import { saveMonitoringText } from "@/app/(app)/monitoring/actions";

/** Isian teks yang tersimpan saat kehilangan fokus. */
export default function MonitoringText({ karyawanId, field, value }: { karyawanId: number; field: string; value: string }) {
  const [pending, start] = useTransition();
  return (
    <input
      className="input min-w-32"
      defaultValue={value}
      disabled={pending}
      onBlur={(e) => {
        if (e.target.value.trim() !== value) start(() => saveMonitoringText(karyawanId, field, e.target.value));
      }}
    />
  );
}
