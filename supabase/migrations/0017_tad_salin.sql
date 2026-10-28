-- karyawan_tad juga menyimpan salinan data karyawan TAD (np, nama, kode bagan, unit kerja, kontrak).
-- Tabel karyawan tetap sumber utama; salinan diperbarui otomatis oleh trigger.
-- sbu dan tad diisi dari form dan tidak ditimpa oleh trigger.

alter table public.karyawan_tad
  add column np text,
  add column nama text,
  add column kode_bagan text,
  add column unit_kerja text,
  add column awal_kontrak date,
  add column akhir_kontrak date;

create or replace function public.salin_karyawan_tad() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.kategori where id = new.kategori_id and nama = 'TAD') then
    insert into public.karyawan_tad (karyawan_id, np, nama, kode_bagan, unit_kerja, awal_kontrak, akhir_kontrak)
    values (new.id, new.np, new.nama, new.kode_bagan, new.unit_kerja, new.awal_kontrak, new.akhir_kontrak)
    on conflict (karyawan_id) do update set
      np = excluded.np, nama = excluded.nama, kode_bagan = excluded.kode_bagan, unit_kerja = excluded.unit_kerja,
      awal_kontrak = excluded.awal_kontrak, akhir_kontrak = excluded.akhir_kontrak;
  end if;
  return new;
end $$;

create trigger karyawan_salin_tad
  after insert or update on public.karyawan
  for each row execute function public.salin_karyawan_tad();

-- Salin karyawan TAD yang sudah ada
update public.karyawan set nama = nama
where kategori_id = (select id from public.kategori where nama = 'TAD');
