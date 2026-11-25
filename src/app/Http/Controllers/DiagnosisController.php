<?php

namespace App\Http\Controllers;

use App\Models\DataDiagnosis;
use App\Models\DataObservasi;
use App\Models\DataRekamMedis;
use App\Models\DataReservasi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/** Pengendali penyimpanan diagnosis sesuai CD-006. */
class DiagnosisController extends Controller
{
    public function form(Request $request, int $antrean): Response
    {
        $idDokter = (int) $request->session()->get('dokter_id');
        $row = DataReservasi::konteksPemeriksaan($antrean, $idDokter);
        abort_if(! $row, 404, 'Antrean pemeriksaan tidak ditemukan pada jadwal Anda.');

        $tersimpan = DataDiagnosis::where('id_antrean', $antrean)->orderByDesc('id_diagnosis')->first(['nama_diagnosis', 'rencana_tindakan']);
        abort_unless($tersimpan || $row->status_antrean === 'dipanggil', 409, 'Panggil pasien setelah triase sebelum membuka formulir.');
        $observasi = DataObservasi::ambilTerbaruUntukAntrean($antrean)?->toArray() ?? [];
        $riwayat = DataRekamMedis::ambilRiwayatDanAlergi((int) $row->id_pasien) ?? [];

        return Inertia::render('Dokter/FormDiagnosis', [
            'antreanId' => (int) $row->id_antrean,
            'diagnosisTersimpan' => $tersimpan,
            'pasienServer' => [
                'id' => (int) $row->id_pasien,
                'rm' => 'RM-'.str_pad((string) $row->id_pasien, 6, '0', STR_PAD_LEFT),
                'nama' => $row->nama_lengkap,
                'nik' => $row->nik,
                'umur' => $row->tanggal_lahir ? (int) \Carbon\Carbon::parse($row->tanggal_lahir)->age : null,
                'jk' => $row->jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki',
                'golonganDarah' => $row->golongan_darah,
                'poli' => $row->nama_poli,
                'antrean' => 'A-'.str_pad((string) $row->nomor_antrean, 3, '0', STR_PAD_LEFT),
                'waktu' => $row->tanggal_antrean,
                'tekananDarah' => $observasi['tekanan_darah'] ?? null,
                'suhu' => $observasi['suhu'] ?? null,
                'berat' => $observasi['berat_badan'] ?? null,
                'alergi' => $riwayat['alergi'] ?? null,
            ],
        ]);
    }

    public function store(Request $request, int $idPemeriksaan): RedirectResponse
    {
        $data = $request->validate([
            'namaDiagnosis' => ['required', 'string', 'max:255'],
            'rencanaTindakan' => ['required', 'string'],
        ]);

        return $this->simpanDiagnosis($request, $idPemeriksaan, $data['namaDiagnosis'], $data['rencanaTindakan']);
    }

    public function simpanDiagnosis(Request $request, int $idPemeriksaan, string $namaDiagnosis, string $rencanaTindakan): RedirectResponse
    {
        $idDokterSession = (int) $request->session()->get('dokter_id');
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
        if (! $idDokter || (int) $idDokter !== $idDokterSession) {
            abort(403, 'Anda tidak berwenang mengisi diagnosis untuk antrean dokter/poli lain.');
        }

        $dataDiagnosis['id_dokter'] = $idDokter;
        DataDiagnosis::simpanDiagnosis($dataDiagnosis);

        return back()->with('success', 'Diagnosis berhasil disimpan.');
    }

    private function validasiForm(array $dataDiagnosis): bool
    {
        return trim((string) ($dataDiagnosis['nama_diagnosis'] ?? '')) !== ''
            && trim((string) ($dataDiagnosis['rencana_tindakan'] ?? '')) !== '';
    }
}
