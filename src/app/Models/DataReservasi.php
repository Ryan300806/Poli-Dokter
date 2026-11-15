<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/** Entitas reservasi dan pengambilan antrean triage sesuai CD-007. */
class DataReservasi extends Model
{
    protected $table = 'reservasi';
    protected $primaryKey = 'id_reservasi';
    public $timestamps = false;

    public static function ambilAntreanTriage(string $tanggal): array
    {
        return DB::table('reservasi as r')
            ->join('antrean as a', 'a.id_reservasi', '=', 'r.id_reservasi')
            ->join('pasien as p', 'p.id_pasien', '=', 'r.id_pasien')
            ->leftJoin('observasi as o', function ($join) {
                $join->on('o.id_antrean', '=', 'a.id_antrean')->whereRaw('o.waktu_observasi = (select max(o2.waktu_observasi) from observasi o2 where o2.id_antrean = a.id_antrean)');
            })
            ->whereDate('r.tanggal', $tanggal)
            ->whereIn('a.status_antrean', ['menunggu', 'dipanggil', 'triage_selesai'])
            ->orderBy('a.tanggal_antrean')
            ->get([
                'r.id_reservasi', 'r.id_pasien', 'r.id_dokter', 'r.id_slot', 'r.tanggal', 'r.nomor_antrean',
                'r.status_reservasi', 'a.id_antrean', 'a.status_antrean', 'p.nik', 'p.nama_lengkap',
                'p.jenis_kelamin', 'p.tanggal_lahir', 'o.id_observasi', 'o.tekanan_darah', 'o.suhu', 'o.berat_badan',
            ])->map(fn ($row) => (array) $row)->all();
    }
}
