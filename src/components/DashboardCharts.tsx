"use client";

import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const WARNA = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed"];
const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export function GrafikBulanan({ data, warna = "#2563eb" }: { data: number[]; warna?: string }) {
  const rows = data.map((total, i) => ({ nama: BULAN[i], total }));
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nama" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="total" name="Karyawan" fill={warna} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function GrafikKategori({ data }: { data: { nama: string; total: number }[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nama" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="total" name="Karyawan" fill="#2563eb" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function GrafikPendidikan({ data }: { data: { nama: string; total: number }[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="total" nameKey="nama" label>
            {data.map((_, i) => <Cell key={i} fill={WARNA[i % WARNA.length]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function GrafikKampus({ data }: { data: { nama: string; S1: number; S2: number }[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nama" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="S1" fill="#2563eb" />
          <Bar dataKey="S2" fill="#16a34a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
