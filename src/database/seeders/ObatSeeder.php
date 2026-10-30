<?php
namespace database\seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ObatSeeder extends Seeder {
    public function run(): void {
        DB::table('obat')->insertOrIgnore([
            ['id_obat'=>1,'nama_obat'=>'Paracetamol 500 mg'],
            ['id_obat'=>2,'nama_obat'=>'Amoxicillin 500 mg'],
            ['id_obat'=>3,'nama_obat'=>'Vitamin C 500 mg'],
            ['id_obat'=>4,'nama_obat'=>'Antasida tablet'],
            ['id_obat'=>5,'nama_obat'=>'Cetirizine 10 mg'],
            ['id_obat'=>6,'nama_obat'=>'Ibuprofen 200 mg'],
            ['id_obat'=>7,'nama_obat'=>'Omeprazole 20 mg'],
            ['id_obat'=>8,'nama_obat'=>'Salbutamol tablet'],
            ['id_obat'=>9,'nama_obat'=>'Metformin 500 mg'],
            ['id_obat'=>10,'nama_obat'=>'Oralit'],
        ]);
    }
}
