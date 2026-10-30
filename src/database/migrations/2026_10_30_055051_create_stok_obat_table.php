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
        Schema::create('stok_obat', function (Blueprint $table) {
            $table->increments('id_stok');

            $table->unsignedInteger('id_obat')->unique();

            $table->integer('jumlah_stok');

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
        Schema::dropIfExists('stok_obat');
    }
};
