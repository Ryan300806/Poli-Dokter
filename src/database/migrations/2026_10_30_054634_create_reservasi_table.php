<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */

    public function up(): void
    {
        Schema::create('reservasi', function (Blueprint $table) {
            $table->increments('id_reservasi');

            $table->unsignedInteger('id_pasien');
            $table->unsignedInteger('id_dokter');
            $table->unsignedInteger('id_slot');

            $table->date('tanggal');
            $table->integer('nomor_antrean');
            $table->string('status_reservasi', 20);
            $table->string('alasan_pembatalan', 255);

            $table->foreign('id_pasien')
                ->references('id_pasien')
                ->on('pasien');

            $table->foreign('id_dokter')
                ->references('id_dokter')
                ->on('dokter');

            $table->foreign('id_slot')
                ->references('id_slot')
                ->on('slot_jadwal');
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservasi');
    }
};
