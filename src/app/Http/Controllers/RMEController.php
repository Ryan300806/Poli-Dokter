<?php

namespace App\Http\Controllers;

use App\Models\DataObservasi;
use App\Models\DataPasien;
use App\Models\DataRekamMedis;
use App\Models\DataReservasi;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/** Pengendali RME & antrean periksa dokter sesuai CD-006 (terisolasi per dokter/poli). */
class RMEController extends Controller
{
    public function antreanPeriksa(Request $request): Response
    {
        $idDokter = (int) $request->session()->get('dokter_id');
        $dokterInfo = DB::table('dokter as d')->join('poli as p', 'p.id_poli', '=', 'd.id_poli')
            ->where('d.id_dokter', $idDokter)->first(['d.nama_dokter', 'p.nama_poli']);

        $antrean = collect(DataReservasi::antreanPemeriksaanHariIni($idDokter))->map(function ($item) {
            $item = (object) $item;
            $triage = DataObservasi::ambilTerbaruUntukAntrean((int) $item->id_antrean)?->toArray() ?? [];
            $diagnosisId = DB::table('diagnosis')->where('id_antrean', $item->id_antrean)->orderByDesc('id_diagnosis')->value('id_diagnosis');
            $eresep = $diagnosisId
                ? DB::table('e_resep')->where('id_diagnosis', $diagnosisId)->orderByDesc('id_e_resep')->first(['id_e_resep', 'status_e_resep'])
                : null;

            return [
                'id' => (int) $item->id_antrean,
                'pasienId' => (int) $item->id_pasien,
                'no' => 'A-'.str_pad((string) $item->nomor_antrean, 3, '0', STR_PAD_LEFT),
                'jam' => substr((string) $item->jam, 0, 5),
                'keterangan' => $item->status_antrean,
                'rm' => 'RM-'.str_pad((string) $item->id_pasien, 6, '0', STR_PAD_LEFT),
                'nama' => $item->nama_lengkap,
                'jk' => $item->jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki',
                'umur' => $item->tanggal_lahir ? (int) now()->diffInYears($item->tanggal_lahir) : null,
                'poli' => $item->nama_poli,
                'status' => match ($item->status_antrean) {
                    'dipanggil' => 'sedang',
                    'selesai' => 'selesai',
                    default => 'menunggu',
                },
                'triageSelesai' => $item->status_antrean === 'triage_selesai' || $triage !== [],
                'triage' => $triage ? ['td' => $triage['tekanan_darah'], 'suhu' => $triage['suhu'], 'berat' => $triage['berat_badan']] : null,
                'nik' => $item->nik,
                'hasDiagnosis' => (bool) $diagnosisId,
                'eresepStatus' => $eresep?->status_e_resep,
            ];
        });

        return Inertia::render('Dokter/AntreanPeriksa', [
            'dokter' => ['nama' => $dokterInfo->nama_dokter ?? 'Dokter', 'poli' => $dokterInfo->nama_poli ?? 'Poli'],
            'antrean' => $antrean,
        ]);
    }

    public function panggilPasien(Request $request, int $idAntrean): RedirectResponse
    {
        $idDokter = (int) $request->session()->get('dokter_id');
        abort_unless(DataReservasi::panggilAntrean($idAntrean, $idDokter), 404, 'Antrean tidak ditemukan pada jadwal Anda.');

        return back()->with('success', 'Pasien dipanggil ke ruang periksa.');
    }

    public function daftarRiwayatMedis(Request $request): Response
    {
        $idDokter = (int) $request->session()->get('dokter_id');
        $pasien = DataRekamMedis::daftarPasienUntukDokter($idDokter)->map(fn ($item) => [
            'id' => (string) $item->id_pasien,
            'nama' => $item->nama_lengkap,
            'rm' => 'RM-'.str_pad((string) $item->id_pasien, 6, '0', STR_PAD_LEFT),
            'nik' => $item->nik,
            'umur' => $item->tanggal_lahir ? (int) now()->diffInYears($item->tanggal_lahir) : '—',
            'tanggalLahir' => $item->tanggal_lahir ?? '—',
            'jk' => $item->jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki',
            'golDarah' => $item->golongan_darah ?? 'Belum tercatat',
            'telepon' => $item->kontak_darurat ?? '—',
            'alergi' => $item->alergi && $item->alergi !== '-' ? [$item->alergi] : ['Tidak ada data alergi'],
            'penyakit' => $item->riwayat_penyakit && $item->riwayat_penyakit !== 'Nihil' ? [$item->riwayat_penyakit] : ['Nihil'],
        ]);

        return Inertia::render('Dokter/RiwayatMedis', ['daftarPasien' => $pasien]);
    }

    public function requestRiwayatMedis(Request $request, int $idPasien): Response
    {
        $idDokter = (int) $request->session()->get('dokter_id');
        $pasien = DataPasien::query()->whereKey($idPasien)->firstOrFail();

        $punyaReservasi = DB::table('reservasi')->where('id_pasien', $idPasien)->where('id_dokter', $idDokter)->exists();
        abort_unless($punyaReservasi, 403, 'Anda tidak memiliki akses ke rekam medis pasien poli/dokter lain.');

        $riwayat = DataRekamMedis::ambilRiwayatDanAlergi($idPasien)
            ?? ['id_pasien' => $idPasien, 'riwayat_penyakit' => 'Nihil', 'alergi' => '-'];

        $idAntrean = $request->integer('antreanId') ?: null;
        $antrean = $idAntrean ? DataReservasi::konteksPemeriksaan($idAntrean, $idDokter) : null;
        abort_if($idAntrean && (! $antrean || (int) $antrean->id_pasien !== $idPasien), 404);

        $triage = $idAntrean
            ? (DataObservasi::ambilTerbaruUntukAntrean($idAntrean)?->toArray() ?? [])
            : DataObservasi::ambilTriageTerbaru($idPasien);

        $riwayatDiagnosis = DB::table('diagnosis as dg')
            ->join('antrean as a', 'a.id_antrean', '=', 'dg.id_antrean')
            ->join('dokter as d', 'd.id_dokter', '=', 'dg.id_dokter')
            ->join('poli as p', 'p.id_poli', '=', 'd.id_poli')
            ->where('a.id_pasien', $idPasien)
            ->orderByDesc('dg.id_diagnosis')
            ->get(['dg.id_diagnosis', 'dg.nama_diagnosis', 'dg.rencana_tindakan', 'dg.status_pemeriksaan', 'a.tanggal_antrean', 'd.nama_dokter', 'p.nama_poli']);

        return Inertia::render('Dokter/RiwayatMedis', [
            'antreanId' => $antrean->id_antrean ?? $triage['id_antrean'] ?? null,
            'pasien' => $pasien->makeVisible(['nik'])->only([
                'id_pasien', 'nik', 'nama_lengkap', 'tempat_lahir', 'tanggal_lahir',
                'jenis_kelamin', 'golongan_darah', 'kontak_darurat',
            ]),
            'riwayatMedis' => $riwayat,
            'triageTerbaru' => $triage,
            'riwayatDiagnosis' => $riwayatDiagnosis,
        ]);
    }
}
