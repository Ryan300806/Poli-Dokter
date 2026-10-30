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
        Schema::create('slot_jadwal', function (Blueprint $table) {
            $table->increments('id_slot');

            $table->unsignedInteger('id_dokter');
            $table->unsignedInteger('id_poli');

            $table->date('tanggal');
            $table->time('jam');
            $table->integer('kuota');
            $table->integer('sisa_kuota');
            $table->string('status_slot', 20);

            $table->foreign('id_dokter')
                ->references('id_dokter')
                ->on('dokter');

            $table->foreign('id_poli')
                ->references('id_poli')
                ->on('poli');
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('slot_jadwal');
    }
};
