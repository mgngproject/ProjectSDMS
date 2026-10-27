-- karyawan_ide menyimpan salinan data karyawan IDE (selain kolom khusus status_ide).
-- Tabel karyawan tetap sumber utama; salinan diperbarui otomatis oleh trigger.

alter table public.karyawan_ide
  add column np text,
  add column nama text,
  add column kode_bagan text,
  add column unit_kerja text,
  add column jabatan text,
  add column level text,
  add column role text,
  add column benefit_kesehatan text,
  add column faskes text,
  add column gross_per_month bigint,
  add column kpi text,
  add column folder_link text,
  add column awal_kontrak date,
  add column akhir_kontrak date,
  add column status text,
  add column tanggal_keluar date;

create or replace function public.salin_karyawan_ide() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.kategori where id = new.kategori_id and nama = 'IDE') then
    insert into public.karyawan_ide (
      karyawan_id, np, nama, kode_bagan, unit_kerja, jabatan, level, role, benefit_kesehatan, faskes,
      gross_per_month, kpi, folder_link, awal_kontrak, akhir_kontrak, status, tanggal_keluar
    ) values (
      new.id, new.np, new.nama, new.kode_bagan, new.unit_kerja, new.jabatan, new.level, new.role, new.benefit_kesehatan, new.faskes,
      new.gross_per_month, new.kpi, new.folder_link, new.awal_kontrak, new.akhir_kontrak, new.status, new.tanggal_keluar
    )
    on conflict (karyawan_id) do update set
      np = excluded.np, nama = excluded.nama, kode_bagan = excluded.kode_bagan, unit_kerja = excluded.unit_kerja,
      jabatan = excluded.jabatan, level = excluded.level, role = excluded.role,
      benefit_kesehatan = excluded.benefit_kesehatan, faskes = excluded.faskes,
      gross_per_month = excluded.gross_per_month, kpi = excluded.kpi, folder_link = excluded.folder_link,
      awal_kontrak = excluded.awal_kontrak, akhir_kontrak = excluded.akhir_kontrak,
      status = excluded.status, tanggal_keluar = excluded.tanggal_keluar;
  end if;
  return new;
end $$;

create trigger karyawan_salin_ide
  after insert or update on public.karyawan
  for each row execute function public.salin_karyawan_ide();

-- Salin karyawan IDE yang sudah ada
update public.karyawan set nama = nama
where kategori_id = (select id from public.kategori where nama = 'IDE');
