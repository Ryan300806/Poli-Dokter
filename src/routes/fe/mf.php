<?php

// routes/fe/mf.php | Rute halaman FE milik MF (di-load otomatis dari routes/web.php)
// Sementara memakai data contoh dari FE. BE akan mengganti closure dengan Controller tanpa mengubah URL dan nama rute.

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Pasien\AuthPasienController;
use App\Http\Controllers\Pasien\PortalPasienController;
use App\Http\Middleware\PasienSession;
use Inertia\Inertia;

// UI-001 MF-IM-001 Registrasi Pasien Baru
Route::get('/registrasi', fn () => Inertia::render('Auth/Registrasi'))->name('registrasi');
Route::post('/registrasi', [AuthPasienController::class, 'daftar'])->name('registrasi.simpan');

// UI-002 MF-IM-002 Login
Route::get('/login', [AuthPasienController::class, 'login'])->name('login');
Route::post('/login', [AuthPasienController::class, 'masuk'])->name('login.masuk');

// UI-003 MF-IM-003 Beranda Pasien
Route::middleware(PasienSession::class)->group(function () {
    Route::get('/pasien/beranda', [PortalPasienController::class, 'beranda'])->name('pasien.beranda');
    Route::get('/pasien/profil', [PortalPasienController::class, 'profil'])->name('pasien.profil');
    Route::put('/pasien/profil', [PortalPasienController::class, 'updateProfil'])->name('pasien.profil.update');
    Route::get('/pasien/dasbor', [PortalPasienController::class, 'dasbor'])->name('pasien.dasbor');
    Route::post('/logout', [AuthPasienController::class, 'keluar'])->name('logout');
});

// UI-006 MF-IM-006 Triage Perawat
Route::inertia('/perawat/triage', 'Perawat/Triage')->name('perawat.triage');

