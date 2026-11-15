<?php

namespace App\Http\Controllers;

use App\Models\EResep;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Throwable;

/** Operasi kontrol E-Resep yang dicantumkan pada Class Diagram Modul 2. */
class EResepController extends Controller
{
    public function formEResep(int $idAntrean): \Inertia\Response
    {
        $context = DB::table('antrean as a')
            ->join('pasien as p', 'p.id_pasien', '=', 'a.id_pasien')
            ->join('diagnosis as dg', 'dg.id_antrean', '=', 'a.id_antrean')
            ->where('a.id_antrean', $idAntrean)
            ->orderByDesc('dg.id_diagnosis')
            ->first(['a.id_pasien', 'a.id_antrean', 'p.nama_lengkap', 'p.nik', 'dg.id_diagnosis', 'dg.nama_diagnosis']);
        abort_if(! $context, 404, 'Simpan diagnosis pemeriksaan sebelum membuat E-Resep.');

        return \Inertia\Inertia::render('Dokter/FormEResep', [
            'antreanId' => (string) $context->id_antrean,
            'idDiagnosis' => (int) $context->id_diagnosis,
            'pasienServer' => ['id_pasien' => (int) $context->id_pasien, 'nama' => $context->nama_lengkap, 'nik' => $context->nik, 'diagnosis' => $context->nama_diagnosis],
            'obatServer' => DB::table('obat')->orderBy('nama_obat')->get(['id_obat', 'nama_obat']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'id_pasien' => ['required', 'integer', 'exists:pasien,id_pasien'],
            'id_diagnosis' => ['required', 'integer', 'exists:diagnosis,id_diagnosis'],
            'daftar_obat' => ['required', 'array', 'min:1'],
            'daftar_obat.*.id_obat' => ['required', 'integer', 'exists:obat,id_obat'],
            'daftar_obat.*.dosis' => ['required', 'string', 'max:100'],
            'daftar_obat.*.jumlah_obat' => ['required', 'integer', 'min:1'],
            'daftar_obat.*.aturan_pakai' => ['required', 'string', 'max:255'],
        ]);

        $pemilikDiagnosis = DB::table('diagnosis as dg')->join('antrean as a', 'a.id_antrean', '=', 'dg.id_antrean')
            ->where('dg.id_diagnosis', $data['id_diagnosis'])->value('a.id_pasien');
        abort_unless((int) $pemilikDiagnosis === (int) $data['id_pasien'], 422, 'Diagnosis harus berasal dari pemeriksaan pasien yang sama.');

        $result = $this->kirimEResep($data);
        if (str_starts_with($result, 'Gagal')) {
            return back()->withErrors(['eresep' => $result]);
        }

        return back()->with('success', $result);
    }

    public function daftarNotifikasi(): \Inertia\Response
    {
        $resep = DB::table('e_resep as e')
            ->join('pasien as p', 'p.id_pasien', '=', 'e.id_pasien')
            ->join('diagnosis as dg', 'dg.id_diagnosis', '=', 'e.id_diagnosis')
            ->join('dokter as d', 'd.id_dokter', '=', 'dg.id_dokter')
            ->orderByDesc('e.waktu_kirim')
            ->get(['e.id_e_resep', 'e.id_pasien', 'e.status_e_resep', 'e.waktu_kirim', 'p.nama_lengkap', 'dg.nama_diagnosis', 'd.nama_dokter'])
            ->map(fn ($item) => [
                'id' => (string) $item->id_e_resep,
                'pasienId' => (int) $item->id_pasien,
                'pasien' => $item->nama_lengkap,
                'dokter' => $item->nama_dokter,
                'poli' => 'Rawat Jalan',
                'tanggal' => $item->waktu_kirim,
                'diagnosis' => $item->nama_diagnosis,
                'items' => collect(EResep::getInformasiObat((int) $item->id_e_resep))->map(fn ($obat) => [
                    ...$obat, 'nama' => $obat['nama_obat'], 'satuan' => $obat['jumlah_obat'], 'aturan' => $obat['aturan_pakai'],
                ])->all(),
                'jaminan' => '—',
                'status' => $this->labelStatus($item->status_e_resep),
                'dibaca' => false,
            ]);

        return \Inertia\Inertia::render('Apoteker/NotifikasiEResep', ['resepServer' => $resep]);
    }

    public function halamanRincian(int $idEResep): \Inertia\Response
    {
        $resep = $this->ambilEResep($idEResep);
        abort_if($resep === [], 404);

        $pasien = DB::table('pasien')->where('id_pasien', $resep['id_pasien'])->first(['id_pasien', 'nama_lengkap', 'nik']);
        $diagnosis = DB::table('diagnosis as dg')->join('dokter as d', 'd.id_dokter', '=', 'dg.id_dokter')
            ->where('dg.id_diagnosis', $resep['id_diagnosis'])->first(['dg.nama_diagnosis', 'd.nama_dokter']);
        $resep = [
            ...$resep,
            'pasien' => $pasien->nama_lengkap ?? '—',
            'pasienId' => $pasien->id_pasien ?? null,
            'rm' => 'P-' . str_pad((string) $resep['id_pasien'], 4, '0', STR_PAD_LEFT),
            'jaminan' => '—', 'poli' => 'Rawat Jalan',
            'dokter' => $diagnosis->nama_dokter ?? '—',
            'diagnosis' => $diagnosis->nama_diagnosis ?? '—',
            'tanggal' => $resep['waktu_kirim'],
            'status' => $this->labelStatus($resep['status_e_resep']),
            'items' => collect($resep['daftar_obat'])->map(fn ($obat) => [
                ...$obat, 'nama' => $obat['nama_obat'], 'satuan' => $obat['jumlah_obat'], 'aturan' => $obat['aturan_pakai'],
            ])->all(),
        ];

        return \Inertia\Inertia::render('Apoteker/RincianEResep', ['eresepId' => (string) $idEResep, 'resepServer' => $resep]);
    }

    public function updateStatusHttp(Request $request, int $idEResep): RedirectResponse
    {
        $data = $request->validate(['statusBaru' => ['required', 'in:terkirim,diproses,siap_diserahkan,ditolak,selesai']]);
        abort_unless($this->perbaruiStatusEResep($idEResep, $data['statusBaru']), 404);

        return back()->with('success', 'Status E-Resep berhasil diperbarui.');
    }

    private function labelStatus(string $status): string
    {
        return [
            'terkirim' => 'Menunggu Telaah Resep', 'diproses' => 'Perlu Diracik',
            'siap_diserahkan' => 'Siap Diserahkan', 'ditolak' => 'Ditolak', 'selesai' => 'Obat Sudah Diberikan',
        ][$status] ?? $status;
    }

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
