param(
    [string]$Php = "php",
    [switch]$Siapkan
)
$ErrorActionPreference = "Stop"
$proyek = $PSScriptRoot
$compose = Join-Path $proyek "compose.yaml"
function Jalankan([string]$program, [string[]]$argumen) {
    & $program @argumen
    if ($LASTEXITCODE -ne 0) { throw "$program berhenti dengan kode $LASTEXITCODE." }
}
Push-Location (Join-Path $proyek "src")
try {
    $versi = & $Php -r 'echo intdiv(PHP_VERSION_ID,100);'
    if ($LASTEXITCODE -ne 0 -or $versi -ne "804") { throw "Pilih php.exe 8.4 dengan parameter -Php." }
    if (-not ((& $Php -m) -contains "pdo_mysql")) { throw "Aktifkan pdo_mysql pada php.ini milik PHP 8.4." }
    New-Item -ItemType Directory -Force -Path "bootstrap/cache","storage/framework/views","storage/framework/sessions","storage/framework/cache/data","storage/logs" | Out-Null
    if (-not (Test-Path ".env")) { Copy-Item ".env.example" ".env" }
    if ($Siapkan) {
        # Do not migrate the group's existing database, including a cached configuration.
        $databaseRevisi = @(Get-Content ".env" | Where-Object { $_ -match '^\s*DB_DATABASE\s*=' })
        if (@($databaseRevisi).Count -ne 1 -or $databaseRevisi -notcontains 'DB_DATABASE=rsi_rawat_jalan_revisi') { throw "Periksa DB_DATABASE di src\.env. Penyiapan memerlukan rsi_rawat_jalan_revisi." }
    }
    Jalankan "docker" @("compose", "-f", $compose, "up", "-d", "--wait", "db")
    if ($Siapkan) {
        # Composer on Windows selects php.exe from PATH; prefer the verified interpreter.
        $phpExe = (Get-Command $Php -CommandType Application).Source
        $pathSebelum = $env:Path
        try {
            $env:Path = (Split-Path $phpExe) + [IO.Path]::PathSeparator + $env:Path
            Jalankan "composer" @("install", "--prefer-dist", "--no-interaction")
        } finally { $env:Path = $pathSebelum }
        Jalankan $Php @("artisan", "config:clear")
        if (-not (Select-String -Path ".env" -Pattern '^APP_KEY=.+$' -Quiet)) {
            Jalankan $Php @("artisan", "key:generate")
        }
        Jalankan $Php @("artisan", "revisi:periksa-db")
        Jalankan $Php @("artisan", "migrate", "--seed")
        Jalankan $Php @("artisan", "db:seed", "--class=DemoKunjunganSeeder")
        Jalankan "npm.cmd" @("ci", "--no-audit", "--no-fund")
        Jalankan "npm.cmd" @("run", "build")
    }
    if (-not (Test-Path "public\build\manifest.json")) { throw "Aset belum dibangun. Jalankan kembali dengan -Siapkan." }
    if (Test-Path "public\hot") { throw "Mode Vite dev masih aktif. Hentikan npm run dev. Jika prosesnya sudah berhenti, hapus src\public\hot lalu jalankan ulang." }
    Jalankan $Php @("artisan", "serve", "--host=127.0.0.1", "--port=8010")
} finally { Pop-Location }
