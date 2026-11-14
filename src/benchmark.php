
<?php

function ukur(string $nama, callable $proses): void
{
    $mulai = microtime(true);

    $proses();

    $durasi = microtime(true) - $mulai;

    echo $nama . ': '
        . round($durasi, 4)
        . " seconds\n";
}

echo "=== DETAILED LARAVEL DIAGNOSTIC ===\n\n";

$app = null;
$kernel = null;

ukur('1. Composer Autoload', function () {
    require __DIR__ . '/vendor/autoload.php';
});

ukur('2. Laravel Application Creation', function () use (&$app) {
    $app = require __DIR__ . '/bootstrap/app.php';
});

ukur('3. Console Kernel Resolution', function () use (&$app, &$kernel) {
    $kernel = $app->make(
        Illuminate\Contracts\Console\Kernel::class
    );
});

ukur('4. Laravel Full Bootstrap', function () use (&$kernel) {
    $kernel->bootstrap();
});

ukur('5. Artisan About', function () use (&$kernel) {
    $kernel->call('about');
});

echo "\n=== DIAGNOSTIC COMPLETED ===\n";
