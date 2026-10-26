"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function KategoriChart({ data }: { data: { nama: string; total: number }[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nama" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="total" fill="#2563eb" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
