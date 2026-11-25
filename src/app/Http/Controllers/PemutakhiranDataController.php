<?php

namespace App\Http\Controllers;

use App\Models\DataPasien;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/** Pemutakhiran profil pasien sesuai Class Diagram (batas 1x per 365 hari). */
class PemutakhiranDataController extends Controller
{
    public function requestEdit(Request $request): Response
    {
        $pasien = DataPasien::query()->whereKey((int) $request->session()->get('pasien_id'))->firstOrFail();

        $riwayat = DB::table('reservasi as r')
            ->join('dokter as d', 'd.id_dokter', '=', 'r.id_dokter')
            ->join('poli as p', 'p.id_poli', '=', 'd.id_poli')
            ->leftJoin('antrean as a', 'a.id_reservasi', '=', 'r.id_reservasi')
            ->leftJoin('diagnosis as dg', 'dg.id_antrean', '=', 'a.id_antrean')
            ->where('r.id_pasien', $pasien->id_pasien)
            ->where('r.status_reservasi', 'selesai')
            ->orderByDesc('r.tanggal')
            ->limit(4)
            ->select('r.id_reservasi', 'r.tanggal', 'r.status_reservasi', 'd.nama_dokter', 'p.nama_poli', 'dg.nama_diagnosis')
            ->get();

        $terakhir = DataPasien::getTanggalUpdateTerakhir($pasien->id_pasien);
        $tersedia = $terakhir?->copy()->addDays(365);

        return Inertia::render('Pasien/Profil', [
            'pasien' => $pasien->makeVisible(['nik']),
            'riwayat' => $riwayat,
            'konfirmasi' => $request->boolean('konfirmasi') && DataPasien::perluKonfirmasiProfil($pasien->id_pasien),
            'infoPembaruan' => [
                'lastUpdatedAt' => $terakhir?->toIso8601String(),
                'lastUpdatedFormatted' => $terakhir?->format('d-m-Y'),
                'nextAvailableAt' => $tersedia?->toIso8601String(),
                'canUpdate' => $this->validasiUsiaEdit($terakhir),
                'daysElapsed' => $terakhir ? max(0, (int) $terakhir->diffInDays(now())) : null,
            ],
        ]);
    }

    private function validasiUsiaEdit(?Carbon $tglUpdate): bool
    {
        if (! $tglUpdate) {
            return true;
        }

        return ! $tglUpdate->copy()->addDays(365)->isFuture();
    }

    public function simpanPerubahanData(Request $request): RedirectResponse
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

        $idPasien = (int) $request->session()->get('pasien_id');

        $result = DB::transaction(function () use ($idPasien, $data) {
            DataPasien::query()->whereKey($idPasien)->lockForUpdate()->firstOrFail();
            $terakhir = DataPasien::getTanggalUpdateTerakhir($idPasien);

            if (! $this->validasiUsiaEdit($terakhir)) {
                $daysElapsed = max(0, (int) $terakhir->diffInDays(now()));

                return [
                    'status' => 'blocked',
                    'lastUpdatedFormatted' => $terakhir->format('d-m-Y'),
                    'daysElapsed' => $daysElapsed,
                    'nextAvailableAt' => $terakhir->copy()->addDays(365)->toIso8601String(),
                ];
            }

            if (! DataPasien::updateDataPasien($idPasien, $data)) {
                throw ValidationException::withMessages(['pemutakhiran' => 'Profil pasien tidak berhasil diperbarui.']);
            }

            DB::table('users')->where('id', request()->session()->get('user_id'))->update(['name' => $data['nama_lengkap']]);

            return [
                'status' => 'success',
                'lastUpdatedFormatted' => now()->format('d-m-Y'),
                'daysElapsed' => 0,
                'nextAvailableAt' => now()->addDays(365)->toIso8601String(),
            ];
        });

        if ($result['status'] === 'blocked') {
            return back()
                ->withErrors(['pemutakhiran' => 'Pemutakhiran data pasien hanya dapat dilakukan satu kali setiap 365 hari.'])
                ->with('profileUpdateResult', $result);
        }

        if ($request->boolean('lanjutReservasi')) {
            return redirect()->route('pasien.penjadwalan-poli')->with('success', 'Data kontak telah dikonfirmasi. Pilih jadwal kunjungan Anda.');
        }
        return back()
            ->with('success', 'Profil pasien berhasil diperbarui.')
            ->with('profileUpdateResult', $result);
    }
}
