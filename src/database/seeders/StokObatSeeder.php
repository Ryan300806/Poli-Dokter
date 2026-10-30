<?php
namespace database\seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StokObatSeeder extends Seeder {
    public function run(): void {
        DB::table('stok_obat')->insertOrIgnore([
            ['id_stok'=>1,'id_obat'=>1,'jumlah_stok'=>150],
            ['id_stok'=>2,'id_obat'=>2,'jumlah_stok'=>80],
            ['id_stok'=>3,'id_obat'=>3,'jumlah_stok'=>200],
            ['id_stok'=>4,'id_obat'=>4,'jumlah_stok'=>100],
            ['id_stok'=>5,'id_obat'=>5,'jumlah_stok'=>75],
            ['id_stok'=>6,'id_obat'=>6,'jumlah_stok'=>90],
            ['id_stok'=>7,'id_obat'=>7,'jumlah_stok'=>60],
            ['id_stok'=>8,'id_obat'=>8,'jumlah_stok'=>50],
            ['id_stok'=>9,'id_obat'=>9,'jumlah_stok'=>120],
            ['id_stok'=>10,'id_obat'=>10,'jumlah_stok'=>40],
        ]);
    }
}
