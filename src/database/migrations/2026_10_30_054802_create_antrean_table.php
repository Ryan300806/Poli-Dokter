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
        Schema::create('antrean', function (Blueprint $table) {
            $table->increments('id_antrean');

            $table->unsignedInteger('id_pasien');
            $table->unsignedInteger('id_reservasi');

            $table->date('tanggal_antrean');
            $table->string('jenis_antrean', 20);
            $table->string('status_antrean', 20);

            $table->foreign('id_pasien')
                ->references('id_pasien')
                ->on('pasien');

            $table->foreign('id_reservasi')
                ->references('id_reservasi')
                ->on('reservasi');
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('antrean');
    }
};
