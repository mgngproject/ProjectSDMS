-- Menu Akun (Super Admin) mengelola profil lewat role `service_role` di sisi server.
-- Supabase tidak lagi memberi hak otomatis pada tabel baru di schema public, jadi diberikan di sini.
-- `authenticated` tetap hanya boleh select pada profiles (lihat 0002_grants.sql).

grant usage on schema public to service_role;
grant select, insert, update, delete on public.profiles to service_role;
