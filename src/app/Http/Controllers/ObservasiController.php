<?php

namespace App\Http\Controllers;

use App\Models\DataObservasi;
use App\Models\DataPasien;
use App\Models\DataReservasi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/** Pengendali antrean triage & observasi awal perawat sesuai CD-007. */
class ObservasiController extends Controller
{
    public function getAntreanTriage(): Response
    {
        $rows = collect(DataReservasi::ambilAntreanTriage(today()->toDateString()))->map(function ($row) {
            $item = (object) $row;
            $umur = $item->tanggal_lahir ? (int) now()->diffInYears($item->tanggal_lahir) : null;

            return [
                'id' => (string) $item->id_antrean,
                'idReservasi' => (string) $item->id_reservasi,
                'no' => 'T-'.str_pad((string) $item->nomor_antrean, 2, '0', STR_PAD_LEFT),
                'jam' => substr((string) $item->jam, 0, 5),
                'rm' => 'RM-'.str_pad((string) $item->id_pasien, 6, '0', STR_PAD_LEFT),
                'nik' => $item->nik,
                'nama' => $item->nama_lengkap,
                'jk' => $item->jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki',
                'umur' => $umur ?? '—',
                'poli' => $item->nama_poli,
                'kategori' => $umur !== null ? ($umur >= 60 ? 'Geriatri' : ($umur < 12 ? 'Pediatri' : 'Umum')) : 'Umum',
                'status' => $item->id_observasi ? 'Triage Selesai' : 'Belum Diukur',
                'id_observasi' => $item->id_observasi,
                'tekanan_darah' => $item->tekanan_darah,
                'suhu' => $item->suhu,
                'berat_badan' => $item->berat_badan,
            ];
        });

        return Inertia::render('Perawat/AntreanTriage', ['antrean' => $rows]);
    }

    public function getDataPasien(int $idReservasi): Response
    {
        $reservasi = DataReservasi::getAntreanUntukObservasi($idReservasi);
        abort_if(! $reservasi, 404);

        $pasien = DataPasien::ambilDataPasien((int) $reservasi->id_pasien);
        $observasi = DataObservasi::ambilTerbaruUntukAntrean((int) $reservasi->id_antrean);
        $td = $observasi?->tekanan_darah ? explode('/', $observasi->tekanan_darah) : ['', ''];

        return Inertia::render('Perawat/FormObservasi', [
            'antreanId' => (string) $reservasi->id_antrean,
            'pasien' => [
                'id' => (string) $reservasi->id_antrean,
                'nama' => $pasien['nama_lengkap'],
                'nik' => $pasien['nik'],
                'jk' => $pasien['jenis_kelamin'] === 'P' ? 'Perempuan' : 'Laki-laki',
                'umur' => $pasien['tanggal_lahir'] ? (int) now()->diffInYears($pasien['tanggal_lahir']) : '—',
                'rm' => 'RM-'.str_pad((string) $pasien['id_pasien'], 6, '0', STR_PAD_LEFT),
                'poli' => $reservasi->nama_poli ?? '—',
                'no' => 'A-'.str_pad((string) $reservasi->nomor_antrean, 3, '0', STR_PAD_LEFT),
                'tdSis' => $td[0] ?? '',
                'tdDia' => $td[1] ?? '',
                'suhu' => $observasi->suhu ?? '',
                'berat' => $observasi->berat_badan ?? '',
            ],
            'observasi' => $observasi ? (array) $observasi : null,
        ]);
    }

    public function kirimDataObservasi(Request $request, int $idAntrean): RedirectResponse
    {
        $data = $this->validasiForm($request);
        abort_unless(DataReservasi::antreanTersedia($idAntrean), 404);

        $idPerawat = $request->session()->get('perawat_id');
        DataObservasi::simpanUntukAntrean(
            $idAntrean,
            $data['tekananDarah'],
            (float) $data['suhu'],
            (float) $data['beratBadan'],
            $idPerawat ? (int) $idPerawat : null
        );

        return redirect()->route('perawat.antrean-triage')->with('success', 'Data observasi triage berhasil disimpan.');
    }

    public function getDataObservasi(int $idObservasi): array
    {
        return DataObservasi::ambilDataObservasi($idObservasi) ?? abort(404);
    }

    public function perbaruiObservasi(Request $request, int $idObservasi): RedirectResponse
    {
        $data = $this->validasiForm($request);
        $updated = DataObservasi::updateDataObservasi($idObservasi, [
            'tekanan_darah' => $data['tekananDarah'],
            'suhu' => $data['suhu'],
            'berat_badan' => $data['beratBadan'],
        ]);
        abort_if(! $updated, 404);

        return redirect()->route('perawat.antrean-triage')->with('success', 'Data observasi berhasil diperbarui.');
    }

    private function validasiForm(Request $request): array
    {
        $data = $request->validate([
            'tekananDarah' => ['required', 'regex:/^\d{2,3}\/\d{2,3}$/'],
            'suhu' => ['required', 'numeric', 'between:30,45'],
            'beratBadan' => ['required', 'numeric', 'gt:0', 'max:500'],
        ]);

        if (! $this->validasiData($data['tekananDarah'], (float) $data['suhu'], (float) $data['beratBadan'])) {
            throw ValidationException::withMessages(['tekananDarah' => 'Nilai sistolik (50–250) atau diastolik (30–150) tidak valid.']);
        }

        return $data;
    }

    private function validasiData(string $tekananDarah, float $suhu, float $beratBadan): bool
    {
        if (preg_match('/^(\d{2,3})\/(\d{2,3})$/', $tekananDarah, $m) !== 1) {
            return false;
        }
        $sis = (int) $m[1];
        $dia = (int) $m[2];

        return $sis >= 50 && $sis <= 250 && $dia >= 30 && $dia <= 150 && $suhu >= 30 && $suhu <= 45 && $beratBadan > 0;
    }
}
