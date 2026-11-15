<?php

namespace App\Http\Controllers\Perawat;

use App\Http\Controllers\Controller;
use App\Models\DataObservasi;
use App\Models\DataPasien;
use App\Models\DataReservasi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/** Pengendali antrean triage dan data observasi sesuai CD-007. */
class ObservasiController extends Controller
{
    public function getAntreanTriage(): Response
    {
        $rows = collect(DataReservasi::ambilAntreanTriage(today()->toDateString()))->map(function ($row) {
            $item = (object) $row;
            return [
                'id' => (string) $item->id_antrean, 'idReservasi' => (string) $item->id_reservasi,
                'no' => 'T-' . str_pad((string) $item->nomor_antrean, 2, '0', STR_PAD_LEFT),
                'jam' => $item->tanggal, 'tunggu' => '—',
                'rm' => 'P-' . str_pad((string) $item->id_pasien, 4, '0', STR_PAD_LEFT),
                'nik' => $item->nik, 'nama' => $item->nama_lengkap,
                'jk' => $item->jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki',
                'umur' => $item->tanggal_lahir ? now()->diffInYears($item->tanggal_lahir) : '—',
                'jaminan' => '—', 'poli' => 'Rawat Jalan', 'kategori' => 'Umum',
                'status' => $item->id_observasi ? 'Triage Selesai' : 'Belum Diukur',
                'keluhan' => 'Belum ada catatan keluhan pada skema observasi.',
                'id_observasi' => $item->id_observasi,
                'tekanan_darah' => $item->tekanan_darah, 'suhu' => $item->suhu, 'berat_badan' => $item->berat_badan,
            ];
        });

        return Inertia::render('Perawat/AntreanTriage', ['antrean' => $rows]);
    }

    /** Reservasi dipetakan ke antrean terkait untuk membaca observasi. */
    public function getDataPasien(int $idReservasi): Response
    {
        $reservasi = DB::table('reservasi as r')->join('antrean as a', 'a.id_reservasi', '=', 'r.id_reservasi')
            ->where('r.id_reservasi', $idReservasi)->first(['r.id_pasien', 'a.id_antrean']);
        abort_if(! $reservasi, 404);
        $pasien = DataPasien::ambilDataPasien((int) $reservasi->id_pasien);
        $observasi = DB::table('observasi')->where('id_antrean', $reservasi->id_antrean)->orderByDesc('waktu_observasi')->first();
        $td = $observasi?->tekanan_darah ? explode('/', $observasi->tekanan_darah) : ['', ''];

        return Inertia::render('Perawat/FormObservasi', [
            'antreanId' => (string) $reservasi->id_antrean,
            'pasien' => [
                'id' => (string) $reservasi->id_antrean, 'nama' => $pasien['nama_lengkap'], 'nik' => $pasien['nik'],
                'jk' => $pasien['jenis_kelamin'] === 'P' ? 'Perempuan' : 'Laki-laki',
                'umur' => $pasien['tanggal_lahir'] ? now()->diffInYears($pasien['tanggal_lahir']) : '—',
                'rm' => 'P-' . str_pad((string) $pasien['id_pasien'], 4, '0', STR_PAD_LEFT), 'jaminan' => '—',
                'poli' => 'Rawat Jalan', 'no' => 'T-' . str_pad((string) $reservasi->id_antrean, 2, '0', STR_PAD_LEFT),
                'keluhan' => '', 'tdSis' => $td[0] ?? '', 'tdDia' => $td[1] ?? '',
                'suhu' => $observasi->suhu ?? '', 'berat' => $observasi->berat_badan ?? '',
                'tinggi' => '', 'spo2' => '', 'nadi' => '', 'respirasi' => '', 'gcs' => 'Compos Mentis (GCS 15: E4V5M6)',
            ],
            'observasi' => $observasi ? (array) $observasi : null,
        ]);
    }

    public function kirimDataObservasi(Request $request, int $idAntrean): RedirectResponse
    {
        $data = $this->validasiForm($request);
        abort_unless(DB::table('antrean')->where('id_antrean', $idAntrean)->exists(), 404);
        DataObservasi::simpanUntukAntrean($idAntrean, $data['tekananDarah'], (float) $data['suhu'], (float) $data['beratBadan']);

        return back()->with('success', 'Data observasi berhasil disimpan.');
    }

    public function getDataObservasi(int $idObservasi): array
    {
        return DataObservasi::ambilDataObservasi($idObservasi) ?? abort(404);
    }

    public function perbaruiObservasi(Request $request, int $idObservasi): RedirectResponse
    {
        $data = $this->validasiForm($request);
        $updated = DataObservasi::updateDataObservasi($idObservasi, [
            'tekanan_darah' => $data['tekananDarah'], 'suhu' => $data['suhu'], 'berat_badan' => $data['beratBadan'],
        ]);
        abort_if(! $updated, 404);

        return back()->with('success', 'Data observasi berhasil diperbarui.');
    }

    private function validasiForm(Request $request): array
    {
        $data = $request->validate([
            'tekananDarah' => ['required', 'regex:/^\d{2,3}\/\d{2,3}$/'],
            'suhu' => ['required', 'numeric', 'between:30,45'],
            'beratBadan' => ['required', 'numeric', 'gt:0', 'max:500'],
        ]);
        if (! $this->validasiDataObservasi($data['tekananDarah'], (float) $data['suhu'], (float) $data['beratBadan'])) {
            throw ValidationException::withMessages(['tekananDarah' => 'Data tekanan darah, suhu, atau berat badan tidak valid.']);
        }

        return $data;
    }

    private function validasiDataObservasi(string $tekananDarah, float $suhu, float $beratBadan): bool
    {
        return preg_match('/^\d{2,3}\/\d{2,3}$/', $tekananDarah) === 1 && $suhu >= 30 && $suhu <= 45 && $beratBadan > 0;
    }
}
