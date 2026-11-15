<?php

// routes/fe/kh.php | Rute halaman FE milik KH (di-load otomatis dari routes/web.php)
// Seluruh rute operasional diarahkan ke controller dan data database.

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Pasien\PortalPasienController;
use App\Http\Controllers\Dokter\DiagnosisController;
use App\Http\Controllers\PenjadwalanController;
use App\Http\Middleware\PasienSession;

// UI-007 KH-IM-001 Penjadwalan Poli
Route::middleware(PasienSession::class)->group(function () {
    Route::get('/pasien/penjadwalan-poli', [PenjadwalanController::class, 'ambilJadwalPoli'])->name('pasien.penjadwalan-poli');
    Route::post('/pasien/reservasi', [PenjadwalanController::class, 'buatReservasi'])->name('pasien.reservasi.store');
    Route::get('/pasien/riwayat-reservasi', [PenjadwalanController::class, 'ambilReservasiAktif'])->name('pasien.riwayat-reservasi');
    Route::get('/pasien/reservasi/{idReservasi}', [PenjadwalanController::class, 'ambilDetailReservasi'])->name('pasien.reservasi.show');
    Route::put('/pasien/reservasi/{idReservasi}/jadwal', [PenjadwalanController::class, 'ubahJadwal'])->name('pasien.reservasi.update');
    Route::delete('/pasien/reservasi/{idReservasi}', [PenjadwalanController::class, 'batalkanReservasi'])->name('pasien.reservasi.destroy');
});

// UI-008 KH-IM-002 Riwayat Reservasi / Tiket Antrean
// UI-009 KH-IM-003 Jadwal Saya Dokter (termasuk pop-up Tambah Slot)
Route::get('/dokter/jadwal-saya/{idDokter?}', [PenjadwalanController::class, 'ambilJadwalHarian'])->name('dokter.jadwal-saya');
Route::post('/dokter/jadwal-saya/slot', [PenjadwalanController::class, 'tambahSlot'])->name('dokter.jadwal-saya.slot.store');
Route::put('/dokter/jadwal-saya/slot/{idSlot}', [PenjadwalanController::class, 'ubahSlot'])->name('dokter.jadwal-saya.slot.update');
Route::delete('/dokter/jadwal-saya/slot/{idSlot}', [PenjadwalanController::class, 'hapusSlot'])->name('dokter.jadwal-saya.slot.destroy');

// UI-011 KH-IM-005 Form Diagnosis
Route::get('/dokter/form-diagnosis/{antrean}', [DiagnosisController::class, 'form'])
    ->name('dokter.form-diagnosis');
Route::post('/dokter/diagnosis/{idPemeriksaan}', [DiagnosisController::class, 'store'])
    ->name('dokter.diagnosis.store');
