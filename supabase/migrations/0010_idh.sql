-- Tabel karyawan_idh: salinan data karyawan IDH (tanpa kolom khusus), diperbarui otomatis oleh trigger.
-- Tabel karyawan tetap sumber utama.

create table public.karyawan_idh (
  karyawan_id       bigint primary key references public.karyawan (id) on delete cascade,
  np                text,
  nama              text,
  kode_bagan        text,
  unit_kerja        text,
  jabatan           text,
  level             text,
  role              text,
  benefit_kesehatan text,
  faskes            text,
  gross_per_month   bigint,
  kpi               text,
  folder_link       text,
  awal_kontrak      date,
  akhir_kontrak     date,
  tanggal_keluar    date
);

alter table public.karyawan_idh enable row level security;

create policy karyawan_idh_all on public.karyawan_idh
  for all to authenticated
  using (public.can_access_karyawan(karyawan_id))
  with check (public.can_access_karyawan(karyawan_id));

grant select, insert, update, delete on public.karyawan_idh to authenticated;

create or replace function public.salin_karyawan_idh() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.kategori where id = new.kategori_id and nama = 'IDH') then
    insert into public.karyawan_idh (
      karyawan_id, np, nama, kode_bagan, unit_kerja, jabatan, level, role, benefit_kesehatan, faskes,
      gross_per_month, kpi, folder_link, awal_kontrak, akhir_kontrak, tanggal_keluar
    ) values (
      new.id, new.np, new.nama, new.kode_bagan, new.unit_kerja, new.jabatan, new.level, new.role, new.benefit_kesehatan, new.faskes,
      new.gross_per_month, new.kpi, new.folder_link, new.awal_kontrak, new.akhir_kontrak, new.tanggal_keluar
    )
    on conflict (karyawan_id) do update set
      np = excluded.np, nama = excluded.nama, kode_bagan = excluded.kode_bagan, unit_kerja = excluded.unit_kerja,
      jabatan = excluded.jabatan, level = excluded.level, role = excluded.role,
      benefit_kesehatan = excluded.benefit_kesehatan, faskes = excluded.faskes,
      gross_per_month = excluded.gross_per_month, kpi = excluded.kpi, folder_link = excluded.folder_link,
      awal_kontrak = excluded.awal_kontrak, akhir_kontrak = excluded.akhir_kontrak,
      tanggal_keluar = excluded.tanggal_keluar;
  end if;
  return new;
end $$;

create trigger karyawan_salin_idh
  after insert or update on public.karyawan
  for each row execute function public.salin_karyawan_idh();

-- Salin karyawan IDH yang sudah ada
update public.karyawan set nama = nama
where kategori_id = (select id from public.kategori where nama = 'IDH');
