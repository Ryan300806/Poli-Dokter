<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('password123');
        $now = now();

        // 1. Poli
        DB::table('poli')->insertOrIgnore([
            ['id_poli' => 1, 'nama_poli' => 'Poli Umum'],
            ['id_poli' => 2, 'nama_poli' => 'Poli Gigi'],
            ['id_poli' => 3, 'nama_poli' => 'Poli Anak'],
            ['id_poli' => 4, 'nama_poli' => 'Poli Penyakit Dalam'],
        ]);

        // 2. Dokter + Akun Login Multi-Poli (untuk test case isolasi dokter & poli)
        $dokterList = [
            ['id_dokter' => 1, 'username' => 'dokter_umum', 'nama' => 'dr. Aditya Nugraha', 'id_poli' => 1],
            ['id_dokter' => 2, 'username' => 'dokter_umum2', 'nama' => 'dr. Maya Anggraini', 'id_poli' => 1],
            ['id_dokter' => 3, 'username' => 'dokter_gigi', 'nama' => 'drg. Rina Puspita', 'id_poli' => 2],
            ['id_dokter' => 4, 'username' => 'dokter_anak', 'nama' => 'dr. Fikri Ramadhan', 'id_poli' => 3],
            ['id_dokter' => 5, 'username' => 'dokter_dalam', 'nama' => 'dr. Nadia Kusuma, Sp.PD', 'id_poli' => 4],
            ['id_dokter' => 6, 'username' => 'dokter_dalam2', 'nama' => 'dr. Bagas Prakoso, Sp.PD', 'id_poli' => 4],
        ];

        foreach ($dokterList as $d) {
            if (! DB::table('dokter')->where('id_dokter', $d['id_dokter'])->exists()) {
                $userId = DB::table('users')->insertGetId([
                    'name' => $d['nama'],
                    'username' => $d['username'],
                    'email' => $d['username'].'@rsi.local',
                    'password' => $password,
                    'role' => 'dokter',
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);

                DB::table('dokter')->insert([
                    'id_dokter' => $d['id_dokter'],
                    'user_id' => $userId,
                    'nama_dokter' => $d['nama'],
                    'id_poli' => $d['id_poli'],
                ]);
            }
        }

        // 3. Perawat + Akun Login
        if (! DB::table('users')->where('username', 'perawat1')->exists()) {
            $perawatUserId = DB::table('users')->insertGetId([
                'name' => 'Ns. Siti Rahma, S.Kep',
                'username' => 'perawat1',
                'email' => 'perawat1@rsi.local',
                'password' => $password,
                'role' => 'perawat',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            DB::table('perawat')->insert([
                'user_id' => $perawatUserId,
                'nama_perawat' => 'Ns. Siti Rahma, S.Kep',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // 4. Apoteker + Akun Login
        if (! DB::table('users')->where('username', 'apoteker1')->exists()) {
            $apotekerUserId = DB::table('users')->insertGetId([
                'name' => 'apt. Karina Dewi, S.Farm',
                'username' => 'apoteker1',
                'email' => 'apoteker1@rsi.local',
                'password' => $password,
                'role' => 'apoteker',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            DB::table('apoteker')->insert([
                'user_id' => $apotekerUserId,
                'nama_apoteker' => 'apt. Karina Dewi, S.Farm',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // 5. Pasien + Akun Login + Rekam Medis Awal
        $pasienList = [
            [
                'id_pasien' => 1, 'nik' => '3573010101900001', 'nama_lengkap' => 'Andi Pratama',
                'tempat_lahir' => 'Malang', 'tanggal_lahir' => '1990-01-01', 'alamat' => 'Jl. Melati No. 10, Malang',
                'jenis_kelamin' => 'L', 'golongan_darah' => 'O+', 'kontak_darurat' => '081200000001',
                'nama_kontak_darurat' => 'Siti Aminah', 'riwayat' => 'Gastritis Kronis (2023)', 'alergi' => 'Penisilin',
            ],
            [
                'id_pasien' => 2, 'nik' => '3573010202920002', 'nama_lengkap' => 'Karina Chelsy',
                'tempat_lahir' => 'Jakarta', 'tanggal_lahir' => '1992-06-14', 'alamat' => 'Jl. Cempaka Putih Timur No. 42, Jakarta',
                'jenis_kelamin' => 'P', 'golongan_darah' => 'A+', 'kontak_darurat' => '081311207749',
                'nama_kontak_darurat' => 'Ratna Budiarti', 'riwayat' => 'Dispepsia Fungsional', 'alergi' => 'Seafood (Udang & Kepiting)',
            ],
            [
                'id_pasien' => 3, 'nik' => '3573010303950003', 'nama_lengkap' => 'Budi Santoso',
                'tempat_lahir' => 'Blitar', 'tanggal_lahir' => '1985-05-12', 'alamat' => 'Jl. Kenanga No. 5, Malang',
                'jenis_kelamin' => 'L', 'golongan_darah' => 'B+', 'kontak_darurat' => '081200000003',
                'nama_kontak_darurat' => 'Dewi Lestari', 'riwayat' => 'Hipertensi Grade 1', 'alergi' => '-',
            ],
        ];

        foreach ($pasienList as $p) {
            if (! DB::table('pasien')->where('nik', $p['nik'])->exists()) {
                $userId = DB::table('users')->insertGetId([
                    'name' => $p['nama_lengkap'],
                    'username' => $p['nik'],
                    'email' => $p['nik'].'@pasien.local',
                    'password' => $password,
                    'role' => 'pasien',
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);

                DB::table('pasien')->insert([
                    'id_pasien' => $p['id_pasien'],
                    'user_id' => $userId,
                    'nik' => $p['nik'],
                    'nama_lengkap' => $p['nama_lengkap'],
                    'tempat_lahir' => $p['tempat_lahir'],
                    'tanggal_lahir' => $p['tanggal_lahir'],
                    'alamat' => $p['alamat'],
                    'jenis_kelamin' => $p['jenis_kelamin'],
                    'golongan_darah' => $p['golongan_darah'],
                    'kontak_darurat' => $p['kontak_darurat'],
                    'nama_kontak_darurat' => $p['nama_kontak_darurat'],
                    'password' => $password,
                    'last_profile_update_at' => null,
                ]);

                DB::table('rekam_medis')->insert([
                    'id_pasien' => $p['id_pasien'],
                    'riwayat_penyakit' => $p['riwayat'],
                    'alergi' => $p['alergi'],
                ]);
            }
        }

        // 6. Obat & Stok Obat
        $obatList = [
            ['id_obat' => 1, 'nama_obat' => 'Paracetamol 500 mg', 'stok' => 150],
            ['id_obat' => 2, 'nama_obat' => 'Amoxicillin 500 mg', 'stok' => 80],
            ['id_obat' => 3, 'nama_obat' => 'Vitamin C 500 mg', 'stok' => 200],
            ['id_obat' => 4, 'nama_obat' => 'Antasida Doen Tablet', 'stok' => 100],
            ['id_obat' => 5, 'nama_obat' => 'Cetirizine 10 mg', 'stok' => 75],
            ['id_obat' => 6, 'nama_obat' => 'Ibuprofen 200 mg', 'stok' => 90],
            ['id_obat' => 7, 'nama_obat' => 'Omeprazole 20 mg', 'stok' => 60],
            ['id_obat' => 8, 'nama_obat' => 'Salbutamol 2 mg', 'stok' => 50],
            ['id_obat' => 9, 'nama_obat' => 'Amlodipine 5 mg Tablet', 'stok' => 120],
            ['id_obat' => 10, 'nama_obat' => 'Oralit Sachet', 'stok' => 40],
        ];

        foreach ($obatList as $item) {
            DB::table('obat')->insertOrIgnore([
                'id_obat' => $item['id_obat'],
                'nama_obat' => $item['nama_obat'],
            ]);
            DB::table('stok_obat')->insertOrIgnore([
                'id_obat' => $item['id_obat'],
                'jumlah_stok' => $item['stok'],
            ]);
        }

        // 7. Slot Jadwal Dokter (Hari ini + 14 hari ke depan)
        $dokterRows = DB::table('dokter')->orderBy('id_dokter')->get();
        foreach (range(0, 14) as $offset) {
            $tanggal = today()->addDays($offset)->toDateString();
            foreach ($dokterRows as $index => $dok) {
                $jamList = ['08:00:00', '09:30:00', '11:00:00'];
                foreach ($jamList as $jamIdx => $jam) {
                    if ($offset > 0 && $jamIdx > 0 && ($index + $offset) % 2 === 0) {
                        continue;
                    }
                    $exists = DB::table('slot_jadwal')
                        ->where('id_dokter', $dok->id_dokter)
                        ->whereDate('tanggal', $tanggal)
                        ->where('jam', $jam)
                        ->exists();

                    if (! $exists) {
                        DB::table('slot_jadwal')->insert([
                            'id_dokter' => $dok->id_dokter,
                            'id_poli' => $dok->id_poli,
                            'tanggal' => $tanggal,
                            'jam' => $jam,
                            'kuota' => 10,
                            'sisa_kuota' => 10,
                            'status_slot' => 'tersedia',
                        ]);
                    }
                }
            }
        }
    }
}
