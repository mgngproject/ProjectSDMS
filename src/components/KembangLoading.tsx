import { KEMBANG } from "@/components/kembang-data";

const DURASI = 1.8;

/**
 * Animasi tunggu berupa kembang logo Peruri: sinarnya memanjang dan memendek bergantian, bergelombang mengelilingi kembang.
 * `lebar` dalam piksel (tinggi mengikuti). Tanpa `label` ia dianggap hiasan, karena teks tunggu biasanya sudah ada di dekatnya.
 */
export default function KembangLoading({ lebar = 96, label, className = "" }: { lebar?: number; label?: string; className?: string }) {
  const n = KEMBANG.sinar.length;
  return (
    <svg
      viewBox={`0 0 ${KEMBANG.lebar} ${KEMBANG.tinggi}`} width={lebar} height={(lebar * KEMBANG.tinggi) / KEMBANG.lebar} className={`inline-block flex-none ${className}`}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      {KEMBANG.sinar.map((s, i) => (
        <polygon
          key={i} points={s.p} fill={s.tua ? undefined : "#c969ff"} className={`kembang-sinar ${s.tua ? "fill-[#222a8f] dark:fill-[#8b8bff]" : ""}`}
          style={{ animationDelay: `-${((i / n) * DURASI).toFixed(2)}s`, transformOrigin: `${KEMBANG.hub[0]}px ${KEMBANG.hub[1]}px` }}
        />
      ))}
    </svg>
  );
}
