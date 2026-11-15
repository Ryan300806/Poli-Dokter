<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class PasienSession
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->session()->has('pasien_id') && $request->cookie('remember_pasien')) {
            $id = filter_var($request->cookie('remember_pasien'), FILTER_VALIDATE_INT);
            if ($id && DB::table('pasien')->where('id_pasien', $id)->exists()) {
                $request->session()->regenerate();
                $request->session()->put('pasien_id', $id);
            }
        }

        if (!$request->session()->has('pasien_id')) {
            return redirect()->route('login')->with('info', 'Silakan masuk untuk membuka portal pasien.');
        }

        return $next($request);
    }
}
