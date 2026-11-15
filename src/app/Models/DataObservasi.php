<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/** Entitas DataObservasi dengan operasi pembacaan triage terbaru. */
class DataObservasi extends Model
{
    protected $table = 'observasi';

    protected $primaryKey = 'id_observasi';

    public $timestamps = false;

    protected $fillable = ['id_antrean', 'tekanan_darah', 'suhu', 'berat_badan', 'waktu_observasi'];

    public static function ambilTriageTerbaru(int $idPasien): array
    {
        $observasi = DB::table('observasi as o')
            ->join('antrean as a', 'a.id_antrean', '=', 'o.id_antrean')
            ->where('a.id_pasien', $idPasien)
            ->orderByDesc('o.waktu_observasi')
            ->select('o.id_observasi', 'o.id_antrean', 'o.tekanan_darah', 'o.suhu', 'o.berat_badan', 'o.waktu_observasi')
            ->first();

        return $observasi ? (array) $observasi : [];
    }
}
