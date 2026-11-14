// MF-IM-002 | UI-002 | Login | Penulis: MF
// Sumber desain: Figma node 129:1944. Sumber kebutuhan: Modul 2 bagian 3.7 (UI-002).
// Rute: GET /login  (routes/fe/mf.php, nama rute: login)
import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Asterisk, Contact, Eye, EyeOff, Info, Lock, User } from 'lucide-react';
import Button from '../../Components/ui/Button';
import { Input } from '../../Components/ui/Input';
import { toast } from '../../Components/ui/Toast';
import { cn } from '../../lib/cn';

// URL tujuan. Kalau lib/rute.js sudah punya rutenya, ganti dengan itu.
const URL_UTAMA = '/pasien/beranda';
const URL_REGISTRASI = '/registrasi';
const URL_BERANDA_PASIEN = '/pasien/beranda';

const NIK_PANJANG = 16;
const SANDI_MINIMAL = 8;

const NILAI_AWAL = { nik: '', kataSandi: '', ingat: false };

// Label dengan tanda bintang merah untuk kolom wajib.
function wajib(teks) {
  return (
    <>
      {teks} <span className="text-danger">*</span>
    </>
  );
}

// Mengembalikan objek galat. Objek kosong berarti semua kolom valid.
function validasi(f) {
  const galat = {};
  if (f.nik.length !== NIK_PANJANG) galat.nik = 'NIK harus 16 digit angka.';
  if (!f.kataSandi) galat.kataSandi = 'Kata sandi wajib diisi.';
  else if (f.kataSandi.length < SANDI_MINIMAL) galat.kataSandi = 'Kata sandi minimal 8 karakter.';
  return galat;
}

// Halaman tanpa Header/Sidebar (belum login), jadi tidak memakai AppLayout.
// errors: galat validasi/otentikasi dari BE (Inertia mengirimnya otomatis).
// serverAktif: status server SIM-RS dari BE. Nilai awal true selama BE belum mengirim.
export default function Login({ errors: galatServer = {}, serverAktif = true }) {
  const [form, setForm] = useState(NILAI_AWAL);
  const [galat, setGalat] = useState({});
  const [tampil, setTampil] = useState(false);
  const tampilGalat = { ...galatServer, ...galat };

  function ubah(nama, nilai) {
    setForm((lama) => ({ ...lama, [nama]: nilai }));
    // Pesan galat kolom itu hilang begitu pengguna mulai memperbaikinya.
    setGalat((lama) => ({ ...lama, [nama]: undefined }));
  }

  function masuk(e) {
    e.preventDefault();
    const galatBaru = validasi(form);
    setGalat(galatBaru);
    if (Object.keys(galatBaru).length > 0) {
      toast.error('Data Tidak Lengkap');
      return;
    }
    router.post('/login', form, { onError: () => toast.error('NIK atau kata sandi tidak cocok.') });
  }

  function lupaSandi() {
    // Halaman pemulihan kata sandi belum ada di Modul 2, jadi hanya memberi tahu pengguna.
    toast.error('Pemulihan kata sandi belum tersedia.');
  }

  return (
    <>
      <Head title="Login | SIM-RS Rawat Jalan" />
      <div className="flex min-h-screen flex-col bg-surface">
        {/* Header */}
        <header className="flex items-center justify-between bg-white px-6 py-3 shadow-card sm:px-10">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-brand text-white">
              <Asterisk className="size-5" />
            </span>
            <span className="text-[15px] font-bold text-ink">RS SEHAT MEDIKA</span>
            <span className="hidden rounded-full bg-brand-light px-2.5 py-0.5 text-[10px] font-bold text-brand sm:inline">
              SIM-RS PORTAL
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button href={URL_UTAMA} variant="ghost" size="sm" icon={ArrowLeft}>Kembali ke Sistem</Button>
            <span className="flex size-9 items-center justify-center rounded-full bg-brand text-white">
              <User className="size-4" />
            </span>
          </div>
        </header>

        {/* Kartu login */}
        <main className="flex flex-1 flex-col items-center px-4 py-12">
          <div className="w-full max-w-[460px] rounded-2xl bg-white p-8 shadow-card sm:p-10">
            <div className="mb-8 flex flex-col items-center text-center">
              <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-brand-light text-brand">
                <Lock className="size-6" />
              </span>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
                Portal Rekam Medis Elektronik
              </p>
              <h1 className="mt-2 text-2xl font-bold leading-8 text-ink">Autentikasi Pasien</h1>
              <p className="mt-2 text-[13px] leading-5 text-ink-soft">
                Silakan masukkan NIK dan kata sandi yang telah terdaftar untuk mengakses rekam medis rawat jalan.
              </p>
            </div>

            <form onSubmit={masuk} noValidate className="flex flex-col gap-5">
              {/* NIK + penanda 16 digit */}
              <div className="relative">
                <Input
                  label={wajib('NIK / No. Kartu Keluarga')}
                  hint={(
                    <span className="inline-flex items-center gap-1.5">
                      <Info className="size-3.5" />
                      Gunakan 16 digit Nomor Induk Kependudukan sesuai e-KTP.
                    </span>
                  )}
                  error={tampilGalat.nik}
                  icon={Contact}
                  inputMode="numeric"
                  maxLength={NIK_PANJANG}
                  placeholder="Contoh: 3171012345670001"
                  autoComplete="username"
                  value={form.nik}
                  onChange={(e) => ubah('nik', e.target.value.replace(/\D/g, '').slice(0, NIK_PANJANG))}
                />
                <span className="absolute right-0 -top-0.5 rounded bg-surface-mid px-2 py-0.5 text-[10px] font-bold uppercase text-ink-soft">
                  16 digit
                </span>
              </div>

              {/* Kata sandi + tautan Lupa Sandi */}
              <div className="relative">
                <Input
                  label={wajib('Kata Sandi')}
                  hint="Minimal 8 karakter kombinasi huruf dan angka."
                  error={tampilGalat.kataSandi}
                  icon={Lock}
                  type={tampil ? 'text' : 'password'}
                  placeholder="Masukkan kata sandi akun..."
                  autoComplete="current-password"
                  className="pr-10"
                  value={form.kataSandi}
                  onChange={(e) => ubah('kataSandi', e.target.value)}
                />
                <button
                  type="button"
                  onClick={lupaSandi}
                  className="absolute right-0 top-0 text-xs font-semibold text-brand hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  Lupa Sandi?
                </button>
                {/* top-[24px]: sejajar dengan tengah kolom input (di bawah label) */}
                <button
                  type="button"
                  onClick={() => setTampil(!tampil)}
                  aria-label={tampil ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  className="absolute right-1 top-[24px] flex size-9 items-center justify-center rounded-lg text-ink-muted hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  {tampil ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              <label className="flex cursor-pointer items-center gap-3 text-[13px] text-ink-soft">
                <input
                  type="checkbox"
                  checked={form.ingat}
                  onChange={(e) => ubah('ingat', e.target.checked)}
                  className="size-4 shrink-0 accent-brand"
                />
                Ingat sesi login di perangkat ini
              </label>

              <Button type="submit" size="lg" className="w-full uppercase tracking-wide">
                Masuk ke portal pasien
                <ArrowRight className="size-4" />
              </Button>

              <p className="flex flex-wrap items-center justify-center gap-1 text-[13px] text-ink-soft">
                Belum memiliki akun?
                <Button href={URL_REGISTRASI} variant="ghost" size="sm" className="font-bold text-brand">
                  Registrasi Baru
                  <ArrowRight className="size-3.5" />
                </Button>
              </p>
            </form>
          </div>

          {/* Indikator status server */}
          <p className="mt-6 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-ink-soft">
            <span className={cn('size-2 rounded-full', serverAktif ? 'bg-brand' : 'bg-danger')} />
            {serverAktif ? 'Server SIM-RS aktif & normal' : 'Server SIM-RS sedang tidak aktif'}
            <span className="text-ink-muted">•</span>
            RS Sehat Medika
          </p>
        </main>
      </div>
    </>
  );
}
