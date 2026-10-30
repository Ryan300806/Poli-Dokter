<?php
namespace database\seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PasienSeeder extends Seeder {
    public function run(): void {
        $password = Hash::make('password123');
        DB::table('pasien')->insertOrIgnore([
            ['id_pasien'=>1,'nik'=>'3573010101900001','nama_lengkap'=>'Andi Pratama','tempat_lahir'=>'Malang','tanggal_lahir'=>'1990-01-01','alamat'=>'Jl. Melati No. 10, Malang','jenis_kelamin'=>'L','kontak_darurat'=>'081200000001','password'=>$password],
            ['id_pasien'=>2,'nik'=>'3573010202920002','nama_lengkap'=>'Siti Rahma','tempat_lahir'=>'Malang','tanggal_lahir'=>'1992-02-02','alamat'=>'Jl. Mawar No. 12, Malang','jenis_kelamin'=>'P','kontak_darurat'=>'081200000002','password'=>$password],
            ['id_pasien'=>3,'nik'=>'3573010303950003','nama_lengkap'=>'Budi Santoso','tempat_lahir'=>'Blitar','tanggal_lahir'=>'1995-03-03','alamat'=>'Jl. Kenanga No. 5, Malang','jenis_kelamin'=>'L','kontak_darurat'=>'081200000003','password'=>$password],
            ['id_pasien'=>4,'nik'=>'3573010404980004','nama_lengkap'=>'Dewi Lestari','tempat_lahir'=>'Kediri','tanggal_lahir'=>'1998-04-04','alamat'=>'Jl. Anggrek No. 8, Malang','jenis_kelamin'=>'P','kontak_darurat'=>'081200000004','password'=>$password],
            ['id_pasien'=>5,'nik'=>'3573010505000005','nama_lengkap'=>'Rizky Maulana','tempat_lahir'=>'Surabaya','tanggal_lahir'=>'2000-05-05','alamat'=>'Jl. Cempaka No. 3, Malang','jenis_kelamin'=>'L','kontak_darurat'=>'081200000005','password'=>$password],
            ['id_pasien'=>6,'nik'=>'3573010606010006','nama_lengkap'=>'Nadia Putri','tempat_lahir'=>'Malang','tanggal_lahir'=>'2001-06-06','alamat'=>'Jl. Flamboyan No. 7, Malang','jenis_kelamin'=>'P','kontak_darurat'=>'081200000006','password'=>$password],
            ['id_pasien'=>7,'nik'=>'3573010707020007','nama_lengkap'=>'Fajar Hidayat','tempat_lahir'=>'Pasuruan','tanggal_lahir'=>'2002-07-07','alamat'=>'Jl. Merdeka No. 15, Malang','jenis_kelamin'=>'L','kontak_darurat'=>'081200000007','password'=>$password],
            ['id_pasien'=>8,'nik'=>'3573010808030008','nama_lengkap'=>'Alya Safitri','tempat_lahir'=>'Jombang','tanggal_lahir'=>'2003-08-08','alamat'=>'Jl. Diponegoro No. 20, Malang','jenis_kelamin'=>'P','kontak_darurat'=>'081200000008','password'=>$password],
            ['id_pasien'=>9,'nik'=>'3573010909040009','nama_lengkap'=>'Dimas Saputra','tempat_lahir'=>'Lumajang','tanggal_lahir'=>'2004-09-09','alamat'=>'Jl. Soekarno Hatta No. 21, Malang','jenis_kelamin'=>'L','kontak_darurat'=>'081200000009','password'=>$password],
            ['id_pasien'=>10,'nik'=>'3573011010050010','nama_lengkap'=>'Intan Permata','tempat_lahir'=>'Madiun','tanggal_lahir'=>'2005-10-10','alamat'=>'Jl. Ijen No. 2, Malang','jenis_kelamin'=>'P','kontak_darurat'=>'081200000010','password'=>$password],
        ]);
    }
}
