"use client";

import { CalendarDays, Moon, RefreshCw, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

const tombol = "inline-flex h-10 items-center justify-center rounded-xl border border-line bg-card text-ink shadow-card transition hover:bg-soft";

/** Tanggal hari ini, tombol muat ulang, dan pengganti mode terang/gelap. */
export default function HeaderTools() {
  const router = useRouter();
  const [segar, mulai] = useTransition();
  const [gelap, setGelap] = useState(false);
  const [tanggal, setTanggal] = useState("");

  useEffect(() => {
    setGelap(document.documentElement.classList.contains("dark"));
    setTanggal(new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Jakarta" }));
  }, []);

  function gantiTema() {
    const baru = !gelap;
    document.documentElement.classList.toggle("dark", baru);
    try {
      localStorage.setItem("theme", baru ? "dark" : "light");
    } catch {
      // penyimpanan tidak tersedia; tema tetap berlaku untuk sesi ini
    }
    setGelap(baru);
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`${tombol} gap-2 px-3 text-sm`}>
        <CalendarDays size={16} className="text-muted" />
        {tanggal || " "}
      </span>
      <button type="button" className={`${tombol} w-10`} onClick={() => mulai(() => router.refresh())} aria-label="Muat ulang">
        <RefreshCw size={16} className={segar ? "animate-spin" : ""} />
      </button>
      <button type="button" className={`${tombol} w-10`} onClick={gantiTema} aria-label="Ganti tema">
        {gelap ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </div>
  );
}
