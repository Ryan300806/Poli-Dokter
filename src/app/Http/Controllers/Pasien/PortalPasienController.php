<?php

namespace App\Http\Controllers\Pasien;

use App\Http\Controllers\Controller;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PortalPasienController extends Controller
{
    private function pasienId(Request $request): int { return (int) $request->session()->get('pasien_id'); }

    private function reservasiQuery(int $id)
    {
        return DB::table('reservasi as r')->join('dokter as d', 'd.id_dokter', '=', 'r.id_dokter')
            ->join('poli as p', 'p.id_poli', '=', 'd.id_poli')->join('slot_jadwal as s', 's.id_slot', '=', 'r.id_slot')
            ->leftJoin('antrean as a', 'a.id_reservasi', '=', 'r.id_reservasi')->where('r.id_pasien', $id)
            ->select('r.id_reservasi','r.id_slot','r.tanggal','r.nomor_antrean','r.status_reservasi','r.alasan_pembatalan',
                'd.nama_dokter','d.id_dokter','p.nama_poli','p.id_poli','s.jam','s.status_slot','a.id_antrean','a.status_antrean');
    }

    private function slots(?int $poli = null): array
    {
        return DB::table('slot_jadwal as s')->join('dokter as d', 'd.id_dokter', '=', 's.id_dokter')
            ->join('poli as p', 'p.id_poli', '=', 's.id_poli')->whereDate('s.tanggal', '>=', today())
            ->where('s.sisa_kuota', '>', 0)->where('s.status_slot', 'tersedia')->when($poli, fn ($q) => $q->where('s.id_poli', $poli))
            ->orderBy('s.tanggal')->orderBy('s.jam')->select('s.id_slot','s.id_poli','s.id_dokter','s.tanggal','s.jam','s.sisa_kuota',
                'p.nama_poli','d.nama_dokter')->get()->map(fn ($s) => (array) $s)->all();
    }

    public function beranda(Request $request): Response
    {
        $id = $this->pasienId($request);
        $pasien = DB::table('pasien')->where('id_pasien', $id)->first();
        $jadwal = $this->reservasiQuery($id)->whereIn('r.status_reservasi', ['aktif','menunggu','dikonfirmasi'])
            ->whereDate('r.tanggal', '>=', today())->orderBy('r.tanggal')->orderBy('s.jam')->get();
        return Inertia::render('Pasien/Beranda', ['pasien' => $pasien, 'jadwal' => $jadwal]);
    }

    public function dasbor(Request $request): Response { return $this->beranda($request); }

    public function penjadwalan(Request $request): Response
    {
        $poli = $request->integer('poli') ?: null;
        return Inertia::render('Pasien/PenjadwalanPoli', [
            'poli' => DB::table('poli')->orderBy('nama_poli')->get(),
            'dokter' => DB::table('dokter')->when($poli, fn ($q) => $q->where('id_poli', $poli))->orderBy('nama_dokter')->get(),
            'slots' => $this->slots($poli), 'poliTerpilih' => $poli,
        ]);
    }

    public function booking(Request $request): RedirectResponse
    {
        $data = $request->validate(['id_slot' => ['required', 'integer', 'exists:slot_jadwal,id_slot']]);
        $idPasien = $this->pasienId($request);
        DB::transaction(function () use ($data, $idPasien) {
            $slot = DB::table('slot_jadwal')->where('id_slot', $data['id_slot'])->lockForUpdate()->first();
            if (!$slot || $slot->status_slot !== 'tersedia' || $slot->sisa_kuota < 1 || $slot->tanggal < today()->toDateString()) {
                throw ValidationException::withMessages(['id_slot' => 'Jadwal sudah penuh atau tidak tersedia.']);
            }
            $sudahAda = DB::table('reservasi')->where('id_pasien', $idPasien)->where('id_slot', $slot->id_slot)
                ->whereNotIn('status_reservasi', ['dibatalkan'])->exists();
            if ($sudahAda) throw ValidationException::withMessages(['id_slot' => 'Anda sudah memiliki reservasi pada jadwal ini.']);
            $nomor = DB::table('reservasi')->where('id_slot', $slot->id_slot)->whereNotIn('status_reservasi', ['dibatalkan'])->count() + 1;
            $rid = DB::table('reservasi')->insertGetId(['id_pasien'=>$idPasien,'id_dokter'=>$slot->id_dokter,'id_slot'=>$slot->id_slot,
                'tanggal'=>$slot->tanggal,'nomor_antrean'=>$nomor,'status_reservasi'=>'aktif','alasan_pembatalan'=>''], 'id_reservasi');
            DB::table('slot_jadwal')->where('id_slot',$slot->id_slot)->decrement('sisa_kuota');
            DB::table('antrean')->insert(['id_pasien'=>$idPasien,'id_reservasi'=>$rid,'tanggal_antrean'=>$slot->tanggal,
                'jenis_antrean'=>'rawat_jalan','status_antrean'=>'menunggu']);
        });
        return redirect()->route('pasien.riwayat-reservasi')->with('success', 'Reservasi berhasil dibuat. Tiket antrean Anda tersedia di Riwayat & Jadwal.');
    }

    public function riwayat(Request $request): Response
    {
        $tab = $request->string('status')->toString() ?: 'aktif';
        $map = ['aktif'=>['aktif','menunggu','dikonfirmasi'], 'selesai'=>['selesai'], 'dibatalkan'=>['dibatalkan']];
        $items = $this->reservasiQuery($this->pasienId($request))->whereIn('r.status_reservasi', $map[$tab] ?? $map['aktif'])
            ->orderByDesc('r.tanggal')->orderByDesc('s.jam')->get()->map(function ($item) {
                $item->kode_tiket = strtoupper(substr(hash_hmac('sha256', $item->id_reservasi.':'.$item->id_slot, config('app.key')), 0, 12));
                return $item;
            });
        return Inertia::render('Pasien/RiwayatReservasi', ['reservasi' => $items, 'tab' => array_key_exists($tab,$map) ? $tab : 'aktif', 'slots' => $this->slots()]);
    }

    public function ubahJadwal(Request $request, int $reservasi): RedirectResponse
    {
        $data = $request->validate(['id_slot'=>['required','integer','exists:slot_jadwal,id_slot']]);
        DB::transaction(function () use ($request,$reservasi,$data) {
            $item = DB::table('reservasi')->where('id_reservasi',$reservasi)->where('id_pasien',$this->pasienId($request))->lockForUpdate()->first();
            if (!$item || !in_array($item->status_reservasi,['aktif','menunggu','dikonfirmasi'],true)) abort(404);
            $old = DB::table('slot_jadwal')->where('id_slot',$item->id_slot)->first();
            if (now()->addHours(2)->greaterThan(\Carbon\Carbon::parse($item->tanggal.' '.$old->jam))) throw ValidationException::withMessages(['id_slot'=>'Perubahan jadwal hanya dapat dilakukan minimal 2 jam sebelum kunjungan.']);
            $new = DB::table('slot_jadwal')->where('id_slot',$data['id_slot'])->lockForUpdate()->first();
            if (!$new || $new->status_slot !== 'tersedia' || $new->sisa_kuota < 1 || $new->tanggal < today()->toDateString()) throw ValidationException::withMessages(['id_slot'=>'Jadwal pengganti tidak tersedia.']);
            DB::table('slot_jadwal')->where('id_slot',$old->id_slot)->increment('sisa_kuota');
            $nomor = DB::table('reservasi')->where('id_slot',$new->id_slot)->where('status_reservasi','!=','dibatalkan')->count() + 1;
            DB::table('reservasi')->where('id_reservasi',$reservasi)->update(['id_slot'=>$new->id_slot,'id_dokter'=>$new->id_dokter,'tanggal'=>$new->tanggal,'nomor_antrean'=>$nomor]);
            DB::table('slot_jadwal')->where('id_slot',$new->id_slot)->decrement('sisa_kuota');
            DB::table('antrean')->where('id_reservasi',$reservasi)->update(['tanggal_antrean'=>$new->tanggal,'status_antrean'=>'menunggu']);
        });
        return back()->with('success','Jadwal kunjungan berhasil diubah.');
    }

    public function batal(Request $request, int $reservasi): RedirectResponse
    {
        $data = $request->validate(['alasan'=>['nullable','string','max:255']]);
        DB::transaction(function () use ($request,$reservasi,$data) {
            $item = DB::table('reservasi')->where('id_reservasi',$reservasi)->where('id_pasien',$this->pasienId($request))->lockForUpdate()->first();
            if (!$item || !in_array($item->status_reservasi,['aktif','menunggu','dikonfirmasi'],true)) abort(404);
            $slot = DB::table('slot_jadwal')->where('id_slot',$item->id_slot)->first();
            if (now()->addHours(2)->greaterThan(\Carbon\Carbon::parse($item->tanggal.' '.$slot->jam))) throw ValidationException::withMessages(['alasan'=>'Pembatalan hanya dapat dilakukan minimal 2 jam sebelum kunjungan.']);
            DB::table('reservasi')->where('id_reservasi',$reservasi)->update(['status_reservasi'=>'dibatalkan','alasan_pembatalan'=>$data['alasan'] ?? 'Dibatalkan oleh pasien']);
            DB::table('slot_jadwal')->where('id_slot',$slot->id_slot)->increment('sisa_kuota');
            DB::table('antrean')->where('id_reservasi',$reservasi)->update(['status_antrean'=>'dibatalkan']);
        });
        return back()->with('success','Reservasi berhasil dibatalkan.');
    }

    public function profil(Request $request): Response
    {
        $pasien = DB::table('pasien')->where('id_pasien',$this->pasienId($request))->first();
        $riwayat = DB::table('reservasi as r')->join('dokter as d','d.id_dokter','=','r.id_dokter')->join('poli as p','p.id_poli','=','d.id_poli')
            ->where('r.id_pasien',$pasien->id_pasien)->whereIn('r.status_reservasi',['selesai'])->orderByDesc('r.tanggal')->limit(4)
            ->select('r.id_reservasi','r.tanggal','r.status_reservasi','d.nama_dokter','p.nama_poli')->get();
        return Inertia::render('Pasien/Profil',['pasien'=>$pasien,'riwayat'=>$riwayat]);
    }

    public function updateProfil(Request $request): RedirectResponse
    {
        $data = $request->validate(['nama_lengkap'=>['required','string','max:100'],'tempat_lahir'=>['required','string','max:50'],
            'tanggal_lahir'=>['required','date','before_or_equal:today'],'alamat'=>['required','string','max:255'],
            'jenis_kelamin'=>['required','in:L,P'],'kontak_darurat'=>['required','string','max:20'],
            'nama_kontak_darurat'=>['required','string','max:100']]);
        DB::table('pasien')->where('id_pasien',$this->pasienId($request))->update($data);
        return back()->with('success','Profil pasien berhasil diperbarui.');
    }
}
