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
* **Dashboard** — penunjuk bulan; karyawan aktif, masuk, kontrak habis, dan berkas belum lengkap; grafik masuk dan habis per bulan, pendidikan, dan per kategori; daftar kontrak habis ≤ 60 hari; filter kategori untuk Super Admin.
* **Dashboard Super Admin** — dua tab. **Ringkasan**: kartu karyawan aktif, masuk bulan ini, kontrak berakhir bulan ini, dan turnover 12 bulan (dengan perbandingan dan garis tren kecil); tren karyawan aktif dengan batang masuk dan keluar; Perlu tindak lanjut; Kontrak habis dalam 60 hari (jendela mengikuti kategori); Risiko perpanjangan (habis ≤ 30 hari menurut kelengkapan berkas); Corong perpanjangan; Alasan keluar. **Profil**: karyawan aktif per direktorat dan divisi (treemap dari daftar Kode Bagan), sebaran usia, pendidikan menurut kelompok usia, masa kerja, dan kelengkapan data. Filter kategori berlaku untuk semuanya, klik batang atau kotak membuka daftar orangnya, dan tiap grafik punya tampilan tabel. Dashboard PIC lain tidak berubah. **Dashboard PIC Magang** memakai komponen yang sama tanpa filter kategori dan tab Profil: kartu, tren peserta, Perlu tindak lanjut, Kontrak habis dalam 30 hari, lalu **Sebaran status** (pie, dari kolom Status: Baru, Alih Status, Perpanjangan Maganghub), **Sebaran kategori** (pie, dari kolom Kategori: Magenta, PKL, Maganghub), **Pendidikan terakhir** (bar, dari Data Diri) dan Alasan keluar; Risiko dan Corong perpanjangan tidak ditampilkan. Legenda pie hanya memuat nama dan persentase, nilai kosong masuk "Belum diisi". Logika ada di `src/lib/dashboard-sa.ts`.
* **Data Karyawan** — Super Admin memilih kategori lewat submenu di sidebar (dengan jumlah karyawan aktif per kategori); tiap kategori menampilkan kolomnya sendiri, tambah (otomatis membuat Kontrak 1, data diri, dan monitoring), ubah, hapus, hapus massal, cari, filter masuk/habis per bulan dan tahun, masa kerja dan masa kontrak, export Excel.
* **Mutasi** — riwayat perpindahan unit kerja. Tercatat otomatis setiap kali kode bagan karyawan berubah (Ubah data atau Import Excel); bisa juga dicatat manual di **Karyawan → Mutasi** dengan tanggal efektif dan keterangan (mis. No. SK), yang sekaligus memindahkan unit kerjanya. Tanggal dan keterangan bisa diubah, baris yang salah catat bisa dihapus. Menu **Mutasi** menampilkan semua riwayat (cari, filter kategori dan tanggal, Export Excel). Mengganti kode atau nama unit di menu Kode Bagan tidak dihitung sebagai mutasi.
* **Kontrak** — riwayat per karyawan (tambah, ubah, hapus). Kontrak yang lewat otomatis selesai, kontrak aktif baru menutup yang lama, dan data karyawan ikut disinkronkan.
* **Import Laporan Perpanjangan** (hanya Super Admin, tombol di halaman Riwayat Kontrak) — satu baris Excel = satu kontrak baru untuk satu NP (kolom **NP**, **Awal Kontrak**, **Akhir Kontrak**; **Kontrak Ke**, **Penilaian**, **Folder** opsional; template bisa diunduh). Kontrak ditambahkan ke riwayat tanpa menghapus yang lama; Kontrak Ke yang kosong diberi nomor berikutnya. Kontrak terbaru yang belum berakhir menjadi aktif dan kontrak aktif sebelumnya otomatis selesai. Baris dengan awal kontrak yang sudah ada di riwayat, NP yang tidak ditemukan, dan karyawan terminate dilewati dan dilaporkan, sehingga file yang sama aman diimport ulang. Tombol **Export Excel** di sebelahnya (juga hanya Super Admin) mengunduh riwayat kontrak sesuai filter di layar, satu baris per kontrak, dengan kolom yang sama seperti template sehingga file bisa diedit lalu diimport kembali.
* **Kesalahan import** — setelah Import Excel (Data Karyawan) maupun Import Laporan Perpanjangan, pesan hasil menyebut singkat letak dan jenis kesalahannya, mis. *Baris 2 (T8881): Awal Kontrak format tanggal salah; Baris 3 (T8882): NP tidak terdaftar*.
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
Menu **Kuota** (hanya PIC Magang; Super Admin tidak punya akses) mengatur batas peserta Magang yang aktif bersamaan **per divisi**, tabel `kuota_divisi`. Struktur diambil dari Kode Bagan dalam tiga tingkat: satu angka depan = direktorat (mis. 50000 Keuangan dan SDM), dua angka depan = divisi (mis. 52000 Keuangan Operasional), dan unit kerja (mis. 52A00) ikut divisinya lewat dua karakter depan. Unit yang angka keduanya nol (mis. 50A00) ditaruh di "Langsung di bawah direktorat". Kuota hanya diatur di tingkat divisi dan disimpan per dua karakter depan itu, jadi tidak terikat nama divisi; baris direktorat hanya menampilkan total. Treemap tab Profil dashboard Super Admin memakai aturan yang sama. Halaman berupa daftar memanjang: klik direktorat atau divisi untuk membukanya (dengan jumlah peserta aktif per unit); kuota diubah langsung di baris divisi (tombol − dan + atau ketik). Peserta dihitung lewat Kode Bagan-nya dan memakai satu slot selama seluruh masa kontraknya; jumlah terisi dihitung otomatis per bulan (tidak disimpan) dan bulan bisa digeser. Status: Tersedia, Hampir penuh (80% atau lebih), Penuh, Melebihi, atau Belum diatur. Peserta yang kode bagannya kosong atau tidak punya divisi di daftar tidak terhitung di kuota mana pun dan ditampilkan sebagai peringatan. Kuota tersimpan untuk awalan yang sudah tidak ada di daftar bagan (mis. setelah restrukturisasi) tetap tampil dan bisa dihapus. Saat menambah peserta Magang, bila divisi dari kode bagannya penuh di salah satu bulan masa kontraknya, atau kuotanya belum diatur, muncul peringatan, tetapi data tetap tersimpan. Unit kerja dan divisi dikelola Super Admin di menu Kode Bagan. Tabel lama `kuota_magang` (per unit kerja dan penempatan) tidak dipakai lagi.

### Kode Bagan
Menu **Kode Bagan** (hanya Super Admin) memegang daftar bagan, tabel `bagan`: kode, nama unit, atasan (opsional), dan status aktif. Daftar diisi lewat import Excel (judul kolom **Kode**, **Nama Unit**, **Atasan**; pilihan **Ganti seluruh daftar** menghapus kode lama yang tidak ada di file) atau satu per satu; kode diseragamkan menjadi huruf besar. Daftar ini menjadi satu-satunya acuan: di form karyawan, Kode Bagan dipilih dari daftar yang aktif dan Unit Kerja terisi otomatis (tidak bisa diketik bila kodenya dikenal). Karyawan lama dengan kode yang tidak dikenal tetap bisa disimpan selama kodenya tidak diubah, dan muncul di bagian **Perlu dibereskan** pada halaman Kode Bagan. Mengubah nama unit di daftar menyamakan Unit Kerja semua karyawan yang memakai kode itu; tombol **Samakan sekarang** menyamakan data lama. Import karyawan menolak baris dengan kode yang tidak ada di daftar aktif. Selama daftar masih kosong, semua isian berjalan seperti sebelumnya. Tombol **Ganti kode** di tiap baris mengganti kode sebuah unit yang namanya tetap: kode di daftar, atasan unit bawahan, dan kode semua karyawan berubah bersama dalam satu langkah (fungsi database `ganti_kode_bagan`, migrasi 0012) setelah pratinjau dan konfirmasi; berlaku langsung. Gabung, pecah, tanggal berlaku, dan riwayat perubahan belum tersedia.

Kolom khusus kategori lain didaftarkan di `src/lib/kategori-config.ts`.

### Dashboard "akan selesai"
Dashboard menampilkan daftar karyawan yang kontraknya akan berakhir dalam jendela waktu per kategori: Magang 30 hari, TPBW/TPP, PKWT, BGN, Inagov, IDE, dan IDH 2 bulan serta TAD 1 bulan (bulan kalender), kategori lain 60 hari. Jendela diatur di `JENDELA_KHUSUS` pada `src/lib/kategori-config.ts`.

### Form karyawan
Form Tambah dan Ubah karyawan berada di tengah halaman dengan judul sejajar, isiannya dikelompokkan (Identitas, Data kategori, Kontrak, Penempatan, Kompensasi, Lainnya; bagian yang kosong untuk suatu kategori tidak tampil), dan tombol Simpan menempel di bawah layar saat form digulir.

### Filter
Karyawan, Kontrak, Data Diri, Monitoring, dan Terminate memakai baris filter yang sama (`src/components/FilterBar.tsx`): kategori (Super Admin), cari nama/NP, periode (kontrak masuk, kontrak habis, atau tanggal keluar per bulan dan tahun), filter khusus halaman, tombol **Cari** dan **Reset**. Filter khusus: Karyawan (kolom khusus kategori seperti penempatan, status, level), Data Diri (jenjang, kelengkapan), Monitoring (status, berkas yang belum ada), Terminate (alasan keluar). Pilihan filter tersimpan di alamat halaman, dan Export Excel dan PDF mengikuti filter yang sedang dipakai.

### Kecepatan pindah halaman
Setiap halaman membaca data dari Supabase, jadi kecepatannya dipengaruhi jarak antara server Vercel dan database Supabase. Atur **Function Region** di Vercel (Project Settings, Functions) ke wilayah yang sama atau terdekat dengan wilayah proyek Supabase. Di aplikasi: halaman memakai `loading.tsx` agar kerangka tampil seketika saat pindah menu; `getProfile()` dibungkus `cache` agar layout dan halaman hanya sekali bertanya; pemeriksaan login di middleware dan `getProfile()` memakai `getClaims()` (tanpa bertanya ke Supabase bila proyek memakai kunci asimetris, selain itu kembali ke `getUser()`); jumlah karyawan di sidebar dihitung per kategori di database.

### Ikon tab
Ikon tab browser memakai kembang logo Peruri saja, tanpa latar (`src/app/icon.png` dan `favicon.ico`, transparan). `apple-icon.png` tetap berlatar putih karena iOS tidak menerima ikon transparan. Ikon tab dianimasikan oleh `src/components/IkonTabBergerak.tsx`: 16 bingkai dari `public/kembang-frames.png` (sinar kembang memanjang bergelombang bergantian) dipasang ke `<link rel="icon">` tiap 120 ms. Animasi berhenti saat tab tidak terlihat dan tidak jalan bila pengguna memilih mengurangi gerakan; tanpa itu, ikon statis dipakai.

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
├── migrations/                # 0001 tabel+RLS, 0002 hak akses, 0003 logika kontrak/monitoring, 0004 kolom Magang, 0005 kolom TPBW/TPP, 0006 import Excel (sinkron massal), 0007 kolom BGN, 0008 aktifkan kembali, 0009 kuota Magang, 0010 kuota hanya untuk PIC Magang, 0011 daftar bagan, 0012 ganti kode bagan, 0011 kolom IDE, 0012 salinan data IDE, 0013 hapus status IDE, 0014 hapus salinan status, 0015 tabel IDH, 0016 hapus faskes IDE, 0017 hapus faskes IDH, 0018 kolom TAD, 0019 salinan data TAD, 0020 pisah DELTA dan BDP, 0021 remunerasi TAD, 0022 hak service_role untuk menu Akun, 0023 riwayat mutasi unit kerja, 0024 kuota per divisi
└── seed.sql                   # daftar kategori
scripts/create-users.mjs       # membuat akun awal
legacy-laravel/                # kode Laravel lama (acuan)
```

## 5. Menjalankan Secara Lokal

Prasyarat: Node.js 20+ dan project Supabase.

### a. Siapkan Supabase

1. Buat project di [supabase.com](https://supabase.com).
2. Buka **SQL Editor**, jalankan berurutan: `supabase/migrations/0001_init.sql`, `0002_grants.sql`, `0003_parity_laravel.sql`, `0004_magang.sql`, `0005_tpbw.sql`, `0006_impor_foto.sql`, `0007_bgn.sql`, `0008_aktifkan_kembali.sql`, `0009_kuota.sql`, `0010_kuota_hanya_pic.sql`, `0011_ide.sql`, `0012_ide_salin.sql`, `0013_ide_hapus_status.sql`, `0014_ide_hapus_salinan_status.sql`, `0015_idh.sql`, `0016_ide_hapus_faskes.sql`, `0017_idh_hapus_faskes.sql`, `0018_tad.sql`, `0019_tad_salin.sql`, `0020_tad_pisah.sql`, `0021_tad_remunerasi.sql`, `0022_akun_service_role.sql`, `0023_mutasi.sql`, `0024_kuota_divisi.sql`, lalu `supabase/seed.sql`.
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

Menu **Akun** (hanya Super Admin) membuat dan mengelola akun dari aplikasi, dan butuh `SUPABASE_SERVICE_ROLE_KEY` di Vercel (Settings → Environment Variables, pilih Production dan Preview, tanpa awalan `NEXT_PUBLIC_`). Kunci itu melewati RLS: hanya dibaca server action yang lebih dulu memastikan penggunanya Super Admin, dan tidak pernah dikirim ke browser. Tanpa kunci ini menu Akun menampilkan petunjuk dan fitur lain tetap berjalan.

Password tidak diganti dari menu Akun. Setiap pengguna (PIC kategori maupun Super Admin) menggantinya sendiri lewat tautan **Ganti password** di halaman masuk (`/login/ganti-password`): isi email, password lama, dan password baru (minimal 8 karakter, diulang dua kali). Password lama diverifikasi lebih dulu, lalu semua sesi akun itu diakhiri sehingga pengguna masuk ulang dengan password baru. Fitur ini tidak butuh `SUPABASE_SERVICE_ROLE_KEY`.

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
