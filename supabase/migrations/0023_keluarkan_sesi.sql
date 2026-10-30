-- Menu Akun (Super Admin): memaksa sebuah akun keluar dari semua perangkat dengan menghapus sesinya.
-- Token akses yang sudah terbit tetap berlaku sampai habis (paling lama sekitar 1 jam), tetapi tidak bisa diperbarui.
-- Hanya service_role (server) yang boleh memanggilnya.

create or replace function public.keluarkan_sesi(uid uuid) returns void
language sql security definer set search_path = '' as $$
  delete from auth.sessions where user_id = uid;
$$;

revoke all on function public.keluarkan_sesi(uuid) from public, anon, authenticated;
grant execute on function public.keluarkan_sesi(uuid) to service_role;
