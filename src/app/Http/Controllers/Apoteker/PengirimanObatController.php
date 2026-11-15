<?php

namespace App\Http\Controllers\Apoteker;

use App\Http\Controllers\Controller;
use App\Models\EResep;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/** Pengendali pengambilan E-Resep dan status penyerahan sesuai diagram. */
class PengirimanObatController extends Controller
{
    public function getInfoEResep(int $idEResep): array
    {
        $resep = EResep::getEResep($idEResep);
        abort_if($resep === null, 404);

        return [
            ...$resep,
            'nama_pasien' => DB::table('pasien')->where('id_pasien', $resep['id_pasien'])->value('nama_lengkap'),
            'items' => array_map(fn ($obat) => [
                ...$obat, 'nama' => $obat['nama_obat'], 'satuan' => $obat['jumlah_obat'], 'aturan' => $obat['aturan_pakai'],
            ], $resep['daftar_obat']),
            'status' => [
                'terkirim' => 'Menunggu Telaah Resep', 'diproses' => 'Perlu Diracik',
                'siap_diserahkan' => 'Siap Diserahkan', 'ditolak' => 'Ditolak', 'selesai' => 'Obat Sudah Diberikan',
            ][$resep['status_e_resep']] ?? $resep['status_e_resep'],
            'id' => (string) $resep['id_e_resep'],
            'pasien' => DB::table('pasien')->where('id_pasien', $resep['id_pasien'])->value('nama_lengkap'),
            'rm' => 'P-' . str_pad((string) $resep['id_pasien'], 4, '0', STR_PAD_LEFT),
            'dokter' => DB::table('diagnosis as dg')->join('dokter as d', 'd.id_dokter', '=', 'dg.id_dokter')->where('dg.id_diagnosis', $resep['id_diagnosis'])->value('d.nama_dokter'),
            'tanggal' => $resep['waktu_kirim'],
            'jaminan' => '—',
            'dibaca' => true,
        ];
    }

    public function halamanPengiriman(int $idEResep): Response
    {
        return Inertia::render('Apoteker/PengirimanObat', [
            'eresepId' => (string) $idEResep,
            'eresepServer' => $this->getInfoEResep($idEResep),
        ]);
    }
}
