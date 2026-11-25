<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;

/** Entitas DataPasien sesuai Class Diagram. */
class DataPasien extends Model
{
    protected $table = 'pasien';

    protected $primaryKey = 'id_pasien';

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'no_kk',
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

    public static function ambilDataPasien(int $idPasien): array
    {
        return static::query()->whereKey($idPasien)->first()?->makeVisible(['nik'])->only([
            'id_pasien', 'nik', 'nama_lengkap', 'tempat_lahir', 'tanggal_lahir', 'alamat',
            'jenis_kelamin', 'golongan_darah', 'kontak_darurat', 'nama_kontak_darurat', 'last_profile_update_at',
        ]) ?? [];
    }

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
        return static::query()->where('nik', $nik)->first()?->toArray();
    }

    public static function validasiAkun(string $nik, string $password): bool
    {
        $pasien = static::query()->where('nik', $nik)->first();

        return $pasien !== null && Hash::check($password, $pasien->password);
    }

    public static function perluKonfirmasiProfil(int $idPasien): bool
    {
        $kunjungan = \Illuminate\Support\Facades\DB::table('reservasi')->where('id_pasien', $idPasien)
            ->where('status_reservasi', 'selesai')->max('tanggal');
        if (! $kunjungan || Carbon::parse($kunjungan)->addYear()->isFuture()) {
            return false;
        }
        $terakhir = static::getTanggalUpdateTerakhir($idPasien);

        return ! $terakhir || ! $terakhir->copy()->addDays(365)->isFuture();
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
