<?php
namespace database\seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PoliSeeder extends Seeder {
    public function run(): void {
        DB::table('poli')->insertOrIgnore([
            ['id_poli'=>1,'nama_poli'=>'Poli Umum'],
            ['id_poli'=>2,'nama_poli'=>'Poli Gigi'],
            ['id_poli'=>3,'nama_poli'=>'Poli Anak'],
            ['id_poli'=>4,'nama_poli'=>'Poli Penyakit Dalam'],
        ]);
    }
}
