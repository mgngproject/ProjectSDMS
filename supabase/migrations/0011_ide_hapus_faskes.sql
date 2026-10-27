-- Kolom faskes dihapus dari salinan karyawan_ide (kolom faskes di tabel karyawan tetap ada).
alter table public.karyawan_ide drop column faskes;

create or replace function public.salin_karyawan_ide() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.kategori where id = new.kategori_id and nama = 'IDE') then
    insert into public.karyawan_ide (
      karyawan_id, np, nama, kode_bagan, unit_kerja, jabatan, level, role, benefit_kesehatan,
      gross_per_month, kpi, folder_link, awal_kontrak, akhir_kontrak, tanggal_keluar
    ) values (
      new.id, new.np, new.nama, new.kode_bagan, new.unit_kerja, new.jabatan, new.level, new.role, new.benefit_kesehatan,
      new.gross_per_month, new.kpi, new.folder_link, new.awal_kontrak, new.akhir_kontrak, new.tanggal_keluar
    )
    on conflict (karyawan_id) do update set
      np = excluded.np, nama = excluded.nama, kode_bagan = excluded.kode_bagan, unit_kerja = excluded.unit_kerja,
      jabatan = excluded.jabatan, level = excluded.level, role = excluded.role,
      benefit_kesehatan = excluded.benefit_kesehatan,
      gross_per_month = excluded.gross_per_month, kpi = excluded.kpi, folder_link = excluded.folder_link,
      awal_kontrak = excluded.awal_kontrak, akhir_kontrak = excluded.akhir_kontrak,
      tanggal_keluar = excluded.tanggal_keluar;
  end if;
  return new;
end $$;
