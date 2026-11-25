<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
{
    public function showLogin(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        if ($user && $user->is_active && $user->tujuanPortal()) {
            return redirect()->route($user->tujuanPortal());
        }

        return Inertia::render('Auth/Login');
    }

    public function login(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'nik' => ['required', 'string', 'max:100'],
            'kataSandi' => ['required', 'string'],
            'ingat' => ['nullable', 'boolean'],
        ]);
        $username = trim($data['nik']);
        $key = 'login:'.hash('sha256', strtolower($username).'|'.$request->ip());
        if (RateLimiter::tooManyAttempts($key, 5)) {
            throw ValidationException::withMessages(['nik' => 'Terlalu banyak percobaan. Coba lagi dalam '.RateLimiter::availableIn($key).' detik.']);
        }

        $user = User::where('username', $username)->first();
        if (! $user || ! $user->is_active || ! Hash::check($data['kataSandi'], $user->password)) {
            RateLimiter::hit($key, 60);
            throw ValidationException::withMessages(['nik' => 'NIK, nama pengguna, atau kata sandi tidak cocok.']);
        }

        $id = $user->idPelaku();
        if (! $id || ! $user->tujuanPortal()) {
            throw ValidationException::withMessages(['nik' => 'Profil layanan belum terhubung ke akun ini.']);
        }
        RateLimiter::clear($key);
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        Auth::login($user, $user->role === 'pasien' && $request->boolean('ingat'));
        $request->session()->put(['user_role' => $user->role, 'user_id' => $user->id, $user->role.'_id' => $id]);

        return redirect()->route($user->tujuanPortal())->withCookie(cookie()->forget('remember_pasien'));
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->withCookie(cookie()->forget('remember_pasien'));
    }
}
