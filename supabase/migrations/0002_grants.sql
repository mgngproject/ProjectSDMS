-- Hak akses tabel untuk role `authenticated` (dipakai aplikasi saat pengguna login).
-- Supabase tidak lagi memberi hak ini otomatis pada tabel baru di schema public.
-- Data tetap dibatasi per kategori oleh RLS di 0001_init.sql.
-- `profiles` sengaja hanya select: akun dan perannya dikelola lewat SQL Editor atau scripts/create-users.mjs.

grant usage on schema public to authenticated;

grant select on public.kategori to authenticated;
grant select on public.profiles to authenticated;
grant select, insert, update, delete on
  public.karyawan, public.kontrak, public.data_diri, public.monitoring
  to authenticated;

grant usage, select on all sequences in schema public to authenticated;
