<?php

// routes/fe/kh.php | Rute halaman FE milik KH (di-load otomatis dari routes/web.php)
// Sementara memakai data contoh dari FE. BE akan mengganti closure dengan Controller tanpa mengubah URL dan nama rute.

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// UI-007 KH-IM-001 Penjadwalan Poli
Route::inertia('/pasien/penjadwalan-poli', 'Pasien/PenjadwalanPoli')->name('pasien.penjadwalan-poli');

// UI-008 KH-IM-002 Riwayat Reservasi / Tiket Antrean
Route::inertia('/pasien/riwayat-reservasi', 'Pasien/RiwayatReservasi')->name('pasien.riwayat-reservasi');

// UI-009 KH-IM-003 Jadwal Saya Dokter (termasuk pop-up Tambah Slot)
Route::inertia('/dokter/jadwal-saya', 'Dokter/JadwalSaya')->name('dokter.jadwal-saya');

// UI-010 KH-IM-004 Dasbor Pasien (Beranda)
Route::inertia('/pasien/dasbor', 'Pasien/DasborPasien')->name('pasien.dasbor');

// UI-011 KH-IM-005 Form Diagnosis
Route::get('/dokter/form-diagnosis/{antrean?}', fn ($antrean = null) => Inertia::render('Dokter/FormDiagnosis', ['antreanId' => $antrean]))
    ->name('dokter.form-diagnosis');
