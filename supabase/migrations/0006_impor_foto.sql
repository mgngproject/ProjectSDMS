-- 1. Sinkronisasi kontrak untuk banyak karyawan sekaligus (dipakai import Excel).
create or replace function public.sync_kontrak_semua(ids bigint[]) returns void
language plpgsql as $$
declare kid bigint;
begin
  foreach kid in array ids loop
    perform public.sync_kontrak(kid);
  end loop;
end $$;

-- 2. Penyimpanan foto karyawan (privat). Berkas disimpan di folder <karyawan_id>/.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('foto-karyawan', 'foto-karyawan', false, 2097152, array['image/jpeg', 'image/png'])
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- Id karyawan dari nama folder; null bila bukan angka.
create or replace function public.foto_karyawan_id(path text) returns bigint
language sql immutable as $$
  select case when split_part(path, '/', 1) ~ '^[0-9]{1,15}$' then split_part(path, '/', 1)::bigint end
$$;

create policy foto_karyawan_select on storage.objects
  for select to authenticated
  using (bucket_id = 'foto-karyawan' and public.foto_karyawan_id(name) is not null
         and public.can_access_karyawan(public.foto_karyawan_id(name)));

create policy foto_karyawan_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'foto-karyawan' and public.foto_karyawan_id(name) is not null
              and public.can_access_karyawan(public.foto_karyawan_id(name)));

create policy foto_karyawan_update on storage.objects
  for update to authenticated
  using (bucket_id = 'foto-karyawan' and public.foto_karyawan_id(name) is not null
         and public.can_access_karyawan(public.foto_karyawan_id(name)))
  with check (bucket_id = 'foto-karyawan' and public.foto_karyawan_id(name) is not null
              and public.can_access_karyawan(public.foto_karyawan_id(name)));

create policy foto_karyawan_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'foto-karyawan' and public.foto_karyawan_id(name) is not null
         and public.can_access_karyawan(public.foto_karyawan_id(name)));
