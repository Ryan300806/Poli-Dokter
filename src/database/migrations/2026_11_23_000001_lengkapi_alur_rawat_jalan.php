<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservasi', function (Blueprint $table) {
            $table->index(['id_slot', 'nomor_antrean'], 'idx_reservasi_nomor_slot');
        });
        Schema::table('pasien', function (Blueprint $table) {
            $table->char('no_kk', 16)->nullable();
        });
        Schema::table('e_resep', function (Blueprint $table) {
            $table->unsignedInteger('versi')->default(1);
            $table->index(['id_diagnosis', 'id_e_resep'], 'idx_resep_diagnosis_terakhir');
        });
        Schema::table('observasi', function (Blueprint $table) {
            $table->index(['id_antrean', 'waktu_observasi', 'id_observasi'], 'idx_observasi_terakhir');
        });
        Schema::table('diagnosis', function (Blueprint $table) {
            $table->index(['id_antrean', 'id_diagnosis'], 'idx_diagnosis_terakhir');
        });
        Schema::create('aktivitas_e_resep', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('id_e_resep');
            $table->foreign('id_e_resep')->references('id_e_resep')->on('e_resep');
            $table->foreignId('user_id')->constrained('users');
            $table->string('aktivitas', 40);
            $table->string('status_lama', 30)->nullable();
            $table->string('status_baru', 30);
            $table->unsignedInteger('versi');
            $table->dateTime('waktu');
        });
        Schema::create('penerimaan_stok', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('id_obat');
            $table->foreign('id_obat')->references('id_obat')->on('obat');
            $table->foreignId('user_id')->constrained('users');
            $table->string('nomor_bukti', 80);
            $table->unsignedInteger('jumlah');
            $table->dateTime('waktu');
            $table->unique(['id_obat', 'nomor_bukti']);
        });
    }

    public function down(): void
    {
        Schema::table('reservasi', fn (Blueprint $t) => $t->dropIndex('idx_reservasi_nomor_slot'));
        Schema::dropIfExists('penerimaan_stok');
        Schema::dropIfExists('aktivitas_e_resep');
        Schema::table('diagnosis', fn (Blueprint $t) => $t->dropIndex('idx_diagnosis_terakhir'));
        Schema::table('observasi', fn (Blueprint $t) => $t->dropIndex('idx_observasi_terakhir'));
        Schema::table('e_resep', function (Blueprint $t) {
            $t->dropIndex('idx_resep_diagnosis_terakhir');
            $t->dropColumn('versi');
        });
        Schema::table('pasien', fn (Blueprint $t) => $t->dropColumn('no_kk'));
    }
};
