"use client";

import { useEffect } from "react";

const BINGKAI = 16;
const UKURAN = 64;
const JEDA_MS = 120;

/**
 * Menganimasikan ikon di tab browser: kembang logo Peruri "mekar" bergelombang.
 * Bingkai diambil dari /kembang-frames.png dan dipasang ke <link rel="icon">.
 * Berhenti saat tab tidak terlihat, dan tidak jalan bila pengguna memilih mengurangi gerakan.
 * Tanpa JavaScript atau bila gambar gagal dimuat, ikon statis bawaan (icon.png dan favicon.ico) tetap dipakai.
 */
export default function IkonTabBergerak() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const gambar = new Image();
    let timer: number | undefined;
    let i = 0;
    let batal = false;
    const kanvas = document.createElement("canvas");
    kanvas.width = UKURAN;
    kanvas.height = UKURAN;
    const ctx = kanvas.getContext("2d");
    if (!ctx) return;

    const pasang = () => {
      ctx.clearRect(0, 0, UKURAN, UKURAN);
      ctx.drawImage(gambar, i * UKURAN, 0, UKURAN, UKURAN, 0, 0, UKURAN, UKURAN);
      const url = kanvas.toDataURL("image/png");
      document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]').forEach((l) => {
        l.type = "image/png";
        l.href = url;
      });
      i = (i + 1) % BINGKAI;
    };
    const mulai = () => { if (timer === undefined && !batal) timer = window.setInterval(pasang, JEDA_MS); };
    const henti = () => { if (timer !== undefined) { window.clearInterval(timer); timer = undefined; } };
    const ubahTampil = () => (document.hidden ? henti() : mulai());

    gambar.onload = () => { if (!document.hidden) mulai(); document.addEventListener("visibilitychange", ubahTampil); };
    gambar.src = "/kembang-frames.png";
    return () => { batal = true; henti(); document.removeEventListener("visibilitychange", ubahTampil); };
  }, []);

  return null;
}
