<?php

namespace App\Http\Controllers\Pasien;

use App\Http\Controllers\Controller;
use App\Models\DataPasien;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/** Autentikasi pasien sesuai class diagram LoginController. */
class LoginController extends Controller
{
    public function login(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'nik' => ['required', 'digits:16'],
            'kataSandi' => ['required', 'string'],
            'ingat' => ['nullable', 'boolean'],
        ]);

        $akun = DataPasien::cariAkun($data['nik']);
        if (! $akun || ! DataPasien::validasiAkun($data['nik'], $data['kataSandi'])) {
            throw ValidationException::withMessages(['nik' => 'NIK atau kata sandi tidak cocok.']);
        }

        $request->session()->regenerate();
        $request->session()->put('pasien_id', (int) $akun['id_pasien']);
        $response = redirect()->intended(route('pasien.beranda'))->with('success', 'Selamat datang kembali.');

        return $request->boolean('ingat')
            ? $response->withCookie(cookie('remember_pasien', (string) $akun['id_pasien'], 60 * 24 * 30, '/', null, (bool) config('session.secure'), true, false, 'lax'))
            : $response->withCookie(cookie()->forget('remember_pasien'));
    }
}
