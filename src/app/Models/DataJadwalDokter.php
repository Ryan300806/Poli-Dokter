<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/** Entitas DataJadwalDokter sesuai Class Diagram. */
class DataJadwalDokter extends Model
{
    protected $table = 'slot_jadwal';

    protected $primaryKey = 'id_slot';

    public $timestamps = false;

    protected $fillable = ['id_dokter', 'id_poli', 'tanggal', 'jam', 'kuota', 'sisa_kuota', 'status_slot'];

    public static function getJadwalTersedia(?int $idPoli = null): array
    {
        return DB::table('slot_jadwal as s')
            ->join('dokter as d', 'd.id_dokter', '=', 's.id_dokter')
            ->join('poli as p', 'p.id_poli', '=', 's.id_poli')
            ->whereDate('s.tanggal', '>=', today())
            ->where('s.status_slot', 'tersedia')
            ->when($idPoli, fn ($query) => $query->where('s.id_poli', $idPoli))
            ->orderBy('s.tanggal')
            ->orderBy('s.jam')
            ->select('s.id_slot', 's.id_poli', 's.id_dokter', 's.tanggal', 's.jam', 's.kuota', 's.sisa_kuota', 's.status_slot', 'p.nama_poli', 'd.nama_dokter')
            ->get()
            ->map(fn ($slot) => (array) $slot)
            ->all();
    }

    public static function cekKetersediaanSlot(int $idSlot, string $tanggal): string
    {
        $slot = static::query()->whereKey($idSlot)->first();
        if (! $slot || $slot->tanggal !== $tanggal || $slot->status_slot !== 'tersedia') {
            return 'Tidak Tersedia';
        }

        return $slot->sisa_kuota > 0 ? 'Tersedia' : 'Penuh';
    }

    public static function kurangiKuotaSlot(int $idSlot): bool
    {
        return static::query()->whereKey($idSlot)->where('status_slot', 'tersedia')
            ->where('sisa_kuota', '>', 0)->decrement('sisa_kuota') > 0;
    }

    public static function ambilSlotTersedia(int $idDokter): array
    {
        return static::query()->where('id_dokter', $idDokter)->whereDate('tanggal', '>=', today())
            ->where('status_slot', 'tersedia')->where('sisa_kuota', '>', 0)
            ->orderBy('tanggal')->orderBy('jam')->get()->toArray();
    }

    public static function isiSlotBaru(int $idSlot): bool
    {
        return static::kurangiKuotaSlot($idSlot);
    }

    public static function bebaskanSlotLama(int $idSlot): bool
    {
        $slot = static::query()->whereKey($idSlot)->first();
        if (! $slot || $slot->sisa_kuota >= $slot->kuota) {
            return false;
        }

        return static::query()->whereKey($idSlot)->increment('sisa_kuota') > 0;
    }

    public static function updateStatusSlot(int $idSlot, string $status): bool
    {
        return static::query()->whereKey($idSlot)->update(['status_slot' => $status]) > 0;
    }

    public static function getJadwalHarian(int $idDokter, string $tanggal): array
    {
        return static::query()->where('id_dokter', $idDokter)->whereDate('tanggal', $tanggal)
            ->orderBy('jam')->get()->map(fn ($slot) => $slot->only([
                'id_slot', 'id_dokter', 'id_poli', 'tanggal', 'jam', 'kuota', 'sisa_kuota', 'status_slot',
            ]))->all();
    }

    public static function cekBentrokJadwal(int $idDokter, string $tanggal, string $jam, ?int $abaikanSlot = null): bool
    {
        return static::query()->where('id_dokter', $idDokter)->whereDate('tanggal', $tanggal)->where('jam', $jam)
            ->when($abaikanSlot, fn ($query) => $query->where('id_slot', '!=', $abaikanSlot))->exists();
    }

    public static function simpanSlot(array $dataSlot): bool
    {
        return (bool) static::query()->create($dataSlot)->exists;
    }

    public static function tambahSlot(int $idDokter, string $tanggal, string $jam, int $kuota): bool
    {
        $dokter = DB::table('dokter')->where('id_dokter', $idDokter)->first(['id_poli']);
        if (! $dokter || static::cekBentrokJadwal($idDokter, $tanggal, $jam)) {
            return false;
        }

        return static::simpanSlot([
            'id_dokter' => $idDokter,
            'id_poli' => $dokter->id_poli,
            'tanggal' => $tanggal,
            'jam' => $jam,
            'kuota' => $kuota,
            'sisa_kuota' => $kuota,
            'status_slot' => 'tersedia',
        ]);
    }

    public static function updateSlot(int $idSlot, array $dataBaru): bool
    {
        return static::query()->whereKey($idSlot)->update($dataBaru) > 0;
    }

    public static function deleteSlot(int $idSlot): bool
    {
        if (DB::table('reservasi')->where('id_slot', $idSlot)->exists()) {
            return false;
        }

        return static::query()->whereKey($idSlot)->delete() > 0;
    }
}
