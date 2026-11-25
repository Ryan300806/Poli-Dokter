<?php

namespace Database\Seeders;

use App\Models\DataReservasi;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DemoKunjunganSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment('local', 'testing') || ! in_array(config('database.connections.'.config('database.default').'.database'), ['rsi_rawat_jalan_revisi', ':memory:'], true)) {
            throw new \RuntimeException('Data demo hanya tersedia di database khusus revisi.');
        }
        DB::transaction(function () {
            $dokter = DB::table('dokter as d')->join('users as u', 'u.id', '=', 'd.user_id')
                ->where('u.username', 'dokter_umum')->value('d.id_dokter');
            $pasien = DB::table('pasien')->where('nik', '3573010101900001')->firstOrFail();
            $slot = DB::table('slot_jadwal')->where('id_dokter', $dokter)
                ->where('tanggal', today()->toDateString())->orderBy('jam')->lockForUpdate()->firstOrFail();
            if (DB::table('reservasi')->where('id_pasien', $pasien->id_pasien)->where('id_slot', $slot->id_slot)->exists()) {
                return;
            }
            if ($slot->sisa_kuota <= 0) {
                throw new \RuntimeException('Kuota slot demo hari ini sudah penuh.');
            }
            $nomor = DataReservasi::nomorAntreanBerikutnya((int) $slot->id_slot);
            $reservasi = DB::table('reservasi')->insertGetId([
                'id_pasien' => $pasien->id_pasien, 'id_dokter' => $dokter, 'id_slot' => $slot->id_slot,
                'tanggal' => $slot->tanggal, 'nomor_antrean' => $nomor, 'status_reservasi' => 'aktif', 'alasan_pembatalan' => '',
            ], 'id_reservasi');
            DB::table('slot_jadwal')->where('id_slot', $slot->id_slot)->decrement('sisa_kuota');
            DB::table('antrean')->insert([
                'id_pasien' => $pasien->id_pasien, 'id_reservasi' => $reservasi,
                'tanggal_antrean' => $slot->tanggal, 'jenis_antrean' => 'rawat_jalan', 'status_antrean' => 'menunggu',
            ]);
        });
    }
}
