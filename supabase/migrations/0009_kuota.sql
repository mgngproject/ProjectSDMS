-- Kuota peserta Magang per unit kerja di setiap penempatan.
-- Kuota adalah batas peserta aktif bersamaan; jumlah terisi dihitung dari data karyawan, tidak disimpan.
-- Hanya pasangan unit kerja dan penempatan yang memang ada yang dibuat barisnya.

create table public.kuota_magang (
  id          bigint generated always as identity primary key,
  unit_kerja  text not null check (btrim(unit_kerja) <> ''),
  penempatan  text not null check (penempatan in ('Jakarta', 'Karawang')),
  kuota       integer not null check (kuota >= 0),
  created_at  timestamptz not null default now()
);

create unique index kuota_magang_unik on public.kuota_magang (lower(btrim(unit_kerja)), penempatan);

alter table public.kuota_magang enable row level security;

-- Hanya Super Admin dan admin kategori Magang
create policy kuota_magang_all on public.kuota_magang
  for all to authenticated
  using (
    public.is_superadmin()
    or public.current_kategori_id() = (select id from public.kategori where nama = 'Magang')
  )
  with check (
    public.is_superadmin()
    or public.current_kategori_id() = (select id from public.kategori where nama = 'Magang')
  );

grant select, insert, update, delete on public.kuota_magang to authenticated;
