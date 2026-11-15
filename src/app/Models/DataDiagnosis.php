<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Entitas diagnosis dan penyimpanan diagnosis pemeriksaan. */
class DataDiagnosis extends Model
{
    protected $table = 'diagnosis';

    protected $primaryKey = 'id_diagnosis';

    public $timestamps = false;

    protected $fillable = ['id_antrean', 'id_dokter', 'nama_diagnosis', 'rencana_tindakan', 'status_pemeriksaan'];

    public static function simpanDiagnosis(array $dataDiagnosis): array
    {
        $diagnosis = static::query()->create($dataDiagnosis);

        return $diagnosis->only([
            'id_diagnosis',
            'id_antrean',
            'id_dokter',
            'nama_diagnosis',
            'rencana_tindakan',
            'status_pemeriksaan',
        ]);
    }
}
