<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PasienSession
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->session()->has('pasien_id')) {
            return redirect()->route('login')->with('info', 'Silakan masuk untuk membuka portal pasien.');
        }

        return $next($request);
    }
}
