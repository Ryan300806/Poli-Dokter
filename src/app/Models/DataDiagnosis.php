<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/** Entitas DataDiagnosis sesuai Class Diagram. */
class DataDiagnosis extends Model
{
    protected $table = 'diagnosis';

    protected $primaryKey = 'id_diagnosis';

    public $timestamps = false;

    protected $fillable = ['id_antrean', 'id_dokter', 'nama_diagnosis', 'rencana_tindakan', 'status_pemeriksaan'];

    public static function simpanDiagnosis(array $dataDiagnosis): array
    {
        return DB::transaction(function () use ($dataDiagnosis) {
            $antrean = DB::table('antrean')->where('id_antrean', $dataDiagnosis['id_antrean'])->lockForUpdate()->firstOrFail();
            if ($antrean->status_antrean !== 'dipanggil' || static::where('id_antrean', $antrean->id_antrean)->exists()) {
                throw \Illuminate\Validation\ValidationException::withMessages(['namaDiagnosis' => 'Status pemeriksaan berubah. Periksa kembali antrean atau diagnosis yang sudah tersimpan.']);
            }
            $diagnosis = static::query()->create($dataDiagnosis);

            $idAntrean = (int) $dataDiagnosis['id_antrean'];
            $idReservasi = $antrean->id_reservasi;

            DB::table('antrean')->where('id_antrean', $idAntrean)->update(['status_antrean' => 'selesai']);
            if ($idReservasi) {
                DB::table('reservasi')->where('id_reservasi', $idReservasi)->update(['status_reservasi' => 'selesai']);
            }

            return $diagnosis->only([
                'id_diagnosis',
                'id_antrean',
                'id_dokter',
                'nama_diagnosis',
                'rencana_tindakan',
                'status_pemeriksaan',
            ]);
        });
    }
}
