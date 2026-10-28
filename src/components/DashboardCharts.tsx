"use client";

import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const WARNA = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6"];
const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

// Warna netral agar terbaca di mode terang maupun gelap
const TICK = { fill: "#8b8ba5", fontSize: 12 };
const GRID = "rgba(139, 139, 165, 0.25)";
const TOOLTIP = {
  contentStyle: { background: "rgb(var(--card))", border: "1px solid rgb(var(--line))", borderRadius: 12, color: "rgb(var(--ink))" },
  cursor: { fill: "rgba(139, 139, 165, 0.12)" },
};

function Kolom({ data, kunci, warna }: { data: Record<string, string | number>[]; kunci: string[]; warna: string[] }) {
  return (
    <ResponsiveContainer>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="nama" tick={TICK} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={TICK} axisLine={false} tickLine={false} />
        <Tooltip {...TOOLTIP} />
        {kunci.length > 1 && <Legend />}
        {kunci.map((k, i) => <Bar key={k} dataKey={k} name={k === "total" ? "Karyawan" : k} fill={warna[i]} radius={[6, 6, 0, 0]} />)}
      </BarChart>
    </ResponsiveContainer>
  );
}

function Kosong() {
  return <div className="flex h-full items-center justify-center text-sm text-muted">Belum ada data.</div>;
}

export function GrafikBulanan({ data, warna = WARNA[0] }: { data: number[]; warna?: string }) {
  return (
    <div className="h-64 w-full">
      <Kolom data={data.map((total, i) => ({ nama: BULAN[i], total }))} kunci={["total"]} warna={[warna]} />
    </div>
  );
}

export function GrafikKategori({ data }: { data: { nama: string; total: number }[] }) {
  return (
    <div className="h-64 w-full">
      <Kolom data={data} kunci={["total"]} warna={[WARNA[0]]} />
    </div>
  );
}

export function GrafikKampus({ data }: { data: { nama: string; S1: number; S2: number }[] }) {
  return (
    <div className="h-72 w-full">
      {data.every((d) => d.S1 + d.S2 === 0) ? <Kosong /> : <Kolom data={data} kunci={["S1", "S2"]} warna={[WARNA[0], WARNA[1]]} />}
    </div>
  );
}

export function GrafikPendidikan({ data }: { data: { nama: string; total: number }[] }) {
  return (
    <div className="h-64 w-full">
      {data.every((d) => d.total === 0) ? <Kosong /> : <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="total" nameKey="nama" innerRadius={50} outerRadius={85} paddingAngle={2} stroke="none">
            {data.map((_, i) => <Cell key={i} fill={WARNA[i % WARNA.length]} />)}
          </Pie>
          <Tooltip {...TOOLTIP} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>}
    </div>
  );
}

export function GrafikSebaran({ data }: { data: { nama: string; total: number }[] }) {
  return (
    <div className="h-64 w-full">
      <Kolom data={data} kunci={["total"]} warna={[WARNA[4]]} />
    </div>
  );
}
