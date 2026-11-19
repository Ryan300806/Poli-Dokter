<?php

namespace App\Http\Middleware;

use App\Models\DataPasien;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PasienSession
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->session()->has('pasien_id') && $request->cookie('remember_pasien')) {
            $id = filter_var($request->cookie('remember_pasien'), FILTER_VALIDATE_INT);
            if ($id && DataPasien::query()->whereKey($id)->exists()) {
                $request->session()->regenerate();
                $request->session()->put('pasien_id', $id);
            }
        }

        if (! $request->session()->has('pasien_id')) {
            return redirect()->route('login')->with('info', 'Silakan masuk untuk membuka portal pasien.');
        }

        if ($request->session()->has('user_role') && $request->session()->get('user_role') !== 'pasien') {
            abort(403, 'Akun ini bukan akun pasien.');
        }

        return $next($request);
    }
}
