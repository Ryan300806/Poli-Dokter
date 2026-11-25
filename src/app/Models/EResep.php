<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/** Entitas EResep dan perpindahan status sesuai CD-008. */
class EResep extends Model
{
    protected $table = 'e_resep';
    protected $primaryKey = 'id_e_resep';
    public $timestamps = false;
    protected $fillable = ['id_pasien', 'id_apoteker', 'id_diagnosis', 'status_e_resep', 'alasan_penolakan', 'waktu_kirim'];

    public const LABEL = [
        'terkirim' => 'Menunggu Telaah Resep',
        'diproses' => 'Perlu Diracik',
        'siap_diserahkan' => 'Siap Diserahkan',
        'ditolak' => 'Ditolak',
        'selesai' => 'Obat Sudah Diberikan',
    ];

    private const TRANSISI = [
        'terkirim' => ['diproses', 'ditolak'],
        'diproses' => ['siap_diserahkan', 'ditolak'],
        'siap_diserahkan' => ['selesai'],
    ];

    private static function simpanDetail(int $id, array $obat): void
    {
        $rows = [];
        foreach ($obat as $item) {
            $rows[] = [
                'id_e_resep' => $id, 'id_obat' => $item['id_obat'],
                'dosis' => $item['dosis'], 'jumlah_obat' => $item['jumlah_obat'],
                'aturan_pakai' => $item['aturan_pakai'],
            ];
        }
        DB::table('detail_e_resep')->insert($rows);
    }

    private function catat(string $aktivitas, ?string $lama): void
    {
        DB::table('aktivitas_e_resep')->insert([
            'id_e_resep' => $this->getKey(), 'user_id' => Auth::id(),
            'aktivitas' => $aktivitas, 'status_lama' => $lama,
            'status_baru' => $this->status_e_resep, 'versi' => $this->versi, 'waktu' => now(),
        ]);
    }

    public static function simpanEResep(array $dataEResep): int
    {
        return DB::transaction(function () use ($dataEResep) {
            DB::table('diagnosis')->where('id_diagnosis', $dataEResep['id_diagnosis'])->lockForUpdate()->firstOrFail();
            if (static::where('id_diagnosis', $dataEResep['id_diagnosis'])->exists()) {
                throw ValidationException::withMessages(['eresep' => 'Resep untuk diagnosis ini sudah ada. Muat ulang untuk membukanya.']);
            }
            $resep = new static();
            $resep->id_pasien = $dataEResep['id_pasien'];
            $resep->id_diagnosis = $dataEResep['id_diagnosis'];
            $resep->status_e_resep = 'terkirim';
            $resep->waktu_kirim = now();
            $resep->versi = 1;
            $resep->save();
            static::simpanDetail($resep->getKey(), $dataEResep['daftar_obat']);
            $resep->catat('divalidasi_dan_dikirim', null);

            return (int) $resep->getKey();
        }, 3);
    }

    private function pastikanVersi(int $versi): void
    {
        if ((int) $this->versi !== $versi) {
            throw ValidationException::withMessages(['eresep' => 'Resep sudah berubah. Muat ulang dan periksa rinciannya kembali.']);
        }
    }

    public static function updateEResep(int $idEResep, array $daftarObat, int $versi): bool
    {
        return DB::transaction(function () use ($idEResep, $daftarObat, $versi) {
            $resep = static::whereKey($idEResep)->lockForUpdate()->firstOrFail();
            $resep->pastikanVersi($versi);
            $lama = $resep->status_e_resep;
            if (! in_array($lama, ['terkirim', 'ditolak'], true)) {
                return false;
            }
            DB::table('detail_e_resep')->where('id_e_resep', $idEResep)->delete();
            static::simpanDetail($idEResep, $daftarObat);
            $resep->status_e_resep = 'terkirim';
            $resep->alasan_penolakan = null;
            $resep->id_apoteker = null;
            $resep->waktu_kirim = now();
            $resep->versi++;
            $resep->save();
            $resep->catat('dikoreksi_dan_dikirim', $lama);

            return true;
        }, 3);
    }

    public static function getEResep(int $idEResep): ?array
    {
        $resep = static::find($idEResep);
        if (! $resep) {
            return null;
        }

        return [...$resep->toArray(), 'daftar_obat' => static::getInformasiObat($idEResep)];
    }

    public static function getEResepUntukDiagnosis(int $idDiagnosis): ?array
    {
        $id = static::where('id_diagnosis', $idDiagnosis)->orderByDesc('id_e_resep')->value('id_e_resep');

        return $id ? static::getEResep((int) $id) : null;
    }

    public static function getInformasiObat(int|array $dataEResep): array
    {
        $id = is_array($dataEResep) ? ($dataEResep['id_e_resep'] ?? 0) : $dataEResep;
        return DB::table('detail_e_resep as d')
            ->join('obat as o', 'o.id_obat', '=', 'd.id_obat')
            ->leftJoin('stok_obat as s', 's.id_obat', '=', 'd.id_obat')
            ->where('d.id_e_resep', $id)->orderBy('d.id_detail_resep')
            ->get(['d.id_obat', 'o.nama_obat', 'd.dosis', 'd.jumlah_obat', 'd.aturan_pakai', 's.jumlah_stok'])
            ->map(fn ($item) => (array) $item)->all();
    }

    public static function updateStatusEResep(int $id, string $tujuan, ?string $alasan, int $idApoteker, int $versi, array $obatDisiapkan = []): bool
    {
        return DB::transaction(function () use ($id, $tujuan, $alasan, $idApoteker, $versi, $obatDisiapkan) {
            $resep = static::whereKey($id)->lockForUpdate()->firstOrFail();
            $resep->pastikanVersi($versi);
            $lama = $resep->status_e_resep;
            if (! in_array($tujuan, self::TRANSISI[$lama] ?? [], true)) {
                return false;
            }
            if (in_array($tujuan, ['diproses', 'siap_diserahkan', 'selesai'], true)) {
                // Beberapa baris aturan pakai dapat menunjuk obat yang sama.
                $kebutuhan = DB::table('detail_e_resep')->where('id_e_resep', $id)
                    ->selectRaw('id_obat, SUM(jumlah_obat) as butuh')->groupBy('id_obat')->orderBy('id_obat')->get();
                if ($kebutuhan->isEmpty()) {
                    throw ValidationException::withMessages(['stok' => 'Resep ini belum memiliki rincian obat.']);
                }
                if ($tujuan === 'siap_diserahkan') {
                    $dipilih = array_map('intval', $obatDisiapkan);
                    sort($dipilih, SORT_NUMERIC);
                    $diresepkan = $kebutuhan->pluck('id_obat')->map(fn ($id) => (int) $id)->all();
                    if ($dipilih !== $diresepkan) {
                        throw ValidationException::withMessages(['obatDisiapkan' => 'Cocokkan dan tandai setiap obat sesuai rincian resep.']);
                    }
                }
                $stok = DB::table('stok_obat')->whereIn('id_obat', $kebutuhan->pluck('id_obat'))
                    ->orderBy('id_obat')->lockForUpdate()->pluck('jumlah_stok', 'id_obat');
                foreach ($kebutuhan as $item) {
                    if ((int) ($stok[$item->id_obat] ?? 0) < (int) $item->butuh) {
                        throw ValidationException::withMessages(['stok' => 'Stok saat ini belum cukup. Periksa kembali rincian dan penerimaan stok.']);
                    }
                    if ($tujuan === 'selesai') {
                        DB::table('stok_obat')->where('id_obat', $item->id_obat)->decrement('jumlah_stok', $item->butuh);
                    }
                }
            }
            $resep->status_e_resep = $tujuan;
            $resep->id_apoteker = $idApoteker;
            $resep->alasan_penolakan = $tujuan === 'ditolak' ? $alasan : null;
            $resep->versi++;
            $resep->save();
            $resep->catat($tujuan, $lama);

            return true;
        }, 3);
    }
}
