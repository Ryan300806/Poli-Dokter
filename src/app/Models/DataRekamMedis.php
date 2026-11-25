<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/** Entitas DataRekamMedis sesuai Class Diagram. */
class DataRekamMedis extends Model
{
    protected $table = 'rekam_medis';

    protected $primaryKey = 'id_rekam_medis';

    public $timestamps = false;

    protected $fillable = ['id_pasien', 'riwayat_penyakit', 'alergi'];

    public static function daftarPasienUntukDokter(int $idDokter, string $cari = ''): \Illuminate\Contracts\Pagination\Paginator
    {
        $nomor = preg_match('/^(?:RM-)?(\d+)$/i', $cari, $cocok) ? (int) $cocok[1] : null;

        return DB::table('pasien as p')
            ->select(['p.id_pasien', 'p.nama_lengkap', 'p.tanggal_lahir', 'p.jenis_kelamin'])
            ->selectSub(DB::table('rekam_medis as rm')->select('rm.alergi')->whereColumn('rm.id_pasien', 'p.id_pasien')
                ->orderByDesc('rm.id_rekam_medis')->limit(1), 'alergi')
            ->whereExists(function ($q) use ($idDokter) {
                $q->selectRaw('1')->from('reservasi as r')->whereColumn('r.id_pasien', 'p.id_pasien')
                    ->where('r.id_dokter', $idDokter)->where('r.status_reservasi', '!=', 'dibatalkan');
            })
            ->when($cari !== '', function ($q) use ($cari, $nomor) {
                $q->where(function ($q) use ($cari, $nomor) {
                    $q->where('p.nama_lengkap', 'like', '%'.$cari.'%')
                        ->when($nomor !== null, fn ($q) => $q->orWhere('p.id_pasien', $nomor));
                });
            })
            ->orderBy('p.nama_lengkap')->orderBy('p.id_pasien')
            ->simplePaginate(12)
            ->withQueryString();
    }

    public static function ambilRiwayatDanAlergi(int $idPasien): ?array
    {
        $rekamMedis = static::query()->where('id_pasien', $idPasien)->orderByDesc('id_rekam_medis')->first();

        return $rekamMedis?->only(['id_rekam_medis', 'id_pasien', 'riwayat_penyakit', 'alergi']);
    }
}
