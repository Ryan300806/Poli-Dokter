<?php

namespace App\Http\Controllers\Dokter;

use App\Http\Controllers\Controller;
use App\Models\DataDiagnosis;
use App\Models\DataObservasi;
use App\Models\DataReservasi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/** Pengendali penyimpanan diagnosis sesuai CD-006. */
class DiagnosisController extends Controller
{
    public function form(int $antrean): \Inertia\Response
    {
        $row = DataReservasi::konteksPemeriksaan($antrean);
        abort_if(! $row, 404);
        $observasi = DataObservasi::ambilTerbaruUntukAntrean($antrean);
        $observasi = $observasi ? $observasi->toArray() : [];
        $riwayat = \App\Models\DataRekamMedis::ambilRiwayatDanAlergi((int) $row->id_pasien) ?? [];

        return \Inertia\Inertia::render('Dokter/FormDiagnosis', [
            'antreanId' => (int) $row->id_antrean,
            'pasienServer' => [
                'id' => (int) $row->id_pasien, 'nama' => $row->nama_lengkap, 'nik' => $row->nik,
                'umur' => $row->tanggal_lahir ? now()->diffInYears($row->tanggal_lahir) : null,
                'jk' => $row->jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki',
                'golonganDarah' => $row->golongan_darah, 'poli' => $row->nama_poli,
                'antrean' => $row->nomor_antrean, 'waktu' => $row->tanggal_antrean,
                'tekananDarah' => $observasi['tekanan_darah'] ?? null, 'suhu' => $observasi['suhu'] ?? null,
                'berat' => $observasi['berat_badan'] ?? null, 'alergi' => $riwayat['alergi'] ?? null,
            ],
        ]);
    }

    public function store(Request $request, int $idPemeriksaan): RedirectResponse
    {
        $data = $request->validate([
            'namaDiagnosis' => ['required', 'string', 'max:255'],
            'rencanaTindakan' => ['required', 'string'],
        ]);

        return $this->simpanDiagnosis($idPemeriksaan, $data['namaDiagnosis'], $data['rencanaTindakan']);
    }

    public function simpanDiagnosis(int $idPemeriksaan, string $namaDiagnosis, string $rencanaTindakan): RedirectResponse
    {
        $dataDiagnosis = [
            'id_antrean' => $idPemeriksaan,
            'nama_diagnosis' => trim($namaDiagnosis),
            'rencana_tindakan' => trim($rencanaTindakan),
            'status_pemeriksaan' => 'Selesai',
        ];

        if (! $this->validasiForm($dataDiagnosis)) {
            throw ValidationException::withMessages(['namaDiagnosis' => 'Diagnosis dan rencana tindakan wajib diisi.']);
        }

        $idDokter = DataReservasi::getDokterAntrean($idPemeriksaan);

        if (! $idDokter) {
            throw ValidationException::withMessages(['idPemeriksaan' => 'Antrean pemeriksaan tidak ditemukan atau belum terhubung ke dokter.']);
        }

        $dataDiagnosis['id_dokter'] = (int) $idDokter;

        DataDiagnosis::simpanDiagnosis($dataDiagnosis);

        return back()->with('success', 'Diagnosis berhasil disimpan.');
    }

    private function validasiForm(array $dataDiagnosis): bool
    {
        return trim((string) ($dataDiagnosis['nama_diagnosis'] ?? '')) !== ''
            && trim((string) ($dataDiagnosis['rencana_tindakan'] ?? '')) !== '';
    }
}
