# Panduan Front End Kelompok 3 (Outpatient Care, Rawat Jalan)

Panduan lanjutan untuk seluruh anggota kelompok (MF, KH, MH, RG). Titik awalnya adalah kondisi setelah panduan setup BE dijalankan: Laravel sudah hidup di Docker dan bisa dibuka di `http://localhost:8080`. Dari situ, panduan ini membawa sampai satu halaman selesai ditulis, di-review, dan dicatat di Modul 3 bagian 4.3.

Panduan ini tidak bergantung pada satu orang. Setup FE bisa dipasang oleh anggota mana pun yang lebih dulu siap (bagian 2), dan sambil menunggu setup masuk ke GitHub, semua anggota sudah bisa mulai mengerjakan UI (bagian 1.3).

Stack: Laravel 13 (BE), Inertia.js v3, React 19, Vite 8, Tailwind CSS 4. Semua kode FE ada di `src/resources/js`.

---

## 0. Aturan emas (baca dulu)

1. Satu UI dikerjakan satu orang, di satu berkas. Daftar pembagian ada di bagian 4.
2. Semua halaman memakai `AppLayout`. Jangan membuat header atau sidebar sendiri.
3. Semua tombol, input, tabel, kartu, pop-up, dan notifikasi memakai komponen di `Components/ui`. Jangan membuat versi sendiri.
4. Warna ditulis dengan nama token (`bg-brand`, `text-ink-soft`), tidak boleh kode hex.
5. URL ditulis lewat `lib/rute.js`, tidak boleh diketik langsung di komponen.
6. Setiap berkas diawali komentar header (format di bagian 7). Ini yang menghubungkan kode dengan Modul 2 dan tabel traceability Modul 3.
7. Satu UI satu branch Git, satu Pull Request. Tidak ada yang langsung push ke branch utama.
8. Mengubah komponen bersama (`Layouts/`, `Components/ui/`, `Components/layout/`, `lib/`, `app.css`) dilakukan lewat Pull Request tersendiri berjudul `komponen-bersama: ...`, diumumkan di grup, dan disetujui minimal dua anggota lain. Jangan menyalin komponen ke berkas UI sendiri.

---

## 1. Gambaran urutan kerja

### 1.1 Dua tahap

| Tahap | Dilakukan oleh | Berapa kali |
|---|---|---|
| A. Setup FE (Inertia, React, tema, komponen, kerangka 23 UI) | Satu anggota mana pun yang lebih dulu siap (bagian 2) | Sekali untuk seluruh kelompok |
| B. Mengerjakan UI milik masing-masing | Semua anggota (bagian 3 sampai 9) | Per UI |

### 1.2 Berkas yang dibagikan

| Berkas | Isi | Dipakai untuk |
|---|---|---|
| `fe-foundation.zip` | Folder `src`, `docs`, `.github` berisi tema Figma, layout, komponen, halaman contoh UI-014, kerangka 23 UI, rute, template | Tahap A |
| `fe-sandbox.zip` | Proyek mandiri untuk menjalankan halaman tanpa Laravel dan Docker | Tahap B saat setup belum masuk ke GitHub |
| `PANDUAN-FE-KELOMPOK-3.md` | Dokumen ini | Semua tahap |

### 1.3 Jangan menunggu: mulai dengan sandbox

Kalau setup FE belum ada di GitHub, anggota tidak perlu berhenti. Pakai `fe-sandbox.zip`:

1. Ekstrak, buka PowerShell di folder `sandbox`, jalankan `npm.cmd install` lalu `npm.cmd run dev`.
2. Buka `http://localhost:5174`, kerjakan UI milikmu mengikuti bagian 5 (cara lengkap di `sandbox/README.md`).
3. Kode yang ditulis sama dengan kode untuk Laravel. Setelah setup FE masuk ke GitHub, salin hanya berkas milikmu ke repo, lalu lanjut ke Pull Request (bagian 5, langkah 9).

---

## 2. Tahap A: Setup FE (dilakukan satu kali oleh satu anggota)

### 2.0 Siapa yang memasang, dan cara menghindari pekerjaan ganda

1. Jalankan di root project: `git fetch origin` lalu `git branch -r`. Kalau sudah ada branch `origin/fe/setup-awal`, berarti ada anggota yang sedang atau sudah memasang. Jangan memasang lagi. Tunggu sampai branch itu di-merge ke `main` (sambil menunggu, pakai sandbox di bagian 1.3), lalu lanjut ke bagian 3.
2. Kalau belum ada, kamu boleh jadi pemasang. Segera beri penanda agar yang lain tidak ikut memasang:
   ```powershell
   git switch main
   git pull
   git switch -c fe/setup-awal
   git push -u origin fe/setup-awal
   ```
   Lalu kabari grup: "Setup FE sedang saya pasang di branch fe/setup-awal."
3. Lanjut ke 2.1.

Istilah lokasi yang dipakai di panduan ini:

| Istilah | Artinya |
|---|---|
| Root project | Folder `Poli-Dokter` (berisi `.docker`, `docs`, `src`, `compose.yaml`) |
| Folder src | `Poli-Dokter/src` (tempat `artisan`, `package.json`, `vite.config.js`) |

| Jenis perintah | Dijalankan dari | Berjalan di |
|---|---|---|
| `docker compose ...` (termasuk `composer`, `php artisan`) | Root project | Container Docker |
| `npm ...` | Folder src | Laptop sendiri |

Di Windows PowerShell, tulis `npm.cmd` (bukan `npm`) agar tidak terkena blokir kebijakan skrip.

### 2.1 Prasyarat (hasil panduan BE)

Terminal, lokasi root project:
```powershell
docker compose up -d
docker compose ps
node -v
```
Tiga container (`outpatient-care-app`, `outpatient-care-db`, `outpatient-care-phpmyadmin`) harus berjalan, `http://localhost:8080` menampilkan halaman Laravel, dan `node -v` menampilkan versi 20 ke atas. Kalau belum, selesaikan panduan BE dulu.

### 2.2 Atur APP_URL

Berkas `src/.env` (bukan `.env` di root), cari baris `APP_URL=` lalu ubah:
```env
APP_URL=http://localhost:8080
```
Simpan. Berkas `.env` tidak pernah di-commit.

### 2.3 Pasang paket PHP

Terminal, lokasi root project:
```powershell
docker compose exec app composer require inertiajs/inertia-laravel
docker compose exec app php artisan inertia:middleware
```
Hasilnya: `composer.json` dan `composer.lock` berubah, dan berkas `src/app/Http/Middleware/HandleInertiaRequests.php` terbentuk.

### 2.4 Pasang paket JavaScript

Terminal, lokasi folder src:
```powershell
cd src
npm.cmd install react react-dom @vitejs/plugin-react
npm.cmd install @inertiajs/react @inertiajs/vite lucide-react
```

### 2.5 Daftarkan middleware Inertia

Berkas `src/bootstrap/app.php`. Ada dua perubahan kecil, berkas lainnya biarkan.

1. Tambahkan satu baris `use` di bagian atas, bersama `use` yang sudah ada:
```php
use App\Http\Middleware\HandleInertiaRequests;
```
2. Di dalam `->withMiddleware(function (Middleware $middleware): void { ... })`, ganti isinya (yang tadinya hanya komentar `//`) menjadi:
```php
$middleware->web(append: [
    HandleInertiaRequests::class,
]);
```

### 2.6 Konfigurasi Vite

Berkas `src/vite.config.js`, ganti seluruh isi:
```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import inertia from '@inertiajs/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
            fonts: [
                bunny('Inter', {
                    weights: [400, 500, 600],
                }),
            ],
        }),
        react(),
        inertia({ ssr: false }),
        tailwindcss(),
    ],
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
```
Baris `inertia({ ssr: false })` penting: tanpa itu, di Docker halaman bisa putih dan memuat lama karena Inertia mencoba server-side rendering.

### 2.7 Matikan SSR di sisi Laravel

Berkas `src/app/Providers/AppServiceProvider.php`:

1. Tambahkan di bagian atas bersama `use` lain: `use Inertia\Inertia;`
2. Di dalam fungsi `boot()`, tambahkan satu baris: `Inertia::disableSsr();`

Hasilnya kira-kira:
```php
public function boot(): void
{
    Inertia::disableSsr();
}
```
(jika `boot()` sudah berisi kode BE, biarkan dan tambahkan barisnya di dalam.)

### 2.8 Salin berkas fondasi

Ekstrak `fe-foundation.zip`, lalu salin ke root project:

| Dari zip | Ke repo |
|---|---|
| folder `src\resources` | `src\resources` (pilih timpa jika ditanya) |
| folder `src\routes\fe` | `src\routes\fe` (folder baru) |
| folder `docs` | `docs` di root project |
| folder `.github` | `.github` di root project |

Lalu hapus `src\resources\js\app.js` jika ada (berkas lama yang kosong, digantikan `app.jsx` dari zip). Berkas `app.css` dan `app.blade.php` di zip menggantikan bawaan, itu memang disengaja karena sudah memuat tema Figma.

### 2.9 Daftarkan rute FE

Berkas `src/routes/web.php`, biarkan rute yang sudah ada, tambahkan di paling bawah:
```php
// Rute halaman FE per anggota (UI-001 sampai UI-023). Berkas ada di routes/fe/*.php
foreach (glob(__DIR__.'/fe/*.php') as $berkasRuteFe) {
    require $berkasRuteFe;
}
```
Contoh berkas utuh ada di `docs/web.php.contoh`.

### 2.10 Jalankan dan periksa

Terminal, lokasi folder src (biarkan terbuka):
```powershell
npm.cmd run dev
```
Kalau Blade mengeluh soal `x-inertia`, jalankan di terminal lain (root project): `docker compose exec app php artisan view:clear`.

Buka di browser, semuanya harus tampil:

| Alamat | Yang harus tampil |
|---|---|
| http://localhost:8080/dokter/antrean-periksa | Halaman contoh lengkap (UI-014) |
| http://localhost:8080/dokter/riwayat-medis/1 | Kerangka kosong dengan sidebar dokter |
| http://localhost:8080/pasien/beranda | Kerangka kosong dengan sidebar pasien |
| http://localhost:8080/login | Kerangka tanpa sidebar |

Kalau ada yang putih, lihat bagian 11.

### 2.11 Kirim ke GitHub

Terminal, lokasi root project:
```powershell
git status
git add docs .github src
git status
git commit -m "feat(fe): setup Inertia dan React, tema Figma, komponen, dan kerangka 23 UI"
git push
```
Periksa `git status` sebelum commit: tidak boleh ada `.env`, `vendor`, `node_modules`, `public/build`, `public/hot` (biasanya sudah diabaikan `.gitignore`).

Buka Pull Request dari `fe/setup-awal` ke `main`. Tulis di deskripsi: "Setup FE (Inertia, React, tema, komponen, kerangka 23 UI). Mengubah composer.json, bootstrap/app.php, routes/web.php, AppServiceProvider." agar BE tahu dan tidak terjadi konflik. Minta review satu orang (BE atau anggota lain), lalu merge sesuai aturan merge yang disepakati kelompok. Setelah merge, beri kabar di grup.

---

## 3. Persiapan untuk setiap anggota (MF, KH, MH, RG)

Dilakukan setelah setup FE masuk ke `main`. Di laptop masing-masing:

1. Ambil kode terbaru (root project): `git switch main` lalu `git pull`.
2. Jalankan Docker: `docker compose up -d`.
3. Pasang paket PHP bila ada yang baru: `docker compose exec app composer install`.
4. Pasang paket JavaScript (folder src): `npm.cmd install`.
5. Pastikan `src/.env` berisi `APP_URL=http://localhost:8080`.
6. Jalankan Vite di terminal tersendiri dan biarkan terbuka (folder src): `npm.cmd run dev`.
7. Buka `http://localhost:8080/dokter/antrean-periksa`. Halaman ini acuan, pelajari dulu sebelum menulis UI sendiri.

Aturan keselamatan: jangan menjalankan `docker compose down -v` atau `php artisan migrate:fresh`, karena menghapus isi database.

---

## 4. Pembagian UI dan lokasi berkas

Pembagian mengikuti kolom Created By di Modul 2 bagian 3.7. Berkas, URL, dan kode sudah disediakan sebagai kerangka. Tugasmu mengganti isi kerangka, bukan membuat berkas baru.

Format kode implementasi: `[INISIAL]-IM-[NNN]` (sesuai contoh `HRP-IM-001` di Modul 3). Nomor urut dihitung per orang.

| UI | Nama (Modul 2) | Kode | Berkas di `resources/js/` | URL | Penulis |
|---|---|---|---|---|---|
| UI-001 | Registrasi Pasien Baru | MF-IM-001 | `Pages/Auth/Registrasi.jsx` | /registrasi | MF |
| UI-002 | Login | MF-IM-002 | `Pages/Auth/Login.jsx` | /login | MF |
| UI-003 | Beranda Pasien | MF-IM-003 | `Pages/Pasien/Beranda.jsx` | /pasien/beranda | MF |
| UI-004 | Profile Pasien | MF-IM-004 | `Pages/Pasien/Profil.jsx` | /pasien/profil | MF |
| UI-005 | Edit Data Pasien (pop-up) | MF-IM-005 | `Components/Pasien/EditDataModal.jsx` | dibuka dari UI-004 | MF |
| UI-006 | Triage Perawat | MF-IM-006 | `Pages/Perawat/Triage.jsx` | /perawat/triage | MF |
| UI-007 | Penjadwalan Poli | KH-IM-001 | `Pages/Pasien/PenjadwalanPoli.jsx` | /pasien/penjadwalan-poli | KH |
| UI-008 | Riwayat Reservasi / Tiket Antrean | KH-IM-002 | `Pages/Pasien/RiwayatReservasi.jsx` | /pasien/riwayat-reservasi | KH |
| UI-009 | Jadwal Saya Dokter (termasuk pop-up Tambah Slot) | KH-IM-003 | `Pages/Dokter/JadwalSaya.jsx` | /dokter/jadwal-saya | KH |
| UI-010 | Dasbor Pasien (Beranda) | KH-IM-004 | `Pages/Pasien/DasborPasien.jsx` | /pasien/dasbor | KH |
| UI-011 | Form Diagnosis | KH-IM-005 | `Pages/Dokter/FormDiagnosis.jsx` | /dokter/form-diagnosis/{antrean} | KH |
| UI-012 | Jadwal Saya Pasien (termasuk form ubah jadwal) | MH-IM-001 | `Pages/Pasien/JadwalSaya.jsx` | /pasien/jadwal-saya | MH |
| UI-013 | Pop-up Konfirmasi Ubah Slot Dokter | MH-IM-002 | `Components/Dokter/UbahSlotModal.jsx` | dibuka dari UI-009 | MH |
| UI-014 | Antrean Periksa | MH-IM-003 | `Pages/Dokter/AntreanPeriksa.jsx` | /dokter/antrean-periksa | MH (selesai, jadi contoh) |
| UI-015 | Riwayat Medis / Dasbor | MH-IM-004 | `Pages/Dokter/RiwayatMedis.jsx` | /dokter/riwayat-medis/{antrean} | MH |
| UI-016 | Antrean Triage | MH-IM-005 | `Pages/Perawat/AntreanTriage.jsx` | /perawat/antrean-triage | MH |
| UI-017 | Form Observasi (TD, Suhu, BB) | MH-IM-006 | `Pages/Perawat/FormObservasi.jsx` | /perawat/form-observasi/{antrean} | MH |
| UI-018 | Pop-up Pembatalan Reservasi | RG-IM-001 | `Components/Pasien/BatalReservasiModal.jsx` | dibuka dari UI-012 dan UI-008 | RG |
| UI-019 | Pop-up Hapus Slot | RG-IM-002 | `Components/Dokter/HapusSlotModal.jsx` | dibuka dari UI-009 | RG |
| UI-020 | Form E-Resep (Dokter) | RG-IM-003 | `Pages/Dokter/FormEResep.jsx` | /dokter/form-eresep/{antrean} | RG |
| UI-021 | Notifikasi Apoteker | RG-IM-004 | `Pages/Apoteker/NotifikasiEResep.jsx` | /apoteker/notifikasi-eresep | RG |
| UI-022 | Rincian E-Resep dan Ketersediaan Obat | RG-IM-005 | `Pages/Apoteker/RincianEResep.jsx` | /apoteker/rincian-eresep/{eresep} | RG |
| UI-023 | Pengiriman Obat | RG-IM-006 | `Pages/Apoteker/PengirimanObat.jsx` | /apoteker/pengiriman-obat/{eresep} | RG |

Ketergantungan antar UI (koordinasikan lewat grup):

- UI-013 (MH) dan UI-019 (RG) dibuka dari tombol di UI-009 (KH). KH cukup memasang `<UbahSlotModal open onClose />` dan `<HapusSlotModal open onClose />`, isinya dikerjakan MH dan RG.
- UI-018 (RG) dibuka dari UI-012 (MH) dan UI-008 (KH).
- UI-005 (MF) dibuka dari UI-004 (MF).
- Alur dokter: UI-014, UI-015, UI-011, UI-020. Alur perawat: UI-016, UI-017.

Tombol "Buka RM" di UI-014 mengarah ke UI-015 lewat `rute.dokter.riwayatMedis(id)`. Pola yang sama dipakai untuk tautan antar halaman lain.

---

## 5. Alur mengerjakan satu UI (langkah demi langkah)

Contoh memakai UI-015 (MH-IM-004). Ganti dengan UI milikmu.

**Langkah 1. Buat branch.**
```powershell
cd C:\Projects\Poli-Dokter
git checkout main
git pull
git checkout -b fe/ui-015-riwayat-medis
```
Penamaan branch: `fe/ui-[nomor]-[nama-singkat]`.

**Langkah 2. Kumpulkan bahan.**
- Buka Modul 2 bagian 3.7, cari UI-nya. Salin daftar elemen UI ke catatan: tiap elemen akan menjadi satu blok di halaman.
- Buka Figma (file Kelompok 3, RSI Sistem Rawat Jalan), cari frame UI yang sama. Catat ukuran teks, warna, jarak. Lihat halaman Design System di file Figma untuk nama warna.
- Lihat alur di Modul 2 (use case dan sequence) untuk mengetahui apa yang terjadi saat tombol ditekan dan pesan apa yang muncul.

**Langkah 3. Buka berkas kerangka.** Berkasnya sudah ada (lihat tabel bagian 4). Salin isi `docs/templates/HalamanBaru.template.jsx` (atau `ModalBaru.template.jsx` untuk pop-up) ke berkas itu, lalu isi komentar header.

**Langkah 4. Susun kerangka tampilan.** Tulis dulu blok-bloknya dari atas ke bawah mengikuti urutan elemen di Modul 2 dan Figma, dengan isi sementara. Pakai `PageHeader`, `StatCard`, `Table`, `Badge`, `Button`, `Input`, `Modal`, `Callout`, `Pagination`.

**Langkah 5. Isi dengan data contoh.** Buat berkas `resources/js/data/[namaData]Dummy.js` berisi data contoh dengan bentuk yang sama seperti nanti dari BE (lihat `data/antreanDummy.js`). Halaman menerima data lewat props dengan nilai awal berupa data contoh:
```jsx
export default function RiwayatMedis({ riwayat = riwayatDummy }) { ... }
```
Dengan cara ini halaman jalan sekarang, dan saat BE mengirim props bernama sama, data BE otomatis dipakai tanpa mengubah tampilan.

**Langkah 6. Pasang perilaku.** Pencarian, filter, pop-up, validasi form, dan notifikasi sesuai Modul 2. Pesan notifikasi harus sama persis dengan Modul 2 (bagian 6.6).

**Langkah 7. Bandingkan dengan Figma.** Buka halaman di lebar jendela 1280 px, bandingkan berdampingan dengan Figma. Periksa: ukuran dan berat huruf, warna, jarak, ikon, teks label, urutan kolom. Perbedaan kecil di anti-aliasing atau font (Inter sebagai pengganti SF Pro di Windows) wajar.

**Langkah 8. Periksa sendiri.** Buka konsol browser (F12), tidak boleh ada tulisan merah. Coba semua tombol. Coba data kosong (misalnya hasil pencarian tidak ada) dan pesan galat.

**Langkah 9. Commit dan Pull Request.**
```powershell
git add src/resources src/routes docs
git commit -m "feat(UI-015): halaman Riwayat Medis (MH-IM-004)"
git push -u origin fe/ui-015-riwayat-medis
```
Buka Pull Request di GitHub. Template checklist muncul otomatis, centang semua poin dan tempel tangkapan layar. Reviewer (urutan di bagian 9) memeriksa, lalu kamu merge setelah disetujui.

**Langkah 10. Catat untuk Modul 3.** Buka `docs/traceability-4.3.md`, ubah `[ ]` pada barismu menjadi `[x]`. Salin isi berkas kodemu ke laporan bagian 4.3 dengan format di bagian 8.

Jika di tengah jalan perlu komponen yang belum ada, jangan membuat salinan. Ajukan lewat Pull Request `komponen-bersama: ...` (aturan emas nomor 8), atau sementara susun dari komponen yang ada.

---

## 6. Aturan konsistensi

### 6.1 Penamaan

| Hal | Aturan | Contoh |
|---|---|---|
| Berkas halaman dan komponen | PascalCase, bahasa Indonesia sesuai nama di Modul 2 | `AntreanPeriksa.jsx`, `BatalReservasiModal.jsx` |
| Fungsi komponen | sama persis dengan nama berkas | `export default function AntreanPeriksa` |
| Variabel dan fungsi | camelCase, bahasa Indonesia | `jumlahPerHalaman`, `bukaRM` |
| Props data dari BE | camelCase, sama dengan nama kolom/field BE | `antrean`, `dokter` |
| Nilai status | huruf kecil | `'menunggu'`, `'sedang'`, `'selesai'` |
| Branch | `fe/ui-[nomor]-[nama]` | `fe/ui-015-riwayat-medis` |
| Pesan commit | `feat(UI-015): ...` atau `fix(UI-015): ...` | `feat(UI-015): tabel riwayat medis` |

### 6.2 Warna dan font (token dari Figma)

Semua token ada di `resources/css/app.css`. Pakai nama token di kelas Tailwind.

| Kebutuhan | Token |
|---|---|
| Tombol utama, aksen hijau | `bg-brand`, `text-brand`, hover `bg-brand-hover` |
| Hijau muda (menu aktif, latar lembut) | `bg-brand-light`, `bg-brand-light-active` |
| Latar halaman | `bg-surface` |
| Latar kartu abu | `bg-surface-low`, `bg-surface-mid`, `bg-surface-high` |
| Teks utama | `text-ink` |
| Teks sekunder | `text-ink-soft` |
| Teks redup | `text-ink-muted` |
| Bahaya, galat | `text-danger`, `bg-danger`, `bg-danger-light` |
| Garis pemisah | `border-line` |

Font: SF Pro (dengan cadangan Inter). Tidak perlu menulis `font-family` manual.

### 6.3 Teks antarmuka

- Semua teks Bahasa Indonesia, sama dengan Modul 2 dan Figma (tulis ulang persis, termasuk huruf besar).
- Judul halaman memakai `PageHeader`.
- Label kolom tabel memakai huruf kapital lewat gaya `Th`, tulis cukup dengan huruf biasa.

### 6.4 Komponen bersama

| Komponen | Berkas | Dipakai untuk | Props utama |
|---|---|---|---|
| `AppLayout` | `Layouts/AppLayout.jsx` | Kerangka semua halaman setelah login | `role` (`pasien`, `dokter`, `perawat`, `apoteker`), `title` |
| `PageHeader` | `Components/ui/PageHeader.jsx` | Judul, info, aksi di atas halaman | `icon`, `title`, `actions`, anak = baris info |
| `Button` | `Components/ui/Button.jsx` | Semua tombol | `variant` (`primary`, `secondary`, `outline`, `danger`, `ghost`), `size`, `icon`, `loading`, `href` |
| `Input`, `Select`, `Textarea` | `Components/ui/Input.jsx` | Isian form | `label`, `hint`, `error`, `icon` |
| `Table`, `Thead`, `Tbody`, `Tr`, `Th`, `Td` | `Components/ui/Table.jsx` | Tabel | `Tr aktif` untuk baris disorot |
| `Badge` | `Components/ui/Badge.jsx` | Lencana status | `tone`, `dot`, `check` |
| `StatCard` | `Components/ui/StatCard.jsx` | Kartu angka ringkasan | `label`, `value`, `unit`, `icon`, `tone` |
| `Modal` | `Components/ui/Modal.jsx` | Semua pop-up | `open`, `onClose`, `title`, `description`, `size`, `footer` |
| `toast` | `Components/ui/Toast.jsx` | Notifikasi singkat | `toast.success(...)`, `toast.error(...)`, `toast.info(...)` |
| `Callout` | `Components/ui/Callout.jsx` | Kotak informasi | `tone`, `aside` |
| `Pagination` | `Components/ui/Pagination.jsx` | Nomor halaman | `halaman`, `totalHalaman`, `onUbah` |

Pemetaan status ke warna `Badge` ada di `lib/status.js`. Tambahkan status baru di sana, jangan menentukan warna per halaman.

### 6.5 Rute dan navigasi

- Pindah halaman dengan `Button href={rute...}` atau `router.visit(rute...)`, tidak dengan `window.location`.
- Menambah URL baru: tambahkan di `lib/rute.js` dan di berkas `routes/fe/[inisial].php` milikmu. Dua tempat itu harus selalu sama.
- Menu sidebar diatur di `lib/menu.js`. Menu tanpa href (belum punya UI di Modul 2) menampilkan notifikasi "belum termasuk dalam 23 UI". Jika kamu membuat halaman untuk menu itu, isi `href` lewat Pull Request `komponen-bersama: ...` dan kabari grup.

### 6.6 Pesan notifikasi dan galat

Pakai teks dari Modul 2. Pesan yang sudah dipakai di prototype dan halaman contoh (periksa lagi dengan Modul 2 sebelum dipakai di halamanmu):

| Situasi | Pesan |
|---|---|
| Slot penuh saat reservasi | Kuota Slot Penuh |
| Reservasi berhasil | Berhasil Booking |
| Perubahan data/jadwal tersimpan | Pembaruan Berhasil |
| Pemeriksaan selesai disimpan | Pemeriksaan Selesai |
| Form belum lengkap | Data Tidak Lengkap |
| Gagal membuka riwayat medis | Gagal mengambil riwayat medis, coba lagi. |

Kalau menemukan pesan baru di Modul 2, tambahkan barisnya di tabel ini lewat Pull Request, agar semua orang memakai teks yang sama.

### 6.7 Data contoh dan integrasi dengan BE

- Data contoh disimpan di `resources/js/data/`. Bentuknya harus sama dengan data yang akan dikirim BE.
- Halaman menerima data lewat props dengan nilai awal data contoh.
- BE mengganti rute dari `Route::inertia(...)` menjadi Controller yang memanggil `Inertia::render('Dokter/AntreanPeriksa', ['antrean' => ...])`. URL dan nama rute tidak berubah, jadi FE tidak perlu mengubah apa pun.
- Bila BE butuh bentuk data berbeda, FE dan BE sepakati dulu, lalu ubah data contoh dan halamannya bersamaan.

### 6.8 Kualitas kode (sesuai Modul 3)

Modul 3 meminta readability dan traceability tinggi. Artinya:

1. Beri komentar pada bagian yang butuh penjelasan (fungsi aksi, aturan khusus seperti batas tekanan darah).
2. Satu instruksi satu baris. Pisahkan blok dengan baris kosong. Indentasi 2 spasi, konsisten.
3. Nama sesuai Modul 2 supaya mudah ditelusuri dari desain sampai kode.
4. Logika harus benar: coba kasus normal, kosong, dan galat.
5. Jangan meninggalkan kode yang dimatikan (komentar berisi kode lama) dan `console.log`.

---

## 7. Template dan komentar header

Setiap berkas halaman atau pop-up diawali tiga baris komentar ini. Ini adalah penghubung ke kolom "Implementasi Kode UI" di tabel traceability Modul 3.

```jsx
// MH-IM-003 | UI-014 | Halaman Antrean Periksa (Dashboard Dokter) | Penulis: MH
// Sumber desain: Figma node 240:1074. Sumber kebutuhan: Modul 2 bagian 3.7 (UI-014).
// Rute: GET /dokter/antrean-periksa  (routes/fe/mh.php, nama rute dokter.antrean-periksa)
```

Template siap salin:

- `docs/templates/HalamanBaru.template.jsx` untuk halaman.
- `docs/templates/ModalBaru.template.jsx` untuk pop-up.
- `.github/pull_request_template.md` untuk Pull Request (otomatis muncul).
- `docs/traceability-4.3.md` untuk tabel validasi Modul 3.

Cara mencari Figma node ID: di Figma klik frame UI, lalu klik kanan, Copy link. Angka setelah `node-id=` (ganti tanda `-` dengan `:`) adalah ID-nya.

---

## 8. Mengisi Modul 3 bagian 4.3 (UI Implementation Code)

Format dari Modul 3: untuk setiap UI, tulis inisial penulis, kode implementasi, nama berkas, lalu isi kode. Contoh:

```
[MH]
[MH-IM-003]
AntreanPeriksa.jsx
(isi kode berkas, lengkap dengan nomor baris)
```

Lalu tabel traceability (satu baris per UI, sudah disiapkan di `docs/traceability-4.3.md`):

| No. | Sketsa UI (UI ID) | Implementasi Kode UI | Validasi |
|---|---|---|---|
| 1 | UI-014 | MH-IM-003 | √ |

Validasi dicentang bila kode sudah sesuai dengan sketsa (Figma) dan elemen di Modul 2. Setiap anggota mengisi bagian miliknya dan melampirkan kode berkasnya sendiri.

---

## 9. Git dan GitHub

Aturan singkat:

- Branch utama selalu dalam keadaan jalan. Hanya diubah lewat Pull Request.
- Satu UI satu branch. Jangan menggabungkan dua UI dalam satu Pull Request.
- Sebelum mulai mengerjakan, selalu `git pull` dari branch utama.
- Yang boleh disentuh anggota: berkas UI miliknya, `data/` miliknya, `routes/fe/[inisial].php` miliknya, dan `lib/rute.js` hanya untuk menambah URL.
- Yang diubah hanya lewat Pull Request `komponen-bersama: ...`: `Layouts/`, `Components/ui/`, `Components/layout/`, `lib/` (selain menambah URL), `app.css`.
- Jangan commit: `.env`, `vendor`, `node_modules`, `public/build`, `public/hot`.

Review silang (supaya tidak ada yang menunggu satu orang saja):

| Penulis | Reviewer |
|---|---|
| MF | RG |
| KH | MF |
| MH | KH |
| RG | MH |

Reviewer memeriksa checklist di template Pull Request dan membandingkan tangkapan layar dengan Figma. Satu persetujuan cukup untuk UI biasa, lalu penulis merge sendiri. Jika reviewer tidak membalas dalam 24 jam, minta anggota lain di grup. Jika kelompok atau BE punya aturan merge sendiri (misalnya wajib disetujui ketua), aturan itu yang dipakai.

Konflik saat merge: jangan memilih salah satu sisi sembarangan. Tanyakan di grup, pemilik berkas yang konflik yang memutuskan.

---

## 10. Urutan pengerjaan yang disarankan

Agar tidak saling menunggu:

1. Setup FE sudah masuk `main` (bagian 2), semua `git pull`. Selama menunggu, kerjakan di sandbox (bagian 1.3).
2. Tahap 1: halaman yang tidak bergantung pada halaman lain (UI-001, 002, 007, 012, 014, 016, 020, 021).
3. Berikutnya: halaman lanjutan (UI-003, 004, 006, 008, 009, 010, 011, 015, 017, 022, 023).
4. Terakhir: pop-up (UI-005, 013, 018, 019) lalu pasang di halaman induknya.
5. Tinjau bersama: semua UI dicentang di `docs/traceability-4.3.md`, lalu tangkapan layar dan kode dikumpulkan untuk laporan Modul 3.

---

## 11. Masalah umum

| Gejala | Penyebab | Perbaikan |
|---|---|---|
| Layar putih dan memuat terus | Vite belum jalan, atau SSR aktif di Docker | Jalankan `npm.cmd run dev`. Pastikan `inertia({ ssr: false })` di `vite.config.js` dan `Inertia::disableSsr()` di `AppServiceProvider` |
| `Page not found: Dokter/Xxx` di konsol | Nama berkas tidak sama dengan nama di rute (huruf besar kecil juga dihitung) | Samakan penulisan di `routes/fe/*.php` dan nama berkas |
| `npm.ps1 cannot be loaded` | Kebijakan PowerShell | Pakai `npm.cmd`, atau `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` |
| Vite pindah ke port 5174 | Ada proses Vite lama | `Get-Process node | Stop-Process -Force`, lalu jalankan ulang |
| `Failed to resolve import "lucide-react"` | Paket ikon belum terpasang | `cd src` lalu `npm.cmd install` |
| Kelas Tailwind tidak berpengaruh | Nama token salah ketik | Cocokkan dengan `app.css` bagian `@theme` |
| Halaman 404 saat klik menu | UI-nya belum punya rute | Tambahkan rute di `routes/fe/[inisial].php` |
| Tampilan berbeda dari Figma | Font cadangan Inter menggantikan SF Pro di Windows | Wajar. Periksa ukuran, warna, dan jarak saja |

---

## 12. Hal yang perlu disepakati kelompok

Beberapa UI di Modul 2 saling beririsan. Putuskan sebelum mulai agar tidak ada pekerjaan ganda:

1. UI-003 (Beranda Pasien, MF) dan UI-010 (Dasbor Pasien/Beranda, KH) tampaknya tujuan yang sama. Sepakati satu sebagai beranda utama.
2. UI-006 (Triage Perawat, MF) dan UI-016/UI-017 (Antrean Triage dan Form Observasi, MH) berurutan dalam satu alur. Pastikan pembagian layar jelas: daftar antrean, lalu form pengisian.
3. UI-008 (Riwayat Reservasi) dan UI-012 (Jadwal Saya Pasien) sama-sama menampilkan reservasi pasien. Sepakati isi masing-masing.
4. UI-011 (Form Diagnosis) ditulis KH menurut Modul 2, sementara use case terkait milik MH. Koordinasikan data yang dibawa dari UI-015.
5. Menu sidebar yang belum punya UI di Modul 2 (Beranda Dokter, Beranda Perawat, Daftar Pasien Poli, Beranda Apoteker, Peracikan Obat, Riwayat Pengiriman, Pengaturan) saat ini menampilkan notifikasi "belum tersedia". Putuskan apakah dibiarkan atau ditambahkan ke Modul 2.
