import type { Kontrak } from "@/lib/types";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  np: string;
  kontrak?: Kontrak;
  /** Saran isian "Kontrak ke" untuk kontrak baru. */
  kontrakKeDefault?: string;
  allowTerminate?: boolean;
  batal: string;
};

export default function KontrakForm({ action, np, kontrak: c, kontrakKeDefault, allowTerminate, batal }: Props) {
  return (
    <form action={action} className="grid max-w-3xl gap-3 card p-4 sm:grid-cols-2">
      <div>
        <label className="label" htmlFor="kontrak_ke">Kontrak ke</label>
        <input className="input" id="kontrak_ke" name="kontrak_ke" defaultValue={c?.kontrak_ke ?? kontrakKeDefault} required />
      </div>
      <div>
        <label className="label" htmlFor="np">NP</label>
        <input className="input" id="np" name="np" defaultValue={c?.np ?? np} required />
      </div>
      <div>
        <label className="label" htmlFor="awal_kontrak">Awal Kontrak</label>
        <input className="input" id="awal_kontrak" name="awal_kontrak" type="date" defaultValue={c?.awal_kontrak ?? ""} required />
      </div>
      <div>
        <label className="label" htmlFor="akhir_kontrak">Akhir Kontrak</label>
        <input className="input" id="akhir_kontrak" name="akhir_kontrak" type="date" defaultValue={c?.akhir_kontrak ?? ""} required />
      </div>
      <div>
        <label className="label" htmlFor="status">Status</label>
        <select className="input" id="status" name="status" defaultValue={c?.status ?? "aktif"}>
          <option value="aktif">Aktif</option>
          <option value="selesai">Selesai</option>
          {allowTerminate && <option value="terminate">Terminate</option>}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="folder_link">Link Folder</label>
        <input className="input" id="folder_link" name="folder_link" type="url" defaultValue={c?.folder_link ?? ""} />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="penilaian">Penilaian</label>
        <textarea className="input" id="penilaian" name="penilaian" rows={2} defaultValue={c?.penilaian ?? ""} />
      </div>
      <div className="flex gap-2 sm:col-span-2">
        <button className="btn" type="submit">Simpan</button>
        <a className="btn-secondary" href={batal}>Batal</a>
      </div>
    </form>
  );
}
