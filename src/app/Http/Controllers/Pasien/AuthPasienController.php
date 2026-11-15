<?php

namespace App\Http\Controllers\Pasien;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class AuthPasienController extends Controller
{
    public function login(): InertiaResponse|RedirectResponse
    {
        $request = request();
        $id = $request->session()->get('pasien_id') ?: filter_var($request->cookie('remember_pasien'), FILTER_VALIDATE_INT);
        if ($id && DB::table('pasien')->where('id_pasien', $id)->exists()) {
            $request->session()->regenerate();
            $request->session()->put('pasien_id', $id);
            return redirect()->route('pasien.beranda');
        }
        return Inertia::render('Auth/Login');
    }

    public function masuk(Request $request): RedirectResponse
    {
        $data = $request->validate(['nik' => ['required', 'digits:16'], 'kataSandi' => ['required', 'string'], 'ingat' => ['nullable', 'boolean']]);
        $pasien = DB::table('pasien')->where('nik', $data['nik'])->first();

        if (!$pasien || !Hash::check($data['kataSandi'], $pasien->password)) {
            throw ValidationException::withMessages(['nik' => 'NIK atau kata sandi tidak cocok.']);
        }

        $request->session()->regenerate();
        $request->session()->put('pasien_id', $pasien->id_pasien);

        $response = redirect()->intended(route('pasien.beranda'))->with('success', 'Selamat datang kembali.');
        if ($request->boolean('ingat')) {
            return $response->withCookie(cookie('remember_pasien', (string) $pasien->id_pasien, 60 * 24 * 30, '/', null, (bool) config('session.secure'), true, false, 'lax'));
        }

        return $response->withCookie(cookie()->forget('remember_pasien'));
    }

    public function daftar(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'nik' => ['required', 'digits:16', 'unique:pasien,nik'],
            'namaLengkap' => ['required', 'string', 'max:100'],
            'tempatLahir' => ['required', 'string', 'max:50'],
            'tanggalLahir' => ['required', 'date', 'before_or_equal:today'],
            'alamat' => ['required', 'string', 'max:255'],
            'jenisKelamin' => ['required', 'in:laki-laki,perempuan'],
            'namaKontakDarurat' => ['required', 'string', 'max:100'],
            'noKontakDarurat' => ['required', 'string', 'max:20'],
            'kataSandi' => ['required', 'string', 'min:8', 'regex:/^(?=.*[A-Za-z])(?=.*\d).+$/', 'same:ulangiKataSandi'],
            'ulangiKataSandi' => ['required', 'string'],
            'setuju' => ['accepted'],
        ]);

        $id = DB::table('pasien')->insertGetId([
            'nik' => $data['nik'], 'nama_lengkap' => $data['namaLengkap'], 'tempat_lahir' => $data['tempatLahir'],
            'tanggal_lahir' => $data['tanggalLahir'], 'alamat' => $data['alamat'],
            'jenis_kelamin' => $data['jenisKelamin'] === 'perempuan' ? 'P' : 'L',
            'kontak_darurat' => $data['noKontakDarurat'], 'nama_kontak_darurat' => $data['namaKontakDarurat'],
            'password' => Hash::make($data['kataSandi']),
        ], 'id_pasien');

        $request->session()->regenerate();
        $request->session()->put('pasien_id', $id);

        return redirect()->route('pasien.beranda')->with('success', 'Akun pasien berhasil dibuat.');
    }

    public function keluar(Request $request): RedirectResponse
    {
        $request->session()->forget('pasien_id');
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->withCookie(cookie()->forget('remember_pasien'));
    }
}
