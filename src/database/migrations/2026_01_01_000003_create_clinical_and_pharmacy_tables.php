<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('slot_jadwal', function (Blueprint $table) {
            $table->increments('id_slot');
            $table->unsignedInteger('id_dokter');
            $table->unsignedInteger('id_poli');
            $table->date('tanggal');
            $table->time('jam');
            $table->integer('kuota');
            $table->integer('sisa_kuota');
            $table->string('status_slot', 20);

            $table->foreign('id_dokter')->references('id_dokter')->on('dokter');
            $table->foreign('id_poli')->references('id_poli')->on('poli');
            $table->index(['id_dokter', 'tanggal', 'status_slot'], 'idx_slot_dokter_tanggal_status');
            $table->index(['tanggal', 'status_slot'], 'idx_slot_tanggal_status');
        });

        Schema::create('reservasi', function (Blueprint $table) {
            $table->increments('id_reservasi');
            $table->unsignedInteger('id_pasien');
            $table->unsignedInteger('id_dokter');
            $table->unsignedInteger('id_slot');
            $table->date('tanggal');
            $table->integer('nomor_antrean');
            $table->string('status_reservasi', 20);
            $table->string('alasan_pembatalan', 255);

            $table->foreign('id_pasien')->references('id_pasien')->on('pasien');
            $table->foreign('id_dokter')->references('id_dokter')->on('dokter');
            $table->foreign('id_slot')->references('id_slot')->on('slot_jadwal');
            $table->index(['id_pasien', 'status_reservasi'], 'idx_reservasi_pasien_status');
            $table->index(['id_dokter', 'tanggal'], 'idx_reservasi_dokter_tanggal');
            $table->index('status_reservasi', 'idx_reservasi_status');
        });

        Schema::create('rekam_medis', function (Blueprint $table) {
            $table->increments('id_rekam_medis');
            $table->unsignedInteger('id_pasien');
            $table->text('riwayat_penyakit');
            $table->text('alergi');

            $table->foreign('id_pasien')->references('id_pasien')->on('pasien');
        });

        Schema::create('antrean', function (Blueprint $table) {
            $table->increments('id_antrean');
            $table->unsignedInteger('id_pasien');
            $table->unsignedInteger('id_reservasi');
            $table->date('tanggal_antrean');
            $table->string('jenis_antrean', 20);
            $table->string('status_antrean', 20);

            $table->foreign('id_pasien')->references('id_pasien')->on('pasien');
            $table->foreign('id_reservasi')->references('id_reservasi')->on('reservasi');
            $table->index(['tanggal_antrean', 'status_antrean'], 'idx_antrean_tanggal_status');
            $table->index('status_antrean', 'idx_antrean_status');
        });

        Schema::create('observasi', function (Blueprint $table) {
            $table->increments('id_observasi');
            $table->unsignedInteger('id_antrean');
            $table->unsignedInteger('id_perawat')->nullable();
            $table->string('tekanan_darah', 20);
            $table->decimal('suhu', 4, 1);
            $table->decimal('berat_badan', 5, 2);
            $table->dateTime('waktu_observasi');

            $table->foreign('id_antrean')->references('id_antrean')->on('antrean');
            $table->foreign('id_perawat')->references('id_perawat')->on('perawat')->nullOnDelete();
        });

        Schema::create('diagnosis', function (Blueprint $table) {
            $table->increments('id_diagnosis');
            $table->unsignedInteger('id_antrean');
            $table->unsignedInteger('id_dokter');
            $table->string('nama_diagnosis', 255);
            $table->text('rencana_tindakan');
            $table->string('status_pemeriksaan', 30);

            $table->foreign('id_antrean')->references('id_antrean')->on('antrean');
            $table->foreign('id_dokter')->references('id_dokter')->on('dokter');
        });

        Schema::create('e_resep', function (Blueprint $table) {
            $table->increments('id_e_resep');
            $table->unsignedInteger('id_pasien');
            $table->unsignedInteger('id_apoteker')->nullable();
            $table->unsignedInteger('id_diagnosis');
            $table->string('status_e_resep', 30);
            $table->string('alasan_penolakan', 500)->nullable();
            $table->dateTime('waktu_kirim');

            $table->foreign('id_pasien')->references('id_pasien')->on('pasien');
            $table->foreign('id_apoteker')->references('id_apoteker')->on('apoteker')->nullOnDelete();
            $table->foreign('id_diagnosis')->references('id_diagnosis')->on('diagnosis');
            $table->index('status_e_resep', 'idx_eresep_status');
            $table->index(['id_pasien', 'status_e_resep'], 'idx_eresep_pasien_status');
        });

        Schema::create('detail_e_resep', function (Blueprint $table) {
            $table->increments('id_detail_resep');
            $table->unsignedInteger('id_e_resep');
            $table->unsignedInteger('id_obat');
            $table->string('dosis', 100);
            $table->integer('jumlah_obat');
            $table->string('aturan_pakai', 255);

            $table->foreign('id_e_resep')->references('id_e_resep')->on('e_resep');
            $table->foreign('id_obat')->references('id_obat')->on('obat');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detail_e_resep');
        Schema::dropIfExists('e_resep');
        Schema::dropIfExists('diagnosis');
        Schema::dropIfExists('observasi');
        Schema::dropIfExists('antrean');
        Schema::dropIfExists('rekam_medis');
        Schema::dropIfExists('reservasi');
        Schema::dropIfExists('slot_jadwal');
    }
};
