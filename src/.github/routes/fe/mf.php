<?php

// routes/fe/mf.php | Rute halaman FE milik MF (di-load otomatis dari routes/web.php)
// Sementara memakai data contoh dari FE. BE akan mengganti closure dengan Controller tanpa mengubah URL dan nama rute.

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// UI-001 MF-IM-001 Registrasi Pasien Baru
Route::inertia('/registrasi', 'Auth/Registrasi')->name('registrasi');

// UI-002 MF-IM-002 Login
Route::inertia('/login', 'Auth/Login')->name('login');

// UI-003 MF-IM-003 Beranda Pasien
Route::inertia('/pasien/beranda', 'Pasien/Beranda')->name('pasien.beranda');

// UI-004 MF-IM-004 Profile Pasien
Route::inertia('/pasien/profil', 'Pasien/Profil')->name('pasien.profil');

// UI-006 MF-IM-006 Triage Perawat
Route::inertia('/perawat/triage', 'Perawat/Triage')->name('perawat.triage');

// Keluar Sesi (sementara). BE mengganti dengan logout sungguhan.
Route::post('/logout', fn () => redirect('/login'))->name('logout');
