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
        Schema::create('observasi', function (Blueprint $table) {
            $table->increments('id_observasi');

            $table->unsignedInteger('id_antrean');

            $table->string('tekanan_darah', 20);
            $table->decimal('suhu', 4, 1);
            $table->decimal('berat_badan', 5, 2);
            $table->dateTime('waktu_observasi');

            $table->foreign('id_antrean')
                ->references('id_antrean')
                ->on('antrean');
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('observasi');
    }
};
