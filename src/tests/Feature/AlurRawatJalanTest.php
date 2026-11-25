<?php

namespace Tests\Feature;

use App\Models\User;
use Carbon\Carbon;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\DemoKunjunganSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Page;
use Tests\TestCase;

class AlurRawatJalanTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        Carbon::setTestNow(Carbon::parse('2026-11-23 07:00:00', 'Asia/Jakarta'));
        $this->seed(DatabaseSeeder::class);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function masuk(string $username): void
    {
        $this->actingAs(User::where('username', $username)->firstOrFail());
    }

    public function test_registrasi_login_nomor_rm_dan_isolasi_portal(): void
    {
        $form = ['nik' => '0000000000000009', 'noKK' => '0000000000000022', 'namaLengkap' => 'Pasien Uji',
            'tempatLahir' => 'Malang', 'tanggalLahir' => '2000-01-02', 'jenisKelamin' => 'perempuan',
            'alamat' => 'Alamat uji', 'namaKontakDarurat' => 'Kontak uji', 'noKontakDarurat' => '0800000000',
            'kataSandi' => 'ujiSandi123', 'ulangiKataSandi' => 'ujiSandi123', 'setuju' => true];
        $this->post('/registrasi', $form)->assertRedirect('/login')->assertSessionHas('success', fn ($v) => str_contains($v, 'RM-'));
        $this->post('/registrasi', $form)->assertSessionHasErrors('nik');
        $this->post('/login', ['nik' => $form['nik'], 'kataSandi' => $form['kataSandi']])->assertRedirect('/pasien/beranda');
        $this->get('/pasien/beranda')->assertInertia(fn (Page $p) => $p->component('Pasien/Beranda', false)
            ->where('pasien.nama_lengkap', 'Pasien Uji')->missing('pasien.password')->missing('pasien.nik'));
        $this->get('/dokter/antrean-periksa')->assertForbidden();
        $this->post('/logout')->assertRedirect('/login');
        $this->get('/pasien/beranda')->assertRedirect('/login');
    }

    public function test_nomor_dan_kuota_setelah_batal_tidak_menduplikasi_tiket(): void
    {
        $slot = DB::table('slot_jadwal')->where('id_dokter', 1)->where('tanggal', today()->addDay()->toDateString())->first();
        foreach (['3573010101900001', '3573010202920002', '3573010303950003'] as $nik) {
            $this->masuk($nik);
            $this->post('/pasien/reservasi', ['id_slot' => $slot->id_slot])->assertSessionHasNoErrors();
        }
        $this->masuk('3573010202920002');
        $id = DB::table('reservasi')->where('id_pasien', 2)->value('id_reservasi');
        $this->put("/pasien/reservasi/$id/jadwal", ['id_slot' => $slot->id_slot])->assertSessionHasErrors('id_slot');
        $this->delete("/pasien/reservasi/$id")->assertSessionHasNoErrors();
        $this->post('/pasien/reservasi', ['id_slot' => $slot->id_slot])->assertSessionHasNoErrors();
        $this->assertDatabaseHas('reservasi', ['id_pasien' => 2, 'nomor_antrean' => 4, 'status_reservasi' => 'aktif']);
        $this->assertDatabaseHas('slot_jadwal', ['id_slot' => $slot->id_slot, 'sisa_kuota' => $slot->sisa_kuota - 3]);
    }

    public function test_dari_triase_sampai_penyerahan_dengan_koreksi_dan_stok_kurang(): void
    {
        $this->seed(DemoKunjunganSeeder::class);
        $this->seed(DemoKunjunganSeeder::class);
        $this->assertDatabaseCount('reservasi', 1);
        $a = DB::table('antrean')->first();
        $this->masuk('perawat1');
        $vital = ['tekananDarah' => '120/80', 'suhu' => 36.5, 'beratBadan' => 65];
        $this->post("/perawat/observasi/$a->id_antrean", $vital)->assertSessionHasNoErrors();
        $o = DB::table('observasi')->first();
        $this->get("/perawat/form-observasi/$a->id_reservasi")->assertInertia(fn (Page $p) => $p
            ->where('observasi.id_observasi', $o->id_observasi)->where('pasien.umur', 36));
        $this->put("/perawat/observasi/$o->id_observasi", [...$vital, 'suhu' => 36.7])->assertSessionHasNoErrors();
        $this->assertDatabaseCount('observasi', 1);

        $this->masuk('dokter_gigi');
        $this->get("/dokter/riwayat-medis/$a->id_pasien")->assertForbidden();
        $this->masuk('dokter_umum');
        $this->get('/dokter/antrean-periksa')->assertInertia(fn (Page $p) => $p->has('antrean', 1)->where('antrean.0.triageSelesai', true));
        $this->post("/dokter/antrean-periksa/$a->id_antrean/panggil")->assertSessionHasNoErrors();
        $dx = ['namaDiagnosis' => 'Catatan simulasi', 'rencanaTindakan' => 'Tindakan simulasi'];
        $this->post("/dokter/diagnosis/$a->id_antrean", $dx)->assertSessionHasNoErrors();
        $this->post("/dokter/diagnosis/$a->id_antrean", $dx)->assertSessionHasErrors('namaDiagnosis');
        $this->assertDatabaseCount('diagnosis', 1);
        $item = ['id_obat' => 1, 'dosis' => 'Contoh uji', 'jumlah_obat' => 2, 'aturan_pakai' => 'Contoh uji'];
        $resep = ['id_pasien' => $a->id_pasien, 'id_diagnosis' => DB::table('diagnosis')->value('id_diagnosis'), 'daftar_obat' => [$item, $item]];
        $this->post('/dokter/e-resep', $resep)->assertSessionHasNoErrors();
        $this->post('/dokter/e-resep', $resep)->assertSessionHasErrors('eresep');
        $id = DB::table('e_resep')->value('id_e_resep');
        $url = "/apoteker/e-resep/$id/status";
        $this->masuk('apoteker1');
        $this->post($url, ['versi' => 1, 'statusBaru' => 'ditolak', 'alasanPenolakan' => 'Konfirmasi catatan'])->assertSessionHasNoErrors();
        $this->masuk('dokter_umum');
        $this->put("/dokter/e-resep/$id", ['versi' => 2, 'daftar_obat' => [$item, $item]])->assertSessionHasNoErrors();
        $this->masuk('apoteker1');
        $this->post($url, ['versi' => 3, 'statusBaru' => 'diproses'])->assertSessionHasNoErrors();
        $this->post($url, ['versi' => 4, 'statusBaru' => 'siap_diserahkan', 'obatDisiapkan' => [2]])->assertSessionHasErrors('obatDisiapkan');
        DB::table('stok_obat')->where('id_obat', 1)->update(['jumlah_stok' => 3]);
        $this->post($url, ['versi' => 4, 'statusBaru' => 'siap_diserahkan', 'obatDisiapkan' => [1]])->assertSessionHasErrors('stok');
        $penerimaan = ['id_obat' => 1, 'jumlah' => 2, 'nomor_bukti' => 'DEMO-001'];
        $this->post("/apoteker/e-resep/$id/stok", $penerimaan)->assertSessionHasNoErrors();
        $this->post("/apoteker/e-resep/$id/stok", $penerimaan)->assertSessionHasErrors('nomor_bukti');
        $this->post($url, ['versi' => 4, 'statusBaru' => 'siap_diserahkan', 'obatDisiapkan' => [1]])->assertRedirect("/apoteker/pengiriman-obat/$id");
        $this->post($url, ['versi' => 5, 'statusBaru' => 'selesai'])->assertSessionHasErrors(['identitasSesuai','konselingSelesai']);
        $serah = ['versi' => 5, 'statusBaru' => 'selesai', 'identitasSesuai' => true, 'konselingSelesai' => true];
        $this->post($url, $serah)->assertRedirect('/apoteker/notifikasi-eresep');
        $this->post($url, $serah)->assertSessionHasErrors('eresep');
        $this->assertDatabaseHas('stok_obat', ['id_obat' => 1, 'jumlah_stok' => 1]);
        $this->assertDatabaseHas('e_resep', ['id_e_resep' => $id, 'status_e_resep' => 'selesai', 'versi' => 6]);
        $this->assertDatabaseCount('aktivitas_e_resep', 6);
    }
}
