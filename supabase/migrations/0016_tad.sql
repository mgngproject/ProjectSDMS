-- Kategori TAD: kolom khusus SBU dan TAD (satu baris per karyawan).

insert into public.kategori (nama) values ('TAD') on conflict (nama) do nothing;

create table public.karyawan_tad (
  karyawan_id bigint primary key references public.karyawan (id) on delete cascade,
  sbu         text check (sbu in ('SBU CS', 'SBU DIGITAL', 'SBU HSS', 'Support Bisnis')),
  tad         text check (tad in ('KCA', 'DELTA BDP'))
);

alter table public.karyawan_tad enable row level security;

create policy karyawan_tad_all on public.karyawan_tad
  for all to authenticated
  using (public.can_access_karyawan(karyawan_id))
  with check (public.can_access_karyawan(karyawan_id));

grant select, insert, update, delete on public.karyawan_tad to authenticated;
