import { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import {
  Activity, ArrowLeft, CheckCircle2, RotateCcw, ShieldCheck, Smile, Weight,
} from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/ui/Button';
import Badge from '../../Components/ui/Badge';
import { antreanTriageDemo, levelTriageDemo } from '../../data/perawatDemo';
import { bacaDemo, simpanDemo } from '../../lib/demoStorage';
import { rute } from '../../lib/rute';

const initialForm = (pasien) => ({
  level: 'P3',
  tdSis: pasien.tdSis,
  tdDia: pasien.tdDia,
  suhu: pasien.suhu,
  berat: pasien.berat,
  tinggi: pasien.tinggi,
  spo2: pasien.spo2,
  nadi: pasien.nadi,
  respirasi: pasien.respirasi,
  gcs: pasien.gcs,
  nyeri: '2',
  catatan: pasien.keluhan,
});

const fieldClass = 'h-10 w-full rounded-lg bg-surface-mid px-3 text-xs outline-none focus:ring-2 focus:ring-brand/30';

function Field({ label, unit, value, onChange, type = 'number', min = '0', max, step = '1', note, className = '' }) {
  return (
    <label className={`block text-xs ${className}`}>
      <span className="flex items-center justify-between font-medium leading-[18px]">{label}{note && <small className="text-[9px] text-ink-muted">{note}</small>}</span>
      <span className="mt-1.5 flex items-center rounded-lg bg-surface-mid pr-3 focus-within:ring-2 focus-within:ring-brand/30"><input type={type} min={min} max={max} step={step} value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-full min-w-0 bg-transparent px-3 outline-none" /><small className="text-[10px] text-ink-muted">{unit}</small></span>
    </label>
  );
}

export default function FormObservasi({ antreanId }) {
  const pasien = useMemo(
    () => antreanTriageDemo.find((item) => item.id === String(antreanId)) ?? antreanTriageDemo[0],
    [antreanId],
  );
  const tersimpan = bacaDemo('polidokter-demo-observasi', {});
  const [form, setForm] = useState(() => ({ ...initialForm(pasien), ...(tersimpan[pasien.id] ?? {}) }));
  const [error, setError] = useState('');
  const bmi = form.berat && form.tinggi ? (Number(form.berat) / ((Number(form.tinggi) / 100) ** 2)).toFixed(1) : '—';

  function ubah(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setError('');
  }

  function validasi() {
    const angka = ['tdSis', 'tdDia', 'suhu', 'berat', 'tinggi', 'spo2', 'nadi', 'respirasi'];
    const tidakValid = angka.find((key) => form[key] === '' || !Number.isFinite(Number(form[key])) || Number(form[key]) <= 0);
    if (tidakValid) return 'Semua parameter vital harus diisi dengan angka lebih dari 0.';
    if (Number(form.spo2) > 100) return 'Saturasi oksigen tidak boleh lebih dari 100%.';
    if (Number(form.suhu) < 30 || Number(form.suhu) > 45) return 'Suhu tubuh harus berada dalam rentang 30–45 °C.';
    if (!form.catatan.trim()) return 'Catatan keluhan dan riwayat alergi wajib diisi.';
    return '';
  }

  function simpanObservasi(event) {
    event.preventDefault();
    const pesanError = validasi();
    if (pesanError) {
      setError(pesanError);
      return;
    }

    try {
      simpanDemo('polidokter-demo-observasi', {
        ...tersimpan,
        [pasien.id]: { ...form, disimpanPada: new Date().toISOString(), status: 'Triage Selesai' },
      });
      setError('');
      router.visit(rute.perawat.antreanTriage);
    } catch (saveError) {
      console.error('Gagal menyimpan observasi demo.', saveError);
      setError('Observasi belum tersimpan. Periksa izin penyimpanan browser lalu coba lagi.');
    }
  }

  function resetForm() {
    setForm(initialForm(pasien));
    setError('');
  }

  return (
    <AppLayout role="perawat" title="Formulir Observasi Triage" contentClassName="pl-3 pr-9 xl:pl-[30px] xl:pr-[100px]">
      <div className="mt-[9px] -mb-[9px] flex flex-wrap items-end justify-between gap-3 pb-2">
        <div><h1 className="flex items-center gap-2 text-[27px] font-bold leading-9">Formulir Observasi Triage &amp; Tanda Vital <Badge tone="info">Demo</Badge></h1><p className="text-[13px] text-ink-muted">Input pemeriksaan klinis awal pasien: <b className="text-ink">{pasien.nama}</b> ({pasien.rm}) - Poli {pasien.poli}</p></div>
        <Button variant="ghost" icon={ArrowLeft} onClick={() => router.visit(rute.perawat.antreanTriage)}>Kembali ke Antrean</Button>
      </div>

      <form onSubmit={simpanObservasi} className="rounded-2xl bg-white p-8 shadow-card">
        <section className="flex items-center gap-4 rounded-xl bg-surface-low p-5">
          <span className="flex size-12 items-center justify-center rounded-full bg-brand-light-active font-bold text-brand">{pasien.nama.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span>
          <div className="flex-1"><h2 className="font-bold">{pasien.nama} <small className="ml-1 text-[10px] font-normal text-ink-muted">{pasien.umur} Thn • {pasien.jk}</small></h2><div className="mt-0.5 space-y-1 text-[10px] leading-[18px] text-ink-muted"><p>No. RM: {pasien.rm}</p><p>NIK: {pasien.nik}</p><p>Asuransi {pasien.jaminan}</p></div></div>
          <span className="rounded-lg bg-white px-3 py-2 text-xs font-bold">{pasien.no}</span>
        </section>

        <fieldset className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-4">
          <legend className="sr-only">Pilih kategori triage</legend>
          {levelTriageDemo.map((level) => <label key={level.id} className={`flex cursor-pointer items-start gap-2 rounded-xl border p-[9px] ${form.level === level.id ? level.className : 'border-transparent bg-surface-low text-ink-soft'}`}>
            <input type="radio" name="level" value={level.id} checked={form.level === level.id} onChange={() => ubah('level', level.id)} className="mt-1 accent-brand" />
            <span><b className="block text-xs">{level.id} - {level.label}</b><small className="text-[9px]">{level.detail}</small></span>
          </label>)}
        </fieldset>

        <section className="mt-[25px]">
          <div className="mb-6 flex h-8 items-end justify-between"><h2 className="flex items-center gap-2 text-base font-bold leading-6"><Activity className="size-4 text-brand" />Parameter Tanda Vital &amp; Fisik</h2><span className="text-[10px] text-ink-muted">* Wajib diisi oleh perawat triage</span></div>
          <div className="grid gap-x-6 gap-y-5 sm:grid-cols-12">
            <div className="text-xs sm:col-span-6"><span className="flex justify-between font-medium leading-[18px]">Tekanan Darah (Sistolik / Diastolik)<small className="text-[9px] text-brand">Target: &lt; 130/85 mmHg</small></span><div className="mt-1.5 flex items-center gap-2"><input aria-label="Tekanan darah sistolik" className={fieldClass} value={form.tdSis} onChange={(e) => ubah('tdSis', e.target.value)} /><span>/</span><input aria-label="Tekanan darah diastolik" className={fieldClass} value={form.tdDia} onChange={(e) => ubah('tdDia', e.target.value)} /><span className="text-[10px] text-ink-muted">mmHg</span></div></div>
            <Field className="sm:col-span-6" label="Suhu Tubuh" unit="°C" value={form.suhu} onChange={(value) => ubah('suhu', value)} min="30" max="45" step="0.1" note="Norm: 36.5 - 37.5 °C" />
            <Field className="sm:col-span-3" label="Berat Badan" unit="Kg" value={form.berat} onChange={(value) => ubah('berat', value)} step="0.1" />
            <div className="grid grid-cols-[156fr_164fr] gap-3 sm:col-span-5"><Field label="Tinggi Badan" unit="cm" value={form.tinggi} onChange={(value) => ubah('tinggi', value)} /><div><span className="block text-xs font-medium leading-[18px]">Estimasi IMT/BMI</span><span className="mt-1.5 flex h-10 items-center gap-2 rounded-lg bg-brand-light-active px-3 text-xs font-semibold text-brand-dark"><Weight className="size-4" />BMI: {bmi} (Normal)</span></div></div>
            <Field className="sm:col-span-4" label="Saturasi Oksigen (SpO2)" unit="%" value={form.spo2} onChange={(value) => ubah('spo2', value)} max="100" note="> 95% Normal" />
            <Field className="sm:col-span-6" label="Frekuensi Nadi" unit="x/menit" value={form.nadi} onChange={(value) => ubah('nadi', value)} note="60 - 100 bpm" />
            <Field className="sm:col-span-6" label="Laju Pernapasan (Respirasi)" unit="x/menit" value={form.respirasi} onChange={(value) => ubah('respirasi', value)} note="12 - 20 x/menit" />
            <label className="block text-xs font-medium leading-[18px] sm:col-span-12">Tingkat Kesadaran (Glasgow Coma Scale - GCS)
              <select value={form.gcs} onChange={(e) => ubah('gcs', e.target.value)} className={`${fieldClass} mt-1.5`}><option>Compos Mentis (GCS 15: E4V5M6)</option><option>Apatis (GCS 13-14)</option><option>Somnolen (GCS 10-12)</option><option>Sopor (GCS 7-9)</option><option>Koma (GCS 3-6)</option></select>
            </label>
          </div>
        </section>

        <section className="mt-5 h-[76px] rounded-xl bg-surface-low p-4">
          <div className="flex h-[18px] items-center justify-between text-xs leading-[18px]"><label htmlFor="skala-nyeri" className="flex items-center gap-2 font-semibold"><Smile className="size-4" />Tingkat Skala Nyeri (NRS / Wong-Baker): <b className="text-brand">{form.nyeri} (Nyeri Ringan)</b></label><span className="text-[10px] text-ink-muted">Skala 0 - 10</span></div>
          <div className="mt-3 flex h-[14px] items-center gap-4 text-[9px] text-ink-muted"><span>0 Bebas Nyeri</span><input id="skala-nyeri" type="range" min="0" max="10" value={form.nyeri} onChange={(e) => ubah('nyeri', e.target.value)} className="h-2 min-w-0 flex-1 accent-brand" /><span className="text-danger">10 Nyeri Berat</span></div>
        </section>

        <label className="mt-5 block text-xs font-medium leading-[18px]">Catatan Keluhan &amp; Riwayat Alergi Khusus <small className="float-right text-[10px] font-normal text-ink-muted">Opsional tapi disarankan</small>
          <textarea value={form.catatan} onChange={(e) => ubah('catatan', e.target.value)} className="mt-1.5 block min-h-[133px] w-full rounded-lg bg-surface-mid p-3 text-xs outline-none focus:ring-2 focus:ring-brand/30" placeholder="Catat keluhan utama dan riwayat alergi..." />
        </label>
        {error && <p role="alert" className="mt-4 rounded-lg bg-danger-light p-3 text-xs text-danger">{error}</p>}

        <div className="mt-[3.5px] flex h-[78px] items-end justify-between gap-3">
          <p className="mb-2.5 flex items-center gap-2 text-[10px] text-ink-muted"><ShieldCheck className="size-4 text-brand" />Triage Perawat: Ns. Karina Dewi, S.Kep • SIP: 442/TRIAGE/2022</p>
          <div className="flex gap-3"><Button type="button" className="!h-[38px] !w-[113px] !px-0" variant="secondary" onClick={resetForm}>Reset Form</Button><Button type="submit" className="!h-[38px] !w-[205px] !px-0" icon={CheckCircle2}>Simpan Observasi</Button></div>
        </div>
      </form>
    </AppLayout>
  );
}
