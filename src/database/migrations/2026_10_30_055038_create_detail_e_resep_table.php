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
        Schema::create('detail_e_resep', function (Blueprint $table) {
            $table->increments('id_detail_resep');

            $table->unsignedInteger('id_e_resep');
            $table->unsignedInteger('id_obat');

            $table->string('dosis', 100);
            $table->integer('jumlah_obat');
            $table->string('aturan_pakai', 255);

            $table->foreign('id_e_resep')
                ->references('id_e_resep')
                ->on('e_resep');

            $table->foreign('id_obat')
                ->references('id_obat')
                ->on('obat');
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detail_e_resep');
    }
};
