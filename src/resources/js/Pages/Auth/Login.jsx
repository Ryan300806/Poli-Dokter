import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowRight, Eye, EyeOff, Info, Lock, UserCheck } from 'lucide-react';
import Button from '../../Components/ui/Button';
import { ToastContainer } from '../../Components/ui/Toast';
import { rute } from '../../lib/rute';

export default function Login({ errors: serverErrors = {} }) {
  const { props } = usePage();
  const flash = props.flash || {};
  const [form, setForm] = useState({ nik: '', kataSandi: '', ingat: false });
  const [lihatSandi, setLihatSandi] = useState(false);
  const [errors, setErrors] = useState({});

  const mergedErrors = { ...serverErrors, ...errors };

  function submit(e) {
    e.preventDefault();
    const err = {};
    if (!form.nik.trim()) err.nik = 'NIK atau Username wajib diisi.';
    if (!form.kataSandi) err.kataSandi = 'Kata sandi wajib diisi.';
    setErrors(err);
    if (Object.keys(err).length > 0) return;

    router.post(rute.login, form);
  }

  return (
    <>
      <Head title="Autentikasi — RS Sehat Medika" />
      <div className="min-h-screen flex flex-col bg-surface">
        {/* Topbar Auth */}
        <header className="flex h-16 items-center justify-between border-b border-line bg-white px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-white font-extrabold text-lg">+</span>
            <span className="text-sm font-bold text-ink">RS SEHAT MEDIKA</span>
            <span className="rounded-md bg-brand-light-active px-2 py-0.5 text-[10px] font-bold text-brand-dark">SIM-RS PORTAL</span>
          </div>
          <span className="text-xs font-medium text-ink-soft">Sistem Rawat Jalan</span>
        </header>

        {/* Center Card */}
        <main className="flex flex-1 flex-col items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-modal">
            <div className="flex flex-col items-center text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-light-active text-brand">
                <Lock className="size-6" />
              </span>
              <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                PORTAL REKAM MEDIS ELEKTRONIK
              </p>
              <h1 className="mt-1 text-2xl font-extrabold text-ink">Autentikasi Pengguna</h1>
              <p className="mt-2 text-xs text-ink-soft leading-relaxed">
                Silakan masukkan NIK (untuk Pasien) atau Username (untuk Dokter, Perawat, Apoteker) beserta kata sandi Anda.
              </p>
            </div>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-ink">
                  <label htmlFor="nik">NIK / Username <span className="text-danger">*</span></label>
                  <span className="rounded bg-surface-mid px-1.5 py-0.5 text-[10px] font-bold text-ink-soft">16 DIGIT / ID</span>
                </div>
                <div className="relative mt-1.5">
                  <UserCheck className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
                  <input
                    id="nik"
                    type="text"
                    value={form.nik}
                    onChange={(e) => { setForm({ ...form, nik: e.target.value }); setErrors({ ...errors, nik: undefined }); }}
                    placeholder="Contoh: 3573010101900001 / dokter_umum"
                    className="h-11 w-full rounded-xl bg-surface-input pl-10 pr-4 text-xs text-ink outline-none focus:ring-2 focus:ring-brand/30"
                  />
                </div>
                {mergedErrors.nik && <p className="mt-1 text-[11px] font-medium text-danger">{mergedErrors.nik}</p>}
                <p className="mt-1 flex items-center gap-1 text-[10px] text-ink-muted">
                  <Info className="size-3 shrink-0" /> Gunakan 16 digit NIK sesuai e-KTP atau username staf.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-ink">
                  <label htmlFor="kataSandi">Kata Sandi <span className="text-danger">*</span></label>
                </div>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
                  <input
                    id="kataSandi"
                    type={lihatSandi ? 'text' : 'password'}
                    value={form.kataSandi}
                    onChange={(e) => { setForm({ ...form, kataSandi: e.target.value }); setErrors({ ...errors, kataSandi: undefined }); }}
                    placeholder="Masukkan kata sandi akun..."
                    className="h-11 w-full rounded-xl bg-surface-input pl-10 pr-10 text-xs text-ink outline-none focus:ring-2 focus:ring-brand/30"
                  />
                  <button
                    type="button"
                    onClick={() => setLihatSandi((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                  >
                    {lihatSandi ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {mergedErrors.kataSandi && <p className="mt-1 text-[11px] font-medium text-danger">{mergedErrors.kataSandi}</p>}
                <p className="mt-1 text-[10px] text-ink-muted">Minimal 8 karakter kombinasi huruf dan angka.</p>
              </div>

              <label className="flex items-center gap-2 text-xs text-ink-soft cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.ingat}
                  onChange={(e) => setForm({ ...form, ingat: e.target.checked })}
                  className="size-4 rounded accent-brand"
                />
                <span>Ingat sesi login di perangkat ini</span>
              </label>

              <Button type="submit" icon={ArrowRight} className="w-full h-11 text-xs uppercase tracking-wide">
                Masuk ke Portal
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-ink-soft">
              Belum memiliki akun pasien?{' '}
              <Link href={rute.registrasi} className="font-bold text-brand hover:underline">
                Registrasi Baru &rarr;
              </Link>
            </p>
          </div>

          <div className="mt-6 flex items-center gap-2 text-[11px] font-semibold text-ink-muted">
            <span className="size-2 rounded-full bg-brand" />
            <span>SERVER SIM-RS AKTIF &amp; NORMAL</span>
            <span>•</span>
            <span>RS SEHAT MEDIKA</span>
          </div>
        </main>
      </div>
      <ToastContainer flashSuccess={flash.success} flashInfo={flash.info} />
    </>
  );
}
