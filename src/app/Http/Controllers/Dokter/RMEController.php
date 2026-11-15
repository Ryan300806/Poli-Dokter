<?php

namespace App\Http\Controllers\Dokter;

use App\Http\Controllers\Controller;
use App\Models\DataPasien;
use App\Models\DataObservasi;
use App\Models\DataRekamMedis;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/** Pengendali layar antrean periksa dan permintaan riwayat medis pada CD-006. */
class RMEController extends Controller
{
    public function daftarRiwayatMedis(): Response
    {
        $pasien = DataPasien::query()
            ->leftJoin('rekam_medis as rm', 'rm.id_pasien', '=', 'pasien.id_pasien')
            ->orderBy('pasien.nama_lengkap')
            ->get([
                'pasien.id_pasien', 'pasien.nama_lengkap', 'pasien.nik', 'pasien.tanggal_lahir',
                'pasien.jenis_kelamin', 'pasien.golongan_darah', 'pasien.kontak_darurat',
                'rm.riwayat_penyakit', 'rm.alergi',
            ])
            ->map(fn ($item) => [
                'id' => (string) $item->id_pasien,
                'nama' => $item->nama_lengkap,
                'foto' => '/images/figma/patient-example.jpeg',
                'rm' => 'P-' . str_pad((string) $item->id_pasien, 4, '0', STR_PAD_LEFT),
                'jaminan' => 'Data penjamin belum tersedia',
                'nik' => $item->nik,
                'rujukan' => '—',
                'umur' => $item->tanggal_lahir ? now()->diffInYears($item->tanggal_lahir) : '—',
                'tanggalLahir' => $item->tanggal_lahir ?? '—',
                'jk' => $item->jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki',
                'golDarah' => $item->golongan_darah ?? 'Belum tercatat',
                'telepon' => $item->kontak_darurat ?? '—',
                'alergi' => $item->alergi && $item->alergi !== '-' ? [$item->alergi] : ['Tidak ada data alergi'],
                'antrean' => '—', 'td' => '—', 'suhu' => '—', 'nadi' => '—', 'respirasi' => '—',
                'spo2' => '—', 'berat' => '—', 'tinggi' => '—',
                'catatanPerawat' => 'Catatan tidak tersedia.', 'keluhan' => 'Keluhan belum tercatat.',
                'penyakit' => $item->riwayat_penyakit && $item->riwayat_penyakit !== 'Nihil' ? [$item->riwayat_penyakit] : ['Nihil'],
                'obatRutin' => 'Data obat rutin belum tersedia.', 'riwayat' => [],
            ]);

        return Inertia::render('Dokter/RiwayatMedis', ['daftarPasien' => $pasien]);
    }

    public function antreanPeriksa(): Response
    {
        $antrean = DB::table('antrean as a')
            ->join('pasien as p', 'p.id_pasien', '=', 'a.id_pasien')
            ->whereIn('a.status_antrean', ['menunggu', 'dipanggil', 'triage_selesai'])
            ->orderBy('a.tanggal_antrean')
            ->select('a.id_antrean', 'a.id_pasien', 'a.tanggal_antrean', 'a.status_antrean', 'p.nama_lengkap', 'p.nik')
            ->get();

        $antrean = $antrean->map(fn ($item) => [
            'id' => (int) $item->id_antrean,
            'pasienId' => (int) $item->id_pasien,
            'no' => 'A-' . str_pad((string) $item->id_antrean, 3, '0', STR_PAD_LEFT),
            'jam' => $item->tanggal_antrean,
            'keterangan' => $item->status_antrean,
            'rm' => 'P-' . str_pad((string) $item->id_pasien, 4, '0', STR_PAD_LEFT),
            'jaminan' => '—',
            'nama' => $item->nama_lengkap,
            'jk' => '—',
            'umur' => '—',
            'status' => $item->status_antrean === 'dipanggil' ? 'sedang' : 'menunggu',
            'triage' => null,
            'nik' => $item->nik,
        ]);

        return Inertia::render('Dokter/AntreanPeriksa', ['antrean' => $antrean]);
    }

    public function requestRiwayatMedis(int $idPasien): Response
    {
        $pasien = DataPasien::query()->whereKey($idPasien)->firstOrFail();
        $riwayat = DataRekamMedis::ambilRiwayatDanAlergi($idPasien)
            ?? ['id_pasien' => $idPasien, 'riwayat_penyakit' => 'Nihil', 'alergi' => '-'];
        $triage = DataObservasi::ambilTriageTerbaru($idPasien);

        return Inertia::render('Dokter/RiwayatMedis', [
            'antreanId' => $triage['id_antrean'] ?? null,
            'pasien' => $pasien->only([
                'id_pasien', 'nik', 'nama_lengkap', 'tempat_lahir', 'tanggal_lahir',
                'jenis_kelamin', 'golongan_darah', 'kontak_darurat',
            ]),
            'riwayatMedis' => $riwayat,
            'triageTerbaru' => $triage,
        ]);
    }
}
