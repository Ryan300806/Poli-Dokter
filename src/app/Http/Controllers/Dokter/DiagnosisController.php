<?php

namespace App\Http\Controllers\Dokter;

use App\Http\Controllers\Controller;
use App\Models\DataDiagnosis;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/** Pengendali penyimpanan diagnosis sesuai CD-006. */
class DiagnosisController extends Controller
{
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

        $idDokter = DB::table('antrean as a')
            ->join('reservasi as r', 'r.id_reservasi', '=', 'a.id_reservasi')
            ->where('a.id_antrean', $idPemeriksaan)
            ->value('r.id_dokter');

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
