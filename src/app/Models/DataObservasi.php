<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/** Entitas DataObservasi sesuai Class Diagram. */
class DataObservasi extends Model
{
    protected $table = 'observasi';

    protected $primaryKey = 'id_observasi';

    public $timestamps = false;

    protected $fillable = ['id_antrean', 'id_perawat', 'tekanan_darah', 'suhu', 'berat_badan', 'waktu_observasi'];

    public static function simpanUntukAntrean(int $idAntrean, string $tekananDarah, float $suhu, float $beratBadan, ?int $idPerawat = null): bool
    {
        return DB::transaction(function () use ($idAntrean, $tekananDarah, $suhu, $beratBadan, $idPerawat) {
            static::query()->create([
                'id_antrean' => $idAntrean,
                'id_perawat' => $idPerawat,
                'tekanan_darah' => $tekananDarah,
                'suhu' => $suhu,
                'berat_badan' => $beratBadan,
                'waktu_observasi' => now(),
            ]);

            DB::table('antrean')
                ->where('id_antrean', $idAntrean)
                ->where('status_antrean', 'menunggu')
                ->update(['status_antrean' => 'triage_selesai']);

            return true;
        });
    }

    public static function simpanObservasi(int $idPasien, string $tekananDarah, float $suhu, float $beratBadan, ?int $idPerawat = null): bool
    {
        $idAntrean = DB::table('antrean')->where('id_pasien', $idPasien)
            ->orderByDesc('tanggal_antrean')->value('id_antrean');

        return $idAntrean ? static::simpanUntukAntrean((int) $idAntrean, $tekananDarah, $suhu, $beratBadan, $idPerawat) : false;
    }

    public static function ambilDataObservasi(int $idObservasi): ?array
    {
        return static::query()->whereKey($idObservasi)->first()?->only([
            'id_observasi', 'id_antrean', 'id_perawat', 'tekanan_darah', 'suhu', 'berat_badan', 'waktu_observasi',
        ]);
    }

    public static function ambilTerbaruUntukAntrean(int $idAntrean): ?self
    {
        return static::query()->where('id_antrean', $idAntrean)->orderByDesc('waktu_observasi')->first();
    }

    public static function updateDataObservasi(int $idObservasi, array $dataBaru): bool
    {
        return static::query()->whereKey($idObservasi)->update($dataBaru) > 0;
    }

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
