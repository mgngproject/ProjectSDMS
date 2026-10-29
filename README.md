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
* **Dashboard Super Admin** — dua tab. **Ringkasan**: kartu karyawan aktif, masuk bulan ini, kontrak berakhir bulan ini, dan turnover 12 bulan (dengan perbandingan dan garis tren kecil); tren karyawan aktif dengan batang masuk dan keluar; Perlu tindak lanjut; Kontrak habis dalam 60 hari (jendela mengikuti kategori); Risiko perpanjangan (habis ≤ 30 hari menurut kelengkapan berkas); Corong perpanjangan; Alasan keluar. **Profil**: karyawan aktif per direktorat dan divisi (treemap dari daftar Kode Bagan), sebaran usia, pendidikan menurut kelompok usia, masa kerja, dan kelengkapan data. Filter kategori berlaku untuk semuanya, klik batang atau kotak membuka daftar orangnya, dan tiap grafik punya tampilan tabel. Dashboard PIC tidak berubah. Logika ada di `src/lib/dashboard-sa.ts`.
* **Data Karyawan** — Super Admin memilih kategori lewat submenu di sidebar (dengan jumlah karyawan aktif per kategori); tiap kategori menampilkan kolomnya sendiri, tambah (otomatis membuat Kontrak 1, data diri, dan monitoring), ubah, hapus, hapus massal, cari, filter masuk/habis per bulan dan tahun, masa kerja dan masa kontrak, export Excel.
* **Kontrak** — riwayat per karyawan (tambah, ubah, hapus). Kontrak yang lewat otomatis selesai, kontrak aktif baru menutup yang lama, dan data karyawan ikut disinkronkan.
* **Data Diri** — daftar dengan filter jenjang, ubah (KTP 16 digit dan unik), export Excel.
* **Monitoring** — daftar ringkas (kemajuan n/13, status, berkas yang belum ada); klik baris membuka panel rincian per tahap (Perpanjangan, Persetujuan, Penetapan, Penyampaian, Administrasi) berisi 10 kotak centang dan 3 isian (usulan remunerasi, SP, SKEP); status `Selesai` hanya bila semuanya lengkap, catatan menampilkan yang kurang; filter bulan dan status.
* **Terminate** — terminate dari karyawan, **aktifkan kembali** (satu atau banyak; kontrak terbaru yang masih berlaku kembali aktif), tambah langsung, ubah, hapus, hapus massal, filter, export Excel.
* **Import Excel** — format sama dengan versi lama: sheet `Database` (karyawan dan kontrak berurutan `awal_kontrak`, `akhir_kontrak`, `awal_kontrak2`, ...), `Mail Merge` (data diri), `Terminate`, dan `Kontrak`. File tanpa nama sheet dibaca sebagai Database. Template per kategori bisa diunduh dari tombol Import. Maksimal 3 MB dan 1000 baris per sheet; baris yang salah dilaporkan dan dilewati.
* **Export** — Excel dan PDF (A4 lanskap) untuk karyawan, terminate, dan data diri. Isi mengikuti kolom kategori.

### Kategori Magang
Kategori Magang punya kolom khusus (tabel `karyawan_magang`): Kategori (Magenta / PKL / Maganghub), Universitas/Sekolah, Jurusan, Penempatan (Jakarta / Karawang), Status (Baru / Alih Status / Perpanjangan Maganghub), Awal dan Akhir Pendidikan, serta Referensi (nama orang yang merekomendasikan, isian singkat). Awal dan Akhir Kontrak tetap di data kontrak seperti kategori lain. Dashboard Magang menampilkan peserta yang berakhir dalam 30 hari dan sebaran per kategori, penempatan, dan status. Kolom standar yang tidak dipakai (jabatan, level, role, benefit, faskes, gross, KPI) disembunyikan.

Kategori TPBW/TPP memakai kolom standar ditambah **Status** (TPBW atau TPP), tabel `karyawan_tpbw`.

Kategori BGN memakai kolom standar ditambah **Level Jabatan** (Senior, Middle, Junior, atau PKWT Reguler), tabel `karyawan_bgn`.

Kategori IDH memakai kolom standar, dengan **Level** berupa pilihan (Junior, Middle, Senior) dan tanpa Faskes; tidak ada tabel khusus.

Kategori Inagov memakai kolom standar, dengan **Level** berupa pilihan (Senior, Middle, Junior); tidak ada tabel khusus.

### Kuota Magang
Menu **Kuota** (hanya PIC Magang; Super Admin tidak punya akses) mengatur batas peserta Magang yang aktif bersamaan per unit kerja di tiap penempatan (Jakarta atau Karawang), tabel `kuota_magang`. Hanya pasangan unit kerja dan penempatan yang memang ada yang dibuat. Satu peserta memakai satu slot selama seluruh masa kontraknya; jumlah terisi dihitung otomatis dari data karyawan (tidak disimpan), per bulan, dan bulan bisa digeser. Status: Tersedia, Hampir penuh (80% atau lebih), Penuh, Melebihi. Saat menambah peserta Magang, bila unit kerja belum punya kuota di penempatan itu atau penuh di salah satu bulan masa kontraknya, muncul peringatan, tetapi data tetap tersimpan. Nama unit kerja harus sama dengan isian Unit Kerja peserta (huruf besar-kecil diabaikan).

### Kode Bagan
Menu **Kode Bagan** (hanya Super Admin) memegang daftar bagan, tabel `bagan`: kode, nama unit, atasan (opsional), dan status aktif. Daftar diisi lewat import Excel (judul kolom **Kode**, **Nama Unit**, **Atasan**; pilihan **Ganti seluruh daftar** menghapus kode lama yang tidak ada di file) atau satu per satu; kode diseragamkan menjadi huruf besar. Daftar ini menjadi satu-satunya acuan: di form karyawan, Kode Bagan dipilih dari daftar yang aktif dan Unit Kerja terisi otomatis (tidak bisa diketik bila kodenya dikenal). Karyawan lama dengan kode yang tidak dikenal tetap bisa disimpan selama kodenya tidak diubah, dan muncul di bagian **Perlu dibereskan** pada halaman Kode Bagan. Mengubah nama unit di daftar menyamakan Unit Kerja semua karyawan yang memakai kode itu; tombol **Samakan sekarang** menyamakan data lama. Import karyawan menolak baris dengan kode yang tidak ada di daftar aktif. Selama daftar masih kosong, semua isian berjalan seperti sebelumnya. Ganti kode, gabung, pecah, dan riwayat perubahan belum tersedia.

Kolom khusus kategori lain didaftarkan di `src/lib/kategori-config.ts`.

### Dashboard "akan selesai"
Dashboard menampilkan daftar karyawan yang kontraknya akan berakhir dalam jendela waktu per kategori: Magang 30 hari, TPBW/TPP, PKWT, BGN, dan Inagov 2 bulan serta IDE, IDH, dan TAD 1 bulan (bulan kalender), kategori lain 60 hari. Jendela diatur di `JENDELA_KHUSUS` pada `src/lib/kategori-config.ts`.

### Form karyawan
Form Tambah dan Ubah karyawan berada di tengah halaman dengan judul sejajar, isiannya dikelompokkan (Identitas, Data kategori, Kontrak, Penempatan, Kompensasi, Lainnya; bagian yang kosong untuk suatu kategori tidak tampil), dan tombol Simpan menempel di bawah layar saat form digulir.

### Filter
Karyawan, Kontrak, Data Diri, Monitoring, dan Terminate memakai baris filter yang sama (`src/components/FilterBar.tsx`): kategori (Super Admin), cari nama/NP, periode (kontrak masuk, kontrak habis, atau tanggal keluar per bulan dan tahun), filter khusus halaman, tombol **Cari** dan **Reset**. Filter khusus: Karyawan (kolom khusus kategori seperti penempatan, status, level), Data Diri (jenjang, kelengkapan), Monitoring (status, berkas yang belum ada), Terminate (alasan keluar). Pilihan filter tersimpan di alamat halaman, dan Export Excel dan PDF mengikuti filter yang sedang dipakai.

### Sidebar
Sidebar menampilkan logo Peruri di atas dan bisa dibuka-tutup lewat tombol di sebelahnya (layar lebar). Saat tertutup hanya ikon yang tampil dan logo menjadi bunga saja; pilihan tersimpan di cookie `sidebar`. Logo ada di `public/` (versi biru-ungu untuk mode terang, putih untuk mode gelap, masing-masing penuh dan hanya bunga).

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
| TAD      | Admin TAD    |
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
├── migrations/                # 0001 tabel+RLS, 0002 hak akses, 0003 logika kontrak/monitoring, 0004 kolom Magang, 0005 kolom TPBW/TPP, 0006 import Excel (sinkron massal), 0007 kolom BGN, 0008 aktifkan kembali, 0009 kuota Magang, 0010 kuota hanya untuk PIC Magang, 0011 daftar bagan, 0011 kolom IDE, 0012 salinan data IDE, 0013 hapus status IDE, 0014 hapus salinan status, 0015 tabel IDH, 0016 hapus faskes IDE, 0017 hapus faskes IDH, 0018 kolom TAD, 0019 salinan data TAD, 0020 pisah DELTA dan BDP, 0021 remunerasi TAD
└── seed.sql                   # daftar kategori
scripts/create-users.mjs       # membuat akun awal
legacy-laravel/                # kode Laravel lama (acuan)
```

## 5. Menjalankan Secara Lokal

Prasyarat: Node.js 20+ dan project Supabase.

### a. Siapkan Supabase

1. Buat project di [supabase.com](https://supabase.com).
2. Buka **SQL Editor**, jalankan berurutan: `supabase/migrations/0001_init.sql`, `0002_grants.sql`, `0003_parity_laravel.sql`, `0004_magang.sql`, `0005_tpbw.sql`, `0006_impor_foto.sql`, `0007_bgn.sql`, `0008_aktifkan_kembali.sql`, `0009_kuota.sql`, `0010_kuota_hanya_pic.sql`, `0011_ide.sql`, `0012_ide_salin.sql`, `0013_ide_hapus_status.sql`, `0014_ide_hapus_salinan_status.sql`, `0015_idh.sql`, `0016_ide_hapus_faskes.sql`, `0017_idh_hapus_faskes.sql`, `0018_tad.sql`, `0019_tad_salin.sql`, `0020_tad_pisah.sql`, `0021_tad_remunerasi.sql`, lalu `supabase/seed.sql`.
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
PASSWORD_MAGANG=... PASSWORD_PKWT=... PASSWORD_INAGOV=... PASSWORD_TAD=... PASSWORD_SUPERADMIN=... \
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
