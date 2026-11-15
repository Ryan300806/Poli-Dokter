<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/** Entitas reservasi dan pengambilan antrean triage sesuai CD-007. */
class DataReservasi extends Model
{
    protected $table = 'reservasi';
    protected $primaryKey = 'id_reservasi';
    public $timestamps = false;

    protected $fillable = ['id_pasien', 'id_dokter', 'id_slot', 'tanggal', 'nomor_antrean', 'status_reservasi', 'alasan_pembatalan'];

    public static function simpanReservasi(array $dataReservasi): array
    {
        $id = static::query()->insertGetId($dataReservasi, 'id_reservasi');
        return static::getReservasi((int) $id) ?? [];
    }

    public static function getReservasi(int $idReservasi): array
    {
        return static::query()->whereKey($idReservasi)->first()?->only([
            'id_reservasi', 'id_pasien', 'id_dokter', 'id_slot', 'tanggal', 'nomor_antrean', 'status_reservasi', 'alasan_pembatalan',
        ]) ?? [];
    }

    public static function getReservasiAktif(int $idPasien): array
    {
        return static::query()->where('id_pasien', $idPasien)->whereIn('status_reservasi', ['aktif', 'menunggu', 'dikonfirmasi'])
            ->orderBy('tanggal')->get()->map(fn ($item) => $item->only([
                'id_reservasi', 'id_pasien', 'id_dokter', 'id_slot', 'tanggal', 'nomor_antrean', 'status_reservasi', 'alasan_pembatalan',
            ]))->all();
    }

    public static function updateReservasi(int $idReservasi, array $dataBaru): bool
    {
        return static::query()->whereKey($idReservasi)->update($dataBaru) > 0;
    }

    public static function getDaftarPasien(int $idDokter, string $tanggal): array
    {
        return DB::table('reservasi as r')->join('pasien as p', 'p.id_pasien', '=', 'r.id_pasien')
            ->where('r.id_dokter', $idDokter)->whereDate('r.tanggal', $tanggal)
            ->whereNotIn('r.status_reservasi', ['dibatalkan'])
            ->orderBy('r.nomor_antrean')
            ->get(['r.id_reservasi', 'r.nomor_antrean', 'r.status_reservasi', 'p.id_pasien', 'p.nama_lengkap', 'p.nik'])
            ->map(fn ($item) => (array) $item)->all();
    }

    public static function antreanPemeriksaanHariIni(): array
    {
        return DB::table('antrean as a')->join('pasien as p', 'p.id_pasien', '=', 'a.id_pasien')
            ->join('reservasi as r', 'r.id_reservasi', '=', 'a.id_reservasi')
            ->join('slot_jadwal as s', 's.id_slot', '=', 'r.id_slot')
            ->whereIn('a.status_antrean', ['menunggu', 'dipanggil', 'triage_selesai'])
            ->whereDate('a.tanggal_antrean', today()->toDateString())->orderBy('s.jam')
            ->get(['a.id_antrean', 'a.id_pasien', 'a.tanggal_antrean', 'a.status_antrean', 'r.nomor_antrean', 's.jam', 'p.nama_lengkap', 'p.nik', 'p.jenis_kelamin', 'p.tanggal_lahir'])
            ->map(fn ($row) => (array) $row)->all();
    }

    public static function getAntreanUntukObservasi(int $idReservasi): ?object
    {
        return DB::table('reservasi as r')->join('antrean as a', 'a.id_reservasi', '=', 'r.id_reservasi')
            ->join('slot_jadwal as s', 's.id_slot', '=', 'r.id_slot')
            ->leftJoin('dokter as d', 'd.id_dokter', '=', 'r.id_dokter')->leftJoin('poli as po', 'po.id_poli', '=', 'd.id_poli')
            ->where('r.id_reservasi', $idReservasi)->first(['r.id_pasien', 'r.nomor_antrean', 's.jam', 'po.nama_poli', 'a.id_antrean']);
    }

    public static function antreanTersedia(int $idAntrean): bool
    {
        return DB::table('antrean')->where('id_antrean', $idAntrean)->exists();
    }

    public static function konteksPemeriksaan(int $idAntrean): ?object
    {
        return DB::table('antrean as a')->join('pasien as p', 'p.id_pasien', '=', 'a.id_pasien')
            ->leftJoin('reservasi as r', 'r.id_reservasi', '=', 'a.id_reservasi')
            ->leftJoin('dokter as d', 'd.id_dokter', '=', 'r.id_dokter')
            ->leftJoin('poli as po', 'po.id_poli', '=', 'd.id_poli')
            ->where('a.id_antrean', $idAntrean)
            ->first(['a.id_antrean', 'a.id_pasien', 'a.tanggal_antrean', 'p.nama_lengkap', 'p.nik', 'p.tanggal_lahir', 'p.jenis_kelamin', 'p.golongan_darah', 'r.nomor_antrean', 'd.nama_dokter', 'po.nama_poli']);
    }

    public static function getDokterAntrean(int $idAntrean): ?int
    {
        $idDokter = DB::table('antrean as a')->join('reservasi as r', 'r.id_reservasi', '=', 'a.id_reservasi')
            ->where('a.id_antrean', $idAntrean)->value('r.id_dokter');
        return $idDokter ? (int) $idDokter : null;
    }

    public static function panggilAntrean(int $idAntrean): bool
    {
        return DB::table('antrean')->where('id_antrean', $idAntrean)
            ->whereIn('status_antrean', ['menunggu', 'triage_selesai'])->update(['status_antrean' => 'dipanggil']) > 0;
    }

    public static function ambilAntreanTriage(string $tanggal): array
    {
        return DB::table('reservasi as r')
            ->join('antrean as a', 'a.id_reservasi', '=', 'r.id_reservasi')
            ->join('pasien as p', 'p.id_pasien', '=', 'r.id_pasien')
            ->join('slot_jadwal as s', 's.id_slot', '=', 'r.id_slot')
            ->leftJoin('dokter as d', 'd.id_dokter', '=', 'r.id_dokter')
            ->leftJoin('poli as po', 'po.id_poli', '=', 'd.id_poli')
            ->leftJoin('observasi as o', function ($join) {
                $join->on('o.id_antrean', '=', 'a.id_antrean')->whereRaw('o.waktu_observasi = (select max(o2.waktu_observasi) from observasi o2 where o2.id_antrean = a.id_antrean)');
            })
            ->whereDate('r.tanggal', $tanggal)
            ->whereIn('a.status_antrean', ['menunggu', 'dipanggil', 'triage_selesai'])
            ->orderBy('a.tanggal_antrean')
            ->get([
                'r.id_reservasi', 'r.id_pasien', 'r.id_dokter', 'r.id_slot', 'r.tanggal', 'r.nomor_antrean',
                'r.status_reservasi', 's.jam', 'po.nama_poli', 'a.id_antrean', 'a.status_antrean', 'p.nik', 'p.nama_lengkap',
                'p.jenis_kelamin', 'p.tanggal_lahir', 'o.id_observasi', 'o.tekanan_darah', 'o.suhu', 'o.berat_badan',
            ])->map(fn ($row) => (array) $row)->all();
    }
}
