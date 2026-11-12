-- Riwayat terminate karyawan.
-- Satu baris = satu kejadian: terminate, diubah (tanggal keluar atau alasan), diaktifkan kembali, atau dihapus dari data.
-- Tercatat otomatis lewat trigger di tabel karyawan, jadi semua jalur (form, aktifkan kembali, hapus, import Excel)
-- ikut tercatat tanpa langkah tambahan bagi PIC. Nama dan NP disalin ke riwayat dan tidak memakai foreign key,
-- sehingga riwayat tetap ada walau karyawannya dihapus.

create table if not exists public.riwayat_terminate (
  id                bigint generated always as identity primary key,
  karyawan_id       bigint not null,
  np                text not null,
  nama              text not null,
  kategori_id       bigint references public.kategori (id),
  kejadian          text not null check (kejadian in ('terminate', 'diubah', 'diaktifkan_kembali', 'dihapus')),
  tanggal           date not null default (now() at time zone 'Asia/Jakarta')::date,
  tanggal_keluar    date,
  alasan            text,
  keterangan        text,
  dibuat_oleh       uuid default auth.uid(),
  dibuat_oleh_nama  text,
  created_at        timestamptz not null default now()
);

create index if not exists riwayat_terminate_karyawan_idx on public.riwayat_terminate (karyawan_id, created_at desc);
create index if not exists riwayat_terminate_kategori_idx on public.riwayat_terminate (kategori_id, tanggal desc);

alter table public.riwayat_terminate enable row level security;

-- Hanya dibaca: Super Admin semua, PIC kategorinya sendiri. Penulisan hanya lewat trigger.
drop policy if exists riwayat_terminate_baca on public.riwayat_terminate;
create policy riwayat_terminate_baca on public.riwayat_terminate
  for select to authenticated
  using (public.is_superadmin() or kategori_id = public.current_kategori_id());

grant select on public.riwayat_terminate to authenticated;

create or replace function public.catat_riwayat_terminate() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  hari   date := (now() at time zone 'Asia/Jakarta')::date;
  oleh   text := (select p.nama from public.profiles p where p.id = auth.uid());
  ket    text;
begin
  if tg_op = 'DELETE' then
    if old.status = 'terminate' then
      insert into public.riwayat_terminate (karyawan_id, np, nama, kategori_id, kejadian, tanggal, tanggal_keluar, alasan, keterangan, dibuat_oleh_nama)
      values (old.id, old.np, old.nama, old.kategori_id, 'dihapus', hari, old.tanggal_keluar, old.alasan_keluar, 'Dihapus dari data', oleh);
    end if;
    return old;
  end if;

  if tg_op = 'INSERT' then
    if new.status = 'terminate' then
      insert into public.riwayat_terminate (karyawan_id, np, nama, kategori_id, kejadian, tanggal, tanggal_keluar, alasan, dibuat_oleh_nama)
      values (new.id, new.np, new.nama, new.kategori_id, 'terminate', coalesce(new.tanggal_keluar, hari), new.tanggal_keluar, new.alasan_keluar, oleh);
    end if;
    return new;
  end if;

  if old.status <> 'terminate' and new.status = 'terminate' then
    insert into public.riwayat_terminate (karyawan_id, np, nama, kategori_id, kejadian, tanggal, tanggal_keluar, alasan, dibuat_oleh_nama)
    values (new.id, new.np, new.nama, new.kategori_id, 'terminate', coalesce(new.tanggal_keluar, hari), new.tanggal_keluar, new.alasan_keluar, oleh);
  elsif old.status = 'terminate' and new.status <> 'terminate' then
    insert into public.riwayat_terminate (karyawan_id, np, nama, kategori_id, kejadian, tanggal, tanggal_keluar, alasan, keterangan, dibuat_oleh_nama)
    values (new.id, new.np, new.nama, new.kategori_id, 'diaktifkan_kembali', hari, old.tanggal_keluar, old.alasan_keluar,
            'Terminate' || coalesce(' ' || to_char(old.tanggal_keluar, 'DD-MM-YYYY'), '') || ' dibatalkan', oleh);
  elsif old.status = 'terminate' and new.status = 'terminate'
        and (old.tanggal_keluar is distinct from new.tanggal_keluar or old.alasan_keluar is distinct from new.alasan_keluar) then
    ket := concat_ws('; ',
      case when old.tanggal_keluar is distinct from new.tanggal_keluar
           then 'Tanggal keluar: ' || coalesce(to_char(old.tanggal_keluar, 'DD-MM-YYYY'), '-') || ' → ' || coalesce(to_char(new.tanggal_keluar, 'DD-MM-YYYY'), '-') end,
      case when old.alasan_keluar is distinct from new.alasan_keluar
           then 'Alasan: ' || coalesce(old.alasan_keluar, '-') || ' → ' || coalesce(new.alasan_keluar, '-') end);
    insert into public.riwayat_terminate (karyawan_id, np, nama, kategori_id, kejadian, tanggal, tanggal_keluar, alasan, keterangan, dibuat_oleh_nama)
    values (new.id, new.np, new.nama, new.kategori_id, 'diubah', hari, new.tanggal_keluar, new.alasan_keluar, ket, oleh);
  end if;
  return new;
end $$;

drop trigger if exists karyawan_riwayat_terminate_simpan on public.karyawan;
create trigger karyawan_riwayat_terminate_simpan
  after insert or update of status, tanggal_keluar, alasan_keluar on public.karyawan
  for each row execute function public.catat_riwayat_terminate();

drop trigger if exists karyawan_riwayat_terminate_hapus on public.karyawan;
create trigger karyawan_riwayat_terminate_hapus
  before delete on public.karyawan
  for each row execute function public.catat_riwayat_terminate();

-- Data awal: karyawan yang sedang terminate saat migrasi ini dijalankan dicatat sebagai terminate pertama mereka.
-- Kejadian lama yang sudah terlanjur diaktifkan kembali atau dihapus tidak bisa dipulihkan.
insert into public.riwayat_terminate (karyawan_id, np, nama, kategori_id, kejadian, tanggal, tanggal_keluar, alasan, keterangan, dibuat_oleh, dibuat_oleh_nama)
select k.id, k.np, k.nama, k.kategori_id, 'terminate', coalesce(k.tanggal_keluar, (now() at time zone 'Asia/Jakarta')::date),
       k.tanggal_keluar, k.alasan_keluar, 'Data awal sebelum riwayat dicatat', null, null
from public.karyawan k
where k.status = 'terminate'
  and not exists (select 1 from public.riwayat_terminate r where r.karyawan_id = k.id);
