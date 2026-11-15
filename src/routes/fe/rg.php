<?php

// routes/fe/rg.php | Rute halaman FE milik RG (di-load otomatis dari routes/web.php)
// Seluruh rute operasional diarahkan ke controller dan data database.

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EResepController;
use App\Http\Controllers\Apoteker\PengirimanObatController;

// UI-020 RG-IM-003 Form E-Resep (Dokter)
Route::get('/dokter/form-eresep/{antrean}', [EResepController::class, 'formEResep'])
    ->name('dokter.form-eresep');
Route::post('/dokter/e-resep', [EResepController::class, 'store'])->name('dokter.eresep.store');

// UI-021 RG-IM-004 Notifikasi Apoteker
Route::get('/apoteker/notifikasi-eresep', [EResepController::class, 'daftarNotifikasi'])->name('apoteker.notifikasi-eresep');

// UI-022 RG-IM-005 Rincian E-Resep & Ketersediaan Obat
Route::get('/apoteker/rincian-eresep/{eresep}', [EResepController::class, 'halamanRincian'])
    ->name('apoteker.rincian-eresep');
Route::post('/apoteker/e-resep/{idEResep}/status', [EResepController::class, 'updateStatusHttp'])->name('apoteker.eresep.status');

// UI-023 RG-IM-006 Pengiriman Obat
Route::get('/apoteker/pengiriman-obat/{eresep}', [PengirimanObatController::class, 'halamanPengiriman'])
    ->name('apoteker.pengiriman-obat');
