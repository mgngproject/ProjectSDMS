-- Daftar bagan: satu sumber acuan kode bagan dan nama unit kerja.
-- Dibaca semua pengguna; hanya Super Admin yang mengubahnya. Karyawan tetap menyimpan kode_bagan dan unit_kerja
-- sebagai teks, dicocokkan ke daftar ini lewat kode (huruf besar-kecil diabaikan).

create table public.bagan (
  id          bigint generated always as identity primary key,
  kode        text not null check (kode = upper(btrim(kode)) and kode <> ''),
  nama_unit   text not null check (btrim(nama_unit) <> ''),
  induk_kode  text,
  aktif       boolean not null default true,
  created_at  timestamptz not null default now(),
  constraint bagan_kode_unik unique (kode)
);

alter table public.bagan enable row level security;

create policy bagan_baca on public.bagan
  for select to authenticated using (true);

create policy bagan_tulis on public.bagan
  for all to authenticated
  using (public.is_superadmin())
  with check (public.is_superadmin());

grant select, insert, update, delete on public.bagan to authenticated;
