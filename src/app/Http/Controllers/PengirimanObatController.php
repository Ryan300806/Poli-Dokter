<?php

namespace App\Http\Controllers;

use App\Models\EResep;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/** Pengendali penyerahan obat apoteker sesuai Class Diagram PengirimanObatController. */
class PengirimanObatController extends Controller
{
    public function getInfoEresep(int $idEResep): array
    {
        $resep = EResep::getEResep($idEResep);
        abort_if($resep === null, 404);

        $pasien = DB::table('pasien')->where('id_pasien', $resep['id_pasien'])->first(['id_pasien', 'nama_lengkap', 'nik', 'tanggal_lahir']);
        $dokter = DB::table('diagnosis as dg')
            ->join('dokter as d', 'd.id_dokter', '=', 'dg.id_dokter')
            ->leftJoin('poli as po', 'po.id_poli', '=', 'd.id_poli')
            ->where('dg.id_diagnosis', $resep['id_diagnosis'])
            ->first(['d.nama_dokter', 'po.nama_poli']);

        return [
            ...$resep,
            'id' => (string) $resep['id_e_resep'],
            'rm' => 'RM-'.str_pad((string) ($pasien->id_pasien ?? 0), 6, '0', STR_PAD_LEFT),
            'pasien' => $pasien->nama_lengkap ?? null,
            'id_pasien' => $pasien->id_pasien ?? null,
            'nik' => $pasien->nik ?? null,
            'tanggal_lahir' => $pasien->tanggal_lahir ?? null,
            'dokter' => $dokter->nama_dokter ?? '—',
            'poli' => $dokter->nama_poli ?? '—',
            'tanggal' => $resep['waktu_kirim'],
            'items' => array_map(fn ($obat) => [
                ...$obat, 'nama' => $obat['nama_obat'], 'satuan' => $obat['jumlah_obat'], 'aturan' => $obat['aturan_pakai'],
            ], $resep['daftar_obat']),
            'status' => EResep::LABEL[$resep['status_e_resep']] ?? $resep['status_e_resep'],
        ];
    }

    public function halamanPengiriman(int $idEResep): Response
    {
        $resep = $this->getInfoEresep($idEResep);
        abort_unless(in_array($resep['status_e_resep'], ['siap_diserahkan', 'selesai'], true), 409, 'Selesaikan penyiapan obat terlebih dahulu.');
        return Inertia::render('Apoteker/PengirimanObat', [
            'eresepId' => (string) $idEResep,
            'eresepServer' => $resep,
        ]);
    }
}
