<?php

namespace App\Http\Controllers\Dokter;

use App\Http\Controllers\Controller;
use App\Models\DataPasien;
use App\Models\DataObservasi;
use App\Models\DataRekamMedis;
use App\Models\DataReservasi;
use Inertia\Inertia;
use Inertia\Response;

/** Pengendali layar antrean periksa dan permintaan riwayat medis pada CD-006. */
class RMEController extends Controller
{
    public function daftarRiwayatMedis(): Response
    {
        $pasien = DataRekamMedis::daftarPasienDenganRingkasan()->map(fn ($item) => [
                'id' => (string) $item->id_pasien,
                'nama' => $item->nama_lengkap,
                'rm' => (string) $item->id_pasien,
                'jaminan' => null,
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
        $antrean = collect(DataReservasi::antreanPemeriksaanHariIni())->map(function ($item) {
            $item = (object) $item;
            $triage = DataObservasi::ambilTerbaruUntukAntrean((int) $item->id_antrean)?->toArray() ?? [];
            return [
            'id' => (int) $item->id_antrean,
            'pasienId' => (int) $item->id_pasien,
            'no' => (string) $item->nomor_antrean,
            'jam' => substr((string) $item->jam, 0, 5),
            'keterangan' => $item->status_antrean,
            'rm' => (string) $item->id_pasien,
            'nama' => $item->nama_lengkap,
            'jk' => $item->jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki',
            'umur' => $item->tanggal_lahir ? now()->diffInYears($item->tanggal_lahir) : null,
            'status' => $item->status_antrean === 'dipanggil' ? 'sedang' : 'menunggu',
            'triage' => $triage ? ['td' => $triage['tekanan_darah'], 'suhu' => $triage['suhu']] : null,
            'nik' => $item->nik,
            ];
        });

        return Inertia::render('Dokter/AntreanPeriksa', ['antrean' => $antrean]);
    }

    public function panggilPasien(int $idAntrean): \Illuminate\Http\RedirectResponse
    {
        abort_unless(DataReservasi::panggilAntrean($idAntrean), 404, 'Antrean tidak ditemukan atau tidak dapat dipanggil.');

        return back()->with('success', 'Status antrean pasien diperbarui.');
    }

    public function requestRiwayatMedis(\Illuminate\Http\Request $request, int $idPasien): Response
    {
        $pasien = DataPasien::query()->whereKey($idPasien)->firstOrFail();
        $riwayat = DataRekamMedis::ambilRiwayatDanAlergi($idPasien)
            ?? ['id_pasien' => $idPasien, 'riwayat_penyakit' => 'Nihil', 'alergi' => '-'];
        $idAntrean = $request->integer('antreanId') ?: null;
        $antrean = $idAntrean ? DataReservasi::konteksPemeriksaan($idAntrean) : null;
        abort_if($idAntrean && (! $antrean || (int) $antrean->id_pasien !== $idPasien), 404);
        $triage = $idAntrean
            ? (DataObservasi::ambilTerbaruUntukAntrean($idAntrean)?->toArray() ?? [])
            : DataObservasi::ambilTriageTerbaru($idPasien);

        return Inertia::render('Dokter/RiwayatMedis', [
            'antreanId' => $antrean->id_antrean ?? $triage['id_antrean'] ?? null,
            'pasien' => $pasien->only([
                'id_pasien', 'nik', 'nama_lengkap', 'tempat_lahir', 'tanggal_lahir',
                'jenis_kelamin', 'golongan_darah', 'kontak_darurat',
            ]),
            'riwayatMedis' => $riwayat,
            'triageTerbaru' => $triage,
        ]);
    }
}
