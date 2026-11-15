<?php

namespace App\Http\Controllers\Pasien;

use App\Http\Controllers\Controller;
use App\Models\DataPasien;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
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
        $data = $request->validate(['nik' => ['required', 'digits:16'], 'kataSandi' => ['required', 'string'], 'ingat' => ['nullable', 'boolean']]);
        $pasien = DataPasien::cariAkun($data['nik']);

        if (!$pasien || !DataPasien::validasiAkun($data['nik'], $data['kataSandi'])) {
            throw ValidationException::withMessages(['nik' => 'NIK atau kata sandi tidak cocok.']);
        }

        $request->session()->regenerate();
        $request->session()->put('pasien_id', $pasien['id_pasien']);

        $response = redirect()->intended(route('pasien.beranda'))->with('success', 'Selamat datang kembali.');
        if ($request->boolean('ingat')) {
            return $response->withCookie(cookie('remember_pasien', (string) $pasien->id_pasien, 60 * 24 * 30, '/', null, (bool) config('session.secure'), true, false, 'lax'));
        }

        return $response->withCookie(cookie()->forget('remember_pasien'));
    }

    public function keluar(Request $request): RedirectResponse
    {
        $request->session()->forget('pasien_id');
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->withCookie(cookie()->forget('remember_pasien'));
    }
}
