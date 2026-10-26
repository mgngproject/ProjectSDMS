-- Menyamakan perilaku database dengan versi Laravel.

-- 1. Status kontrak: tambah 'terminate'
alter table public.kontrak drop constraint if exists kontrak_status_check;
alter table public.kontrak
  add constraint kontrak_status_check check (status in ('aktif', 'selesai', 'terminate'));

-- 2. Status monitoring: 'Selesai' / 'Belum Lengkap'
alter table public.monitoring drop constraint if exists monitoring_status_check;
update public.monitoring set status = 'Belum Lengkap' where status <> 'Selesai';
alter table public.monitoring alter column status set default 'Belum Lengkap';
alter table public.monitoring
  add constraint monitoring_status_check check (status in ('Selesai', 'Belum Lengkap'));

-- 3. KTP: tepat 16 karakter dan unik
alter table public.data_diri drop constraint if exists data_diri_ktp_check;
alter table public.data_diri
  add constraint data_diri_ktp_check check (ktp is null or char_length(ktp) = 16);
create unique index if not exists data_diri_ktp_unique on public.data_diri (ktp) where ktp is not null;

-- 4. Karyawan baru otomatis punya baris monitoring dan data diri
create or replace function public.create_monitoring() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.monitoring (karyawan_id) values (new.id) on conflict do nothing;
  insert into public.data_diri (karyawan_id) values (new.id) on conflict do nothing;
  return new;
end $$;

-- Lengkapi karyawan lama yang belum punya baris data diri / monitoring
insert into public.data_diri (karyawan_id)
select id from public.karyawan k
where not exists (select 1 from public.data_diri d where d.karyawan_id = k.id);

insert into public.monitoring (karyawan_id)
select id from public.karyawan k
where not exists (select 1 from public.monitoring m where m.karyawan_id = k.id);

-- 5. Sinkronisasi kontrak -> karyawan (setara logika KontrakController di Laravel)
--    Berjalan sebagai pemanggil, jadi RLS tetap berlaku.
create or replace function public.sync_kontrak(kid bigint) returns void
language plpgsql as $$
declare
  hari_ini date := (now() at time zone 'Asia/Jakarta')::date;
  v_awal   date;
  v_akhir  date;
  v_pertama date;
begin
  if exists (select 1 from public.karyawan where id = kid and status = 'terminate') then
    return;
  end if;

  -- kontrak aktif yang sudah lewat menjadi selesai
  update public.kontrak set status = 'selesai'
  where karyawan_id = kid and status = 'aktif' and akhir_kontrak < hari_ini;

  select awal_kontrak, akhir_kontrak into v_awal, v_akhir
  from public.kontrak
  where karyawan_id = kid and status = 'aktif'
  order by awal_kontrak desc limit 1;

  if not found then
    select awal_kontrak, akhir_kontrak into v_awal, v_akhir
    from public.kontrak
    where karyawan_id = kid and status = 'selesai'
    order by akhir_kontrak desc nulls last limit 1;
  end if;

  select min(awal_kontrak) into v_pertama from public.kontrak where karyawan_id = kid;

  update public.karyawan
  set awal_kontrak = v_pertama, awal_kontrak_aktif = v_awal, akhir_kontrak = v_akhir
  where id = kid;
end $$;

-- Menyelesaikan semua kontrak aktif yang sudah lewat (untuk baris yang boleh dilihat pemanggil)
create or replace function public.expire_kontrak() returns void
language plpgsql as $$
declare kid bigint;
begin
  for kid in
    select distinct karyawan_id from public.kontrak
    where status = 'aktif' and akhir_kontrak < (now() at time zone 'Asia/Jakarta')::date
  loop
    perform public.sync_kontrak(kid);
  end loop;
end $$;
