<?php

// routes/fe/mh.php | Rute halaman FE milik MH (di-load otomatis dari routes/web.php)
// Sementara memakai data contoh dari FE. BE akan mengganti closure dengan Controller tanpa mengubah URL dan nama rute.

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// UI-012 MH-IM-001 Jadwal Saya Pasien (termasuk form ubah jadwal)
Route::middleware(\App\Http\Middleware\PasienSession::class)->get('/pasien/jadwal-saya', [\App\Http\Controllers\Pasien\PortalPasienController::class, 'riwayat'])->name('pasien.jadwal-saya');

// UI-014 MH-IM-003 Antrean Periksa
Route::inertia('/dokter/antrean-periksa', 'Dokter/AntreanPeriksa')->name('dokter.antrean-periksa');

// UI-015 MH-IM-004 Riwayat Medis / Dasbor
Route::get('/dokter/riwayat-medis/{antrean?}', fn ($antrean = null) => Inertia::render('Dokter/RiwayatMedis', ['antreanId' => $antrean]))
    ->name('dokter.riwayat-medis');

// UI-016 MH-IM-005 Antrean Triage
Route::inertia('/perawat/antrean-triage', 'Perawat/AntreanTriage')->name('perawat.antrean-triage');

// UI-017 MH-IM-006 Form Observasi (TD, Suhu, BB)
Route::get('/perawat/form-observasi/{antrean?}', fn ($antrean = null) => Inertia::render('Perawat/FormObservasi', ['antreanId' => $antrean]))
    ->name('perawat.form-observasi');
