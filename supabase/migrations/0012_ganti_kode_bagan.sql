-- Mengganti kode bagan secara atomik: kode di daftar, atasan unit bawahan, dan kode semua karyawan berubah bersama
-- (atau tidak sama sekali). Hanya Super Admin; RLS tetap berlaku karena fungsi berjalan sebagai pemanggil.

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
  update public.karyawan set kode_bagan = v_baru where upper(btrim(kode_bagan)) = v_lama;
  get diagnostics n_karyawan = row_count;

  return jsonb_build_object('karyawan', n_karyawan, 'bawahan', n_bawahan);
end;
$$;

grant execute on function public.ganti_kode_bagan(text, text) to authenticated;
