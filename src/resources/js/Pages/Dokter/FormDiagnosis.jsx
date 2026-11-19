import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Activity, ArrowLeft, ArrowRight, HeartPulse, PlusCircle, Save, ShieldCheck, Stethoscope, Weight } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/ui/Button';
import Badge from '../../Components/ui/Badge';
import { toast } from '../../Components/ui/Toast';
import { rute } from '../../lib/rute';

export default function FormDiagnosis({ antreanId, pasienServer: pasien }) {
  const [mulai, setMulai] = useState(false);
  const [form, setForm] = useState({ diagnosis: '', rencana: '' });
  const [error, setError] = useState('');
  const [tersimpan, setTersimpan] = useState(false);

  function simpanDiagnosis(e) {
    e.preventDefault();
    if (!form.diagnosis.trim() || !form.rencana.trim()) {
      setError('Diagnosis klinis dan rencana tindakan wajib diisi.');
      return;
    }
    router.post(`/dokter/diagnosis/${antreanId}`, {
      namaDiagnosis: form.diagnosis.trim(),
      rencanaTindakan: form.rencana.trim(),
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setError('');
        setTersimpan(true);
        toast.success('Diagnosis berhasil disimpan ke rekam medis.');
      },
      onError: (errs) => setError(errs.namaDiagnosis || errs.rencanaTindakan || 'Gagal menyimpan diagnosis.'),
    });
  }

  return (
    <AppLayout role="dokter" title="Form Diagnosis">
      {!mulai ? (
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-card">
          <div className="flex items-center gap-4">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-light-active text-brand">
              <Stethoscope className="size-6" />
            </span>
            <div>
              <h2 className="text-base font-bold text-ink">Siap melakukan tindakan periksa?</h2>
              <p className="text-xs text-ink-soft">Pemeriksaan pasien <b>{pasien.nama} ({pasien.rm})</b> akan dicatat ke Rekam Medis.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" icon={ArrowLeft} onClick={() => router.visit(rute.dokter.antreanPeriksa)}>Kembali</Button>
            <Button icon={PlusCircle} onClick={() => setMulai(true)}>Buat Diagnosis Baru</Button>
          </div>
        </section>
      ) : (
        <>
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-ink">Form Diagnosis</h1>
              <p className="mt-1 text-xs text-ink-soft">Pencatatan rekam medis pemeriksaan klinis pasien rawat jalan.</p>
            </div>
            <Button variant="ghost" icon={ArrowLeft} onClick={() => setMulai(false)}>Kembali</Button>
          </header>

          <section className="rounded-2xl border-t-4 border-brand bg-white p-6 shadow-card space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-ink">{pasien.nama} <Badge tone="success">{pasien.rm}</Badge></h2>
                <p className="mt-0.5 text-xs text-ink-muted">NIK: {pasien.nik} • {pasien.umur ?? '—'} Tahun ({pasien.jk}) • Poli: <b>{pasien.poli}</b></p>
              </div>
              <div className="flex gap-2 text-center">
                <div className="rounded-xl bg-surface-low px-4 py-2"><small className="block text-[9px] uppercase text-ink-muted">ANTREAN</small><b className="text-brand">{pasien.antrean}</b></div>
                <div className="rounded-xl bg-surface-low px-4 py-2"><small className="block text-[9px] uppercase text-ink-muted">ALERGI</small><b className="text-danger">{pasien.alergi || '—'}</b></div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {[
                { icon: HeartPulse, label: 'TEKANAN DARAH', val: pasien.tekananDarah ? `${pasien.tekananDarah} mmHg` : 'Belum tercatat' },
                { icon: Activity, label: 'SUHU TUBUH', val: pasien.suhu ? `${pasien.suhu} °C` : 'Belum tercatat' },
                { icon: Weight, label: 'BERAT BADAN', val: pasien.berat ? `${pasien.berat} kg` : 'Belum tercatat' },
              ].map((v) => {
                const Icon = v.icon;
                return (
                  <div key={v.label} className="flex items-center gap-3 rounded-xl bg-surface-low p-3.5">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-brand text-white"><Icon className="size-5" /></span>
                    <div><small className="block text-[9px] font-bold text-ink-muted">{v.label}</small><b className="text-sm">{v.val}</b></div>
                  </div>
                );
              })}
            </div>
          </section>

          <form onSubmit={simpanDiagnosis} className="rounded-2xl bg-white p-6 shadow-card space-y-5">
            <div>
              <h3 className="text-base font-bold text-ink">Hasil Pemeriksaan &amp; Rencana Medis</h3>
              <p className="text-xs text-ink-muted">Lengkapi diagnosa kerja sesuai standar ICD-10 dan rencana intervensi medis.</p>
            </div>

            <label className="block text-xs font-bold">
              Nama Diagnosis Klinis / ICD-10 <span className="text-danger">*</span>
              <input
                value={form.diagnosis}
                onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                placeholder="Contoh: Dispepsia Fungsional / Gastritis Akut (K29.7)"
                className="mt-1.5 h-11 w-full rounded-xl bg-surface-input px-4 text-xs outline-none focus:ring-2 focus:ring-brand/30"
              />
            </label>

            <label className="block text-xs font-bold">
              Rencana Tindakan &amp; Intervensi Medis <span className="text-danger">*</span>
              <textarea
                rows={4}
                maxLength={500}
                value={form.rencana}
                onChange={(e) => setForm({ ...form, rencana: e.target.value })}
                placeholder="Rincian rencana terapi, diet, dan edukasi pasien..."
                className="mt-1.5 w-full rounded-xl bg-surface-input p-4 text-xs outline-none focus:ring-2 focus:ring-brand/30"
              />
            </label>

            {error && <p className="rounded-xl bg-danger-light p-3 text-xs font-semibold text-danger">{error}</p>}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <span className="flex items-center gap-1.5 text-xs text-ink-muted">
                <ShieldCheck className="size-4 text-brand" />
                {tersimpan ? 'Diagnosis tersimpan & status antrean selesai.' : 'Siap disimpan ke Rekam Medis'}
              </span>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setForm({ diagnosis: '', rencana: '' })}>Batal</Button>
                <Button type="submit" icon={Save}>Simpan Diagnosis</Button>
                {tersimpan && (
                  <Button type="button" icon={ArrowRight} onClick={() => router.visit(rute.dokter.formEResep(antreanId))}>
                    Buat E-Resep
                  </Button>
                )}
              </div>
            </div>
          </form>
        </>
      )}
    </AppLayout>
  );
}
