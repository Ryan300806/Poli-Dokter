<?php
namespace database\seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SlotJadwalSeeder extends Seeder {
    public function run(): void {
        DB::table('slot_jadwal')->insertOrIgnore([
            ['id_slot'=>1,'id_dokter'=>1,'id_poli'=>1,'tanggal'=>'2026-11-02','jam'=>'08:00:00','kuota'=>20,'sisa_kuota'=>20,'status_slot'=>'tersedia'],
            ['id_slot'=>2,'id_dokter'=>2,'id_poli'=>1,'tanggal'=>'2026-11-02','jam'=>'10:00:00','kuota'=>15,'sisa_kuota'=>15,'status_slot'=>'tersedia'],
            ['id_slot'=>3,'id_dokter'=>3,'id_poli'=>2,'tanggal'=>'2026-11-03','jam'=>'08:30:00','kuota'=>12,'sisa_kuota'=>12,'status_slot'=>'tersedia'],
            ['id_slot'=>4,'id_dokter'=>4,'id_poli'=>3,'tanggal'=>'2026-11-03','jam'=>'09:00:00','kuota'=>15,'sisa_kuota'=>15,'status_slot'=>'tersedia'],
            ['id_slot'=>5,'id_dokter'=>5,'id_poli'=>4,'tanggal'=>'2026-11-04','jam'=>'08:00:00','kuota'=>10,'sisa_kuota'=>10,'status_slot'=>'tersedia'],
            ['id_slot'=>6,'id_dokter'=>6,'id_poli'=>4,'tanggal'=>'2026-11-04','jam'=>'10:00:00','kuota'=>10,'sisa_kuota'=>10,'status_slot'=>'tersedia'],
            ['id_slot'=>7,'id_dokter'=>1,'id_poli'=>1,'tanggal'=>'2026-11-05','jam'=>'08:00:00','kuota'=>20,'sisa_kuota'=>20,'status_slot'=>'tersedia'],
            ['id_slot'=>8,'id_dokter'=>2,'id_poli'=>1,'tanggal'=>'2026-11-05','jam'=>'10:00:00','kuota'=>15,'sisa_kuota'=>15,'status_slot'=>'tersedia'],
            ['id_slot'=>9,'id_dokter'=>3,'id_poli'=>2,'tanggal'=>'2026-11-06','jam'=>'08:30:00','kuota'=>12,'sisa_kuota'=>12,'status_slot'=>'tersedia'],
            ['id_slot'=>10,'id_dokter'=>4,'id_poli'=>3,'tanggal'=>'2026-11-06','jam'=>'09:00:00','kuota'=>15,'sisa_kuota'=>15,'status_slot'=>'tersedia'],
            ['id_slot'=>11,'id_dokter'=>5,'id_poli'=>4,'tanggal'=>'2026-11-07','jam'=>'08:00:00','kuota'=>10,'sisa_kuota'=>10,'status_slot'=>'tersedia'],
            ['id_slot'=>12,'id_dokter'=>6,'id_poli'=>4,'tanggal'=>'2026-11-07','jam'=>'10:00:00','kuota'=>10,'sisa_kuota'=>10,'status_slot'=>'tersedia'],
        ]);
    }
}
