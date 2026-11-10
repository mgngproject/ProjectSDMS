-- Riwayat mutasi unit kerja karyawan.
-- Satu baris = satu perpindahan unit (kode bagan dan/atau unit kerja) pada tanggal efektif tertentu.
-- Tercatat otomatis setiap kali kode bagan karyawan berubah (ubah data, import Excel), atau lewat
-- fungsi mutasi_karyawan() dengan tanggal efektif dan keterangan. Mengganti kode/nama unit di menu
-- Kode Bagan bukan mutasi dan tidak dicatat.

create table if not exists public.mutasi (
  id               bigint generated always as identity primary key,
  karyawan_id      bigint not null references public.karyawan (id) on delete cascade,
  tanggal          date not null default current_date,
  kode_bagan_lama  text,
  unit_kerja_lama  text,
  kode_bagan_baru  text,
  unit_kerja_baru  text,
  keterangan       text,
  dibuat_oleh      uuid default auth.uid(),
  created_at       timestamptz not null default now()
);

create index if not exists mutasi_karyawan_idx on public.mutasi (karyawan_id, tanggal desc);

alter table public.mutasi enable row level security;

drop policy if exists mutasi_all on public.mutasi;
create policy mutasi_all on public.mutasi
  for all to authenticated
  using (public.can_access_karyawan(karyawan_id))
  with check (public.can_access_karyawan(karyawan_id));

grant select, insert, update, delete on public.mutasi to authenticated;

-- Catat otomatis bila kode bagan berubah; bila karyawan tidak memakai kode bagan, perubahan unit kerja yang dicatat.
create or replace function public.catat_mutasi() returns trigger
language plpgsql as $$
declare
  kode_lama text := nullif(upper(btrim(old.kode_bagan)), '');
  kode_baru text := nullif(upper(btrim(new.kode_bagan)), '');
begin
  if coalesce(current_setting('sdms.lewati_mutasi', true), '') = '1' then
    return new;
  end if;
  if kode_lama is distinct from kode_baru
     or (kode_lama is null and kode_baru is null
         and nullif(btrim(old.unit_kerja), '') is distinct from nullif(btrim(new.unit_kerja), '')) then
    insert into public.mutasi (karyawan_id, kode_bagan_lama, unit_kerja_lama, kode_bagan_baru, unit_kerja_baru)
    values (new.id, old.kode_bagan, old.unit_kerja, new.kode_bagan, new.unit_kerja);
  end if;
  return new;
end $$;

drop trigger if exists karyawan_catat_mutasi on public.karyawan;
create trigger karyawan_catat_mutasi
  after update of kode_bagan, unit_kerja on public.karyawan
  for each row execute function public.catat_mutasi();

-- Mutasi dengan tanggal efektif dan keterangan (mis. No. SK). Unit kerja mengikuti daftar bagan bila kodenya ada.
create or replace function public.mutasi_karyawan(p_karyawan bigint, p_kode text, p_unit text, p_tanggal date, p_keterangan text)
returns bigint
language plpgsql
security invoker
as $$
declare
  k public.karyawan%rowtype;
  v_kode text := nullif(upper(btrim(p_kode)), '');
  v_unit text := nullif(btrim(p_unit), '');
  v_id bigint;
begin
  select * into k from public.karyawan where id = p_karyawan;
  if not found then
    raise exception 'Karyawan tidak ditemukan.' using errcode = 'P0002';
  end if;
  if v_kode is not null then
    select coalesce(b.nama_unit, v_unit) into v_unit from public.bagan b where upper(b.kode) = v_kode and b.aktif;
    if not found and exists (select 1 from public.bagan) then
      raise exception 'Kode bagan % tidak ada di daftar atau sudah tidak aktif.', v_kode using errcode = '22023';
    end if;
  end if;
  if v_kode is null and v_unit is null then
    raise exception 'Isi kode bagan atau unit kerja tujuan.' using errcode = '22023';
  end if;
  if v_kode is not distinct from nullif(upper(btrim(k.kode_bagan)), '')
     and v_unit is not distinct from nullif(btrim(k.unit_kerja), '') then
    raise exception 'Unit tujuan sama dengan unit sekarang.' using errcode = '22023';
  end if;

  perform set_config('sdms.lewati_mutasi', '1', true);
  update public.karyawan set kode_bagan = v_kode, unit_kerja = v_unit where id = p_karyawan;
  perform set_config('sdms.lewati_mutasi', '', true);

  insert into public.mutasi (karyawan_id, tanggal, kode_bagan_lama, unit_kerja_lama, kode_bagan_baru, unit_kerja_baru, keterangan)
  values (p_karyawan, coalesce(p_tanggal, current_date), k.kode_bagan, k.unit_kerja, v_kode, v_unit, nullif(btrim(p_keterangan), ''))
  returning id into v_id;
  return v_id;
end $$;

grant execute on function public.mutasi_karyawan(bigint, text, text, date, text) to authenticated;

-- Mengganti kode bagan (menu Kode Bagan) bukan mutasi: sama seperti 0012, ditambah penanda agar tidak tercatat.
create or replace function public.ganti_kode_bagan(p_lama text, p_baru text)
returns jsonb
language plpgsql
security invoker
as $$
declare
  v_lama text := upper(btrim(p_lama));
  v_baru text := upper(btrim(p_baru));
  n_karyawan integer;
  n_bawahan integer;
begin
  if not public.is_superadmin() then
    raise exception 'Hanya Super Admin yang dapat mengganti kode bagan.' using errcode = '42501';
  end if;
  if v_baru !~ '^[A-Z0-9]{3,12}$' then
    raise exception 'Kode hanya boleh huruf dan angka, 3 sampai 12 karakter.' using errcode = '22023';
  end if;
  if v_lama = v_baru then
    raise exception 'Kode baru sama dengan kode lama.' using errcode = '22023';
  end if;
  if not exists (select 1 from public.bagan where kode = v_lama) then
    raise exception 'Kode % tidak ditemukan di daftar bagan.', v_lama using errcode = 'P0002';
  end if;
  if exists (select 1 from public.bagan where kode = v_baru) then
    raise exception 'Kode % sudah dipakai.', v_baru using errcode = '23505';
  end if;

  update public.bagan set kode = v_baru where kode = v_lama;
  update public.bagan set induk_kode = v_baru where induk_kode = v_lama;
  get diagnostics n_bawahan = row_count;
  perform set_config('sdms.lewati_mutasi', '1', true);
  update public.karyawan set kode_bagan = v_baru where upper(btrim(kode_bagan)) = v_lama;
  get diagnostics n_karyawan = row_count;
  perform set_config('sdms.lewati_mutasi', '', true);

  return jsonb_build_object('karyawan', n_karyawan, 'bawahan', n_bawahan);
end;
$$;

grant execute on function public.ganti_kode_bagan(text, text) to authenticated;
