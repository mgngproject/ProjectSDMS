-- Pilihan TAD: KCA, DELTA, dan BDP dipisah (sebelumnya "DELTA BDP" satu pilihan).
alter table public.karyawan_tad drop constraint if exists karyawan_tad_tad_check;
update public.karyawan_tad set tad = null where tad = 'DELTA BDP';
alter table public.karyawan_tad add constraint karyawan_tad_tad_check check (tad in ('KCA', 'DELTA', 'BDP'));
