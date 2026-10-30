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
        Schema::create('diagnosis', function (Blueprint $table) {
            $table->increments('id_diagnosis');

            $table->unsignedInteger('id_antrean');
            $table->unsignedInteger('id_dokter');

            $table->string('nama_diagnosis', 255);
            $table->text('rencana_tindakan');
            $table->string('status_pemeriksaan', 30);

            $table->foreign('id_antrean')
                ->references('id_antrean')
                ->on('antrean');

            $table->foreign('id_dokter')
                ->references('id_dokter')
                ->on('dokter');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('diagnosis');
    }
};
