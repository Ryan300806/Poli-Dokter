import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Activity, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/ui/Button';
import Badge from '../../Components/ui/Badge';
import { rute } from '../../lib/rute';

const initialForm = (pasien = {}) => ({
  tdSis: pasien.tdSis ?? '',
  tdDia: pasien.tdDia ?? '',
  suhu: pasien.suhu ?? '',
  berat: pasien.berat ?? '',
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

export default function FormObservasi({ antreanId, pasien: pasienBackend, observasi: observasiBackend }) {
  const pasien = pasienBackend;
  const isServerData = Boolean(pasienBackend);
  const [form, setForm] = useState(() => pasien ? initialForm(pasien) : initialForm({}));
  const [error, setError] = useState('');

  function ubah(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setError('');
  }

  function validasi() {
    const angka = ['tdSis', 'tdDia', 'suhu', 'berat'];
    const tidakValid = angka.find((key) => form[key] === '' || !Number.isFinite(Number(form[key])) || Number(form[key]) <= 0);
    if (tidakValid) return 'Semua parameter vital harus diisi dengan angka lebih dari 0.';
    if (Number(form.suhu) < 30 || Number(form.suhu) > 45) return 'Suhu tubuh harus berada dalam rentang 30–45 °C.';
    return '';
  }

  function simpanObservasi(event) {
    event.preventDefault();
    const pesanError = validasi();
    if (pesanError) {
      setError(pesanError);
      return;
    }

    if (isServerData) {
      const tekananDarah = `${form.tdSis}/${form.tdDia}`;
      const payload = { tekananDarah, suhu: form.suhu, beratBadan: form.berat };
      const url = observasiBackend?.id_observasi
        ? `/perawat/observasi/${observasiBackend.id_observasi}`
        : `/perawat/observasi/${antreanId}`;
      router[observasiBackend?.id_observasi ? 'put' : 'post'](url, payload, {
        preserveScroll: true,
        onSuccess: () => { setError(''); router.visit(rute.perawat.antreanTriage); },
        onError: (errors) => setError(errors.tekananDarah || errors.suhu || errors.beratBadan || 'Data observasi gagal disimpan.'),
      });
      return;
    }

    setError('Data pasien tidak tersedia dari server. Observasi tidak dapat disimpan.');
  }

  function resetForm() {
    setForm(initialForm(pasien ?? {}));
    setError('');
  }

  return (
    <AppLayout role="perawat" title="Formulir Observasi Triage" contentClassName="pl-3 pr-9 xl:pl-[30px] xl:pr-[100px]">
      {!pasien ? <p className="rounded-xl bg-white p-6">Data pasien untuk antrean ini tidak ditemukan.</p> : <>
      <div className="mt-[9px] -mb-[9px] flex flex-wrap items-end justify-between gap-3 pb-2">
        <div><h1 className="flex items-center gap-2 text-[27px] font-bold leading-9">Formulir Observasi Triage &amp; Tanda Vital <Badge tone="success">Data database</Badge></h1><p className="text-[13px] text-ink-muted">Input pemeriksaan klinis awal pasien: <b className="text-ink">{pasien.nama}</b> (ID {pasien.rm}) - Poli {pasien.poli}</p></div>
        <Button variant="ghost" icon={ArrowLeft} onClick={() => router.visit(rute.perawat.antreanTriage)}>Kembali ke Antrean</Button>
      </div>

      <form onSubmit={simpanObservasi} className="rounded-2xl bg-white p-8 shadow-card">
        <section className="flex items-center gap-4 rounded-xl bg-surface-low p-5">
          <span className="flex size-12 items-center justify-center rounded-full bg-brand-light-active font-bold text-brand">{pasien.nama.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span>
          <div className="flex-1"><h2 className="font-bold">{pasien.nama} <small className="ml-1 text-[10px] font-normal text-ink-muted">{pasien.umur} Thn • {pasien.jk}</small></h2><div className="mt-0.5 space-y-1 text-[10px] leading-[18px] text-ink-muted"><p>ID Pasien: {pasien.rm}</p><p>NIK: {pasien.nik}</p></div></div>
          <span className="rounded-lg bg-white px-3 py-2 text-xs font-bold">{pasien.no}</span>
        </section>

        <section className="mt-[25px]">
          <div className="mb-6 flex h-8 items-end justify-between"><h2 className="flex items-center gap-2 text-base font-bold leading-6"><Activity className="size-4 text-brand" />Parameter Tanda Vital &amp; Fisik</h2><span className="text-[10px] text-ink-muted">* Wajib diisi oleh perawat triage</span></div>
          <div className="grid gap-x-6 gap-y-5 sm:grid-cols-12">
            <div className="text-xs sm:col-span-6"><span className="flex justify-between font-medium leading-[18px]">Tekanan Darah (Sistolik / Diastolik)<small className="text-[9px] text-brand">Target: &lt; 130/85 mmHg</small></span><div className="mt-1.5 flex items-center gap-2"><input aria-label="Tekanan darah sistolik" className={fieldClass} value={form.tdSis} onChange={(e) => ubah('tdSis', e.target.value)} /><span>/</span><input aria-label="Tekanan darah diastolik" className={fieldClass} value={form.tdDia} onChange={(e) => ubah('tdDia', e.target.value)} /><span className="text-[10px] text-ink-muted">mmHg</span></div></div>
            <Field className="sm:col-span-6" label="Suhu Tubuh" unit="°C" value={form.suhu} onChange={(value) => ubah('suhu', value)} min="30" max="45" step="0.1" note="Norm: 36.5 - 37.5 °C" />
            <Field className="sm:col-span-3" label="Berat Badan" unit="Kg" value={form.berat} onChange={(value) => ubah('berat', value)} step="0.1" />
          </div>
        </section>

        {error && <p role="alert" className="mt-4 rounded-lg bg-danger-light p-3 text-xs text-danger">{error}</p>}

        <div className="mt-[3.5px] flex h-[78px] items-end justify-between gap-3">
          <p className="mb-2.5 flex items-center gap-2 text-[10px] text-ink-muted"><ShieldCheck className="size-4 text-brand" />Petugas triage</p>
          <div className="flex gap-3"><Button type="button" className="!h-[38px] !w-[113px] !px-0" variant="secondary" onClick={resetForm}>Reset Form</Button><Button type="submit" className="!h-[38px] !w-[205px] !px-0" icon={CheckCircle2}>Simpan Observasi</Button></div>
        </div>
      </form>
      </>}
    </AppLayout>
  );
}
