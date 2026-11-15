<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('e_resep', function (Blueprint $table) {
            $table->string('alasan_penolakan', 500)->nullable()->after('status_e_resep');
        });
    }

    public function down(): void
    {
        Schema::table('e_resep', function (Blueprint $table) {
            $table->dropColumn('alasan_penolakan');
        });
    }
};
