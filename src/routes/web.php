<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::inertia('/fe-test', 'Welcome');
// Rute halaman FE per anggota (UI-001 sampai UI-023). Berkas ada di routes/fe/*.php
foreach (glob(__DIR__.'/fe/*.php') as $berkasRuteFe) {
    require $berkasRuteFe;
}