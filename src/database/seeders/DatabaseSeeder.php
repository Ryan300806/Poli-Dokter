<?php

namespace database\seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            PoliSeeder::class,
            PasienSeeder::class,
            ObatSeeder::class,
            DokterSeeder::class,
            SlotJadwalSeeder::class,
            StokObatSeeder::class,
        ]);
    }
}
