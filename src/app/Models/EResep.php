<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/** Entitas EResep sesuai Class Diagram. */
class EResep extends Model
{
    protected $table = 'e_resep';

    protected $primaryKey = 'id_e_resep';

    public $timestamps = false;

    protected $fillable = ['id_pasien', 'id_apoteker', 'id_diagnosis', 'status_e_resep', 'alasan_penolakan', 'waktu_kirim'];

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

    public static function updateEResep(int $idEResep, array $daftarObat): bool
    {
        return DB::transaction(function () use ($idEResep, $daftarObat) {
            $resep = static::query()->whereKey($idEResep)->lockForUpdate()->first();
            if (! $resep || ! in_array($resep->status_e_resep, ['terkirim', 'ditolak'], true)) {
                return false;
            }

            DB::table('detail_e_resep')->where('id_e_resep', $idEResep)->delete();
            foreach ($daftarObat as $obat) {
                DB::table('detail_e_resep')->insert([
                    'id_e_resep' => $idEResep,
                    'id_obat' => $obat['id_obat'],
                    'dosis' => $obat['dosis'],
                    'jumlah_obat' => $obat['jumlah_obat'],
                    'aturan_pakai' => $obat['aturan_pakai'],
                ]);
            }

            static::query()->whereKey($idEResep)->update([
                'status_e_resep' => 'terkirim',
                'alasan_penolakan' => null,
                'waktu_kirim' => now(),
            ]);

            return true;
        });
    }

    public static function getEResep(int $idEResep): ?array
    {
        $resep = static::query()->whereKey($idEResep)->first();
        if (! $resep) {
            return null;
        }

        return [
            ...$resep->only(['id_e_resep', 'id_pasien', 'id_apoteker', 'id_diagnosis', 'status_e_resep', 'alasan_penolakan', 'waktu_kirim']),
            'daftar_obat' => static::getInformasiObat($idEResep),
        ];
    }

    public static function getEResepUntukDiagnosis(int $idDiagnosis): ?array
    {
        $idEResep = static::query()->where('id_diagnosis', $idDiagnosis)->orderByDesc('id_e_resep')->value('id_e_resep');

        return $idEResep ? static::getEResep((int) $idEResep) : null;
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
            ->get()
            ->map(fn ($obat) => (array) $obat)
            ->all();
    }

    public static function cekStokKurang(int $idEResep): array
    {
        return collect(static::getInformasiObat($idEResep))
            ->filter(fn ($obat) => (int) ($obat['jumlah_stok'] ?? 0) < (int) $obat['jumlah_obat'])
            ->map(fn ($obat) => $obat['nama_obat'].' (stok '.(int) ($obat['jumlah_stok'] ?? 0).', butuh '.(int) $obat['jumlah_obat'].')')
            ->values()
            ->all();
    }

    public static function updateStatusEResep(int $idEResep, string $statusBaru, ?string $alasanPenolakan = null, ?int $idApoteker = null): bool
    {
        return DB::transaction(function () use ($idEResep, $statusBaru, $alasanPenolakan, $idApoteker) {
            $resep = static::query()->whereKey($idEResep)->lockForUpdate()->first();
            if (! $resep) {
                return false;
            }

            if (in_array($statusBaru, ['siap_diserahkan', 'selesai'], true) && $resep->status_e_resep !== 'selesai') {
                $details = DB::table('detail_e_resep')->where('id_e_resep', $idEResep)->get(['id_obat', 'jumlah_obat']);
                foreach ($details as $item) {
                    $stok = DB::table('stok_obat')->where('id_obat', $item->id_obat)->lockForUpdate()->first();
                    if (! $stok || (int) $stok->jumlah_stok < (int) $item->jumlah_obat) {
                        return false;
                    }
                }

                if ($statusBaru === 'selesai') {
                    foreach ($details as $item) {
                        DB::table('stok_obat')->where('id_obat', $item->id_obat)->decrement('jumlah_stok', (int) $item->jumlah_obat);
                    }
                }
            }

            $update = ['status_e_resep' => $statusBaru];
            if ($idApoteker !== null) {
                $update['id_apoteker'] = $idApoteker;
            }
            if ($statusBaru === 'ditolak') {
                $update['alasan_penolakan'] = $alasanPenolakan;
            } elseif ($statusBaru === 'terkirim') {
                $update['alasan_penolakan'] = null;
            }

            return static::query()->whereKey($idEResep)->update($update) > 0;
        });
    }
}
