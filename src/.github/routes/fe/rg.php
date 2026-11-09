<?php

// routes/fe/rg.php | Rute halaman FE milik RG (di-load otomatis dari routes/web.php)
// Sementara memakai data contoh dari FE. BE akan mengganti closure dengan Controller tanpa mengubah URL dan nama rute.

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// UI-020 RG-IM-003 Form E-Resep (Dokter)
Route::get('/dokter/form-eresep/{antrean?}', fn ($antrean = null) => Inertia::render('Dokter/FormEResep', ['antreanId' => $antrean]))
    ->name('dokter.form-eresep');

// UI-021 RG-IM-004 Notifikasi Apoteker
Route::inertia('/apoteker/notifikasi-eresep', 'Apoteker/NotifikasiEResep')->name('apoteker.notifikasi-eresep');

// UI-022 RG-IM-005 Rincian E-Resep & Ketersediaan Obat
Route::get('/apoteker/rincian-eresep/{eresep?}', fn ($eresep = null) => Inertia::render('Apoteker/RincianEResep', ['eresepId' => $eresep]))
    ->name('apoteker.rincian-eresep');

// UI-023 RG-IM-006 Pengiriman Obat
Route::get('/apoteker/pengiriman-obat/{eresep?}', fn ($eresep = null) => Inertia::render('Apoteker/PengirimanObat', ['eresepId' => $eresep]))
    ->name('apoteker.pengiriman-obat');
