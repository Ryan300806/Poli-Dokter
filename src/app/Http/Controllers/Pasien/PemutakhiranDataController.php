<?php

namespace App\Http\Controllers\Pasien;

use App\Http\Controllers\Controller;
use App\Models\DataPasien;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/** Menampilkan dan menyimpan pemutakhiran profil sesuai diagram. */
class PemutakhiranDataController extends Controller
{
    public function requestEdit(Request $request): Response
    {
        $pasien = DataPasien::query()->whereKey((int) $request->session()->get('pasien_id'))->firstOrFail();
        $riwayat = DB::table('reservasi as r')->join('dokter as d', 'd.id_dokter', '=', 'r.id_dokter')
            ->join('poli as p', 'p.id_poli', '=', 'd.id_poli')->where('r.id_pasien', $pasien->id_pasien)
            ->where('r.status_reservasi', 'selesai')->orderByDesc('r.tanggal')->limit(4)
            ->select('r.id_reservasi', 'r.tanggal', 'r.status_reservasi', 'd.nama_dokter', 'p.nama_poli')->get();
        $terakhir = DataPasien::getTanggalUpdateTerakhir($pasien->id_pasien);
        $tersedia = $terakhir?->copy()->addDays(365);

        return Inertia::render('Pasien/Profil', [
            'pasien' => $pasien,
            'riwayat' => $riwayat,
            'infoPembaruan' => [
                'lastUpdatedAt' => $terakhir?->toIso8601String(),
                'nextAvailableAt' => $tersedia?->toIso8601String(),
                'canUpdate' => ! $tersedia || ! $tersedia->isFuture(),
                'daysElapsed' => $terakhir ? max(0, (int) $terakhir->diffInDays(now())) : null,
            ],
        ]);
    }

    public function validasiEdit(array $dataUpdate): bool
    {
        return isset($dataUpdate['nama_lengkap'], $dataUpdate['tempat_lahir'], $dataUpdate['tanggal_lahir'], $dataUpdate['alamat'], $dataUpdate['jenis_kelamin'], $dataUpdate['kontak_darurat'], $dataUpdate['nama_kontak_darurat'])
            && trim($dataUpdate['nama_lengkap']) !== ''
            && in_array($dataUpdate['jenis_kelamin'], ['L', 'P'], true);
    }

    public function simpanPerubahanData(Request $request, ?int $idPasien = null): RedirectResponse
    {
        $data = $request->validate([
            'nama_lengkap' => ['required', 'string', 'max:100'],
            'tempat_lahir' => ['required', 'string', 'max:50'],
            'tanggal_lahir' => ['required', 'date', 'before_or_equal:today'],
            'alamat' => ['required', 'string', 'max:255'],
            'jenis_kelamin' => ['required', 'in:L,P'],
            'golongan_darah' => ['nullable', 'in:A+,A-,B+,B-,AB+,AB-,O+,O-'],
            'kontak_darurat' => ['required', 'string', 'max:20'],
            'nama_kontak_darurat' => ['required', 'string', 'max:100'],
        ]);
        if (! $this->validasiEdit($data)) {
            throw ValidationException::withMessages(['pemutakhiran' => 'Data pemutakhiran tidak valid.']);
        }

        $idPasien ??= (int) $request->session()->get('pasien_id');
        $result = DB::transaction(function () use ($idPasien, $data) {
            $pasien = DataPasien::query()->whereKey($idPasien)->lockForUpdate()->firstOrFail();
            $terakhir = DataPasien::getTanggalUpdateTerakhir($idPasien);
            $tersedia = $terakhir?->copy()->addDays(365);
            if ($tersedia && $tersedia->isFuture()) {
                return ['blocked' => true, 'lastUpdatedAt' => $terakhir->toIso8601String(), 'nextAvailableAt' => $tersedia->toIso8601String(),
                    'daysElapsed' => max(0, (int) $terakhir->diffInDays(now())), 'intervalLabel' => max(0, (int) $terakhir->diffInDays(now())) . ' hari'];
            }
            if (! DataPasien::updateDataPasien($idPasien, $data)) {
                throw ValidationException::withMessages(['pemutakhiran' => 'Profil pasien tidak berhasil diperbarui.']);
            }
            return ['blocked' => false, 'lastUpdatedAt' => now()->toIso8601String(), 'nextAvailableAt' => now()->addDays(365)->toIso8601String(), 'daysElapsed' => 0, 'intervalLabel' => '0 hari'];
        });

        if ($result['blocked']) {
            return back()->withErrors(['pemutakhiran' => 'Pemutakhiran data pasien hanya dapat dilakukan satu kali setiap 365 hari.'])
                ->with('profileUpdateResult', $result);
        }
        return back()->with('success', 'Profil pasien berhasil diperbarui.')->with('profileUpdateResult', $result);
    }
}
