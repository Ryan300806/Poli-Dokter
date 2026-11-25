# Sistem Rawat Jalan · Kelompok 3

Versi revisi dari Poli-Dokter untuk presentasi dan uji penerimaan dengan data simulasi. Aplikasi memakai Laravel, Inertia, React, dan Vite dari proyek kelompok. PHP 8.4 berjalan di Windows. Docker Compose menjalankan MariaDB 11.4. Laporan evaluasi di direktori ini menghubungkan perubahan dengan Modul 1–3 dan Figma.

## Menjalankan di Windows

1. Ekstrak seluruh ZIP, misalnya ke `C:\Projects\Poli-Dokter-Revisi`. Buka folder yang berisi `Mulai-Lokal.ps1` dan `compose.yaml` di PowerShell. Jalur di luar folder sinkronisasi memudahkan perbandingan performa.
2. Nyalakan Docker Desktop. Siapkan PHP CLI 8.4, Composer 2, Node yang didukung Vite (20.19+ pada seri 20, atau 22.12+), dan npm. Di PowerShell, periksa lokasi dengan `where.exe php`, versinya dengan `php -v`, dan berkas konfigurasi dengan `php --ini`. Laravel membutuhkan antara lain `pdo_mysql`, `mbstring`, `openssl`, `fileinfo` dan ekstensi XML. Untuk tes lokal, aktifkan juga `pdo_sqlite`. Composer memeriksa persyaratan selebihnya saat pemasangan.
3. Jalankan penyiapan pertama. Unduhan pertama memerlukan internet untuk image MariaDB, paket Composer, dan npm.

```powershell
.\Mulai-Lokal.ps1 -Siapkan
```

Jika ada beberapa PHP di laptop, tunjuk file 8.4 yang dipakai. Sesuaikan lokasi contoh berikut.

```powershell
.\Mulai-Lokal.ps1 -Siapkan -Php "C:\php84\php.exe"
```

Jika kebijakan PowerShell memblokir skrip yang sudah kamu periksa, buka satu proses khusus untuk perintah ini.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\Mulai-Lokal.ps1 -Siapkan
```

4. Buka [portal lokal](http://127.0.0.1:8010/login) setelah terminal menampilkan alamat server. Skrip membangun aset dan memakai hasil build. Pada pemakaian berikutnya, jalankan `.\Mulai-Lokal.ps1`. Di hari demo yang berbeda, perbarui data simulasi seperti di bawah.
5. Hentikan PHP dengan `Ctrl+C`. Untuk menghentikan database, jalankan `docker compose stop db` dari folder versi revisi. Volume data tetap dapat dipakai pada sesi selanjutnya.

### Apa yang dilakukan skrip

Skrip memilih interpreter PHP 8.4, menyalin `src/.env.example` bila diperlukan, menyalakan layanan `db` dan menunggu MariaDB sehat. Saat `-Siapkan` diberikan, skrip memasang dependensi terkunci, membersihkan cache konfigurasi Laravel, membuat kunci aplikasi bila kosong, lalu memeriksa nama database yang benar-benar terhubung sebelum migrasi. Skrip memasang data simulasi serta satu kunjungan hari ini, menjalankan `npm.cmd ci`, membangun aset dengan Vite, lalu menjalankan `php artisan serve` di host.

| Komponen | Pengaturan revisi |
| --- | --- |
| Portal | `http://127.0.0.1:8010` |
| MariaDB dari PHP host atau DBeaver | `127.0.0.1`, port `3318` |
| Database | `rsi_rawat_jalan_revisi` |
| Pengguna dan sandi DB demo | Lihat `src/.env.example` |
| Jam layanan | `Asia/Jakarta` |
| Nama proyek Compose | `poli-dokter-revisi` |

`DB_HOST=db` hanya dapat diakses oleh layanan yang berada pada jaringan Compose yang sama. PHP Windows memerlukan `DB_HOST=127.0.0.1` dan `DB_PORT=3318`. Jika konfigurasi lama masih muncul, simpan `src/.env`, lalu jalankan `php artisan config:clear` dan `php artisan revisi:periksa-db` dari `src`. Jika port sudah dipakai, identifikasi layanan pemiliknya sebelum mengganti port. Port baru perlu disamakan pada `compose.yaml` dan `src/.env`.

## Akun dan alur demo

Keempat akun simulasi berikut memakai kata sandi `password123`. Akun hanya untuk pengujian lokal.

| Peran | Isi kolom NIK atau nama pengguna | Pekerjaan yang dicoba |
| --- | --- | --- |
| Pasien | `3573010101900001` | Buka tiket hari ini. Buat reservasi untuk hari lain, ubah ke slot dokter yang sama, atau batalkan. |
| Perawat | `perawat1` | Temukan antrean hari ini. Simpan observasi, buka kembali, lalu koreksi satu nilai. |
| Dokter | `dokter_umum` | Panggil pasien yang telah ditriase. Buka RME, simpan diagnosis simulasi, lalu susun e-resep. |
| Apoteker | `apoteker1` | Buka resep yang sama. Telaah stok, siapkan obat, centang obat yang sudah disiapkan, lalu verifikasi dan serahkan. |

Gunakan jendela profil browser berbeda untuk pasien, perawat, dokter, dan apoteker jika ingin menampilkan keempat peran bersamaan. Tab dalam satu profil berbagi sesi. Nomor RM, tanggal, dan nomor antrean membantu mengidentifikasi kunjungan yang sama saat berpindah peran.

Untuk uji jalur penolakan, kembalikan resep disertai alasan sebelum diserahkan. Masuk sebagai dokter penulis, koreksi resep dari antreannya, lalu kirim ulang. Untuk uji stok, cocokkan jumlah pada rincian sebelum dan sesudah penyerahan. Jika stok kurang, catat penerimaan fisik memakai nomor bukti simulasi yang unik untuk obat itu atau kembalikan ke dokter. Resep selesai mengurangi stok satu kali. Nomor bukti dapat dipakai untuk item obat lain dalam dokumen penerimaan yang sama.

Pada hari demo lain, jalankan ini dari `src` dengan interpreter yang sama sebelum membuka portal.

```powershell
php artisan revisi:periksa-db
php artisan db:seed
php artisan db:seed --class=DemoKunjunganSeeder
```

Penyiapan membuat maksimal satu reservasi contoh untuk pasien, slot demo, dan tanggal yang sama. Kunjungan yang sudah selesai tetap menyimpan hasilnya. Untuk mengulang dari awal pada hari yang sama, gunakan pasien simulasi lain dan slot hari ini yang masih tersedia. Untuk memperlihatkan reservasi pada malam hari, pilih hari berikutnya. Antrean staf menampilkan kunjungan tanggal berjalan.

## Mengedit UI dan mengukur perpindahan halaman

- Untuk demo, gunakan hasil `npm.cmd run build`. Setelah mengubah JSX/CSS, jalankan lagi perintah itu dari `src` dan muat ulang browser.
- Untuk mengedit dengan pembaruan langsung, biarkan server PHP berjalan dan jalankan `npm.cmd run dev` di terminal kedua dari `src`. Akses portal tetap melalui port `8010`. Hentikan Vite sebelum membandingkan dengan build. Jika proses sudah berhenti tetapi `src/public/hot` masih ada, hapus penanda tersebut. Pastikan `src/public/build/manifest.json` tersedia.
- Untuk tes regresi, dari `src` jalankan `php artisan config:clear` lalu `php artisan test`. PHPUnit memakai SQLite dalam memori. Uji penguncian dan konkurensi juga perlu dilakukan di MariaDB menggunakan dua sesi dengan data simulasi.

### Menemukan sumber tombol lambat

1. Pilih tiga perjalanan yang sama di kedua versi, misalnya daftar antrean ke RME, daftar e-resep ke rincian, dan riwayat pasien ke dialog ubah jadwal. Gunakan jumlah kunjungan atau resep yang sama.
2. Buka DevTools → Network, aktifkan Preserve log. Klik tombol sekali. Jika hanya modal konfirmasi yang dibuka, lihat apakah ada permintaan ke server. Saat membuka pilihan jadwal pengganti, satu permintaan data memang diperlukan.
3. Untuk navigasi Inertia, periksa baris Fetch/XHR, TTFB (*Waiting for server response*), ukuran transfer, dan waktu respons. Operasi simpan biasanya diikuti pengalihan ke halaman hasil. Bedakan respons POST/PUT dengan GET setelahnya dan polling berkala.
4. Pada revisi lokal, buka header `Server-Timing`. `web` mencakup SQL selama middleware Laravel memproses permintaan. `sql` adalah total waktu kueri beserta jumlah kuerinya. Hindari menjumlahkan kedua durasi ini. TTFB juga mencakup pekerjaan lain, seperti bootstrap PHP. Jika server cepat tetapi tampilan masih tersendat, rekam panel Performance untuk melihat pemuatan JavaScript dan penggambaran ulang.
5. Ukur satu pembukaan pertama dan 20 perpindahan berulang per perjalanan, lalu ulangi dengan dev/build. Catat median dan persentil ke-95, versi PHP, jumlah baris, lokasi proyek, dan mode aset. Pakai data simulasi ketika menyimpan tangkapan layar atau hasil pengukuran.

## Bukti yang menyertai versi ini

Inventaris file dan kelompok perubahan tersedia di `PERUBAHAN.md`. Simulasi kueri halaman dokter dan farmasi dapat diulang dari folder proyek dengan `py -3 verifikasi/banding_kueri.py` bila Python 3 terpasang. Python hanya dipakai untuk simulasi ini.

Lihat `Evaluasi-Rawat-Jalan.pdf` untuk temuan berprioritas, matriks UC dan UI, perbandingan jumlah kueri, serta batas hasil uji. Uji fitur yang dapat dijalankan di laptop berada di `src/tests/Feature/AlurRawatJalanTest.php`. Penggunaan dengan data pasien sebenarnya memerlukan penerimaan oleh pemilik layanan, pengujian akses dan pemulihan data pada lingkungan sasaran.
