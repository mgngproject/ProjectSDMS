-- Kolom khusus kategori BGN: Level Jabatan (satu baris per karyawan).

create table public.karyawan_bgn (
  karyawan_id   bigint primary key references public.karyawan (id) on delete cascade,
  level_jabatan text check (level_jabatan in ('Senior', 'Middle', 'Junior', 'PKWT Reguler'))
);

alter table public.karyawan_bgn enable row level security;

create policy karyawan_bgn_all on public.karyawan_bgn
  for all to authenticated
  using (public.can_access_karyawan(karyawan_id))
  with check (public.can_access_karyawan(karyawan_id));

grant select, insert, update, delete on public.karyawan_bgn to authenticated;
