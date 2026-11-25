<?php

namespace App\Http\Controllers;

use App\Models\DataPasien;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/** Controller registrasi sesuai Class Diagram. */
class RegistrasiController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Auth/Registrasi');
    }

    public function kirimDataRegistrasi(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'nik' => ['required', 'digits:16'],
            'noKK' => ['required', 'digits:16'],
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

        if (! $this->verifikasiData($data)) {
            throw ValidationException::withMessages(['nik' => 'Data registrasi tidak valid.']);
        }

        if (DataPasien::cekNIK($data['nik'])) {
            return back()->withErrors(['nik' => 'NIK sudah pernah terdaftar. Silakan masuk menggunakan akun yang ada.']);
        }

        try {
            $idPasien = DB::transaction(function () use ($data) {
                $user = User::query()->create([
                    'name' => $data['namaLengkap'],
                    'username' => $data['nik'],
                    'email' => $data['nik'].'@pasien.local',
                    'password' => $data['kataSandi'],
                    'role' => 'pasien',
                    'is_active' => true,
                ]);

                DataPasien::simpanDataPasien([
                    'user_id' => $user->id,
                    'nik' => $data['nik'],
                    'no_kk' => $data['noKK'],
                    'nama_lengkap' => $data['namaLengkap'],
                    'tempat_lahir' => $data['tempatLahir'],
                    'tanggal_lahir' => $data['tanggalLahir'],
                    'alamat' => $data['alamat'],
                    'jenis_kelamin' => $data['jenisKelamin'] === 'perempuan' ? 'P' : 'L',
                    'kontak_darurat' => $data['noKontakDarurat'],
                    'nama_kontak_darurat' => $data['namaKontakDarurat'],
                    'password' => $data['kataSandi'],
                ]);
                return DataPasien::where('user_id', $user->id)->value('id_pasien');
            });
        } catch (\Illuminate\Database\UniqueConstraintViolationException $error) {
            if (User::where('username', $data['nik'])->exists()) {
                throw ValidationException::withMessages(['nik' => 'NIK sudah terdaftar. Silakan masuk.']);
            }
            throw $error;
        }

        $rm = 'RM-'.str_pad((string) $idPasien, 6, '0', STR_PAD_LEFT);
        return redirect()->route('login')->with('success', 'Registrasi berhasil. Nomor rekam medis Anda '.$rm.'. Silakan masuk menggunakan NIK.');
    }

    private function verifikasiData(array $dataPasien): bool
    {
        foreach (['nik', 'namaLengkap', 'tempatLahir', 'tanggalLahir', 'alamat', 'jenisKelamin', 'noKontakDarurat', 'kataSandi'] as $field) {
            if (! isset($dataPasien[$field]) || trim((string) $dataPasien[$field]) === '') {
                return false;
            }
        }

        return preg_match('/^\d{16}$/', (string) $dataPasien['nik']) === 1;
    }
}
