<?php

namespace App\Http\Controllers\Pasien;

use App\Http\Controllers\Controller;
use App\Models\DataPasien;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/** Controller registrasi sesuai CD-001 Modul 2. */
class RegistrasiController extends Controller
{
    public function kirimDataRegistrasi(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'nik' => ['required', 'digits:16'],
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
            return redirect()->route('login')->withErrors(['nik' => 'NIK sudah pernah digunakan untuk registrasi.']);
        }

        $berhasil = DataPasien::simpanDataPasien([
            'nik' => $data['nik'],
            'nama_lengkap' => $data['namaLengkap'],
            'tempat_lahir' => $data['tempatLahir'],
            'tanggal_lahir' => $data['tanggalLahir'],
            'alamat' => $data['alamat'],
            'jenis_kelamin' => $data['jenisKelamin'] === 'perempuan' ? 'P' : 'L',
            'kontak_darurat' => $data['noKontakDarurat'],
            'nama_kontak_darurat' => $data['namaKontakDarurat'],
            'password' => $data['kataSandi'],
        ]);

        if (! $berhasil) {
            return back()->withErrors(['nik' => 'Registrasi gagal. Silakan coba kembali.'])->withInput();
        }

        return redirect()->route('login')->with('success', 'Akun pasien berhasil dibuat. Silakan masuk.');
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
