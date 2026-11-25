<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('revisi:periksa-db', function () {
    $db = \Illuminate\Support\Facades\DB::connection();
    if (! app()->environment('local') || $db->getDriverName() !== 'mysql'
        || $db->selectOne('SELECT DATABASE() AS nama')->nama !== 'rsi_rawat_jalan_revisi') {
        $this->error('Penyiapan memerlukan database lokal rsi_rawat_jalan_revisi.');
        return 1;
    }
    $this->info('Database khusus revisi terhubung.');
    return 0;
})->purpose('Pastikan target migrasi adalah database khusus revisi.');
