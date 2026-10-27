"use client";

import { useEffect, useRef } from "react";

const RAMP = " .:-=+xX#8@";
const LEBAR_SEL = 13;
const TINGGI_SEL = 18;
const JARI_JARI = 130; // jangkauan pengaruh kursor (px)

/**
 * Latar karakter ASCII yang bergerak pelan. Karakter di dekat kursor terdorong dan berputar
 * seperti air yang disentuh, lalu kembali ke tempatnya. Area di sekitar elemen `avoidId` (logo)
 * dikosongkan agar logo tetap jelas.
 */
export default function AsciiBackground({ avoidId }: { avoidId?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const kurangGerak = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lebar = 0, tinggi = 0, kolom = 0, baris = 0, dpr = 1;
    let ox = new Float32Array(0), oy = new Float32Array(0), vx = new Float32Array(0), vy = new Float32Array(0), energi = new Float32Array(0), acak = new Float32Array(0);
    let warna = "91, 91, 214";
    const tempat = { x: 0, y: 0, rx: 1, ry: 1 }; // area logo yang dikosongkan
    const kursor = { x: -9999, y: -9999, vx: 0, vy: 0, aktif: false };
    let bingkai = 0;

    const bacaWarna = () => {
      const v = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim().split(/\s+/);
      if (v.length === 3 && v.every((n) => Number.isFinite(Number(n)))) warna = v.join(", ");
    };

    const ukur = () => {
      const box = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      lebar = box.width;
      tinggi = box.height;
      canvas.width = Math.round(lebar * dpr);
      canvas.height = Math.round(tinggi * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      kolom = Math.ceil(lebar / LEBAR_SEL);
      baris = Math.ceil(tinggi / TINGGI_SEL);
      const n = kolom * baris;
      ox = new Float32Array(n); oy = new Float32Array(n); vx = new Float32Array(n); vy = new Float32Array(n); energi = new Float32Array(n);
      acak = Float32Array.from({ length: n }, () => Math.random());

      const el = avoidId ? document.getElementById(avoidId) : null;
      if (el) {
        const r = el.getBoundingClientRect();
        tempat.x = r.left - box.left + r.width / 2;
        tempat.y = r.top - box.top + r.height / 2;
        tempat.rx = r.width / 2 + 40;
        tempat.ry = r.height / 2 + 30;
      } else {
        tempat.rx = tempat.ry = 1;
      }
    };

    const gambar = (t: number) => {
      ctx.clearRect(0, 0, lebar, tinggi);
      ctx.font = `14px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = `rgb(${warna})`;

      const R2 = JARI_JARI * JARI_JARI;
      const kecepatanKursor = Math.hypot(kursor.vx, kursor.vy);

      for (let b = 0; b < baris; b++) {
        for (let k = 0; k < kolom; k++) {
          const i = b * kolom + k;
          const cx = (k + 0.5) * LEBAR_SEL;
          const cy = (b + 0.5) * TINGGI_SEL;

          // Sentuhan kursor: dorongan keluar, ikut terseret, dan sedikit berputar
          if (kursor.aktif) {
            const dx = cx + ox[i] - kursor.x;
            const dy = cy + oy[i] - kursor.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < R2) {
              const d = Math.sqrt(d2) || 1;
              const f = 1 - d / JARI_JARI;
              const f2 = f * f;
              vx[i] += (dx / d) * f2 * 1.4 + kursor.vx * f2 * 0.16 - (dy / d) * f2 * kecepatanKursor * 0.02;
              vy[i] += (dy / d) * f2 * 1.4 + kursor.vy * f2 * 0.16 + (dx / d) * f2 * kecepatanKursor * 0.02;
              if (f > energi[i]) energi[i] = f;
            }
          }

          // Pegas dengan redaman rendah agar bergelombang seperti air
          vx[i] += -ox[i] * 0.045;
          vy[i] += -oy[i] * 0.045;
          vx[i] *= 0.9;
          vy[i] *= 0.9;
          ox[i] += vx[i];
          oy[i] += vy[i];
          energi[i] *= 0.94;

          // Medan punggung bukit berlapis yang mengalir pelan
          const u = (cx - lebar / 2) / (tinggi * 0.9);
          const w = cy / tinggi;
          const punggung = 0.6 - 0.28 * Math.exp(-((u * 1.25) ** 2));
          const s = w - punggung;
          let v: number;
          if (s < 0) {
            v = acak[i] > 0.82 ? 0.12 : 0;
          } else {
            const pita = 0.5 + 0.5 * Math.sin(s * 60 - t * 0.6 + u * 1.5);
            v = pita * Math.exp(-s * 2.4) * (0.35 + 0.65 * Math.exp(-u * u * 0.9)) * 1.05;
          }

          // Kosongkan area logo
          if (tempat.rx > 1) {
            const e = Math.hypot((cx - tempat.x) / tempat.rx, (cy - tempat.y) / tempat.ry);
            if (e < 1.5) v *= Math.max(0, (e - 0.9) / 0.6);
          }

          v = Math.min(1, v + energi[i] * 0.75);
          const idx = Math.floor(v * (RAMP.length - 1));
          if (idx === 0) continue;
          ctx.globalAlpha = 0.14 + 0.86 * v;
          ctx.fillText(RAMP[idx], cx + ox[i], cy + oy[i]);
        }
      }
      ctx.globalAlpha = 1;
      kursor.vx *= 0.8;
      kursor.vy *= 0.8;
    };

    const putar = (ms: number) => {
      gambar(ms / 1000);
      bingkai = requestAnimationFrame(putar);
    };

    const gerak = (e: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      const x = e.clientX - box.left;
      const y = e.clientY - box.top;
      if (kursor.aktif) {
        kursor.vx = Math.max(-40, Math.min(40, x - kursor.x));
        kursor.vy = Math.max(-40, Math.min(40, y - kursor.y));
      }
      kursor.x = x;
      kursor.y = y;
      kursor.aktif = true;
    };
    const keluar = () => { kursor.aktif = false; };
    const tampilBerubah = () => {
      cancelAnimationFrame(bingkai);
      if (!document.hidden && !kurangGerak) bingkai = requestAnimationFrame(putar);
    };

    bacaWarna();
    ukur();
    const pengamatTema = new MutationObserver(() => { bacaWarna(); if (kurangGerak) gambar(0); });
    pengamatTema.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    const pengamatUkuran = new ResizeObserver(() => { ukur(); if (kurangGerak) gambar(0); });
    pengamatUkuran.observe(canvas);

    if (kurangGerak) {
      gambar(0);
    } else {
      window.addEventListener("pointermove", gerak);
      document.addEventListener("pointerleave", keluar);
      document.addEventListener("visibilitychange", tampilBerubah);
      bingkai = requestAnimationFrame(putar);
    }

    return () => {
      cancelAnimationFrame(bingkai);
      pengamatTema.disconnect();
      pengamatUkuran.disconnect();
      window.removeEventListener("pointermove", gerak);
      document.removeEventListener("pointerleave", keluar);
      document.removeEventListener("visibilitychange", tampilBerubah);
    };
  }, [avoidId]);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
}
