# SDMS — Sistem Dashboard Rekrutmen

Aplikasi web untuk mengelola data karyawan dan administrasi kontrak secara terpusat, dengan pembatasan akses per kategori pengguna.

Versi ini dibangun dengan **Next.js + Supabase** dan di-deploy ke **Vercel**. Versi lama (Laravel + MySQL) disimpan di folder [`legacy-laravel/`](legacy-laravel) hanya sebagai acuan.

## 1. Tech Stack

| Komponen        | Teknologi                                   |
| --------------- | ------------------------------------------- |
| Framework       | Next.js 15 (App Router) + TypeScript        |
| Database        | PostgreSQL (Supabase)                       |
| Autentikasi     | Supabase Auth (email + password)            |
| Hak akses data  | Row Level Security (RLS) Supabase           |
| Styling         | Tailwind CSS                                |
| Grafik / Export | Recharts / SheetJS (`xlsx`)                 |
| Hosting         | Vercel                                      |

| Aspek       | Versi lama (Laravel)       | Versi ini                |
| ----------- | -------------------------- | ------------------------ |
| Bahasa      | PHP                        | TypeScript               |
| Database    | MySQL                      | PostgreSQL (Supabase)    |
| Tampilan    | Blade + Bootstrap          | React + Tailwind         |
| Login       | Session Laravel            | Supabase Auth            |
| Batas akses | Pengecekan di controller   | RLS + `kategori_id`      |
| Skema DB    | Laravel Migration          | `supabase/migrations/`   |

## 2. Fitur

Logikanya mengikuti versi Laravel.

* **Login & hak akses** — admin hanya melihat dan mengelola data kategorinya; Super Admin melihat semua.
* **Dashboard** — penunjuk bulan; karyawan aktif, masuk, kontrak habis, dan berkas belum lengkap; grafik masuk dan habis per bulan, pendidikan, 10 kampus teratas, dan per kategori; daftar kontrak habis ≤ 60 hari; filter kategori untuk Super Admin.
* **Data Karyawan** — tambah (otomatis membuat Kontrak 1, data diri, dan monitoring), ubah, hapus, hapus massal, cari, filter masuk/habis per bulan dan tahun, masa kerja dan masa kontrak, export Excel.
* **Kontrak** — riwayat per karyawan (tambah, ubah, hapus). Kontrak yang lewat otomatis selesai, kontrak aktif baru menutup yang lama, dan data karyawan ikut disinkronkan.
* **Data Diri** — daftar dengan filter jenjang, ubah (KTP 16 digit dan unik), export Excel.
* **Monitoring** — 10 kotak centang dan 3 isian (usulan remunerasi, SP, SKEP); status `Selesai` hanya bila semuanya lengkap, catatan menampilkan yang kurang; filter bulan dan status.
* **Terminate** — terminate dari karyawan, tambah langsung, ubah, hapus, hapus massal, filter, export Excel.
* **Import Excel** — format sama dengan versi lama: sheet `Database` (karyawan dan kontrak berurutan `awal_kontrak`, `akhir_kontrak`, `awal_kontrak2`, ...), `Mail Merge` (data diri), `Terminate`, dan `Kontrak`. File tanpa nama sheet dibaca sebagai Database. Template per kategori bisa diunduh dari tombol Import. Maksimal 3 MB dan 1000 baris per sheet; baris yang salah dilaporkan dan dilewati.
* **Export** — Excel dan PDF (A4 lanskap) untuk karyawan, terminate, dan data diri. Isi mengikuti kolom kategori.

### Kategori Magang
Kategori Magang punya kolom khusus (tabel `karyawan_magang`): Kategori (Magenta / PKL / Maganghub), Universitas/Sekolah, Jurusan, Penempatan (Jakarta / Karawang), Status (Baru / Alih Status / Perpanjangan Maganghub), Awal dan Akhir Pendidikan, serta Catatan Titipan. Awal dan Akhir Kontrak tetap di data kontrak seperti kategori lain. Dashboard Magang menampilkan peserta yang berakhir dalam 30 hari dan sebaran per kategori, penempatan, dan status. Kolom standar yang tidak dipakai (jabatan, level, role, benefit, faskes, gross, KPI) disembunyikan.

Kategori TPBW/TPP memakai kolom standar ditambah **Status** (TPBW atau TPP), tabel `karyawan_tpbw`.

Kategori BGN memakai kolom standar ditambah **Level Jabatan** (Senior, Middle, Junior, atau PKWT Reguler), tabel `karyawan_bgn`.

Kategori IDH memakai kolom standar, dengan **Level** berupa pilihan (Junior, Middle, Senior) dan tanpa Faskes; tidak ada tabel khusus.

Kategori Inagov memakai kolom standar, dengan **Level** berupa pilihan (Senior, Middle, Junior); tidak ada tabel khusus.

Kolom khusus kategori lain didaftarkan di `src/lib/kategori-config.ts`.

### Dashboard "akan selesai"
Dashboard menampilkan daftar karyawan yang kontraknya akan berakhir dalam jendela waktu per kategori: Magang 30 hari, TPBW/TPP, PKWT, BGN, dan Inagov 2 bulan serta IDE 1 bulan (bulan kalender), kategori lain 60 hari. Jendela diatur di `JENDELA_KHUSUS` pada `src/lib/kategori-config.ts`.

## 3. Kategori dan Role

| Kategori | Akun         |
| -------- | ------------ |
| IDE      | Admin IDE    |
| IDH      | Admin IDH    |
| BGN      | Admin BGN    |
| TPBW/TPP | Admin TPBW/TPP |
| Magang   | PIC Magang   |
| PKWT     | PIC PKWT     |
| Inagov   | Admin Inagov |
| —        | Super Admin (semua kategori) |

Tabel `profiles` menyimpan `role` (`admin` atau `superadmin`) dan `kategori_id`. Admin wajib punya kategori; Super Admin tidak terikat kategori. Pembatasan data ditegakkan di database lewat RLS (lihat `supabase/migrations/0001_init.sql`), jadi tetap berlaku walau ada yang memanggil API Supabase langsung.

## 4. Struktur Proyek

```
src/
├── app/
│   ├── login/                 # halaman dan aksi login/logout
│   ├── (app)/                 # area setelah login (layout + sidebar)
│   │   ├── dashboard/
│   │   ├── karyawan/          # daftar, new, [id]/edit, [id]/kontrak, [id]/datadiri
│   │   ├── monitoring/
│   │   └── terminate/
│   └── api/export/karyawan/   # export Excel
├── components/
├── lib/                       # klien Supabase, auth, format tanggal
└── middleware.ts              # menyegarkan sesi dan mengarahkan ke /login
supabase/
├── migrations/                # 0001 tabel+RLS, 0002 hak akses, 0003 logika kontrak/monitoring, 0004 kolom Magang, 0005 kolom TPBW/TPP, 0006 import Excel (sinkron massal), 0007 kolom BGN
└── seed.sql                   # daftar kategori
scripts/create-users.mjs       # membuat akun awal
legacy-laravel/                # kode Laravel lama (acuan)
```

## 5. Menjalankan Secara Lokal

Prasyarat: Node.js 20+ dan project Supabase.

### a. Siapkan Supabase

1. Buat project di [supabase.com](https://supabase.com).
2. Buka **SQL Editor**, jalankan berurutan: `supabase/migrations/0001_init.sql`, `0002_grants.sql`, `0003_parity_laravel.sql`, `0004_magang.sql`, `0005_tpbw.sql`, `0006_impor_foto.sql`, `0007_bgn.sql`, lalu `supabase/seed.sql`.
3. Ambil `Project URL`, `anon key`, dan `service_role key` dari **Project Settings → API**.

### b. Konfigurasi dan jalankan

```bash
npm install
cp .env.example .env     # isi nilai dari Supabase
npm run dev
```

Aplikasi berjalan di `http://localhost:3000`.

### c. Buat akun awal

Isi password tiap akun lewat variabel lingkungan (tidak disimpan di repo), lalu jalankan skrip:

```bash
PASSWORD_IDE=... PASSWORD_IDH=... PASSWORD_BGN=... PASSWORD_TPBW=... \
PASSWORD_MAGANG=... PASSWORD_PKWT=... PASSWORD_INAGOV=... PASSWORD_SUPERADMIN=... \
node --env-file=.env scripts/create-users.mjs
```

Akun yang passwordnya tidak diisi akan dilewati. Email akun ada di `scripts/create-users.mjs`.

## 6. Deploy ke Vercel

1. Di [vercel.com](https://vercel.com), pilih **Add New → Project**, lalu import repo `ProjectSDMS` dari GitHub.
2. Framework otomatis terdeteksi sebagai Next.js (Root Directory: `./`).
3. Isi **Environment Variables**:

| Variabel                        | Nilai                  |
| ------------------------------- | ---------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Project URL Supabase   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key Supabase      |

4. Klik **Deploy**. Setiap push ke `main` akan men-deploy ulang otomatis.

`SUPABASE_SERVICE_ROLE_KEY` **jangan** dimasukkan ke Vercel. Kunci itu melewati RLS dan hanya dipakai skrip lokal.

## 7. Perintah

```bash
npm run dev        # mode pengembangan
npm run build      # build produksi
npm run typecheck  # cek tipe TypeScript
```

## 8. Alur Kerja Git

```bash
git checkout -b fitur/nama-fitur
git add .
git commit -m "feat: deskripsi singkat"
git push -u origin fitur/nama-fitur
```

Buat Pull Request ke `main` dan minta review sebelum merge.

## 9. Belum Dimigrasikan dari Versi Laravel

* Perpindahan data dari MySQL lama ke Supabase. Jalurnya: ekspor data lama ke Excel dengan format import di atas, lalu import per kategori.

Kode acuannya ada di `legacy-laravel/app/`.
