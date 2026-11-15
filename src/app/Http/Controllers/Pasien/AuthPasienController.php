<?php

namespace App\Http\Controllers\Pasien;

use App\Http\Controllers\Controller;
use App\Models\DataPasien;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class AuthPasienController extends Controller
{
    public function login(): InertiaResponse|RedirectResponse
    {
        $request = request();
        $id = $request->session()->get('pasien_id') ?: filter_var($request->cookie('remember_pasien'), FILTER_VALIDATE_INT);
        if ($id && DataPasien::query()->whereKey($id)->exists()) {
            $request->session()->regenerate();
            $request->session()->put('pasien_id', $id);
            return redirect()->route('pasien.beranda');
        }
        return Inertia::render('Auth/Login');
    }

    public function masuk(Request $request): RedirectResponse
    {
        return app(LoginController::class)->login($request);
    }

    public function keluar(Request $request): RedirectResponse
    {
        $request->session()->forget('pasien_id');
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->withCookie(cookie()->forget('remember_pasien'));
    }
}
