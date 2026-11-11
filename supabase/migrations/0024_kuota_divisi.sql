-- Kuota Magang per divisi.
-- Divisi diambil dari Kode Bagan: kode berpola dua angka lalu nol semua (mis. 10000) adalah divisi, dan unit kerja
-- yang dua karakter depan kodenya sama masuk ke divisi itu. Kuota disimpan per dua karakter depan itu (awalan),
-- sehingga tidak terikat pada nama divisi. Jumlah terisi dihitung dari kode bagan peserta, tidak disimpan.
--
-- Tabel kuota_magang (kuota per unit kerja dan penempatan) tidak dipakai lagi dan boleh dihapus.

create table public.kuota_divisi (
  awalan      text primary key check (awalan ~ '^[A-Z0-9]{2}$'),
  kuota       integer not null check (kuota >= 0),
  updated_at  timestamptz not null default now()
);

alter table public.kuota_divisi enable row level security;

-- Hanya admin kategori Magang; Super Admin tidak punya akses ke fitur ini
create policy kuota_divisi_pic on public.kuota_divisi
  for all to authenticated
  using (public.current_kategori_id() = (select id from public.kategori where nama = 'Magang'))
  with check (public.current_kategori_id() = (select id from public.kategori where nama = 'Magang'));

grant select, insert, update, delete on public.kuota_divisi to authenticated;
