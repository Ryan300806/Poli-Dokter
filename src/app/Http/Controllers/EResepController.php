<?php

namespace App\Http\Controllers;

use App\Models\EResep;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

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
                'umur' => $context->tanggal_lahir ? (int) \Carbon\Carbon::parse($context->tanggal_lahir)->age : null,
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
            'daftar_obat' => ['required', 'array', 'min:1', 'max:100'],
            'daftar_obat.*.id_obat' => ['required', 'integer', 'exists:obat,id_obat'],
            'daftar_obat.*.dosis' => ['required', 'string', 'max:100'],
            'daftar_obat.*.jumlah_obat' => ['required', 'integer', 'min:1', 'max:2147483647'],
            'daftar_obat.*.aturan_pakai' => ['required', 'string', 'max:255'],
        ]);

        $diagnosis = DB::table('diagnosis as dg')
            ->join('antrean as a', 'a.id_antrean', '=', 'dg.id_antrean')
            ->where('dg.id_diagnosis', $data['id_diagnosis'])
            ->first(['a.id_pasien', 'dg.id_dokter']);

        abort_unless($diagnosis && (int) $diagnosis->id_pasien === (int) $data['id_pasien'] && (int) $diagnosis->id_dokter === $idDokter, 403);

        $result = $this->kirimEResep($data);

        return redirect()->route('dokter.antrean-periksa')->with('success', $result);
    }

    public function update(Request $request, int $idEResep): RedirectResponse
    {
        $idDokter = (int) $request->session()->get('dokter_id');
        $data = $request->validate([
            'versi' => ['required', 'integer', 'min:1'],
            'daftar_obat' => ['required', 'array', 'min:1', 'max:100'],
            'daftar_obat.*.id_obat' => ['required', 'integer', 'exists:obat,id_obat'],
            'daftar_obat.*.dosis' => ['required', 'string', 'max:100'],
            'daftar_obat.*.jumlah_obat' => ['required', 'integer', 'min:1', 'max:2147483647'],
            'daftar_obat.*.aturan_pakai' => ['required', 'string', 'max:255'],
        ]);

        $pemilik = DB::table('e_resep as e')->join('diagnosis as dg', 'dg.id_diagnosis', '=', 'e.id_diagnosis')
            ->where('e.id_e_resep', $idEResep)->value('dg.id_dokter');
        abort_unless((int) $pemilik === $idDokter, 403);

        if (! EResep::updateEResep($idEResep, $data['daftar_obat'], (int) $data['versi'])) {
            return back()->withErrors(['eresep' => 'E-Resep tidak dapat diubah karena sudah diproses atau diserahkan farmasi.']);
        }

        return back()->with('success', 'E-Resep berhasil diperbarui dan dikirim ulang ke farmasi.');
    }

    public function daftarNotifikasi(Request $request): Response
    {
        $filters = $request->validate([
            'status' => ['nullable', 'in:terkirim,diproses,siap_diserahkan,ditolak,selesai'],
            'q' => ['nullable', 'string', 'max:100'],
        ]);
        $status = $filters['status'] ?? '';
        $kata = trim($filters['q'] ?? '');
        $resep = DB::table('e_resep as e')
            ->join('pasien as p', 'p.id_pasien', '=', 'e.id_pasien')
            ->join('diagnosis as dg', 'dg.id_diagnosis', '=', 'e.id_diagnosis')
            ->join('dokter as d', 'd.id_dokter', '=', 'dg.id_dokter')
            ->join('poli as po', 'po.id_poli', '=', 'd.id_poli')
            ->when($status, fn ($q) => $q->where('e.status_e_resep', $status))
            ->when($kata !== '', fn ($q) => $q->where(function ($q) use ($kata) {
                $q->where('p.nama_lengkap', 'like', '%'.$kata.'%')->orWhere('d.nama_dokter', 'like', '%'.$kata.'%');
                if (ctype_digit(ltrim($kata, '#'))) {
                    $q->orWhere('e.id_e_resep', (int) ltrim($kata, '#'));
                }
            }))
            ->orderByDesc('e.waktu_kirim')->orderByDesc('e.id_e_resep')
            ->paginate(12, ['e.id_e_resep as id', 'e.status_e_resep as statusRaw', 'e.waktu_kirim as tanggal',
                'p.nama_lengkap as pasien', 'd.nama_dokter as dokter', 'po.nama_poli as poli'])
            ->withQueryString();

        $ringkasan = DB::table('detail_e_resep as d')->leftJoin('stok_obat as s', 's.id_obat', '=', 'd.id_obat')
            ->whereIn('d.id_e_resep', $resep->getCollection()->pluck('id'))
            ->groupBy('d.id_e_resep', 'd.id_obat', 's.jumlah_stok')
            ->selectRaw('d.id_e_resep, sum(d.jumlah_obat) as butuh, coalesce(s.jumlah_stok, 0) as stok')
            ->get()->groupBy('id_e_resep');
        $resep->through(function ($item) use ($ringkasan) {
            $obat = $ringkasan->get($item->id, collect());
            $item->jumlahJenis = $obat->count();
            $item->stokKurang = $obat->contains(fn ($baris) => $baris->butuh > $baris->stok);
            $item->status = EResep::LABEL[$item->statusRaw] ?? $item->statusRaw;
            return $item;
        });

        return Inertia::render('Apoteker/NotifikasiEResep', [
            'resepServer' => $resep,
            'filters' => ['status' => $status, 'q' => $kata],
            'jumlahStatus' => fn () => DB::table('e_resep')->groupBy('status_e_resep')
                ->selectRaw('status_e_resep, count(*) as jumlah')->pluck('jumlah', 'status_e_resep'),
        ]);
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
            'status' => EResep::LABEL[$resep['status_e_resep']] ?? $resep['status_e_resep'],
            'items' => collect($resep['daftar_obat'])->map(fn ($obat) => [
                ...$obat, 'nama' => $obat['nama_obat'], 'satuan' => $obat['jumlah_obat'], 'aturan' => $obat['aturan_pakai'],
            ])->all(),
        ];

        return Inertia::render('Apoteker/RincianEResep', ['eresepId' => (string) $idEResep, 'resepServer' => $resep]);
    }

    public function updateStatusHttp(Request $request, int $idEResep): RedirectResponse
    {
        $data = $request->validate([
            'statusBaru' => ['required', 'in:diproses,siap_diserahkan,ditolak,selesai'],
            'versi' => ['required', 'integer', 'min:1'],
            'alasanPenolakan' => ['required_if:statusBaru,ditolak', 'nullable', 'string', 'max:500'],
            'identitasSesuai' => ['accepted_if:statusBaru,selesai'],
            'obatDisiapkan' => ['required_if:statusBaru,siap_diserahkan', 'array', 'min:1', 'max:100'],
            'obatDisiapkan.*' => ['integer', 'distinct'],
            'konselingSelesai' => ['accepted_if:statusBaru,selesai'],
        ]);
        $tujuan = $data['statusBaru'];
        if (! $this->perbaruiStatusEResep($idEResep, $tujuan, $data['alasanPenolakan'] ?? null, (int) $request->session()->get('apoteker_id'), (int) $data['versi'], $data['obatDisiapkan'] ?? [])) {
            return back()->withErrors(['eresep' => 'Tahap resep telah berubah. Muat ulang rincian resep.']);
        }

        return match ($tujuan) {
            'siap_diserahkan' => redirect()->route('apoteker.pengiriman-obat', $idEResep)->with('success', 'Obat siap diserahkan. Cocokkan identitas pasien di loket.'),
            'selesai' => redirect()->route('apoteker.notifikasi-eresep')->with('success', 'Penyerahan tercatat dan stok obat telah dikurangi.'),
            default => back()->with('success', $tujuan === 'ditolak' ? 'Resep dikembalikan kepada dokter.' : 'Resep diterima untuk diracik.'),
        };
    }

    public function terimaStok(Request $request, int $idEResep): RedirectResponse
    {
        $data = $request->validate([
            'id_obat' => ['required', 'integer'],
            'jumlah' => ['required', 'integer', 'min:1', 'max:2147483647'],
            'nomor_bukti' => ['required', 'string', 'max:80'],
        ]);
        DB::transaction(function () use ($request, $idEResep, $data) {
            DB::table('obat')->where('id_obat', $data['id_obat'])->lockForUpdate()->firstOrFail();
            abort_unless(DB::table('detail_e_resep')->where('id_e_resep', $idEResep)->where('id_obat', $data['id_obat'])->exists(), 404);
            $nomor = mb_strtoupper(trim($data['nomor_bukti']));
            if (DB::table('penerimaan_stok')->where('id_obat', $data['id_obat'])->where('nomor_bukti', $nomor)->lockForUpdate()->first()) {
                throw \Illuminate\Validation\ValidationException::withMessages(['nomor_bukti' => 'Nomor bukti untuk obat ini sudah tercatat.']);
            }
            DB::table('stok_obat')->insertOrIgnore(['id_obat' => $data['id_obat'], 'jumlah_stok' => 0]);
            $stok = DB::table('stok_obat')->where('id_obat', $data['id_obat'])->lockForUpdate()->firstOrFail();
            if ((int) $stok->jumlah_stok + (int) $data['jumlah'] > 2147483647) {
                throw \Illuminate\Validation\ValidationException::withMessages(['jumlah' => 'Jumlah melebihi kapasitas pencatatan stok.']);
            }
            DB::table('penerimaan_stok')->insert(['id_obat' => $data['id_obat'], 'nomor_bukti' => $nomor,
                'jumlah' => $data['jumlah'], 'user_id' => $request->user()->id, 'waktu' => now()]);
            DB::table('stok_obat')->where('id_obat', $data['id_obat'])->increment('jumlah_stok', (int) $data['jumlah']);
        }, 3);

        return back()->with('success', 'Penerimaan stok tercatat.');
    }

    public function kirimEResep(array $dataEResep): string
    {
        return 'E-Resep berhasil dikirim dengan ID '.EResep::simpanEResep($dataEResep);
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

    public function perbaruiStatusEResep(int $idEResep, string $statusBaru, ?string $alasan, int $idApoteker, int $versi, array $obatDisiapkan = []): bool
    {
        return EResep::updateStatusEResep($idEResep, $statusBaru, $alasan, $idApoteker, $versi, $obatDisiapkan);
    }
}
