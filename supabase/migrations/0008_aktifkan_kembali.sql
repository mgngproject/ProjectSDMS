-- Mengaktifkan kembali karyawan yang sudah di-terminate.
-- Berjalan sebagai pemanggil, jadi RLS tetap berlaku (admin hanya bisa memulihkan karyawan kategorinya).
create or replace function public.aktifkan_kembali(ids bigint[]) returns jsonb
language plpgsql as $$
declare
  hari  date := (now() at time zone 'Asia/Jakarta')::date;
  kid   bigint;
  k_id  bigint;
  n     int := 0;
  tanpa int := 0;
begin
  foreach kid in array ids loop
    update public.karyawan
       set status = 'aktif', tanggal_keluar = null, alasan_keluar = null
     where id = kid and status = 'terminate';
    if not found then
      continue; -- bukan terminate, atau tidak boleh diakses
    end if;
    n := n + 1;

    -- Kontrak yang ikut di-terminate dikembalikan menjadi selesai
    update public.kontrak set status = 'selesai' where karyawan_id = kid and status = 'terminate';

    -- Kontrak terbaru yang belum berakhir menjadi aktif kembali
    select id into k_id from public.kontrak
     where karyawan_id = kid and akhir_kontrak >= hari
     order by awal_kontrak desc limit 1;
    if k_id is not null then
      update public.kontrak set status = 'aktif' where id = k_id;
    else
      tanpa := tanpa + 1;
    end if;

    perform public.sync_kontrak(kid);
  end loop;

  return jsonb_build_object('aktif', n, 'tanpa_kontrak_aktif', tanpa);
end $$;
