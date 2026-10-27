import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "SDMS",
  description: "Sistem Dashboard Rekrutmen",
};

// Tema awal selalu terang; gelap hanya bila pengguna memilihnya sendiri (tersimpan di browser).
// Diterapkan sebelum halaman tampil agar tidak berkedip.
const TEMA = `try{if(localStorage.getItem("theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: TEMA }} />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
