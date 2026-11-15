<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;

/**
 * Entitas DataPasien pada Class Diagram Modul 2.
 * Model ini memusatkan akses dan operasi dasar untuk tabel pasien.
 */
class DataPasien extends Model
{
    protected $table = 'pasien';

    protected $primaryKey = 'id_pasien';

    public $timestamps = false;

    protected $fillable = [
        'nik',
        'nama_lengkap',
        'tempat_lahir',
        'tanggal_lahir',
        'alamat',
        'jenis_kelamin',
        'golongan_darah',
        'kontak_darurat',
        'nama_kontak_darurat',
        'password',
        'last_profile_update_at',
    ];

    protected $hidden = ['password'];

    public static function cekNIK(string $nik): bool
    {
        return static::query()->where('nik', $nik)->exists();
    }

    public static function simpanDataPasien(array $dataPasien): bool
    {
        if (isset($dataPasien['password'])) {
            $dataPasien['password'] = Hash::make($dataPasien['password']);
        }

        return (bool) static::query()->create($dataPasien)->exists;
    }

    public static function cariAkun(string $nik): ?array
    {
        $pasien = static::query()->where('nik', $nik)->first();

        return $pasien?->toArray();
    }

    public static function validasiAkun(string $nik, string $password): bool
    {
        $pasien = static::query()->where('nik', $nik)->first();

        return $pasien !== null && Hash::check($password, $pasien->password);
    }

    public static function getTanggalUpdateTerakhir(int $idPasien): ?Carbon
    {
        $tanggal = static::query()->whereKey($idPasien)->value('last_profile_update_at');

        return $tanggal ? Carbon::parse($tanggal) : null;
    }

    public static function updateDataPasien(int $idPasien, array $dataBaru): bool
    {
        $dataBaru['last_profile_update_at'] = now();

        return static::query()->whereKey($idPasien)->update($dataBaru) === 1;
    }
}
