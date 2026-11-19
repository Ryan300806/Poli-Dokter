<?php

namespace App\Http\Controllers;

use App\Models\EResep;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

/** Operasi kontrol E-Resep sesuai Class Diagram. */
class EResepController extends Controller
{
    public function formEResep(Request $request, int $idAntrean): Response
    {
        $idDokter = (int) $request->session()->get('dokter_id');

        $context = DB::table('antrean as a')
            ->join('reservasi as r', 'r.id_reservasi', '=', 'a.id_reservasi')
            ->join('pasien as p', 'p.id_pasien', '=', 'a.id_pasien')
            ->join('diagnosis as dg', 'dg.id_antrean', '=', 'a.id_antrean')
            ->join('dokter as d', 'd.id_dokter', '=', 'dg.id_dokter')
            ->where('a.id_antrean', $idAntrean)
            ->where('r.id_dokter', $idDokter)
            ->orderByDesc('dg.id_diagnosis')
            ->first([
                'a.id_pasien', 'a.id_antrean', 'p.nama_lengkap', 'p.nik', 'p.tanggal_lahir', 'p.jenis_kelamin',
                'dg.id_diagnosis', 'dg.nama_diagnosis', 'd.nama_dokter',
            ]);

        abort_if(! $context, 404, 'Diagnosis pemeriksaan belum ditemukan atau antrean bukan milik Anda.');

        $obatServer = DB::table('obat as o')
            ->leftJoin('stok_obat as s', 's.id_obat', '=', 'o.id_obat')
            ->orderBy('o.nama_obat')
            ->get(['o.id_obat', 'o.nama_obat', DB::raw('COALESCE(s.jumlah_stok, 0) as jumlah_stok')]);

        return Inertia::render('Dokter/FormEResep', [
            'antreanId' => (string) $context->id_antrean,
            'idDiagnosis' => (int) $context->id_diagnosis,
            'pasienServer' => [
                'id_pasien' => (int) $context->id_pasien,
                'rm' => 'RM-'.str_pad((string) $context->id_pasien, 6, '0', STR_PAD_LEFT),
                'nama' => $context->nama_lengkap,
                'nik' => $context->nik,
                'umur' => $context->tanggal_lahir ? (int) now()->diffInYears($context->tanggal_lahir) : null,
                'jk' => $context->jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki',
                'diagnosis' => $context->nama_diagnosis,
                'dokter' => $context->nama_dokter,
            ],
            'obatServer' => $obatServer,
            'eresepServer' => EResep::getEResepUntukDiagnosis((int) $context->id_diagnosis),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $idDokter = (int) $request->session()->get('dokter_id');
        $data = $request->validate([
            'id_pasien' => ['required', 'integer', 'exists:pasien,id_pasien'],
            'id_diagnosis' => ['required', 'integer', 'exists:diagnosis,id_diagnosis'],
            'daftar_obat' => ['required', 'array', 'min:1'],
            'daftar_obat.*.id_obat' => ['required', 'integer', 'exists:obat,id_obat'],
            'daftar_obat.*.dosis' => ['required', 'string', 'max:100'],
            'daftar_obat.*.jumlah_obat' => ['required', 'integer', 'min:1'],
            'daftar_obat.*.aturan_pakai' => ['required', 'string', 'max:255'],
        ]);

        $diagnosis = DB::table('diagnosis as dg')
            ->join('antrean as a', 'a.id_antrean', '=', 'dg.id_antrean')
            ->where('dg.id_diagnosis', $data['id_diagnosis'])
            ->first(['a.id_pasien', 'dg.id_dokter']);

        abort_unless($diagnosis && (int) $diagnosis->id_pasien === (int) $data['id_pasien'] && (int) $diagnosis->id_dokter === $idDokter, 403);

        $result = $this->kirimEResep($data);
        if (str_starts_with($result, 'Gagal')) {
            return back()->withErrors(['eresep' => $result]);
        }

        return redirect()->route('dokter.antrean-periksa')->with('success', $result);
    }

    public function update(Request $request, int $idEResep): RedirectResponse
    {
        $idDokter = (int) $request->session()->get('dokter_id');
        $data = $request->validate([
            'daftar_obat' => ['required', 'array', 'min:1'],
            'daftar_obat.*.id_obat' => ['required', 'integer', 'exists:obat,id_obat'],
            'daftar_obat.*.dosis' => ['required', 'string', 'max:100'],
            'daftar_obat.*.jumlah_obat' => ['required', 'integer', 'min:1'],
            'daftar_obat.*.aturan_pakai' => ['required', 'string', 'max:255'],
        ]);

        $pemilik = DB::table('e_resep as e')->join('diagnosis as dg', 'dg.id_diagnosis', '=', 'e.id_diagnosis')
            ->where('e.id_e_resep', $idEResep)->value('dg.id_dokter');
        abort_unless((int) $pemilik === $idDokter, 403);

        if (! EResep::updateEResep($idEResep, $data['daftar_obat'])) {
            return back()->withErrors(['eresep' => 'E-Resep tidak dapat diubah karena sudah diproses atau diserahkan farmasi.']);
        }

        return back()->with('success', 'E-Resep berhasil diperbarui dan dikirim ulang ke farmasi.');
    }

    public function daftarNotifikasi(): Response
    {
        $resep = DB::table('e_resep as e')
            ->join('pasien as p', 'p.id_pasien', '=', 'e.id_pasien')
            ->join('diagnosis as dg', 'dg.id_diagnosis', '=', 'e.id_diagnosis')
            ->join('dokter as d', 'd.id_dokter', '=', 'dg.id_dokter')
            ->leftJoin('poli as po', 'po.id_poli', '=', 'd.id_poli')
            ->orderByDesc('e.waktu_kirim')
            ->get(['e.id_e_resep', 'e.id_pasien', 'e.status_e_resep', 'e.waktu_kirim', 'p.nama_lengkap', 'dg.nama_diagnosis', 'd.nama_dokter', 'po.nama_poli'])
            ->map(fn ($item) => [
                'id' => (string) $item->id_e_resep,
                'pasienId' => (int) $item->id_pasien,
                'pasien' => $item->nama_lengkap,
                'dokter' => $item->nama_dokter,
                'poli' => $item->nama_poli,
                'tanggal' => $item->waktu_kirim,
                'diagnosis' => $item->nama_diagnosis,
                'items' => collect(EResep::getInformasiObat((int) $item->id_e_resep))->map(fn ($obat) => [
                    ...$obat, 'nama' => $obat['nama_obat'], 'satuan' => $obat['jumlah_obat'], 'aturan' => $obat['aturan_pakai'],
                ])->all(),
                'status' => $this->labelStatus($item->status_e_resep),
                'statusRaw' => $item->status_e_resep,
            ]);

        return Inertia::render('Apoteker/NotifikasiEResep', ['resepServer' => $resep]);
    }

    public function halamanRincian(int $idEResep): Response
    {
        $resep = $this->ambilEResep($idEResep);
        abort_if($resep === [], 404);

        $pasien = DB::table('pasien')->where('id_pasien', $resep['id_pasien'])->first(['id_pasien', 'nama_lengkap', 'nik']);
        $diagnosis = DB::table('diagnosis as dg')
            ->join('dokter as d', 'd.id_dokter', '=', 'dg.id_dokter')
            ->leftJoin('poli as po', 'po.id_poli', '=', 'd.id_poli')
            ->where('dg.id_diagnosis', $resep['id_diagnosis'])
            ->first(['dg.nama_diagnosis', 'd.nama_dokter', 'po.nama_poli']);

        $resep = [
            ...$resep,
            'id' => (string) $resep['id_e_resep'],
            'pasien' => $pasien->nama_lengkap ?? '—',
            'pasienId' => $pasien->id_pasien ?? null,
            'rm' => 'RM-'.str_pad((string) ($pasien->id_pasien ?? 0), 6, '0', STR_PAD_LEFT),
            'poli' => $diagnosis->nama_poli ?? '—',
            'dokter' => $diagnosis->nama_dokter ?? '—',
            'diagnosis' => $diagnosis->nama_diagnosis ?? '—',
            'tanggal' => $resep['waktu_kirim'],
            'status' => $this->labelStatus($resep['status_e_resep']),
            'items' => collect($resep['daftar_obat'])->map(fn ($obat) => [
                ...$obat, 'nama' => $obat['nama_obat'], 'satuan' => $obat['jumlah_obat'], 'aturan' => $obat['aturan_pakai'],
            ])->all(),
        ];

        return Inertia::render('Apoteker/RincianEResep', ['eresepId' => (string) $idEResep, 'resepServer' => $resep]);
    }

    public function updateStatusHttp(Request $request, int $idEResep): RedirectResponse
    {
        $data = $request->validate([
            'statusBaru' => ['required', 'in:terkirim,diproses,siap_diserahkan,ditolak,selesai'],
            'alasanPenolakan' => ['required_if:statusBaru,ditolak', 'nullable', 'string', 'max:500'],
        ]);

        if (in_array($data['statusBaru'], ['siap_diserahkan', 'selesai'], true)) {
            $kurang = EResep::cekStokKurang($idEResep);
            if ($kurang !== []) {
                return back()->withErrors(['stok' => 'Stok obat tidak mencukupi: '.implode(', ', $kurang).'.']);
            }
        }

        $idApoteker = $request->session()->get('apoteker_id');
        abort_unless($this->perbaruiStatusEResep($idEResep, $data['statusBaru'], $data['alasanPenolakan'] ?? null, $idApoteker ? (int) $idApoteker : null), 404);

        return back()->with('success', 'Status E-Resep berhasil diperbarui.');
    }

    private function labelStatus(string $status): string
    {
        return [
            'terkirim' => 'Menunggu Telaah Resep',
            'diproses' => 'Perlu Diracik',
            'siap_diserahkan' => 'Siap Diserahkan',
            'ditolak' => 'Ditolak',
            'selesai' => 'Obat Sudah Diberikan',
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
            if ((int) $obat['id_obat'] === $idObat && (int) ($obat['jumlah_stok'] ?? 0) >= (int) $obat['jumlah_obat']) {
                return true;
            }
        }

        return false;
    }

    public function perbaruiStatusEResep(int $idEResep, string $statusBaru, ?string $alasanPenolakan = null, ?int $idApoteker = null): bool
    {
        if (! in_array($statusBaru, ['terkirim', 'diproses', 'siap_diserahkan', 'ditolak', 'selesai'], true)) {
            return false;
        }

        return EResep::updateStatusEResep($idEResep, $statusBaru, $alasanPenolakan, $idApoteker);
    }
}
