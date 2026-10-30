# MVP scope — berdasarkan dokumen kelompok

## Use case yang tercantum
- Pasien: registrasi, login, pemutakhiran data.
- Pasien: mengelola jadwal kunjungan.
- Dokter: mengelola jadwal praktik/daftar pasien, meninjau riwayat medis, mencatat diagnosis.
- Perawat: pencatatan observasi awal (triage).
- Apoteker: UC-009 menerima e-resep, UC-010 meracik obat dari e-resep, UC-011 mengirim obat.
- Admin: detail use case admin belum tampak pada daftar use case yang tersedia; jangan menambahkan fitur tanpa kesepakatan kelompok.

## Alur e-resep UC-009–UC-011
1. Dokter mengirim e-resep; sistem menyimpan dan memberi notifikasi kepada apoteker.
2. Apoteker membuka dan memvalidasi rincian e-resep.
3. Sistem menampilkan ketersediaan obat. Jika stok tidak cukup, tampilkan informasi obat tidak tersedia.
4. Apoteker menyiapkan obat dan memperbarui status resep setelah diproses.
5. Apoteker memverifikasi identitas pasien, memastikan obat sesuai resep, menyerahkan/mengirim obat, dan menjelaskan aturan pakai.
6. Sistem memperbarui status e-resep menjadi selesai.

## Saran pengorganisasian kode
- Controllers: pisahkan per area fitur, misalnya `JadwalController`, `DiagnosisController`, `TriageController`, `EResepController`.
- Models: tentukan setelah ERD final. Kandidat awal dari dokumen: Pasien, Dokter, Jadwal/SlotJadwal, Reservasi, Diagnosis, Observasi, EResep, Obat.
- Form Requests: validasi input sisi server.
- Middleware/Policies: batasi akses berdasarkan role yang disepakati.
- Views: pisahkan layout bersama dan halaman per peran.

## Perlu dikonfirmasi
- Apakah Perawat dan Admin masuk ruang lingkup implementasi MVP.
- Pada daftar use case, UC-004 tertulis pengelolaan ketersediaan dokter, sementara detailnya menjelaskan pengelolaan jadwal kunjungan pasien.
- ERD final, aturan status e-resep, kapan stok obat dikurangi, dan apakah “mengirim obat” berarti penyerahan langsung atau pengantaran.
- Mekanisme login dan pembagian hak akses.
