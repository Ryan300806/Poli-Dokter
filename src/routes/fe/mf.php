<?php

// routes/fe/mf.php | Rute halaman FE milik MF (di-load otomatis dari routes/web.php)
// Seluruh rute operasional diarahkan ke controller dan data database.

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Pasien\AuthPasienController;
use App\Http\Controllers\Pasien\LoginController;
use App\Http\Controllers\Pasien\PemutakhiranDataController;
use App\Http\Controllers\Pasien\RegistrasiController;
use App\Http\Controllers\Pasien\PortalPasienController;
use App\Http\Controllers\Perawat\ObservasiController;
use App\Http\Middleware\PasienSession;
use Inertia\Inertia;

// UI-001 MF-IM-001 Registrasi Pasien Baru
Route::get('/registrasi', fn () => Inertia::render('Auth/Registrasi'))->name('registrasi');
Route::post('/registrasi', [RegistrasiController::class, 'kirimDataRegistrasi'])->name('registrasi.simpan');

// UI-002 MF-IM-002 Login
Route::get('/login', [AuthPasienController::class, 'login'])->name('login');
Route::post('/login', [LoginController::class, 'login'])->name('login.masuk');

// UI-003 MF-IM-003 Beranda Pasien
Route::middleware(PasienSession::class)->group(function () {
    Route::get('/pasien/beranda', [PortalPasienController::class, 'beranda'])->name('pasien.beranda');
    Route::get('/pasien/profil', [PemutakhiranDataController::class, 'requestEdit'])->name('pasien.profil');
    Route::put('/pasien/profil', [PemutakhiranDataController::class, 'simpanPerubahanData'])->name('pasien.profil.update');
    Route::get('/pasien/dasbor', [PortalPasienController::class, 'dasbor'])->name('pasien.dasbor');
    Route::post('/logout', [AuthPasienController::class, 'keluar'])->name('logout');
});

// UI-006 MF-IM-006 Triage Perawat
Route::get('/perawat/triage', [ObservasiController::class, 'getAntreanTriage'])->name('perawat.triage');

