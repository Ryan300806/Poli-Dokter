// MF-IM-001 | UI-001 | Registrasi Pasien Baru | Penulis: MF
// Sumber desain: Figma node 129:2075. Sumber kebutuhan: Modul 2 bagian 3.7 (UI-001).
// Rute: GET /registrasi  (routes/fe/mf.php, nama rute: registrasi)
import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
  ArrowLeft, ArrowRight, Asterisk, Contact, Eye, EyeOff, Lock, Mars, ShieldCheck, User, UserPlus, Venus,
} from 'lucide-react';
import Button from '../../Components/ui/Button';
import { Input, Textarea } from '../../Components/ui/Input';
import { toast } from '../../Components/ui/Toast';
import { cn } from '../../lib/cn';

// URL halaman login. Kalau lib/rute.js sudah punya rute login, ganti dengan itu.
const URL_LOGIN = '/login';

const NIK_PANJANG = 16;
// Kata sandi: minimal 8 karakter, ada huruf dan ada angka (Modul 2).
const POLA_SANDI = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

const NILAI_AWAL = {
  nik: '',
  namaLengkap: '',
  tempatLahir: '',
  tanggalLahir: '',
  alamat: '',
  jenisKelamin: '',
  namaKontakDarurat: '',
  noKontakDarurat: '',
  kataSandi: '',
  ulangiKataSandi: '',
  setuju: false,
};

const PILIHAN_KELAMIN = [
  { nilai: 'laki-laki', label: 'Laki-laki', ikon: Mars },
  { nilai: 'perempuan', label: 'Perempuan', ikon: Venus },
];

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
  const hariIni = new Date().toISOString().slice(0, 10);
  const digitKontak = f.noKontakDarurat.replace(/\D/g, '');

  if (f.nik.length !== NIK_PANJANG) galat.nik = 'NIK harus 16 digit angka.';
  if (!f.namaLengkap.trim()) galat.namaLengkap = 'Nama lengkap wajib diisi.';
  if (!f.tempatLahir.trim()) galat.tempatLahir = 'Tempat lahir wajib diisi.';
  if (!f.tanggalLahir) galat.tanggalLahir = 'Tanggal lahir wajib diisi.';
  else if (f.tanggalLahir > hariIni) galat.tanggalLahir = 'Tanggal lahir tidak boleh melewati hari ini.';
  if (!f.alamat.trim()) galat.alamat = 'Alamat domisili wajib diisi.';
  if (!f.jenisKelamin) galat.jenisKelamin = 'Pilih salah satu jenis kelamin.';
  if (!f.namaKontakDarurat.trim()) galat.namaKontakDarurat = 'Nama kontak darurat wajib diisi.';
  if (digitKontak.length < 9 || digitKontak.length > 13) {
    galat.noKontakDarurat = 'Masukkan nomor aktif 9 sampai 13 digit, tanpa +62.';
  }
  if (!POLA_SANDI.test(f.kataSandi)) galat.kataSandi = 'Minimal 8 karakter, kombinasi huruf dan angka.';
  if (!f.ulangiKataSandi || f.ulangiKataSandi !== f.kataSandi) galat.ulangiKataSandi = 'Kata sandi tidak sama.';
  if (!f.setuju) galat.setuju = 'Centang pernyataan ini untuk melanjutkan.';

  return galat;
}

// Input hanya menerima ikon, jadi komponen ini dipakai untuk menampilkan awalan +62.
function Awalan62({ className }) {
  return <span className={`${className} whitespace-nowrap text-[13px] font-semibold`}>+62</span>;
}

// Kolom kata sandi dengan tombol tampilkan/sembunyikan.
function KolomSandi({ label, hint, error, nilai, onUbah, autoComplete }) {
  const [tampil, setTampil] = useState(false);
  return (
    <div className="relative">
      <Input
        label={label}
        hint={hint}
        error={error}
        type={tampil ? 'text' : 'password'}
        value={nilai}
        onChange={(e) => onUbah(e.target.value)}
        autoComplete={autoComplete}
        placeholder="••••••••"
        className="pr-10"
      />
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
  );
}

// Dua kartu pilihan jenis kelamin (radio).
function PilihanKelamin({ nilai, onUbah, error }) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-1.5">
      <legend className="mb-1.5 text-xs font-semibold text-ink-soft">{wajib('Jenis Kelamin')}</legend>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PILIHAN_KELAMIN.map(({ nilai: pilihan, label, ikon: Ikon }) => {
          const aktif = nilai === pilihan;
          return (
            <label
              key={pilihan}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-4 text-[13px] font-medium text-ink transition-colors',
                'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand/40',
                aktif ? 'border-brand bg-brand-light' : 'border-line bg-white hover:bg-surface-low',
              )}
            >
              <input
                type="radio"
                name="jenisKelamin"
                value={pilihan}
                checked={aktif}
                onChange={() => onUbah(pilihan)}
                className="sr-only"
              />
              <span
                className={cn(
                  'flex size-8 items-center justify-center rounded-full',
                  aktif ? 'bg-brand-light-active text-brand' : 'bg-surface-mid text-ink-soft',
                )}
              >
                <Ikon className="size-4" />
              </span>
              <span className="flex-1">{label}</span>
              <span
                className={cn(
                  'flex size-5 items-center justify-center rounded-full border-2',
                  aktif ? 'border-brand' : 'border-ink-muted',
                )}
              >
                {aktif && <span className="size-2.5 rounded-full bg-brand" />}
              </span>
            </label>
          );
        })}
      </div>
      {error && <p className="text-xs text-danger" role="alert">{error}</p>}
    </fieldset>
  );
}

// Halaman tanpa Header/Sidebar (belum login), jadi tidak memakai AppLayout.
// errors: galat validasi dari BE (Inertia mengirimnya otomatis). Kalau kosong, hanya validasi di sini yang dipakai.
export default function Registrasi({ errors: galatServer = {} }) {
  const [form, setForm] = useState(NILAI_AWAL);
  const [galat, setGalat] = useState({});
  const tampilGalat = { ...galatServer, ...galat };
  const hariIni = new Date().toISOString().slice(0, 10);

  function ubah(nama, nilai) {
    setForm((lama) => ({ ...lama, [nama]: nilai }));
    // Pesan galat kolom itu hilang begitu pengguna mulai memperbaikinya.
    setGalat((lama) => ({ ...lama, [nama]: undefined }));
  }

  function kirim(e) {
    e.preventDefault();
    const galatBaru = validasi(form);
    setGalat(galatBaru);
    if (Object.keys(galatBaru).length > 0) {
      toast.error('Data Tidak Lengkap');
      return;
    }
    // BE nanti mengganti dua baris di bawah dengan router.post('/registrasi', form).
    toast.success('Registrasi Berhasil');
    router.visit(URL_LOGIN);
  }

  return (
    <>
      <Head title="Registrasi Pasien Baru | SIM-RS Rawat Jalan" />
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
            <Button href={URL_LOGIN} variant="ghost" size="sm" icon={ArrowLeft}>Kembali ke Sistem</Button>
            <span className="flex size-9 items-center justify-center rounded-full bg-brand text-white">
              <User className="size-4" />
            </span>
          </div>
        </header>

        {/* Kartu formulir */}
        <main className="flex-1 px-4 py-8">
          <div className="mx-auto w-full max-w-[720px] rounded-2xl bg-white p-6 shadow-card sm:p-10">
            <div className="mb-8 flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
                <UserPlus className="size-6" />
              </span>
              <div>
                <h1 className="text-2xl font-bold leading-8 text-ink">Formulir Registrasi Pasien Baru</h1>
                <p className="mt-1 max-w-md text-[13px] leading-5 text-ink-soft">
                  Pastikan data identitas sesuai dengan KTP / Kartu Keluarga resmi untuk validasi rekam medis rawat jalan.
                </p>
              </div>
            </div>

            <form onSubmit={kirim} noValidate className="flex flex-col gap-6">
              {/* NIK + penghitung digit */}
              <div className="relative">
                <Input
                  label={wajib('Nomor Induk Kependudukan (NIK)')}
                  hint={(
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldCheck className="size-3.5 text-brand" />
                      Data NIK akan otomatis disinkronkan dengan data kependudukan Dukcapil & BPJS Kesehatan
                    </span>
                  )}
                  error={tampilGalat.nik}
                  inputMode="numeric"
                  maxLength={NIK_PANJANG}
                  placeholder="Contoh: 3171012345670001"
                  value={form.nik}
                  onChange={(e) => ubah('nik', e.target.value.replace(/\D/g, '').slice(0, NIK_PANJANG))}
                />
                <span className="absolute right-0 top-0 text-xs text-ink-muted">{form.nik.length}/{NIK_PANJANG}</span>
              </div>

              <Input
                label={wajib('Nama Lengkap (Sesuai KTP)')}
                error={tampilGalat.namaLengkap}
                placeholder="Masukkan nama lengkap tanpa singkatan gelar"
                autoComplete="name"
                value={form.namaLengkap}
                onChange={(e) => ubah('namaLengkap', e.target.value)}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label={wajib('Tempat Lahir')}
                  error={tampilGalat.tempatLahir}
                  placeholder="Kota/Kabupaten lahir"
                  value={form.tempatLahir}
                  onChange={(e) => ubah('tempatLahir', e.target.value)}
                />
                <Input
                  label={wajib('Tanggal Lahir')}
                  error={tampilGalat.tanggalLahir}
                  type="date"
                  max={hariIni}
                  value={form.tanggalLahir}
                  onChange={(e) => ubah('tanggalLahir', e.target.value)}
                />
              </div>

              <Textarea
                label={wajib('Alamat Lengkap Domisili')}
                error={tampilGalat.alamat}
                placeholder="Tuliskan nama jalan, RT/RW, kelurahan, kecamatan, dan kota domisili saat ini..."
                value={form.alamat}
                onChange={(e) => ubah('alamat', e.target.value)}
              />

              <PilihanKelamin
                nilai={form.jenisKelamin}
                onUbah={(nilai) => ubah('jenisKelamin', nilai)}
                error={tampilGalat.jenisKelamin}
              />

              {/* Kontak darurat */}
              <section className="rounded-xl bg-brand-light p-5">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
                    <Contact className="size-5 text-brand" />
                    Kontak Darurat Pasien
                  </h2>
                  <span className="rounded-full bg-danger-light px-2.5 py-1 text-[10px] font-bold uppercase text-danger">
                    * Wajib diisi
                  </span>
                </div>
                <p className="mb-4 text-xs text-ink-soft">
                  Dihubungi untuk konfirmasi tindakan medis mendesak atau perubahan jadwal dokter.
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label={wajib('Nama Kontak Darurat')}
                    error={tampilGalat.namaKontakDarurat}
                    placeholder="Nama lengkap kerabat/wali"
                    value={form.namaKontakDarurat}
                    onChange={(e) => ubah('namaKontakDarurat', e.target.value)}
                  />
                  <Input
                    label={wajib('Nomor WhatsApp / Telepon Aktif')}
                    error={tampilGalat.noKontakDarurat}
                    icon={Awalan62}
                    className="pl-12"
                    type="tel"
                    inputMode="tel"
                    placeholder="812-3456-7890"
                    value={form.noKontakDarurat}
                    onChange={(e) => ubah('noKontakDarurat', e.target.value.replace(/[^\d\s-]/g, ''))}
                  />
                </div>
              </section>

              {/* Kata sandi */}
              <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
                <KolomSandi
                  label={wajib('Kata Sandi Baru')}
                  hint="Minimal 8 karakter, kombinasi huruf & angka"
                  error={tampilGalat.kataSandi}
                  nilai={form.kataSandi}
                  onUbah={(nilai) => ubah('kataSandi', nilai)}
                  autoComplete="new-password"
                />
                <KolomSandi
                  label={wajib('Ulangi Kata Sandi')}
                  error={tampilGalat.ulangiKataSandi}
                  nilai={form.ulangiKataSandi}
                  onUbah={(nilai) => ubah('ulangiKataSandi', nilai)}
                  autoComplete="new-password"
                />
              </div>

              {/* Pernyataan kebenaran data */}
              <div className="flex flex-col gap-1.5">
                <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-6 text-ink-soft">
                  <input
                    type="checkbox"
                    checked={form.setuju}
                    onChange={(e) => ubah('setuju', e.target.checked)}
                    aria-invalid={!!tampilGalat.setuju}
                    className="mt-1 size-4 shrink-0 accent-brand"
                  />
                  <span>
                    Saya menyatakan bahwa data yang saya isikan adalah benar dan dapat dipertanggungjawabkan untuk
                    kebutuhan administrasi pelayanan rekam medis <strong className="text-ink">RS Sehat Medika</strong>.
                  </span>
                </label>
                {tampilGalat.setuju && <p className="text-xs text-danger" role="alert">{tampilGalat.setuju}</p>}
              </div>

              <Button type="submit" size="lg" className="w-full uppercase tracking-wide">
                Daftar akun pasien
                <ArrowRight className="size-4" />
              </Button>

              <p className="flex flex-wrap items-center justify-center gap-1 text-[13px] text-ink-soft">
                Sudah memiliki akun rekam medis?
                <Button href={URL_LOGIN} variant="ghost" size="sm" className="font-bold uppercase text-brand">
                  Masuk di sini
                  <ArrowRight className="size-3.5" />
                </Button>
              </p>
            </form>
          </div>
        </main>

        {/* Footer */}
        <footer className="flex flex-col items-center justify-between gap-2 px-6 pb-8 text-[11px] tracking-wide text-ink-muted sm:flex-row sm:px-10">
          <span className="inline-flex items-center gap-2">
            <Lock className="size-3.5" />
            SECURE CONNECTION // ENCRYPTED
          </span>
          <span>SISTEM INFORMASI OUTPATIENT CARE - RS SEHAT MEDIKA</span>
        </footer>
      </div>
    </>
  );
}
