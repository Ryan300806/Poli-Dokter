<?php

namespace App\Http\Controllers;

use App\Models\DataJadwalDokter;
use App\Models\DataReservasi;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/** Penjadwalan poli pasien dan manajemen jadwal praktek dokter sesuai Class Diagram. */
class PenjadwalanController extends Controller
{
    private function nomorAntreanBerikutnya(): int
    {
        return ((int) DB::table('reservasi')->lockForUpdate()->max('nomor_antrean')) + 1;
    }

    private function reservasiPasien(int $idPasien)
    {
        return DB::table('reservasi as r')
            ->join('dokter as d', 'd.id_dokter', '=', 'r.id_dokter')
            ->join('poli as p', 'p.id_poli', '=', 'd.id_poli')
            ->join('slot_jadwal as s', 's.id_slot', '=', 'r.id_slot')
            ->leftJoin('antrean as a', 'a.id_reservasi', '=', 'r.id_reservasi')
            ->leftJoin('diagnosis as dg', 'dg.id_antrean', '=', 'a.id_antrean')
            ->where('r.id_pasien', $idPasien)
            ->select(
                'r.id_reservasi', 'r.id_slot', 'r.tanggal', 'r.nomor_antrean', 'r.status_reservasi', 'r.alasan_pembatalan',
                'd.nama_dokter', 'd.id_dokter', 'p.nama_poli', 'p.id_poli', 's.jam', 's.status_slot',
                'a.id_antrean', 'a.status_antrean', 'dg.nama_diagnosis', 'dg.rencana_tindakan'
            );
    }

    public function ambilJadwalPoli(Request $request): Response
    {
        $idPoli = $request->integer('poli') ?: null;

        return Inertia::render('Pasien/PenjadwalanPoli', [
            'poli' => DB::table('poli')->orderBy('nama_poli')->get(),
            'dokter' => DB::table('dokter')->when($idPoli, fn ($q) => $q->where('id_poli', $idPoli))->orderBy('nama_dokter')->get(),
            'slots' => DataJadwalDokter::getJadwalTersedia($idPoli),
            'poliTerpilih' => $idPoli,
        ]);
    }

    public function buatReservasi(Request $request): RedirectResponse
    {
        $data = $request->validate(['id_slot' => ['required', 'integer', 'exists:slot_jadwal,id_slot']]);
        $idPasien = (int) $request->session()->get('pasien_id');

        $booking = DB::transaction(function () use ($data, $idPasien) {
            $slot = DB::table('slot_jadwal')->where('id_slot', $data['id_slot'])->lockForUpdate()->first();
            if (! $slot || DataJadwalDokter::cekKetersediaanSlot((int) $slot->id_slot, $slot->tanggal) !== 'Tersedia' || $slot->tanggal < today()->toDateString()) {
                throw ValidationException::withMessages(['id_slot' => 'Kuota jadwal sudah penuh atau tidak tersedia.']);
            }

            $sudahAda = DB::table('reservasi')
                ->where('id_pasien', $idPasien)
                ->where('id_slot', $slot->id_slot)
                ->whereNotIn('status_reservasi', ['dibatalkan'])
                ->exists();
            if ($sudahAda) {
                throw ValidationException::withMessages(['id_slot' => 'Anda sudah memiliki reservasi pada slot jadwal ini.']);
            }

            $nomor = $this->nomorAntreanBerikutnya();
            $reservasi = DataReservasi::simpanReservasi([
                'id_pasien' => $idPasien,
                'id_dokter' => $slot->id_dokter,
                'id_slot' => $slot->id_slot,
                'tanggal' => $slot->tanggal,
                'nomor_antrean' => $nomor,
                'status_reservasi' => 'aktif',
                'alasan_pembatalan' => '',
            ]);

            if (! DataJadwalDokter::kurangiKuotaSlot((int) $slot->id_slot)) {
                throw ValidationException::withMessages(['id_slot' => 'Kuota jadwal sudah habis.']);
            }

            DB::table('antrean')->insert([
                'id_pasien' => $idPasien,
                'id_reservasi' => $reservasi['id_reservasi'],
                'tanggal_antrean' => $slot->tanggal,
                'jenis_antrean' => 'rawat_jalan',
                'status_antrean' => 'menunggu',
            ]);

            $dokter = DB::table('dokter as d')->join('poli as p', 'p.id_poli', '=', 'd.id_poli')
                ->where('d.id_dokter', $slot->id_dokter)->first(['d.nama_dokter', 'p.nama_poli']);

            return [
                'id_reservasi' => $reservasi['id_reservasi'],
                'nomor_antrean' => $nomor,
                'nama_poli' => $dokter->nama_poli ?? '-',
                'nama_dokter' => $dokter->nama_dokter ?? '-',
                'tanggal' => $slot->tanggal,
                'jam' => substr((string) $slot->jam, 0, 5),
            ];
        });

        return redirect()->route('pasien.riwayat-reservasi')
            ->with('success', 'Reservasi berhasil dibuat.')
            ->with('bookingSuccess', $booking);
    }

    public function ambilReservasiAktif(Request $request): Response
    {
        $tab = $request->string('status')->toString() ?: 'aktif';
        $map = ['aktif' => ['aktif', 'menunggu', 'dikonfirmasi'], 'selesai' => ['selesai'], 'dibatalkan' => ['dibatalkan']];
        $items = $this->reservasiPasien((int) $request->session()->get('pasien_id'))
            ->whereIn('r.status_reservasi', $map[$tab] ?? $map['aktif'])
            ->orderByDesc('r.tanggal')
            ->orderByDesc('s.jam')
            ->get()
            ->map(function ($item) {
                $item->kode_tiket = 'SEC-'.strtoupper(substr(hash_hmac('sha256', $item->id_reservasi.':'.$item->id_slot, config('app.key')), 0, 8));

                return $item;
            });

        return Inertia::render('Pasien/RiwayatReservasi', [
            'reservasi' => $items,
            'tab' => array_key_exists($tab, $map) ? $tab : 'aktif',
            'slots' => array_values(array_filter(DataJadwalDokter::getJadwalTersedia(), fn ($s) => $s['sisa_kuota'] > 0)),
        ]);
    }

    public function ambilDetailReservasi(Request $request, int $idReservasi): Response
    {
        $item = $this->reservasiPasien((int) $request->session()->get('pasien_id'))->where('r.id_reservasi', $idReservasi)->firstOrFail();

        return Inertia::render('Pasien/RiwayatReservasi', [
            'reservasi' => [$item],
            'tab' => 'aktif',
            'slots' => DataJadwalDokter::getJadwalTersedia(),
        ]);
    }

    public function ubahJadwal(Request $request, int $idReservasi): RedirectResponse
    {
        $data = $request->validate(['id_slot' => ['required', 'integer', 'exists:slot_jadwal,id_slot']]);
        DB::transaction(function () use ($request, $idReservasi, $data) {
            $idPasien = (int) $request->session()->get('pasien_id');
            $item = DB::table('reservasi')->where('id_reservasi', $idReservasi)->where('id_pasien', $idPasien)->lockForUpdate()->first();
            if (! $item || ! in_array($item->status_reservasi, ['aktif', 'menunggu', 'dikonfirmasi'], true)) {
                abort(404);
            }

            $old = DB::table('slot_jadwal')->where('id_slot', $item->id_slot)->first();
            if (now()->addHours(2)->greaterThan(Carbon::parse($item->tanggal.' '.$old->jam))) {
                throw ValidationException::withMessages(['id_slot' => 'Perubahan jadwal hanya dapat dilakukan minimal 2 jam sebelum kunjungan.']);
            }

            $new = DB::table('slot_jadwal')->where('id_slot', $data['id_slot'])->lockForUpdate()->first();
            if (! $new || $new->status_slot !== 'tersedia' || $new->sisa_kuota < 1 || $new->tanggal < today()->toDateString()) {
                throw ValidationException::withMessages(['id_slot' => 'Jadwal pengganti tidak tersedia atau kuota sudah penuh.']);
            }

            DataJadwalDokter::bebaskanSlotLama((int) $old->id_slot);
            $nomor = $this->nomorAntreanBerikutnya();
            DataReservasi::updateReservasi($idReservasi, [
                'id_slot' => $new->id_slot,
                'id_dokter' => $new->id_dokter,
                'tanggal' => $new->tanggal,
                'nomor_antrean' => $nomor,
            ]);

            if (! DataJadwalDokter::isiSlotBaru((int) $new->id_slot)) {
                throw ValidationException::withMessages(['id_slot' => 'Kuota jadwal pengganti sudah habis.']);
            }

            DB::table('antrean')->where('id_reservasi', $idReservasi)->update(['tanggal_antrean' => $new->tanggal, 'status_antrean' => 'menunggu']);
        });

        return back()->with('success', 'Jadwal kunjungan berhasil diubah.');
    }

    public function batalkanReservasi(Request $request, int $idReservasi): RedirectResponse
    {
        $data = $request->validate(['alasan' => ['nullable', 'string', 'max:255']]);
        DB::transaction(function () use ($request, $idReservasi, $data) {
            $item = DB::table('reservasi')->where('id_reservasi', $idReservasi)->where('id_pasien', (int) $request->session()->get('pasien_id'))->lockForUpdate()->first();
            if (! $item || ! in_array($item->status_reservasi, ['aktif', 'menunggu', 'dikonfirmasi'], true)) {
                abort(404);
            }

            $slot = DB::table('slot_jadwal')->where('id_slot', $item->id_slot)->first();
            if (now()->addHours(2)->greaterThan(Carbon::parse($item->tanggal.' '.$slot->jam))) {
                throw ValidationException::withMessages(['alasan' => 'Pembatalan hanya dapat dilakukan minimal 2 jam sebelum kunjungan.']);
            }

            DataReservasi::updateReservasi($idReservasi, [
                'status_reservasi' => 'dibatalkan',
                'alasan_pembatalan' => $data['alasan'] ?? 'Dibatalkan oleh pasien',
            ]);
            DataJadwalDokter::bebaskanSlotLama((int) $slot->id_slot);
            DB::table('antrean')->where('id_reservasi', $idReservasi)->update(['status_antrean' => 'dibatalkan']);
        });

        return back()->with('success', 'Reservasi berhasil dibatalkan.');
    }

    public function ambilJadwalHarian(Request $request): Response
    {
        $idDokter = (int) $request->session()->get('dokter_id');
        $filters = $request->validate(['tanggal' => ['nullable', 'date']]);
        $tanggal = isset($filters['tanggal']) ? Carbon::parse($filters['tanggal'])->toDateString() : today()->toDateString();

        $dokterInfo = DB::table('dokter as d')->join('poli as p', 'p.id_poli', '=', 'd.id_poli')
            ->where('d.id_dokter', $idDokter)->first(['d.nama_dokter', 'p.nama_poli']);

        $jadwal = collect(DataJadwalDokter::getJadwalHarian($idDokter, $tanggal))->map(fn ($slot) => [
            ...$slot,
            'id' => $slot['id_slot'],
            'mulai' => substr($slot['jam'], 0, 5),
            'selesai' => Carbon::parse($slot['jam'])->addMinutes(60)->format('H:i'),
            'terisi' => $slot['kuota'] - $slot['sisa_kuota'],
            'status' => $slot['status_slot'] !== 'tersedia' ? 'Nonaktif' : ($slot['sisa_kuota'] === 0 ? 'Penuh' : ($slot['sisa_kuota'] <= 2 ? 'Hampir Penuh' : 'Tersedia')),
        ])->all();

        return Inertia::render('Dokter/JadwalSaya', [
            'dokter' => ['nama' => $dokterInfo->nama_dokter ?? 'Dokter', 'poli' => $dokterInfo->nama_poli ?? 'Poli'],
            'jadwalServer' => $jadwal,
            'pasienServer' => DataReservasi::getDaftarPasien($idDokter, $tanggal),
            'tanggal' => $tanggal,
        ]);
    }

    public function tambahSlot(Request $request): RedirectResponse
    {
        $idDokter = (int) $request->session()->get('dokter_id');
        $data = $request->validate([
            'tanggal' => ['required', 'date', 'after_or_equal:today'],
            'jam' => ['required', 'date_format:H:i'],
            'kuota' => ['required', 'integer', 'min:1', 'max:200'],
        ]);

        if (! DataJadwalDokter::tambahSlot($idDokter, $data['tanggal'], $data['jam'], (int) $data['kuota'])) {
            throw ValidationException::withMessages(['jam' => 'Slot waktu tersebut bentrok dengan jadwal praktek yang sudah ada.']);
        }

        return back()->with('success', 'Jadwal berhasil ditambahkan.');
    }

    public function ubahSlot(Request $request, int $idSlot): RedirectResponse
    {
        $idDokter = (int) $request->session()->get('dokter_id');
        $data = $request->validate([
            'tanggal' => ['sometimes', 'date', 'after_or_equal:today'],
            'jam' => ['sometimes', 'date_format:H:i'],
            'kuota' => ['sometimes', 'integer', 'min:1', 'max:200'],
            'status_slot' => ['sometimes', 'in:tersedia,nonaktif'],
        ]);

        $slot = DataJadwalDokter::query()->whereKey($idSlot)->where('id_dokter', $idDokter)->firstOrFail();
        $memilikiReservasi = DB::table('reservasi')->where('id_slot', $idSlot)->whereNotIn('status_reservasi', ['dibatalkan'])->exists();
        if ($memilikiReservasi && (isset($data['tanggal']) || isset($data['jam']))) {
            throw ValidationException::withMessages(['tanggal' => 'Tanggal atau jam slot tidak dapat diubah saat masih memiliki reservasi aktif.']);
        }

        if (DataJadwalDokter::cekBentrokJadwal($idDokter, $data['tanggal'] ?? $slot->tanggal, $data['jam'] ?? substr($slot->jam, 0, 5), $idSlot)) {
            throw ValidationException::withMessages(['jam' => 'Jadwal dokter bentrok dengan slot lain.']);
        }

        if (isset($data['kuota'])) {
            $terisi = $slot->kuota - $slot->sisa_kuota;
            if ($data['kuota'] < $terisi) {
                throw ValidationException::withMessages(['kuota' => 'Kuota tidak boleh lebih kecil dari reservasi yang sudah ada.']);
            }
            $data['sisa_kuota'] = $data['kuota'] - $terisi;
        }

        abort_unless(DataJadwalDokter::updateSlot($idSlot, $data), 404);

        return back()->with('success', 'Slot jadwal berhasil diperbarui.');
    }

    public function hapusSlot(Request $request, int $idSlot): RedirectResponse
    {
        $idDokter = (int) $request->session()->get('dokter_id');
        DataJadwalDokter::query()->whereKey($idSlot)->where('id_dokter', $idDokter)->firstOrFail();

        if (! DataJadwalDokter::deleteSlot($idSlot)) {
            return back()->withErrors(['slot' => 'Slot tidak dapat dihapus karena sudah memiliki riwayat reservasi.']);
        }

        return back()->with('success', 'Slot jadwal berhasil dihapus.');
    }
}
