<?php

namespace App\Http\Controllers;

use App\Models\EResep;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Throwable;

/** Operasi kontrol E-Resep yang dicantumkan pada Class Diagram Modul 2. */
class EResepController extends Controller
{
    public function kirimEResep(array $dataEResep): string
    {
        $dataEResep = Validator::make($dataEResep, [
            'id_pasien' => ['required', 'integer', 'exists:pasien,id_pasien'],
            'id_diagnosis' => ['required', 'integer', 'exists:diagnosis,id_diagnosis'],
            'daftar_obat' => ['required', 'array', 'min:1'],
            'daftar_obat.*.id_obat' => ['required', 'integer', 'exists:obat,id_obat'],
            'daftar_obat.*.dosis' => ['required', 'string', 'max:100'],
            'daftar_obat.*.jumlah_obat' => ['required', 'integer', 'min:1'],
            'daftar_obat.*.aturan_pakai' => ['required', 'string', 'max:255'],
        ])->validate();

        try {
            return 'E-Resep berhasil dikirim dengan ID '.EResep::simpanEResep($dataEResep);
        } catch (Throwable $error) {
            Log::error('Gagal menyimpan E-Resep.', ['exception' => $error]);

            return 'Gagal mengirim E-Resep.';
        }
    }

    public function ambilEResep(int $idEResep): array
    {
        return EResep::getEResep($idEResep) ?? [];
    }

    public function cekKetersediaanObat(array $dataEResep): array
    {
        return EResep::getInformasiObat($dataEResep);
    }

    public function pilihObat(int $idEResep, int $idObat): bool
    {
        foreach (EResep::getInformasiObat($idEResep) as $obat) {
            if ((int) $obat['id_obat'] === $idObat && (int) ($obat['jumlah_stok'] ?? 0) > 0) {
                return true;
            }
        }

        return false;
    }

    public function perbaruiStatusEResep(int $idEResep, string $statusBaru): bool
    {
        if (! in_array($statusBaru, ['terkirim', 'diproses', 'siap_diserahkan', 'ditolak', 'selesai'], true)) {
            return false;
        }

        return EResep::updateStatusEResep($idEResep, $statusBaru);
    }
}
