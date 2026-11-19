<?php

namespace App\Http\Controllers;

use App\Models\DataPasien;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/** Autentikasi multi-role sesuai Class Diagram LoginController. */
class LoginController extends Controller
{
    public function showLogin(Request $request): Response|RedirectResponse
    {
        $role = $request->session()->get('user_role');
        if ($role) {
            return redirect($this->tujuanRole($role));
        }

        $rememberId = filter_var($request->cookie('remember_pasien'), FILTER_VALIDATE_INT);
        if ($rememberId) {
            $pasien = DataPasien::query()->whereKey($rememberId)->first(['id_pasien', 'user_id']);
            if ($pasien) {
                $request->session()->regenerate();
                $request->session()->put([
                    'user_id' => $pasien->user_id,
                    'user_role' => 'pasien',
                    'pasien_id' => $pasien->id_pasien,
                ]);

                return redirect()->route('pasien.beranda');
            }
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

        $akun = User::query()->where('username', trim($data['nik']))->first();
        if (! $akun || ! $akun->is_active || ! Hash::check($data['kataSandi'], $akun->password)) {
            throw ValidationException::withMessages(['nik' => 'NIK / Username atau kata sandi tidak cocok.']);
        }

        $request->session()->regenerate();
        $request->session()->put(['user_id' => $akun->id, 'user_role' => $akun->role]);

        $pasienId = null;
        if ($akun->role === 'pasien') {
            $pasienId = DataPasien::query()->where('user_id', $akun->id)->value('id_pasien');
            abort_if(! $pasienId, 403, 'Profil pasien belum terhubung ke akun.');
            $request->session()->put('pasien_id', (int) $pasienId);
        } elseif ($akun->role === 'dokter') {
            $dokterId = DB::table('dokter')->where('user_id', $akun->id)->value('id_dokter');
            if (! $dokterId) {
                throw ValidationException::withMessages(['nik' => 'Profil dokter belum terhubung ke akun ini.']);
            }
            $request->session()->put('dokter_id', (int) $dokterId);
        } elseif ($akun->role === 'perawat') {
            $perawatId = DB::table('perawat')->where('user_id', $akun->id)->value('id_perawat');
            if (! $perawatId) {
                throw ValidationException::withMessages(['nik' => 'Profil perawat belum terhubung ke akun ini.']);
            }
            $request->session()->put('perawat_id', (int) $perawatId);
        } elseif ($akun->role === 'apoteker') {
            $apotekerId = DB::table('apoteker')->where('user_id', $akun->id)->value('id_apoteker');
            if (! $apotekerId) {
                throw ValidationException::withMessages(['nik' => 'Profil apoteker belum terhubung ke akun ini.']);
            }
            $request->session()->put('apoteker_id', (int) $apotekerId);
        } else {
            throw ValidationException::withMessages(['nik' => 'Peran akun tidak dikenali.']);
        }

        $response = redirect($this->tujuanRole($akun->role))->with('success', 'Berhasil masuk.');

        return $request->boolean('ingat') && $pasienId
            ? $response->withCookie(cookie('remember_pasien', (string) $pasienId, 60 * 24 * 30, '/', null, (bool) config('session.secure'), true, false, 'lax'))
            : $response->withCookie(cookie()->forget('remember_pasien'));
    }

    public function logout(Request $request): RedirectResponse
    {
        $request->session()->forget(['pasien_id', 'dokter_id', 'perawat_id', 'apoteker_id', 'user_id', 'user_role']);
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->withCookie(cookie()->forget('remember_pasien'));
    }

    private function tujuanRole(string $role): string
    {
        return match ($role) {
            'pasien' => route('pasien.beranda'),
            'dokter' => route('dokter.antrean-periksa'),
            'perawat' => route('perawat.antrean-triage'),
            'apoteker' => route('apoteker.notifikasi-eresep'),
            default => route('login'),
        };
    }
}
