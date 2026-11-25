<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class UkurRequestLokal
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! app()->environment('local')) {
            return $next($request);
        }

        $mulai = microtime(true);
        $jumlah = 0;
        $waktuSql = 0.0;
        DB::listen(function (QueryExecuted $query) use (&$jumlah, &$waktuSql) {
            $jumlah++;
            $waktuSql += $query->time;
        });
        $response = $next($request);
        $durasi = (microtime(true) - $mulai) * 1000;
        $response->headers->set('Server-Timing', sprintf('web;dur=%.2f, sql;dur=%.2f;desc="%d kueri"', $durasi, $waktuSql, $jumlah));

        return $response;
    }
}
