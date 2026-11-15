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

    /** Simpan observasi pada antrean tertentu (skema DB mengaitkan observasi ke antrean). */
    public static function simpanUntukAntrean(int $idAntrean, string $tekananDarah, float $suhu, float $beratBadan): bool
    {
        return (bool) static::query()->create([
            'id_antrean' => $idAntrean,
            'tekanan_darah' => $tekananDarah,
            'suhu' => $suhu,
            'berat_badan' => $beratBadan,
            'waktu_observasi' => now(),
        ])->exists;
    }

    /** Operasi diagram: cari antrean terbaru milik pasien lalu simpan observasinya. */
    public static function simpanObservasi(int $idPasien, string $tekananDarah, float $suhu, float $beratBadan): bool
    {
        $idAntrean = DB::table('antrean')->where('id_pasien', $idPasien)
            ->orderByDesc('tanggal_antrean')->value('id_antrean');

        return $idAntrean ? static::simpanUntukAntrean((int) $idAntrean, $tekananDarah, $suhu, $beratBadan) : false;
    }

    public static function ambilDataObservasi(int $idObservasi): ?array
    {
        $observasi = static::query()->whereKey($idObservasi)->first();

        return $observasi?->only(['id_observasi', 'id_antrean', 'tekanan_darah', 'suhu', 'berat_badan', 'waktu_observasi']);
    }

    public static function ambilTerbaruUntukAntrean(int $idAntrean): ?self
    {
        return static::query()->where('id_antrean', $idAntrean)->orderByDesc('waktu_observasi')->first();
    }

    public static function updateDataObservasi(int $idObservasi, array $dataBaru): bool
    {
        return static::query()->whereKey($idObservasi)->update([
            'tekanan_darah' => $dataBaru['tekanan_darah'],
            'suhu' => $dataBaru['suhu'],
            'berat_badan' => $dataBaru['berat_badan'],
        ]) > 0;
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
