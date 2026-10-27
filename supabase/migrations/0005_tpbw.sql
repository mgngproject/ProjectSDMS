-- Kolom khusus kategori TPBW/TPP: status TPBW atau TPP (satu baris per karyawan).

create table public.karyawan_tpbw (
  karyawan_id bigint primary key references public.karyawan (id) on delete cascade,
  status_tpbw text check (status_tpbw in ('TPBW', 'TPP'))
);

alter table public.karyawan_tpbw enable row level security;

create policy karyawan_tpbw_all on public.karyawan_tpbw
  for all to authenticated
  using (public.can_access_karyawan(karyawan_id))
  with check (public.can_access_karyawan(karyawan_id));

grant select, insert, update, delete on public.karyawan_tpbw to authenticated;
