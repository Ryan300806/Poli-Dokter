<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('poli', function (Blueprint $table) {
            $table->increments('id_poli');
            $table->string('nama_poli', 100);
        });

        Schema::create('obat', function (Blueprint $table) {
            $table->increments('id_obat');
            $table->string('nama_obat', 150);
        });

        Schema::create('pasien', function (Blueprint $table) {
            $table->increments('id_pasien');
            $table->foreignId('user_id')->nullable()->unique()->constrained('users')->nullOnDelete();
            $table->char('nik', 16)->unique();
            $table->string('nama_lengkap', 100);
            $table->string('tempat_lahir', 50);
            $table->date('tanggal_lahir');
            $table->string('alamat', 255);
            $table->char('jenis_kelamin', 1);
            $table->string('golongan_darah', 3)->nullable();
            $table->string('kontak_darurat', 20);
            $table->string('nama_kontak_darurat', 100)->nullable();
            $table->string('password', 255);
            $table->timestamp('last_profile_update_at')->nullable();
        });

        Schema::create('dokter', function (Blueprint $table) {
            $table->increments('id_dokter');
            $table->foreignId('user_id')->nullable()->unique()->constrained('users')->nullOnDelete();
            $table->string('nama_dokter', 100);
            $table->unsignedInteger('id_poli');
            $table->foreign('id_poli')->references('id_poli')->on('poli');
        });

        Schema::create('perawat', function (Blueprint $table) {
            $table->increments('id_perawat');
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('nama_perawat', 100);
            $table->timestamps();
        });

        Schema::create('apoteker', function (Blueprint $table) {
            $table->increments('id_apoteker');
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('nama_apoteker', 100);
            $table->timestamps();
        });

        Schema::create('stok_obat', function (Blueprint $table) {
            $table->increments('id_stok');
            $table->unsignedInteger('id_obat')->unique();
            $table->integer('jumlah_stok');
            $table->foreign('id_obat')->references('id_obat')->on('obat');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stok_obat');
        Schema::dropIfExists('apoteker');
        Schema::dropIfExists('perawat');
        Schema::dropIfExists('dokter');
        Schema::dropIfExists('pasien');
        Schema::dropIfExists('obat');
        Schema::dropIfExists('poli');
    }
};
