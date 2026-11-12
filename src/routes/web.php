<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| KODE LAMA (DIPERTAHANKAN)
|--------------------------------------------------------------------------
|
| Kode asli sebelum perubahan.
|
| Route::get('/', function () {
|     return view('welcome');
| });
|
| Route::inertia('/fe-test', 'Welcome');
| // Route halaman FE per anggota (UI-001 sampai UI-023). Berkas ada di routes/fe/*.php
| foreach (glob(__DIR__.'/fe/*.php') as $berkasRuteFe) {
|     require $berkasRuteFe;
| }
|
|--------------------------------------------------------------------------
| KODE BARU
|--------------------------------------------------------------------------
*/

// Halaman utama diarahkan ke halaman pengujian Inertia.
Route::redirect('/', '/fe-test');

// Halaman pengujian React + Inertia.
Route::inertia('/fe-test', 'Welcome');

// Route halaman FE per anggota (UI-001 sampai UI-023).
foreach (glob(__DIR__.'/fe/*.php') as $berkasRuteFe) {
    require $berkasRuteFe;
}
