# SDMS — Sistem Dashboard Rekrutmen (Next.js + Supabase)

SDMS (Sistem Dashboard Rekrutmen) adalah website untuk mengelola data karyawan dan administrasi kontrak secara terpusat, dengan pembatasan akses per kategori pengguna.

> **Status:** prototype. Versi sebelumnya dibangun dengan Laravel + MySQL. Versi ini dibangun ulang dengan Next.js + Supabase, dengan fitur dan aturan akses yang sama sebagai acuan.
>
> Bagian bertanda **[KONFIRMASI]** adalah asumsi yang perlu dicek sebelum dianggap final.

---

## 1. Tech Stack

| Komponen          | Teknologi                                      |
| ----------------- | ---------------------------------------------- |
| Framework         | Next.js (App Router) + TypeScript              |
| Database          | PostgreSQL (Supabase)                          |
| Autentikasi       | Supabase Auth                                  |
| Hak akses data    | Row Level Security (RLS) Supabase              |
| Styling           | Tailwind CSS                                   |
| Hosting           | Vercel                                         |
| Version Control   | Git & GitHub                                   |
| Alat pengembangan | Claude Code                                    |

Perbandingan dengan versi sebelumnya:

| Aspek          | Versi lama (Laravel)       | Versi baru                  |
| -------------- | -------------------------- | --------------------------- |
| Bahasa         | PHP 8.3                    | TypeScript                  |
| Database       | MySQL (`db_sdms`)          | PostgreSQL (Supabase)       |
| Tampilan       | Blade + Bootstrap (SB Admin 2) | React + Tailwind        |
| Login          | Session Laravel            | Supabase Auth               |
| Batas akses    | Middleware + `kategori_id` | RLS + `kategori_id`         |
| Struktur DB    | Laravel Migration          | Supabase Migration (SQL)    |
| Data awal      | `DatabaseSeeder.php`       | `supabase/seed.sql` + skrip |

---

## 2. Fitur Utama

### Login & Hak Akses

Pengguna login dengan akun sesuai kategorinya. Setelah login, admin hanya melihat dan mengelola data kategorinya. **Super Admin** dapat mengakses seluruh kategori.

Kategori yang tersedia:

* IDE
* IDH
* BGN
* TPBW/TPP
* Magang
* PKWT
* Inagov

### Dashboard

Ringkasan informasi karyawan dan kontrak sesuai hak akses pengguna.

### Data Karyawan

Create, Read, Update, Delete data karyawan. Data yang tampil menyesuaikan kategori pengguna.

### Kontrak

Melihat dan mengelola data kontrak karyawan, termasuk informasi masa kontrak.

### Monitoring

Memantau kelengkapan data atau proses yang harus diselesaikan sebelum karyawan terminasi/resign.

### Terminate

Melihat data karyawan yang sudah terminasi.

### Data Diri

Melihat detail data diri tiap karyawan.

### Import & Export Data

Import dan export data (Excel) seperti pada versi sebelumnya. **[KONFIRMASI]** format file dan kolom yang dipakai.

---

## 3. Alur Sistem

```text
Login (Supabase Auth)
  ↓
Ambil profil pengguna (role + kategori_id)
  ↓
Dashboard
  ↓
┌─────────────────────────────────────┐
│ Data Karyawan                       │
│ Kontrak                             │
│ Monitoring                          │
│ Terminate                           │
│ Data Diri                           │
└─────────────────────────────────────┘
```

Admin kategori: login → kategori pengguna → data sesuai kategori.
Super Admin: login → seluruh kategori → seluruh data.

Pembatasan data dilakukan di **dua lapis**: tampilan (menu yang muncul) dan database (RLS). Lapis database yang menjadi penjaga utama, sehingga data tetap aman meski seseorang memanggil API secara langsung.

---

## 4. Role dan Hak Akses

| Role           | Akses Data              |
| -------------- | ----------------------- |
| Admin IDE      | Data kategori IDE       |
| Admin IDH      | Data kategori IDH       |
| Admin BGN      | Data kategori BGN       |
| Admin TPBW/TPP | Data kategori TPBW/TPP  |
| PIC Magang     | Data kategori Magang    |
| PIC PKWT       | Data kategori PKWT      |
| Admin Inagov   | Data kategori Inagov    |
| Super Admin    | Seluruh kategori        |

Kategori pengguna disimpan di `kategori_id` pada tabel `profiles`. Pengguna dengan role `superadmin` tidak terikat kategori.

### Matriks hak akses (diisi seiring development)

| Menu / Aksi     | Admin kategori      | Super Admin |
| --------------- | ------------------- | ----------- |
| Dashboard       | Lihat (kategorinya) | Lihat semua |
| Data Karyawan   | CRUD (kategorinya)  | CRUD semua  |
| Kontrak         | **[KONFIRMASI]**    | CRUD semua  |
| Monitoring      | **[KONFIRMASI]**    | CRUD semua  |
| Terminate       | Lihat (kategorinya) | Lihat semua |
| Data Diri       | **[KONFIRMASI]**    | CRUD semua  |

---

## 5. Database

* DBMS: PostgreSQL di Supabase
* Struktur database dikelola lewat **file migrasi SQL** di `supabase/migrations/`, bukan lewat dashboard.

### Tabel utama (draft)

Nama tabel mengikuti model versi lama. **Kolom lengkap diambil dari migration Laravel lama**, lalu disesuaikan.

| Tabel        | Isi                                                        |
| ------------ | ---------------------------------------------------------- |
| `kategori`   | Daftar kategori (IDE, IDH, BGN, TPBW/TPP, Magang, PKWT, Inagov)             |
| `profiles`   | Profil pengguna: terhubung ke `auth.users`, `role`, `kategori_id` |
| `karyawan`   | Data karyawan, terhubung ke `kategori`                     |
| `kontrak`    | Kontrak karyawan, terhubung ke `karyawan`                  |
| `monitoring` | Status kelengkapan/proses, terhubung ke `karyawan`         |
| `data_diri`  | Data diri detail, terhubung ke `karyawan`                  |

Diagram relasi (ERD) disimpan di `docs/erd.md`.

### Contoh kebijakan RLS

Pola dasar: Super Admin melihat semua, admin kategori hanya melihat baris dengan `kategori_id` yang sama.

```sql
alter table karyawan enable row level security;

create policy "karyawan_per_kategori"
on karyawan
for all
to authenticated
using (
  exists (
    select 1 from profiles p
    where p.id = auth.uid()
      and (p.role = 'superadmin' or p.kategori_id = karyawan.kategori_id)
  )
)
with check (
  exists (
    select 1 from profiles p
    where p.id = auth.uid()
      and (p.role = 'superadmin' or p.kategori_id = karyawan.kategori_id)
  )
);
```

Pola yang sama diterapkan ke tabel lain. Tabel yang tidak memiliki `kategori_id` sendiri (misalnya `kontrak`) mengikuti kategori karyawannya lewat relasi.

### Data awal

* `supabase/seed.sql` membuat data kategori dan data contoh (dummy).
* Akun pengguna dibuat lewat Supabase Auth (skrip di `scripts/` atau dashboard), lalu profilnya diisi `role` dan `kategori_id`.

> Selama prototype, **gunakan data dummy saja**. Jangan memasukkan data karyawan asli.
>
> Kredensial login diberikan secara terpisah dan tidak dicantumkan di README.

---

## 6. Struktur Project

```text
sdms/
│
├── src/
│   ├── app/
│   │   ├── (auth)/              ← login (fondasi, satu pemegang)
│   │   ├── dashboard/
│   │   ├── pic-magang/          ← area kerja PIC Magang
│   │   └── pic-pkwt/            ← area kerja PIC PKWT
│   ├── components/
│   │   ├── shared/              ← komponen bersama (kabari sebelum mengubah)
│   │   ├── pic-magang/
│   │   └── pic-pkwt/
│   ├── lib/
│   │   └── supabase/            ← klien Supabase (browser & server)
│   └── middleware.ts            ← proteksi halaman berdasarkan login
│
├── supabase/
│   ├── migrations/              ← seluruh perubahan skema, berurutan
│   └── seed.sql                 ← data dummy
│
├── scripts/                     ← skrip bantu (mis. membuat akun awal)
├── docs/                        ← ERD, matriks akses, alur kontrak
│
├── .env.example
├── .gitignore
├── CLAUDE.md                    ← aturan proyek untuk Claude Code
├── package.json
└── README.md
```

---

## 7. Persiapan Environment

Pastikan sudah tersedia:

* Node.js (versi LTS)
* npm
* Git
* Akun Supabase (atau Docker, jika memakai Supabase lokal)

Clone repository:

```bash
git clone [URL_REPOSITORY]
cd sdms
```

Install dependency:

```bash
npm install
```

---

## 8. Konfigurasi `.env`

Copy `.env.example` menjadi `.env.local`, lalu isi nilainya.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

* `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` aman dipakai di sisi browser, karena akses datanya dibatasi RLS.
* `SUPABASE_SERVICE_ROLE_KEY` melewati RLS. **Hanya boleh dipakai di sisi server** dan tidak boleh diawali `NEXT_PUBLIC_`.

**File `.env.local` tidak boleh di-commit ke GitHub.** Gunakan `.env.example` (berisi nama variabel tanpa nilai) sebagai template.

---

## 9. Database Setup

Hubungkan project ke Supabase, lalu terapkan migrasi:

```bash
npx supabase login
npx supabase link --project-ref [PROJECT_REF]
npx supabase db push
```

Lalu muat data dummy dari `supabase/seed.sql` (lewat SQL Editor Supabase atau perintah seed), dan buat akun awal sesuai panduan di `scripts/`.

> Gunakan project Supabase **dev** untuk pengembangan. Jangan menjalankan perintah yang menghapus atau me-reset database di project **prod** tanpa backup.

---

## 10. Menjalankan Project

```bash
npm run dev
```

Buka `http://localhost:3000`.

---

## 11. Kolaborasi Dua Orang (Git & GitHub)

Pembagian area kerja:

| Orang     | Area                                   | Branch                |
| --------- | -------------------------------------- | --------------------- |
| Developer A | `pic-magang` (folder & komponen)     | `fitur/magang-...`    |
| Developer B | `pic-pkwt` (folder & komponen)       | `fitur/pkwt-...`      |

### Alur harian

```bash
git checkout main
git pull origin main
git checkout -b fitur/pkwt-nama-fitur
# kerjakan dengan Claude Code, commit kecil dan sering
git add .
git commit -m "deskripsi perubahan"
git push origin fitur/pkwt-nama-fitur
```

Lalu buka **Pull Request** ke `main`. Vercel otomatis membuat preview URL untuk tiap PR. Satu orang me-review, lalu merge.

### Aturan bersama

1. **Branch `main` diproteksi.** Tidak ada push langsung ke `main`.
2. Setiap orang hanya mengubah folder areanya sendiri.
3. **File bersama** (`package.json`, layout utama, `components/shared/`, `middleware.ts`) hanya diubah lewat PR kecil dan dikabari ke rekan.
4. **Perubahan skema database** selalu lewat file migrasi di `supabase/migrations/`, bukan lewat dashboard Supabase.
   * Satu orang menjadi pemegang skema dan menggabungkan migrasi.
   * Sebelum membuat migrasi baru, `git pull` dulu agar urutan tidak bentrok.
   * Buat migrasi baru dengan `npx supabase migration new nama_perubahan`.
5. **Jangan menghapus atau mengubah migrasi yang sudah ter-merge.** Perbaikan dilakukan dengan migrasi baru.
6. Jangan commit `.env.local` atau key apa pun.
7. Setelah fitur selesai, uji di preview URL sebelum merge.

### Aturan untuk Claude Code

Aturan proyek (struktur folder, penamaan tabel, gaya kode, larangan mengubah area rekan) ditulis di `CLAUDE.md` agar kedua Claude Code mengikuti konvensi yang sama.

---

## 12. Panduan Singkat Pengembangan

| Kebutuhan               | Lokasi                         |
| ----------------------- | ------------------------------ |
| Halaman & route         | `src/app/`                     |
| Komponen tampilan       | `src/components/`              |
| Koneksi & query Supabase | `src/lib/supabase/`           |
| Proteksi login/halaman  | `src/middleware.ts`            |
| Struktur database & RLS | `supabase/migrations/`         |
| Data awal (dummy)       | `supabase/seed.sql`            |
| Dokumentasi             | `docs/`                        |

---

## 13. Catatan Handover ke Tim IT

Project ini prototype. Hal yang perlu diketahui tim IT:

1. **Database tidak ikut di GitHub.** Struktur tabel dan aturan akses dibangun ulang lewat `supabase/migrations/`.
2. Database berbasis **PostgreSQL**. Datanya dapat dipindah ke server PostgreSQL mandiri. Supabase juga dapat di-host sendiri.
3. Fitur login dan RLS memakai Supabase. Jika IT memakai stack lain, aturan akses perlu diimplementasikan ulang sesuai **matriks hak akses** (bagian 4) dan kebijakan RLS (bagian 5).
4. Dokumen di `docs/` (ERD, matriks akses, alur status kontrak) menjadi spesifikasi untuk membangun ulang di stack lain bila diperlukan.
5. Semua key dan kredensial dikelola lewat environment variables, tidak ada di repository.
6. Data di prototype hanya data dummy. Data asli dimasukkan setelah sistem terpasang di lingkungan yang disetujui IT.
7. Cek ketentuan terbaru Vercel (terutama paket Hobby dan deployment dari beberapa akun GitHub) sebelum memakainya untuk kolaborasi.

---

## 14. Ringkasan Alur Pengguna

```text
                    LOGIN
                      │
             ┌────────┴────────┐
             │                 │
       ADMIN KATEGORI      SUPER ADMIN
             │                 │
             ↓                 ↓
      Data sesuai         Seluruh kategori
        kategori                 │
             │                   │
             └─────────┬─────────┘
                       ↓
                    DASHBOARD
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
 Data Karyawan      Kontrak       Monitoring
        │              │              │
        └──────────────┼──────────────┘
                       ↓
                  Data Diri
                       │
                       ↓
                   Terminate
```

SDMS menjadi pusat pengelolaan data karyawan dan administrasi kontrak, dengan pembatasan akses berdasarkan kategori pengguna dan akses penuh untuk Super Admin.
