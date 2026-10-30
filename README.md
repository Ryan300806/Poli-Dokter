# Outpatient Care — MVP Scaffold

Fondasi repository untuk proyek Sistem Informasi Pasien Terintegrasi (Rawat Jalan/Poli).

## Stack
- Laravel + PHP 8.3
- Blade (frontend awal; Bootstrap dapat ditambahkan)
- MariaDB
- Docker Compose
- phpMyAdmin untuk development lokal

> Ini scaffold, bukan aplikasi Laravel lengkap. Folder `src/` dibuat pada langkah instalasi. Nama tabel dan relasi wajib mengikuti ERD final kelompok.

## Struktur

```text
outpatient-care/
├── .docker/apache/000-default.conf
├── docs/MVP-SCOPE.md
├── src/                         # Laravel dibuat di sini
│   ├── app/Http/Controllers/
│   ├── app/Http/Middleware/
│   ├── app/Http/Requests/
│   ├── app/Models/
│   ├── app/Policies/
│   ├── database/migrations/
│   ├── database/seeders/
│   ├── resources/views/
│   │   ├── layouts/
│   │   ├── auth/
│   │   ├── pasien/
│   │   ├── dokter/
│   │   ├── perawat/
│   │   ├── apoteker/
│   │   └── admin/
│   ├── resources/css/
│   ├── resources/js/
│   ├── routes/web.php
│   └── tests/
├── .env.docker.example
├── .gitignore
├── compose.yaml
├── Dockerfile
└── README.md
```

## Setup awal
1. Ekstrak scaffold ke root repository GitHub kalian.
2. Buat Laravel di folder `src` (perlu Composer di komputer):

   ```bash
   composer create-project laravel/laravel src
   ```

3. Salin konfigurasi contoh:
   - Windows CMD: `copy .env.docker.example src\.env`
   - Git Bash/PowerShell: `cp .env.docker.example src/.env`

   Jika `src/.env` sudah ada, jangan ditimpa; sesuaikan variabel database saja.

4. Build dan jalankan container:

   ```bash
   docker compose up -d --build
   docker compose exec app php artisan key:generate
   docker compose exec app php artisan migrate
   ```

5. Buka:
   - Aplikasi: http://localhost:8080
   - phpMyAdmin: http://localhost:8081

## Penting
- Di dalam Docker, `DB_HOST=db`, bukan `localhost`.
- MariaDB menyimpan data pada named volume `mariadb_data`.
- Jangan commit `src/.env`, password asli, data pasien asli, atau dump database sensitif.
- Password di `compose.yaml` hanya untuk development lokal. Ganti sebelum deployment.
- Autentikasi, role, dan permission belum dikonfigurasi otomatis oleh scaffold.
