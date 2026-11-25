# Laporan perubahan per file

Acuan perbandingan adalah unggahan `Poli-Dokter-main.zip`. Perbandingan dilakukan pada isi file. Nama model, rute lama, direktori halaman per peran, dan berkas kunci Composer/npm berasal dari aplikasi kelompok. PDF evaluasi menjelaskan keputusan desain, relasi setiap use case ke modul, beserta hasil dan batas pengujian.

## Lingkungan dan panduan

PHP 8.4 pada host Windows, Compose MariaDB terpisah, panduan dan peluncur lokal. Empat berkas Docker untuk arsitektur aplikasi lama dilepas hanya dari salinan revisi.

| File | Perubahan |
| --- | --- |
| `.docker/apache/000-default.conf` | Dilepas dari salinan |
| `.docker/php/opcache.ini` | Dilepas dari salinan |
| `.env.docker.example` | Dilepas dari salinan |
| `Dockerfile` | Dilepas dari salinan |
| `Mulai-Lokal.ps1` | Baru |
| `README.md` | Baru |
| `compose.yaml` | Direvisi |
| `src/.env.example` | Direvisi |
| `src/AGENTS.md` | Direvisi |
| `src/CLAUDE.md` | Direvisi |
| `src/README.md` | Direvisi |
| `src/config/app.php` | Direvisi |
| `src/vite.config.js` | Direvisi |

## Migrasi dan data simulasi

Penambahan nomor KK, versi resep, indeks, tabel aktivitas resep dan penerimaan stok. Seeder kunjungan memungkinkan demo alur pada tanggal berjalan.

| File | Perubahan |
| --- | --- |
| `src/database/migrations/2026_11_23_000001_lengkapi_alur_rawat_jalan.php` | Baru |
| `src/database/seeders/DatabaseSeeder.php` | Direvisi |
| `src/database/seeders/DemoKunjunganSeeder.php` | Baru |

## Rute, sesi dan pengukuran

Otorisasi per peran, flash hasil reservasi, diagnostik waktu permintaan lokal, dan endpoint penerimaan stok.

| File | Perubahan |
| --- | --- |
| `src/app/Http/Middleware/HandleInertiaRequests.php` | Direvisi |
| `src/app/Http/Middleware/PasienSession.php` | Direvisi |
| `src/app/Http/Middleware/RoleSession.php` | Direvisi |
| `src/app/Http/Middleware/UkurRequestLokal.php` | Baru |
| `src/bootstrap/app.php` | Direvisi |
| `src/routes/console.php` | Direvisi |
| `src/routes/web.php` | Direvisi |

## Pengendali dan data

Pendaftaran, pembatasan akses, jadwal, koreksi observasi, RME, diagnosis, koreksi resep dan transaksi persediaan. Perubahan per alur dijelaskan pada halaman 3 dan 5 PDF.

| File | Perubahan |
| --- | --- |
| `src/app/Http/Controllers/DiagnosisController.php` | Direvisi |
| `src/app/Http/Controllers/EResepController.php` | Direvisi |
| `src/app/Http/Controllers/LoginController.php` | Direvisi |
| `src/app/Http/Controllers/ObservasiController.php` | Direvisi |
| `src/app/Http/Controllers/PemutakhiranDataController.php` | Direvisi |
| `src/app/Http/Controllers/PengirimanObatController.php` | Direvisi |
| `src/app/Http/Controllers/PenjadwalanController.php` | Direvisi |
| `src/app/Http/Controllers/PortalPasienController.php` | Direvisi |
| `src/app/Http/Controllers/RMEController.php` | Direvisi |
| `src/app/Http/Controllers/RegistrasiController.php` | Direvisi |
| `src/app/Models/DataDiagnosis.php` | Direvisi |
| `src/app/Models/DataJadwalDokter.php` | Direvisi |
| `src/app/Models/DataObservasi.php` | Direvisi |
| `src/app/Models/DataPasien.php` | Direvisi |
| `src/app/Models/DataRekamMedis.php` | Direvisi |
| `src/app/Models/DataReservasi.php` | Direvisi |
| `src/app/Models/EResep.php` | Direvisi |
| `src/app/Models/User.php` | Direvisi |

## Antarmuka dan aset

Komponen bersama, identitas fasilitas, keterbacaan, form dan dialog, navigasi kerja dokter/perawat/farmasi, serta halaman pasien dan bahasa validasi.

| File | Perubahan |
| --- | --- |
| `src/lang/id/validation.php` | Baru |
| `src/public/favicon.ico` | Direvisi |
| `src/resources/css/app.css` | Direvisi |
| `src/resources/fonts/OFL.txt` | Baru |
| `src/resources/fonts/inter-latin.woff2` | Baru |
| `src/resources/images/logo-rawat-jalan.png` | Baru |
| `src/resources/js/Components/ui/Brand.jsx` | Baru |
| `src/resources/js/Components/ui/Button.jsx` | Direvisi |
| `src/resources/js/Components/ui/Modal.jsx` | Direvisi |
| `src/resources/js/Components/ui/PenerimaanStok.jsx` | Baru |
| `src/resources/js/Components/ui/StatCard.jsx` | Direvisi |
| `src/resources/js/Components/ui/Toast.jsx` | Direvisi |
| `src/resources/js/Layouts/AppLayout.jsx` | Direvisi |
| `src/resources/js/Pages/Apoteker/NotifikasiEResep.jsx` | Direvisi |
| `src/resources/js/Pages/Apoteker/PengirimanObat.jsx` | Direvisi |
| `src/resources/js/Pages/Apoteker/RincianEResep.jsx` | Direvisi |
| `src/resources/js/Pages/Auth/Login.jsx` | Direvisi |
| `src/resources/js/Pages/Auth/Registrasi.jsx` | Direvisi |
| `src/resources/js/Pages/Dokter/AntreanPeriksa.jsx` | Direvisi |
| `src/resources/js/Pages/Dokter/FormDiagnosis.jsx` | Direvisi |
| `src/resources/js/Pages/Dokter/FormEResep.jsx` | Direvisi |
| `src/resources/js/Pages/Dokter/JadwalSaya.jsx` | Direvisi |
| `src/resources/js/Pages/Dokter/RiwayatMedis.jsx` | Direvisi |
| `src/resources/js/Pages/Pasien/Beranda.jsx` | Direvisi |
| `src/resources/js/Pages/Pasien/PenjadwalanPoli.jsx` | Direvisi |
| `src/resources/js/Pages/Pasien/Profil.jsx` | Direvisi |
| `src/resources/js/Pages/Pasien/RiwayatReservasi.jsx` | Direvisi |
| `src/resources/js/Pages/Perawat/AntreanTriage.jsx` | Direvisi |
| `src/resources/js/Pages/Perawat/FormObservasi.jsx` | Direvisi |
| `src/resources/views/app.blade.php` | Direvisi |

## Pengujian

Skenario lintas peran, pengujian regresi, serta simulasi SQLite yang dapat diulang.

| File | Perubahan |
| --- | --- |
| `src/phpunit.xml` | Direvisi |
| `src/tests/Feature/AlurRawatJalanTest.php` | Baru |
| `src/tests/Feature/ExampleTest.php` | Direvisi |
| `verifikasi/banding_kueri.py` | Baru |

Dokumen keluaran yang menyertai paket adalah `PERUBAHAN.md` dan `Evaluasi-Rawat-Jalan.pdf`.
