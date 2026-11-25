<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PortalPasienController extends Controller
{
    public function beranda(Request $request): Response
    {
        $idPasien = (int) $request->session()->get('pasien_id');
        $pasien = DB::table('pasien')->where('id_pasien', $idPasien)->firstOrFail(['id_pasien', 'nama_lengkap']);

        $jadwal = DB::table('reservasi as r')
            ->join('dokter as d', 'd.id_dokter', '=', 'r.id_dokter')
            ->join('poli as p', 'p.id_poli', '=', 'd.id_poli')
            ->join('slot_jadwal as s', 's.id_slot', '=', 'r.id_slot')
            ->leftJoin('antrean as a', 'a.id_reservasi', '=', 'r.id_reservasi')
            ->where('r.id_pasien', $idPasien)
            ->whereIn('r.status_reservasi', ['aktif', 'menunggu', 'dikonfirmasi'])
            ->whereDate('r.tanggal', '>=', today())
            ->orderBy('r.tanggal')
            ->orderBy('s.jam')
            ->select(
                'r.id_reservasi', 'r.id_slot', 'r.tanggal', 'r.nomor_antrean', 'r.status_reservasi',
                'd.nama_dokter', 'p.nama_poli', 's.jam', 'a.id_antrean', 'a.status_antrean'
            )
            ->get();

        return Inertia::render('Pasien/Beranda', [
            'pasien' => $pasien,
            'jadwal' => $jadwal,
        ]);
    }
}
