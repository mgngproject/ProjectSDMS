-- SDMS: skema awal (setara migrasi Laravel di legacy-laravel/database/migrations)

create table public.kategori (
  id   bigint generated always as identity primary key,
  nama text not null unique
);

create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  nama        text not null,
  jabatan     text,
  role        text not null default 'admin' check (role in ('admin', 'superadmin')),
  kategori_id bigint references public.kategori (id),
  created_at  timestamptz not null default now(),
  -- superadmin tidak terikat kategori; admin wajib punya kategori
  constraint profiles_kategori_check check (role = 'superadmin' or kategori_id is not null)
);

create table public.karyawan (
  id                 bigint generated always as identity primary key,
  np                 text not null unique,
  nama               text not null,
  kategori_id        bigint not null references public.kategori (id),
  kode_bagan         text,
  unit_kerja         text,
  jabatan            text,
  level              text,
  role               text,
  benefit_kesehatan  text,
  faskes             text,
  gross_per_month    bigint,
  kpi                text,
  foto               text,
  folder_link        text,
  awal_kontrak       date,
  awal_kontrak_aktif date,
  akhir_kontrak      date,
  status             text not null default 'aktif' check (status in ('aktif', 'terminate')),
  tanggal_keluar     date,
  alasan_keluar      text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table public.kontrak (
  id            bigint generated always as identity primary key,
  karyawan_id   bigint not null references public.karyawan (id) on delete cascade,
  kontrak_ke    text not null,
  np            text,
  awal_kontrak  date,
  akhir_kontrak date,
  penilaian     text,
  folder_link   text,
  status        text not null default 'aktif' check (status in ('aktif', 'selesai')),
  created_at    timestamptz not null default now()
);

create table public.data_diri (
  id            bigint generated always as identity primary key,
  karyawan_id   bigint not null unique references public.karyawan (id) on delete cascade,
  ktp           text check (ktp is null or char_length(ktp) <= 16),
  tempat_lahir  text,
  tanggal_lahir date,
  alamat        text,
  rt            text,
  rw            text,
  kelurahan     text,
  kecamatan     text,
  kabupaten     text,
  provinsi      text,
  jenjang_1     text,
  jurusan_1     text,
  kampus_1      text,
  jenjang_2     text,
  jurusan_2     text,
  kampus_2      text
);

create table public.monitoring (
  id                         bigint generated always as identity primary key,
  karyawan_id                bigint not null unique references public.karyawan (id) on delete cascade,
  nde_konfirmasi             boolean not null default false,
  nde_jawaban                boolean not null default false,
  nde_laporan                boolean not null default false,
  usulan_remunerasi          text,
  offering_letter            boolean not null default false,
  izin_prinsip_nde           boolean not null default false,
  izin_prinsip_manual        boolean not null default false,
  sp                         text,
  skep                       text,
  nde_penyampaian_unit_kerja boolean not null default false,
  nde_penyampaian_sdmo       boolean not null default false,
  upload_ess                 boolean not null default false,
  data_diri                  boolean not null default false,
  status                     text not null default 'Belum Selesai' check (status in ('Selesai', 'Belum Selesai')),
  catatan                    text,
  keterangan                 text
);

create index karyawan_kategori_idx on public.karyawan (kategori_id);
create index kontrak_karyawan_idx on public.kontrak (karyawan_id);

-- Buat baris monitoring otomatis untuk setiap karyawan baru
create function public.create_monitoring() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.monitoring (karyawan_id) values (new.id);
  return new;
end $$;

create trigger karyawan_after_insert
  after insert on public.karyawan
  for each row execute function public.create_monitoring();

create function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger karyawan_touch before update on public.karyawan
  for each row execute function public.touch_updated_at();

-- Helper hak akses
create function public.is_superadmin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'superadmin' from public.profiles where id = auth.uid()), false)
$$;

create function public.current_kategori_id() returns bigint
language sql stable security definer set search_path = public as $$
  select kategori_id from public.profiles where id = auth.uid()
$$;

create function public.can_access_karyawan(kid bigint) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_superadmin() or exists (
    select 1 from public.karyawan k
    where k.id = kid and k.kategori_id = public.current_kategori_id()
  )
$$;

-- Row Level Security
alter table public.kategori  enable row level security;
alter table public.profiles  enable row level security;
alter table public.karyawan  enable row level security;
alter table public.kontrak   enable row level security;
alter table public.data_diri enable row level security;
alter table public.monitoring enable row level security;

create policy kategori_read on public.kategori
  for select to authenticated using (true);

create policy profiles_read on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_superadmin());

create policy karyawan_all on public.karyawan
  for all to authenticated
  using (public.is_superadmin() or kategori_id = public.current_kategori_id())
  with check (public.is_superadmin() or kategori_id = public.current_kategori_id());

create policy kontrak_all on public.kontrak
  for all to authenticated
  using (public.can_access_karyawan(karyawan_id))
  with check (public.can_access_karyawan(karyawan_id));

create policy data_diri_all on public.data_diri
  for all to authenticated
  using (public.can_access_karyawan(karyawan_id))
  with check (public.can_access_karyawan(karyawan_id));

create policy monitoring_all on public.monitoring
  for all to authenticated
  using (public.can_access_karyawan(karyawan_id))
  with check (public.can_access_karyawan(karyawan_id));
