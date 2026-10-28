-- Kolom khusus kategori IDE: status (satu baris per karyawan).

create table public.karyawan_ide (
  karyawan_id bigint primary key references public.karyawan (id) on delete cascade,
  status_ide text
);

alter table public.karyawan_ide enable row level security;

create policy karyawan_ide_all on public.karyawan_ide
  for all to authenticated
  using (public.can_access_karyawan(karyawan_id))
  with check (public.can_access_karyawan(karyawan_id));

grant select, insert, update, delete on public.karyawan_ide to authenticated;
