<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/** Entitas EResep sesuai atribut dan operasi pada Class Diagram Modul 2. */
class EResep extends Model
{
    protected $table = 'e_resep';

    protected $primaryKey = 'id_e_resep';

    public $timestamps = false;

    protected $fillable = ['id_pasien', 'id_diagnosis', 'status_e_resep', 'waktu_kirim'];

    public static function simpanEResep(array $dataEResep): int
    {
        return DB::transaction(function () use ($dataEResep) {
            $id = static::query()->insertGetId([
                'id_pasien' => $dataEResep['id_pasien'],
                'id_diagnosis' => $dataEResep['id_diagnosis'],
                'status_e_resep' => $dataEResep['status_e_resep'] ?? 'terkirim',
                'waktu_kirim' => $dataEResep['waktu_kirim'] ?? now(),
            ], 'id_e_resep');

            foreach ($dataEResep['daftar_obat'] ?? [] as $obat) {
                DB::table('detail_e_resep')->insert([
                    'id_e_resep' => $id,
                    'id_obat' => $obat['id_obat'],
                    'dosis' => $obat['dosis'],
                    'jumlah_obat' => $obat['jumlah_obat'],
                    'aturan_pakai' => $obat['aturan_pakai'],
                ]);
            }

            return (int) $id;
        });
    }

    public static function getEResep(int $idEResep): ?array
    {
        $resep = static::query()->whereKey($idEResep)->first();
        if (! $resep) {
            return null;
        }

        return [
            ...$resep->only(['id_e_resep', 'id_pasien', 'id_diagnosis', 'status_e_resep', 'waktu_kirim']),
            'daftar_obat' => static::getInformasiObat($idEResep),
        ];
    }

    public static function getInformasiObat(int|array $dataEResep): array
    {
        $idEResep = is_array($dataEResep) ? (int) ($dataEResep['id_e_resep'] ?? 0) : $dataEResep;
        if ($idEResep < 1) {
            return [];
        }

        return DB::table('detail_e_resep as detail')
            ->join('obat', 'obat.id_obat', '=', 'detail.id_obat')
            ->leftJoin('stok_obat as stok', 'stok.id_obat', '=', 'obat.id_obat')
            ->where('detail.id_e_resep', $idEResep)
            ->select('detail.id_obat', 'obat.nama_obat', 'detail.dosis', 'detail.jumlah_obat', 'detail.aturan_pakai', 'stok.jumlah_stok')
            ->get()->map(fn ($obat) => (array) $obat)->all();
    }

    public static function updateStatusEResep(int $idEResep, string $statusBaru): bool
    {
        return static::query()->whereKey($idEResep)->update(['status_e_resep' => $statusBaru]) > 0;
    }
}
