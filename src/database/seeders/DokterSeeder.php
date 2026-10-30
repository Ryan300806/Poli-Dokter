<?php
namespace database\seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DokterSeeder extends Seeder {
    public function run(): void {
        DB::table('dokter')->insertOrIgnore([
            ['id_dokter'=>1,'nama_dokter'=>'dr. Aditya Nugraha','id_poli'=>1],
            ['id_dokter'=>2,'nama_dokter'=>'dr. Maya Anggraini','id_poli'=>1],
            ['id_dokter'=>3,'nama_dokter'=>'drg. Rina Puspita','id_poli'=>2],
            ['id_dokter'=>4,'nama_dokter'=>'dr. Fikri Ramadhan','id_poli'=>3],
            ['id_dokter'=>5,'nama_dokter'=>'dr. Nadia Kusuma','id_poli'=>4],
            ['id_dokter'=>6,'nama_dokter'=>'dr. Bagas Prakoso','id_poli'=>4],
        ]);
    }
}
