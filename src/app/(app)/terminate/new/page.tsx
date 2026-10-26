import PageHeader from "@/components/PageHeader";
import Flash from "@/components/Flash";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createTerminate } from "../actions";

const FIELDS: [string, string, string?, boolean?][] = [
  ["np", "NP", "text", true],
  ["nama", "Nama", "text", true],
  ["kode_bagan", "Kode Bagan"],
  ["unit_kerja", "Unit Kerja"],
  ["jabatan", "Jabatan"],
  ["level", "Level"],
  ["role", "Role"],
  ["awal_kontrak", "Awal Kontrak", "date"],
  ["akhir_kontrak", "Akhir Kontrak", "date"],
  ["tanggal_keluar", "Tanggal Keluar", "date", true],
];

export default async function NewTerminatePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const profile = await getProfile();
  const supabase = await createClient();
  const { data: kategori } = await supabase.from("kategori").select("id, nama").order("id");

  return (
    <div className="space-y-4">
      <PageHeader title="Tambah Data Terminate" />
      <Flash error={error} />
      <form action={createTerminate} className="grid max-w-3xl gap-3 card p-4 sm:grid-cols-2">
        {FIELDS.slice(0, 2).map(([name, label, type, req]) => (
          <div key={name}>
            <label className="label" htmlFor={name}>{label}</label>
            <input className="input" id={name} name={name} type={type ?? "text"} required={req} />
          </div>
        ))}
        <div>
          <label className="label" htmlFor="kategori_id">Kategori</label>
          {profile.role === "superadmin" ? (
            <select className="input" id="kategori_id" name="kategori_id" required defaultValue="">
              <option value="">-- Pilih Kategori --</option>
              {(kategori ?? []).map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
            </select>
          ) : (
            <input className="input bg-soft" value={profile.kategori?.nama ?? ""} readOnly />
          )}
        </div>
        {FIELDS.slice(2).map(([name, label, type, req]) => (
          <div key={name}>
            <label className="label" htmlFor={name}>{label}</label>
            <input className="input" id={name} name={name} type={type ?? "text"} required={req} />
          </div>
        ))}
        <div className="sm:col-span-2">
          <label className="label" htmlFor="alasan_keluar">Alasan Keluar</label>
          <textarea className="input" id="alasan_keluar" name="alasan_keluar" rows={2} maxLength={500} required />
        </div>
        <div className="flex gap-2 sm:col-span-2">
          <button className="btn" type="submit">Simpan</button>
          <a className="btn-secondary" href="/terminate">Batal</a>
        </div>
      </form>
    </div>
  );
}
