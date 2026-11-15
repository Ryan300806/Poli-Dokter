<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pasien', function (Blueprint $table) {
            $table->string('golongan_darah', 3)->nullable()->after('jenis_kelamin');
            $table->timestamp('last_profile_update_at')->nullable()->after('password');
        });
    }

    public function down(): void
    {
        Schema::table('pasien', function (Blueprint $table) {
            $table->dropColumn(['golongan_darah', 'last_profile_update_at']);
        });
    }
};
