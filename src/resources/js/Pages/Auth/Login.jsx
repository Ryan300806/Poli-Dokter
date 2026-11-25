import { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowRight, Eye, EyeOff, Lock } from 'lucide-react';
import Brand from '../../Components/ui/Brand';
import Button from '../../Components/ui/Button';
import { rute } from '../../lib/rute';

export default function Login() {
  const { flash = {} } = usePage().props;
  const { data, setData, post, processing, errors } = useForm({ nik: '', kataSandi: '', ingat: false });
  const [lihat, setLihat] = useState(false);
  const EyeIcon = lihat ? EyeOff : Eye;
  function masuk(event) {
    event.preventDefault();
    if (!processing) post(rute.login);
  }
  return (
    <>
      <Head title="Masuk · RS Citra Medika" />
      <div className="min-h-screen bg-surface">
        <header className="portal-topbar"><Brand /><span className="hidden text-sm text-ink-soft sm:block">Layanan rawat jalan</span></header>
        <main className="mx-auto w-full max-w-md px-4 pb-10 pt-10 sm:pt-[9vh]">
          <section className="rounded-2xl border border-line bg-white p-6 shadow-card sm:p-9">
            <span className="mb-5 inline-grid size-11 place-items-center rounded-xl bg-brand-light text-brand-dark"><Lock size={21} /></span>
            <h1 className="text-3xl font-bold tracking-tight text-ink">Masuk ke portal</h1>
            <p className="mt-2 leading-relaxed text-ink-soft">Pasien masuk dengan NIK. Dokter, perawat, dan apoteker menggunakan nama pengguna staf.</p>
            {(flash.info || flash.success) && <p role="status" className="mt-4 rounded-lg bg-brand-light p-3 text-sm text-brand-dark">{flash.info || flash.success}</p>}
            <form onSubmit={masuk} className="mt-7 space-y-5">
              <div>
                <label className="field-label" htmlFor="identitas">NIK atau nama pengguna</label>
                <input className="field-input" id="identitas" autoComplete="username" autoCapitalize="none" spellCheck={false}
                  value={data.nik} onChange={(e) => setData('nik', e.target.value)} required maxLength={100}
                  aria-invalid={!!errors.nik} aria-describedby={errors.nik ? 'err-identitas' : undefined} />
                {errors.nik && <p id="err-identitas" role="alert" className="field-error">{errors.nik}</p>}
              </div>
              <div>
                <label className="field-label" htmlFor="sandi">Kata sandi</label>
                <div className="relative">
                  <input className="field-input pr-12" id="sandi" type={lihat ? 'text' : 'password'} autoComplete="current-password"
                    value={data.kataSandi} onChange={(e) => setData('kataSandi', e.target.value)} required
                    aria-invalid={!!errors.kataSandi} aria-describedby={errors.kataSandi ? 'err-sandi' : undefined} />
                  <button type="button" aria-label={lihat ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} aria-pressed={lihat}
                    className="absolute right-0 top-1.5 grid size-11 place-items-center text-ink-soft" onClick={() => setLihat(!lihat)}>
                    <EyeIcon size={18} />
                  </button>
                </div>
                {errors.kataSandi && <p id="err-sandi" className="field-error">{errors.kataSandi}</p>}
              </div>
              <label className="flex items-center gap-2.5 text-sm text-ink-soft">
                <input type="checkbox" className="size-4 accent-brand" checked={data.ingat} onChange={(e) => setData('ingat', e.target.checked)} />
                Ingat akun pasien di perangkat pribadi
              </label>
              <Button type="submit" disabled={processing} className="w-full">{processing ? 'Sedang masuk…' : 'Masuk'}<ArrowRight size={16} /></Button>
            </form>
            <p className="mt-6 border-t border-line pt-5 text-center text-sm text-ink-soft">
              Pasien baru? <Link href={rute.registrasi} className="font-semibold text-brand underline-offset-4 hover:underline">Daftar akun</Link>
            </p>
          </section>
        </main>
      </div>
    </>
  );
}
