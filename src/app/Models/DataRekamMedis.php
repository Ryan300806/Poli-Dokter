<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Entitas DataRekamMedis dan operasi baca pada CD/sequence Modul 2. */
class DataRekamMedis extends Model
{
    protected $table = 'rekam_medis';

    protected $primaryKey = 'id_rekam_medis';

    public $timestamps = false;

    protected $fillable = ['id_pasien', 'riwayat_penyakit', 'alergi'];

    public static function ambilRiwayatDanAlergi(int $idPasien): ?array
    {
        $rekamMedis = static::query()->where('id_pasien', $idPasien)->first();

        return $rekamMedis?->only(['id_rekam_medis', 'id_pasien', 'riwayat_penyakit', 'alergi']);
    }
}
