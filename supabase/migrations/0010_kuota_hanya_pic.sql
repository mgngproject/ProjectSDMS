-- Kuota Magang hanya untuk admin kategori Magang; Super Admin tidak punya akses ke fitur ini.
-- (Nama berkas dipertahankan agar urutan migrasi tetap; isinya membatasi akses ke PIC Magang saja.)

drop policy if exists kuota_magang_all on public.kuota_magang;
drop policy if exists kuota_magang_baca on public.kuota_magang;
drop policy if exists kuota_magang_tulis on public.kuota_magang;

create policy kuota_magang_pic on public.kuota_magang
  for all to authenticated
  using (public.current_kategori_id() = (select id from public.kategori where nama = 'Magang'))
  with check (public.current_kategori_id() = (select id from public.kategori where nama = 'Magang'));
