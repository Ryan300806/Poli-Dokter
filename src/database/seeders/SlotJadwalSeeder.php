<?php

namespace database\seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SlotJadwalSeeder extends Seeder
{
    public function run(): void
    {
        $dokter = DB::table('dokter')->orderBy('id_dokter')->get();
        foreach (range(1, 21) as $hari) {
            $tanggal = today()->addDays($hari);
            if ($tanggal->isWeekend()) continue;

            foreach ($dokter as $index => $item) {
                $jam = ['08:00:00', '09:30:00', '11:00:00'][$index % 3];
                $ada = DB::table('slot_jadwal')->where('id_dokter', $item->id_dokter)->whereDate('tanggal', $tanggal)->where('jam', $jam)->exists();
                if (!$ada) {
                    DB::table('slot_jadwal')->insert([
                        'id_dokter' => $item->id_dokter,
                        'id_poli' => $item->id_poli,
                        'tanggal' => $tanggal->toDateString(),
                        'jam' => $jam,
                        'kuota' => 15,
                        'sisa_kuota' => 15,
                        'status_slot' => 'tersedia',
                    ]);
                }
            }
        }
    }
}
