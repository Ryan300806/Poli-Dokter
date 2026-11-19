import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Mars, ShieldCheck, UserPlus, Venus } from 'lucide-react';
import Button from '../../Components/ui/Button';
import { rute } from '../../lib/rute';

export default function Registrasi({ errors: serverErrors = {} }) {
  const [form, setForm] = useState({
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
  });
  const [lihat1, setLihat1] = useState(false);
  const [lihat2, setLihat2] = useState(false);
  const [errors, setErrors] = useState({});

  const merged = { ...serverErrors, ...errors };

  function ubah(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function submit(e) {
    e.preventDefault();
    const err = {};
    if (!/^\d{16}$/.test(form.nik)) err.nik = 'NIK harus tepat 16 digit angka.';
    if (!form.namaLengkap.trim()) err.namaLengkap = 'Nama lengkap wajib diisi.';
    if (!form.tempatLahir.trim()) err.tempatLahir = 'Tempat lahir wajib diisi.';
    if (!form.tanggalLahir) err.tanggalLahir = 'Tanggal lahir wajib diisi.';
    if (!form.alamat.trim()) err.alamat = 'Alamat domisili wajib diisi.';
    if (!form.jenisKelamin) err.jenisKelamin = 'Pilih jenis kelamin.';
    if (!form.namaKontakDarurat.trim()) err.namaKontakDarurat = 'Nama kontak darurat wajib diisi.';
    if (!form.noKontakDarurat.trim()) err.noKontakDarurat = 'Nomor telepon darurat wajib diisi.';
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(form.kataSandi)) err.kataSandi = 'Minimal 8 karakter kombinasi huruf dan angka.';
    if (form.kataSandi !== form.ulangiKataSandi) err.ulangiKataSandi = 'Konfirmasi kata sandi tidak cocok.';
    if (!form.setuju) err.setuju = 'Centang persetujuan data terlebih dahulu.';

    setErrors(err);
    if (Object.keys(err).length > 0) return;

    router.post(rute.registrasi, form);
  }

  const inputCls = 'mt-1.5 h-11 w-full rounded-xl border border-line bg-white px-3.5 text-xs text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20';

  return (
    <>
      <Head title="Registrasi Pasien Baru — RS Sehat Medika" />
      <div className="min-h-screen flex flex-col bg-surface">
        <header className="flex h-16 items-center justify-between border-b border-line bg-white px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-white font-extrabold text-lg">+</span>
            <span className="text-sm font-bold text-ink">RS SEHAT MEDIKA</span>
            <span className="rounded-md bg-brand-light-active px-2 py-0.5 text-[10px] font-bold text-brand-dark">SIM-RS PORTAL</span>
          </div>
          <Link href={rute.login} className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-ink">
            <ArrowLeft className="size-4" /> Kembali ke Login
          </Link>
        </header>

        <main className="flex-1 py-8 px-4">
          <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-modal">
            <div className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-light-active text-brand">
                <UserPlus className="size-6" />
              </span>
              <div>
                <h1 className="text-2xl font-extrabold text-ink">Formulir Registrasi Pasien Baru</h1>
                <p className="mt-1 text-xs text-ink-soft">
                  Pastikan data identitas sesuai dengan KTP / Kartu Keluarga resmi untuk validasi rekam medis rawat jalan.
                </p>
              </div>
            </div>

            <form onSubmit={submit} className="mt-6 space-y-5">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <label>Nomor Induk Kependudukan (NIK) <span className="text-danger">*</span></label>
                  <span className="text-[11px] font-bold text-ink-muted">{form.nik.length}/16</span>
                </div>
                <input
                  type="text"
                  maxLength={16}
                  value={form.nik}
                  onChange={(e) => ubah('nik', e.target.value.replace(/\D/g, ''))}
                  placeholder="Contoh: 3171012345670001"
                  className={inputCls}
                />
                {merged.nik && <p className="mt-1 text-[11px] text-danger">{merged.nik}</p>}
                <p className="mt-1 flex items-center gap-1 text-[10px] text-brand-dark">
                  <ShieldCheck className="size-3.5" /> Data NIK otomatis divalidasi untuk mencegah duplikasi rekam medis.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold">Nama Lengkap (Sesuai KTP) <span className="text-danger">*</span></label>
                <input
                  type="text"
                  value={form.namaLengkap}
                  onChange={(e) => ubah('namaLengkap', e.target.value)}
                  placeholder="Masukkan nama lengkap tanpa singkatan gelar"
                  className={inputCls}
                />
                {merged.namaLengkap && <p className="mt-1 text-[11px] text-danger">{merged.namaLengkap}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold">Tempat Lahir <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    value={form.tempatLahir}
                    onChange={(e) => ubah('tempatLahir', e.target.value)}
                    placeholder="Kota/Kabupaten lahir"
                    className={inputCls}
                  />
                  {merged.tempatLahir && <p className="mt-1 text-[11px] text-danger">{merged.tempatLahir}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold">Tanggal Lahir <span className="text-danger">*</span></label>
                  <input
                    type="date"
                    max={new Date().toISOString().slice(0, 10)}
                    value={form.tanggalLahir}
                    onChange={(e) => ubah('tanggalLahir', e.target.value)}
                    className={inputCls}
                  />
                  {merged.tanggalLahir && <p className="mt-1 text-[11px] text-danger">{merged.tanggalLahir}</p>}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold">Alamat Lengkap Domisili <span className="text-danger">*</span></label>
                <textarea
                  rows={3}
                  value={form.alamat}
                  onChange={(e) => ubah('alamat', e.target.value)}
                  placeholder="Tuliskan nama jalan, RT/RW, kelurahan, kecamatan, dan kota domisili saat ini..."
                  className="mt-1.5 w-full rounded-xl border border-line bg-white p-3.5 text-xs text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
                {merged.alamat && <p className="mt-1 text-[11px] text-danger">{merged.alamat}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold">Jenis Kelamin <span className="text-danger">*</span></label>
                <div className="mt-1.5 grid gap-3 sm:grid-cols-2">
                  {[
                    { value: 'laki-laki', label: 'Laki-laki', icon: Mars },
                    { value: 'perempuan', label: 'Perempuan', icon: Venus },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    const active = form.jenisKelamin === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => ubah('jenisKelamin', opt.value)}
                        className={`flex items-center justify-between rounded-xl border px-4 py-3 text-xs font-semibold transition cursor-pointer ${
                          active ? 'border-brand bg-brand-light-active text-brand-dark' : 'border-line bg-white text-ink hover:bg-surface-low'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <span className={`flex size-7 items-center justify-center rounded-full ${active ? 'bg-brand text-white' : 'bg-surface-mid text-ink-soft'}`}>
                            <Icon className="size-4" />
                          </span>
                          {opt.label}
                        </span>
                        <span className={`size-4 rounded-full border-2 ${active ? 'border-brand bg-brand' : 'border-ink-muted'}`} />
                      </button>
                    );
                  })}
                </div>
                {merged.jenisKelamin && <p className="mt-1 text-[11px] text-danger">{merged.jenisKelamin}</p>}
              </div>

              {/* Kotak Kontak Darurat Hijau seperti _p1 */}
              <div className="rounded-2xl bg-brand-light-active p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-brand-dark">Kontak Darurat Pasien</p>
                  <span className="rounded-full bg-danger-light px-2.5 py-0.5 text-[10px] font-bold text-danger">* WAJIB DIISI</span>
                </div>
                <p className="mt-1 text-[11px] text-brand-dark/80">Dihubungi untuk konfirmasi tindakan medis mendesak atau perubahan jadwal dokter.</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-semibold text-brand-dark">Nama Kontak Darurat <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      value={form.namaKontakDarurat}
                      onChange={(e) => ubah('namaKontakDarurat', e.target.value)}
                      placeholder="Nama lengkap kerabat/wali"
                      className="mt-1 h-10 w-full rounded-xl bg-white px-3 text-xs text-ink outline-none"
                    />
                    {merged.namaKontakDarurat && <p className="mt-1 text-[11px] text-danger">{merged.namaKontakDarurat}</p>}
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-brand-dark">Nomor WhatsApp / Telepon Aktif <span className="text-danger">*</span></label>
                    <div className="mt-1 flex h-10 overflow-hidden rounded-xl bg-white">
                      <span className="flex items-center bg-surface-mid px-3 text-xs font-bold text-ink-soft">+62</span>
                      <input
                        type="text"
                        value={form.noKontakDarurat}
                        onChange={(e) => ubah('noKontakDarurat', e.target.value)}
                        placeholder="812-3456-7890"
                        className="w-full px-3 text-xs text-ink outline-none"
                      />
                    </div>
                    {merged.noKontakDarurat && <p className="mt-1 text-[11px] text-danger">{merged.noKontakDarurat}</p>}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold">Kata Sandi Baru <span className="text-danger">*</span></label>
                  <div className="relative">
                    <input
                      type={lihat1 ? 'text' : 'password'}
                      value={form.kataSandi}
                      onChange={(e) => ubah('kataSandi', e.target.value)}
                      placeholder="Minimal 8 karakter"
                      className={`${inputCls} pr-10`}
                    />
                    <button type="button" onClick={() => setLihat1((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted">
                      {lihat1 ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {merged.kataSandi && <p className="mt-1 text-[11px] text-danger">{merged.kataSandi}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold">Ulangi Kata Sandi <span className="text-danger">*</span></label>
                  <div className="relative">
                    <input
                      type={lihat2 ? 'text' : 'password'}
                      value={form.ulangiKataSandi}
                      onChange={(e) => ubah('ulangiKataSandi', e.target.value)}
                      placeholder="Ketik ulang kata sandi"
                      className={`${inputCls} pr-10`}
                    />
                    <button type="button" onClick={() => setLihat2((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted">
                      {lihat2 ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {merged.ulangiKataSandi && <p className="mt-1 text-[11px] text-danger">{merged.ulangiKataSandi}</p>}
                </div>
              </div>

              <label className="flex items-start gap-2.5 text-xs text-ink-soft cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.setuju}
                  onChange={(e) => ubah('setuju', e.target.checked)}
                  className="mt-0.5 size-4 rounded accent-brand"
                />
                <span>
                  Saya menyatakan bahwa data yang saya isikan adalah benar dan dapat dipertanggungjawabkan untuk kebutuhan administrasi pelayanan rekam medis <b>RS Sehat Medika</b>.
                </span>
              </label>
              {merged.setuju && <p className="text-[11px] text-danger">{merged.setuju}</p>}

              <Button type="submit" icon={ArrowRight} className="w-full h-12 text-xs uppercase tracking-wider">
                Daftar Akun Pasien
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-ink-soft">
              Sudah memiliki akun rekam medis?{' '}
              <Link href={rute.login} className="font-bold text-brand hover:underline">
                MASUK DI SINI &rarr;
              </Link>
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
