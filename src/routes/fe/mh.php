<?php

// routes/fe/mh.php | Rute halaman FE milik MH (di-load otomatis dari routes/web.php)
// Sementara memakai data contoh dari FE. BE akan mengganti closure dengan Controller tanpa mengubah URL dan nama rute.

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Dokter\RMEController;
use App\Http\Controllers\Perawat\ObservasiController;

// UI-012 MH-IM-001 Jadwal Saya Pasien (termasuk form ubah jadwal)
Route::middleware(\App\Http\Middleware\PasienSession::class)->get('/pasien/jadwal-saya', [\App\Http\Controllers\Pasien\PortalPasienController::class, 'riwayat'])->name('pasien.jadwal-saya');

// UI-014 MH-IM-003 Antrean Periksa
Route::get('/dokter/antrean-periksa', [RMEController::class, 'antreanPeriksa'])->name('dokter.antrean-periksa');
Route::get('/dokter/riwayat-medis', [RMEController::class, 'daftarRiwayatMedis'])->name('dokter.riwayat-medis.index');

// UI-015 MH-IM-004 Riwayat Medis / Dasbor
Route::get('/dokter/riwayat-medis/{idPasien}', [RMEController::class, 'requestRiwayatMedis'])
    ->name('dokter.riwayat-medis');

// UI-016 MH-IM-005 Antrean Triage
Route::get('/perawat/antrean-triage', [ObservasiController::class, 'getAntreanTriage'])->name('perawat.antrean-triage');

// UI-017 MH-IM-006 Form Observasi (TD, Suhu, BB)
Route::get('/perawat/form-observasi/{antrean}', [ObservasiController::class, 'getDataPasien'])
    ->name('perawat.form-observasi');
Route::post('/perawat/observasi/{idAntrean}', [ObservasiController::class, 'kirimDataObservasi'])->name('perawat.observasi.store');
Route::get('/perawat/observasi/{idObservasi}', [ObservasiController::class, 'getDataObservasi'])->name('perawat.observasi.show');
Route::put('/perawat/observasi/{idObservasi}', [ObservasiController::class, 'perbaruiObservasi'])->name('perawat.observasi.update');
