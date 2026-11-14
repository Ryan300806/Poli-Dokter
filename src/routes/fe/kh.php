<?php

// routes/fe/kh.php | Rute halaman FE milik KH (di-load otomatis dari routes/web.php)
// Sementara memakai data contoh dari FE. BE akan mengganti closure dengan Controller tanpa mengubah URL dan nama rute.

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Pasien\PortalPasienController;
use App\Http\Middleware\PasienSession;

// UI-007 KH-IM-001 Penjadwalan Poli
Route::middleware(PasienSession::class)->group(function () {
    Route::get('/pasien/penjadwalan-poli', [PortalPasienController::class, 'penjadwalan'])->name('pasien.penjadwalan-poli');
    Route::post('/pasien/reservasi', [PortalPasienController::class, 'booking'])->name('pasien.reservasi.store');
    Route::get('/pasien/riwayat-reservasi', [PortalPasienController::class, 'riwayat'])->name('pasien.riwayat-reservasi');
    Route::put('/pasien/reservasi/{reservasi}/jadwal', [PortalPasienController::class, 'ubahJadwal'])->name('pasien.reservasi.update');
    Route::delete('/pasien/reservasi/{reservasi}', [PortalPasienController::class, 'batal'])->name('pasien.reservasi.destroy');
});

// UI-008 KH-IM-002 Riwayat Reservasi / Tiket Antrean
// UI-009 KH-IM-003 Jadwal Saya Dokter (termasuk pop-up Tambah Slot)
Route::inertia('/dokter/jadwal-saya', 'Dokter/JadwalSaya')->name('dokter.jadwal-saya');

// UI-011 KH-IM-005 Form Diagnosis
Route::get('/dokter/form-diagnosis/{antrean?}', fn ($antrean = null) => Inertia::render('Dokter/FormDiagnosis', ['antreanId' => $antrean]))
    ->name('dokter.form-diagnosis');
