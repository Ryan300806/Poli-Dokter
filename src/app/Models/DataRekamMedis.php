<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/** Entitas DataRekamMedis dan operasi baca pada CD/sequence Modul 2. */
class DataRekamMedis extends Model
{
    protected $table = 'rekam_medis';

    protected $primaryKey = 'id_rekam_medis';

    public $timestamps = false;

    protected $fillable = ['id_pasien', 'riwayat_penyakit', 'alergi'];

    public static function daftarPasienDenganRingkasan(): \Illuminate\Support\Collection
    {
        return DB::table('pasien as p')->leftJoin('rekam_medis as rm', 'rm.id_pasien', '=', 'p.id_pasien')
            ->orderBy('p.nama_lengkap')
            ->get(['p.id_pasien', 'p.nama_lengkap', 'p.nik', 'p.tanggal_lahir', 'p.jenis_kelamin', 'p.golongan_darah', 'p.kontak_darurat', 'rm.riwayat_penyakit', 'rm.alergi']);
    }

    public static function ambilRiwayatDanAlergi(int $idPasien): ?array
    {
        $rekamMedis = static::query()->where('id_pasien', $idPasien)->first();

        return $rekamMedis?->only(['id_rekam_medis', 'id_pasien', 'riwayat_penyakit', 'alergi']);
    }
}
