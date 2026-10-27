-- Kolom khusus kategori Magang (satu baris per karyawan Magang).
-- Kontrak (awal/akhir) tetap di tabel karyawan dan kontrak, sama seperti kategori lain.

create table public.karyawan_magang (
  karyawan_id      bigint primary key references public.karyawan (id) on delete cascade,
  jenis            text check (jenis in ('Magenta', 'PKL', 'Maganghub')),
  institusi        text,
  jurusan          text,
  penempatan       text check (penempatan in ('Jakarta', 'Karawang')),
  status_magang    text check (status_magang in ('Baru', 'Alih Status', 'Perpanjangan Maganghub')),
  awal_pendidikan  date,
  akhir_pendidikan date,
  catatan_titipan  text,
  constraint karyawan_magang_pendidikan_check
    check (awal_pendidikan is null or akhir_pendidikan is null or akhir_pendidikan >= awal_pendidikan)
);

alter table public.karyawan_magang enable row level security;

create policy karyawan_magang_all on public.karyawan_magang
  for all to authenticated
  using (public.can_access_karyawan(karyawan_id))
  with check (public.can_access_karyawan(karyawan_id));

grant select, insert, update, delete on public.karyawan_magang to authenticated;
