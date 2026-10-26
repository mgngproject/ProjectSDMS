import { NAMA_BULAN } from "@/lib/format";

export default function FilterBulanTahun({ filter, bulan, tahun }: { filter?: string; bulan?: string; tahun?: string }) {
  const tahunIni = new Date().getFullYear();
  const daftarTahun = Array.from({ length: 8 }, (_, i) => tahunIni + 2 - i);

  return (
    <form className="flex flex-wrap gap-2">
      <select className="input w-auto" name="filter" defaultValue={filter ?? ""}>
        <option value="">Semua</option>
        <option value="masuk">Kontrak masuk</option>
        <option value="habis">Kontrak habis</option>
      </select>
      <select className="input w-auto" name="bulan" defaultValue={bulan ?? ""}>
        <option value="">Semua bulan</option>
        {NAMA_BULAN.map((n, i) => <option key={n} value={i + 1}>{n}</option>)}
      </select>
      <select className="input w-auto" name="tahun" defaultValue={tahun ?? ""}>
        <option value="">Semua tahun</option>
        {daftarTahun.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      <button className="btn-secondary" type="submit">Terapkan</button>
    </form>
  );
}
