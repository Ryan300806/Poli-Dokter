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
        Schema::create('rekam_medis', function (Blueprint $table) {
            $table->increments('id_rekam_medis');

            $table->unsignedInteger('id_pasien');

            $table->text('riwayat_penyakit');
            $table->text('alergi');

            $table->foreign('id_pasien')
                ->references('id_pasien')
                ->on('pasien');
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rekam_medis');
    }
};
