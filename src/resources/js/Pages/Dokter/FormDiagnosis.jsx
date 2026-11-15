import { useState } from 'react';
import { router } from '@inertiajs/react';
import {
  Activity, ArrowLeft, ArrowRight, HeartPulse, LockKeyhole,
  PlusCircle, Save, ShieldCheck, Stethoscope, UserRound, Weight,
} from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/ui/Button';
import Badge from '../../Components/ui/Badge';
import { toast } from '../../Components/ui/Toast';
import { rute } from '../../lib/rute';

const fieldClass = 'h-11 w-full rounded-lg border border-line bg-white px-3 text-[13px] text-ink outline-none placeholder:text-ink-muted focus:border-brand focus:ring-2 focus:ring-brand/20';

function InfoVital({ icon: Icon, label, value, detail }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-surface-low px-4 py-4">
      <span className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg bg-brand text-white"><Icon className="size-5" /></span>
        <span><span className="block text-[10px] font-semibold uppercase tracking-wide text-ink-muted">{label}</span><b className="text-sm">{value}</b></span>
      </span>
      <span className="text-[11px] text-ink-muted">{detail}</span>
    </div>
  );
}

export default function FormDiagnosis({ antreanId, pasienServer: pasien }) {
  const [mulai, setMulai] = useState(false);
  const [form, setForm] = useState({ diagnosis: '', rencana: '' });
  const [error, setError] = useState('');
  const [tersimpan, setTersimpan] = useState(false);
  if (!pasien) return <AppLayout role="dokter" title="Form Diagnosis"><p className="rounded-xl bg-white p-6">Data pasien untuk antrean ini tidak tersedia.</p></AppLayout>;

  function simpanDiagnosis(event) {
    event.preventDefault();
    if (!form.diagnosis.trim() || !form.rencana.trim()) {
      setError('Diagnosis klinis dan rencana tindakan wajib diisi.');
      return;
    }

    if (!antreanId || !/^\d+$/.test(String(antreanId))) {
      setError('ID antrean pemeriksaan tidak valid. Buka form dari daftar antrean server.');
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
      onError: (errors) => setError(errors.namaDiagnosis || errors.rencanaTindakan || errors.idPemeriksaan || 'Diagnosis gagal disimpan.'),
    });
  }

  function lanjutKeResep() {
    router.visit(rute.dokter.formEResep(antreanId));
  }

  return (
    <AppLayout role="dokter" title="Form Diagnosis" contentClassName="pl-3 pr-9 xl:pl-[30px] xl:pr-[18px]">
      {!mulai ? (
        <section className="flex items-center justify-between gap-5 rounded-2xl bg-white px-6 py-5 shadow-card">
          <div className="flex items-center gap-4">
            <span className="flex size-10 items-center justify-center rounded-full bg-brand/15 text-brand"><Stethoscope className="size-5" /></span>
            <div>
              <h1 className="text-base font-bold text-ink">Siap melakukan tindakan periksa?</h1>
              <p className="text-[13px] text-ink-muted">Pemeriksaan akan dicatat ke rekam medis pasien.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button icon={PlusCircle} onClick={() => setMulai(true)}>Buat Diagnosis Baru</Button>
          </div>
        </section>
      ) : (
        <>
          <header className="mt-[9px] mb-[9px] flex items-center justify-between pb-2">
            <div>
              <h1 className="flex items-center gap-2 text-[28px] font-bold leading-9 tracking-tight">Form Diagnosis</h1>
              <p className="text-[13px] text-ink-muted">Pencatatan rekam medis pemeriksaan klinis pasien rawat jalan secara terpusat</p>
            </div>
            <Button variant="ghost" icon={ArrowLeft} onClick={() => setMulai(false)}>Kembali</Button>
          </header>

          <section className="min-h-[304px] rounded-2xl border-t-4 border-brand bg-white p-6 shadow-card">
            <div className="mt-3 flex min-h-16 flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex size-14 items-center justify-center rounded-full bg-brand/15 text-brand"><UserRound className="size-6" /></span>
                <div>
                  <h2 className="text-lg font-bold">{pasien.nama}</h2>
                  <p className="text-[11px] text-ink-muted">ID Pasien: {pasien.id} • Status Triase: <b className="text-brand">{pasien.tekananDarah ? 'Terukur' : 'Belum tersedia'}</b></p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="rounded-lg bg-surface-low px-4 py-2 text-center"><small className="block text-[9px] uppercase text-ink-muted">Antrean</small><b className="text-brand">{pasien.antrean}</b></div>
                <div className="rounded-lg bg-surface-low px-4 py-2 text-center"><small className="block text-[9px] uppercase text-ink-muted">Waktu Masuk</small><b>{pasien.waktu ?? '—'}</b></div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-surface-low px-4 py-2.5 text-[11px] md:grid-cols-4">
              <span><small className="block text-ink-muted">Nomor Induk Kependudukan (NIK)</small><b>{pasien.nik}</b></span>
              <span><small className="block text-ink-muted">Umur / Jenis Kelamin</small><b>{pasien.umur ?? '—'} Tahun ({pasien.jk})</b></span>
              <span><small className="block text-ink-muted">Poliklinik Rujukan</small><b>{pasien.poli ?? '—'}</b></span>
              <span><small className="block text-ink-muted">Alergi Terdata</small><b className="text-danger">{pasien.alergi ?? 'Belum tercatat'}</b></span>
            </div>
            <p className="mb-2 mt-4 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">Tanda-tanda vital (TTV) &amp; antropometri pra-pemeriksaan</p>
            <div className="grid gap-3 md:grid-cols-3">
              <InfoVital icon={HeartPulse} label="Tekanan Darah" value={pasien.tekananDarah ? `${pasien.tekananDarah} mmHg` : 'Belum tercatat'} detail="Data observasi" />
              <InfoVital icon={Activity} label="Suhu Tubuh" value={pasien.suhu ? `${pasien.suhu} °C` : 'Belum tercatat'} detail="Data observasi" />
              <InfoVital icon={Weight} label="Berat Badan" value={pasien.berat ? `${pasien.berat} kg` : 'Belum tercatat'} detail="Data observasi" />
            </div>
          </section>

          <form onSubmit={simpanDiagnosis} className="mt-[7px] min-h-[633px] rounded-2xl bg-white p-6 shadow-card">
            <div className="mb-6 min-h-[52px] flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Hasil Pemeriksaan &amp; Rencana Medis</h2>
                <p className="text-[11px] text-ink-muted">Lengkapi diagnosa kerja, instruksi farmakologis, serta rekomendasi lanjutan sesuai standar ICD-10.</p>
              </div>
              <span className="flex items-center gap-1 text-[10px] text-ink-muted"><LockKeyhole className="size-3 text-brand" />Waktu antrean: {pasien.waktu ?? '—'}</span>
            </div>

            <div className="mb-1.5 flex h-5 items-center justify-between gap-3 text-xs font-semibold">
              <label>Nama Diagnosis Klinis / ICD-10 <span className="text-danger">*</span></label>
            </div>
            <div className="relative">
              <Stethoscope className="absolute left-3 top-3 size-4 text-ink-muted" />
              <input className={`${fieldClass} pl-10`} value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} placeholder="Contoh: Dispepsia Fungsional / Gastritis Akut (K29.7)" />
            </div>
            <p className="mt-[5px] h-4 text-[10px] text-ink-muted">Masukkan kode ICD-10 atau nama diagnosis klinis yang ditegakkan dokter.</p>

            <label className="mb-1.5 mt-6 flex h-5 items-center justify-between text-xs font-semibold leading-5"><span>Rencana Tindakan &amp; Intervensi Medis <span className="text-danger">*</span></span><span className="text-[10px] font-normal text-ink-muted">{form.rencana.length} / 500 karakter</span></label>
            <textarea className={`${fieldClass} min-h-[140px] resize-y py-3 block`} maxLength={500} value={form.rencana} onChange={(e) => setForm({ ...form, rencana: e.target.value })} placeholder="Rincian rencana terapi, instruksi diet lambung, pemeriksaan penunjang lab darah rutin/USG, atau edukasi kepatuhan minum obat..." />
            <p className="mt-1.5 flex h-[22px] items-center text-[10px] text-ink-muted">Dokumentasikan advis istirahat, anjuran nutrisi, dan konseling gaya hidup pasien.</p>


            {error && <p className="mt-4 rounded-lg bg-danger-light p-3 text-xs text-danger" role="alert">{error}</p>}
            <div className="mt-6 flex min-h-14 flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
      <span className="flex items-center gap-2 text-[10px] text-ink-muted"><ShieldCheck className="size-4 text-brand" />{tersimpan ? 'Diagnosis tersimpan ke rekam medis' : 'Diagnosis akan disimpan ke server'}</span>
              <div className="flex gap-2">
                <Button type="button" className="h-10" variant="secondary" onClick={() => setForm({ diagnosis: '', rencana: '' })}>Batal</Button>
                <Button type="submit" className="h-10" icon={Save}>Simpan Diagnosis</Button>
                {tersimpan && <Button type="button" icon={ArrowRight} onClick={lanjutKeResep}>Buat E-Resep</Button>}
              </div>
            </div>
          </form>
        </>
      )}

    </AppLayout>
  );
}
