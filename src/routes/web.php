<?php

use App\Http\Controllers\DiagnosisController;
use App\Http\Controllers\EResepController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\ObservasiController;
use App\Http\Controllers\PemutakhiranDataController;
use App\Http\Controllers\PengirimanObatController;
use App\Http\Controllers\PenjadwalanController;
use App\Http\Controllers\PortalPasienController;
use App\Http\Controllers\RegistrasiController;
use App\Http\Controllers\RMEController;
use App\Http\Middleware\PasienSession;
use App\Http\Middleware\RoleSession;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login');

// Autentikasi
Route::get('/registrasi', [RegistrasiController::class, 'index'])->name('registrasi');
Route::post('/registrasi', [RegistrasiController::class, 'kirimDataRegistrasi'])->name('registrasi.simpan');
Route::get('/login', [LoginController::class, 'showLogin'])->name('login');
Route::post('/login', [LoginController::class, 'login'])->name('login.masuk');
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

// Portal Pasien
Route::middleware(PasienSession::class)->group(function () {
    Route::get('/pasien/beranda', [PortalPasienController::class, 'beranda'])->name('pasien.beranda');
    Route::get('/pasien/dasbor', [PortalPasienController::class, 'beranda'])->name('pasien.dasbor');
    Route::get('/pasien/penjadwalan-poli', [PenjadwalanController::class, 'ambilJadwalPoli'])->name('pasien.penjadwalan-poli');
    Route::post('/pasien/reservasi', [PenjadwalanController::class, 'buatReservasi'])->name('pasien.reservasi.store');
    Route::get('/pasien/riwayat-reservasi', [PenjadwalanController::class, 'ambilReservasiAktif'])->name('pasien.riwayat-reservasi');
    Route::get('/pasien/jadwal-saya', [PenjadwalanController::class, 'ambilReservasiAktif'])->name('pasien.jadwal-saya');
    Route::get('/pasien/reservasi/{idReservasi}', [PenjadwalanController::class, 'ambilDetailReservasi'])->name('pasien.reservasi.show');
    Route::put('/pasien/reservasi/{idReservasi}/jadwal', [PenjadwalanController::class, 'ubahJadwal'])->name('pasien.reservasi.update');
    Route::delete('/pasien/reservasi/{idReservasi}', [PenjadwalanController::class, 'batalkanReservasi'])->name('pasien.reservasi.destroy');
    Route::get('/pasien/profil', [PemutakhiranDataController::class, 'requestEdit'])->name('pasien.profil');
    Route::put('/pasien/profil', [PemutakhiranDataController::class, 'simpanPerubahanData'])->name('pasien.profil.update');
});

// Layanan Perawat
Route::middleware(RoleSession::class.':perawat')->group(function () {
    Route::get('/perawat/antrean-triage', [ObservasiController::class, 'getAntreanTriage'])->name('perawat.antrean-triage');
    Route::get('/perawat/triage', [ObservasiController::class, 'getAntreanTriage'])->name('perawat.triage');
    Route::get('/perawat/form-observasi/{antrean}', [ObservasiController::class, 'getDataPasien'])->name('perawat.form-observasi');
    Route::post('/perawat/observasi/{idAntrean}', [ObservasiController::class, 'kirimDataObservasi'])->name('perawat.observasi.store');
    Route::get('/perawat/observasi/{idObservasi}', [ObservasiController::class, 'getDataObservasi'])->name('perawat.observasi.show');
    Route::put('/perawat/observasi/{idObservasi}', [ObservasiController::class, 'perbaruiObservasi'])->name('perawat.observasi.update');
});

// Layanan Dokter (terisolasi per dokter/poli)
Route::middleware(RoleSession::class.':dokter')->group(function () {
    Route::get('/dokter/antrean-periksa', [RMEController::class, 'antreanPeriksa'])->name('dokter.antrean-periksa');
    Route::post('/dokter/antrean-periksa/{idAntrean}/panggil', [RMEController::class, 'panggilPasien'])->name('dokter.antrean-periksa.panggil');
    Route::get('/dokter/jadwal-saya', [PenjadwalanController::class, 'ambilJadwalHarian'])->name('dokter.jadwal-saya');
    Route::post('/dokter/jadwal-saya/slot', [PenjadwalanController::class, 'tambahSlot'])->name('dokter.jadwal-saya.slot.store');
    Route::put('/dokter/jadwal-saya/slot/{idSlot}', [PenjadwalanController::class, 'ubahSlot'])->name('dokter.jadwal-saya.slot.update');
    Route::delete('/dokter/jadwal-saya/slot/{idSlot}', [PenjadwalanController::class, 'hapusSlot'])->name('dokter.jadwal-saya.slot.destroy');
    Route::get('/dokter/riwayat-medis', [RMEController::class, 'daftarRiwayatMedis'])->name('dokter.riwayat-medis.index');
    Route::get('/dokter/riwayat-medis/{idPasien}', [RMEController::class, 'requestRiwayatMedis'])->name('dokter.riwayat-medis');
    Route::get('/dokter/form-diagnosis/{antrean}', [DiagnosisController::class, 'form'])->name('dokter.form-diagnosis');
    Route::post('/dokter/diagnosis/{idPemeriksaan}', [DiagnosisController::class, 'store'])->name('dokter.diagnosis.store');
    Route::get('/dokter/form-eresep/{antrean}', [EResepController::class, 'formEResep'])->name('dokter.form-eresep');
    Route::post('/dokter/e-resep', [EResepController::class, 'store'])->name('dokter.eresep.store');
    Route::put('/dokter/e-resep/{idEResep}', [EResepController::class, 'update'])->name('dokter.eresep.update');
});

// Pelayanan Farmasi / Apoteker
Route::middleware(RoleSession::class.':apoteker')->group(function () {
    Route::get('/apoteker/notifikasi-eresep', [EResepController::class, 'daftarNotifikasi'])->name('apoteker.notifikasi-eresep');
    Route::get('/apoteker/rincian-eresep/{eresep}', [EResepController::class, 'halamanRincian'])->name('apoteker.rincian-eresep');
    Route::post('/apoteker/e-resep/{idEResep}/status', [EResepController::class, 'updateStatusHttp'])->name('apoteker.eresep.status');
    Route::get('/apoteker/pengiriman-obat/{eresep}', [PengirimanObatController::class, 'halamanPengiriman'])->name('apoteker.pengiriman-obat');
});
