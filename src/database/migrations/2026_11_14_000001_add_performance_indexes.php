<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Index on reservasi for common query patterns
        Schema::table('reservasi', function (Blueprint $table) {
            $table->index(['id_pasien', 'status_reservasi'], 'idx_reservasi_pasien_status');
            $table->index(['id_dokter', 'tanggal'], 'idx_reservasi_dokter_tanggal');
            $table->index('status_reservasi', 'idx_reservasi_status');
        });

        // Index on antrean for queue lookup
        Schema::table('antrean', function (Blueprint $table) {
            $table->index(['tanggal_antrean', 'status_antrean'], 'idx_antrean_tanggal_status');
            $table->index('status_antrean', 'idx_antrean_status');
        });

        // Index on slot_jadwal for schedule queries
        Schema::table('slot_jadwal', function (Blueprint $table) {
            $table->index(['id_dokter', 'tanggal', 'status_slot'], 'idx_slot_dokter_tanggal_status');
            $table->index(['tanggal', 'status_slot'], 'idx_slot_tanggal_status');
        });

        // Index on e_resep for pharmacist queries
        Schema::table('e_resep', function (Blueprint $table) {
            $table->index('status_e_resep', 'idx_eresep_status');
            $table->index(['id_pasien', 'status_e_resep'], 'idx_eresep_pasien_status');
        });
    }

    public function down(): void
    {
        Schema::table('reservasi', function (Blueprint $table) {
            $table->dropIndex('idx_reservasi_pasien_status');
            $table->dropIndex('idx_reservasi_dokter_tanggal');
            $table->dropIndex('idx_reservasi_status');
        });

        Schema::table('antrean', function (Blueprint $table) {
            $table->dropIndex('idx_antrean_tanggal_status');
            $table->dropIndex('idx_antrean_status');
        });

        Schema::table('slot_jadwal', function (Blueprint $table) {
            $table->dropIndex('idx_slot_dokter_tanggal_status');
            $table->dropIndex('idx_slot_tanggal_status');
        });

        Schema::table('e_resep', function (Blueprint $table) {
            $table->dropIndex('idx_eresep_status');
            $table->dropIndex('idx_eresep_pasien_status');
        });
    }
};
