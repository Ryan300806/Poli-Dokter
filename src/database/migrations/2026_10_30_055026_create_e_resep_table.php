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
        Schema::create('e_resep', function (Blueprint $table) {
            $table->increments('id_e_resep');

            $table->unsignedInteger('id_pasien');
            $table->unsignedInteger('id_diagnosis');

            $table->string('status_e_resep', 30);
            $table->dateTime('waktu_kirim');

            $table->foreign('id_pasien')
                ->references('id_pasien')
                ->on('pasien');

            $table->foreign('id_diagnosis')
                ->references('id_diagnosis')
                ->on('diagnosis');
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('e_resep');
    }
};
