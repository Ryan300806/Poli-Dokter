import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Activity, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/ui/Button';
import { rute } from '../../lib/rute';

export default function FormObservasi({ antreanId, pasien, observasi }) {
  const [form, setForm] = useState({
    tdSis: pasien?.tdSis ?? '',
    tdDia: pasien?.tdDia ?? '',
    suhu: pasien?.suhu ?? '',
    berat: pasien?.berat ?? '',
  });
  const [error, setError] = useState('');

  function submit(e) {
    e.preventDefault();
    const sis = Number(form.tdSis);
    const dia = Number(form.tdDia);
    const suhu = Number(form.suhu);
    const berat = Number(form.berat);

    if (!sis || !dia || sis < 50 || sis > 250 || dia < 30 || dia > 150) {
      setError('Tekanan darah harus valid (Sistolik 50–250, Diastolik 30–150 mmHg).');
      return;
    }
    if (!suhu || suhu < 30 || suhu > 45) {
      setError('Suhu tubuh harus berada di antara 30–45 °C.');
      return;
    }
    if (!berat || berat <= 0 || berat > 500) {
      setError('Berat badan harus lebih dari 0 kg.');
      return;
    }

    const payload = {
      tekananDarah: `${sis}/${dia}`,
      suhu: form.suhu,
      beratBadan: form.berat,
    };

    if (observasi?.id_observasi) {
      router.put(`/perawat/observasi/${observasi.id_observasi}`, payload, {
        onError: (errs) => setError(errs.tekananDarah || errs.suhu || errs.beratBadan || 'Gagal memperbarui observasi.'),
      });
    } else {
      router.post(`/perawat/observasi/${antreanId}`, payload, {
        onError: (errs) => setError(errs.tekananDarah || errs.suhu || errs.beratBadan || 'Gagal menyimpan observasi.'),
      });
    }
  }

  function resetForm() {
    setForm({ tdSis: '', tdDia: '', suhu: '', berat: '' });
    setError('');
  }

  return (
    <AppLayout role="perawat" title="Formulir Observasi Triage">
      <div className="flex items-center justify-between">
        <Button variant="ghost" icon={ArrowLeft} onClick={() => router.visit(rute.perawat.antreanTriage)}>
          Kembali ke Antrean Triage
        </Button>
      </div>

      <header>
        <h1 className="text-3xl font-extrabold text-ink">Formulir Observasi Triage &amp; Tanda Vital</h1>
        <p className="mt-1 text-xs text-ink-soft">
          Input pemeriksaan klinis awal pasien: <b>{pasien.nama} ({pasien.rm})</b> — {pasien.poli}
        </p>
      </header>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-card">
        <div className="flex items-center gap-4">
          <span className="flex size-12 items-center justify-center rounded-full bg-brand-light-active text-sm font-extrabold text-brand-dark">
            {pasien.nama.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <h2 className="text-base font-bold text-ink">{pasien.nama} <span className="text-xs font-medium text-ink-muted">• {pasien.umur} Thn • {pasien.jk}</span></h2>
            <p className="mt-0.5 text-xs text-ink-soft">No. RM: <b>{pasien.rm}</b> • NIK: <b>{pasien.nik}</b></p>
          </div>
        </div>
        <span className="rounded-xl bg-brand-light-active px-3.5 py-2 text-xs font-extrabold text-brand-dark">
          Antrean {pasien.no}
        </span>
      </section>

      <form onSubmit={submit} className="rounded-2xl bg-white p-6 shadow-card space-y-6">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
            <Activity className="size-5 text-brand" /> Parameter Tanda Vital &amp; Fisik
          </h3>
          <span className="text-[11px] font-medium text-ink-muted">* Wajib diisi oleh perawat triage</span>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Tekanan Darah (Sis / Dia)</span>
              <span className="text-[10px] font-semibold text-brand">Target: &lt; 130/85 mmHg</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex flex-1 items-center rounded-xl bg-surface-input px-3">
                <input
                  type="number"
                  placeholder="120"
                  value={form.tdSis}
                  onChange={(e) => { setForm({ ...form, tdSis: e.target.value }); setError(''); }}
                  className="h-11 w-full bg-transparent text-xs font-semibold outline-none"
                />
                <span className="text-[10px] text-ink-muted">Sis</span>
              </div>
              <span className="font-bold text-ink-muted">/</span>
              <div className="flex flex-1 items-center rounded-xl bg-surface-input px-3">
                <input
                  type="number"
                  placeholder="80"
                  value={form.tdDia}
                  onChange={(e) => { setForm({ ...form, tdDia: e.target.value }); setError(''); }}
                  className="h-11 w-full bg-transparent text-xs font-semibold outline-none"
                />
                <span className="text-[10px] text-ink-muted">Dia</span>
              </div>
              <span className="rounded-xl bg-surface-low px-2.5 py-3 text-[10px] font-bold text-ink-soft">mmHg</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Suhu Tubuh</span>
              <span className="text-[10px] font-medium text-ink-muted">Norm: 36.5 - 37.5 °C</span>
            </div>
            <div className="mt-2 flex items-center rounded-xl bg-surface-input px-3">
              <input
                type="number"
                step="0.1"
                placeholder="36.5"
                value={form.suhu}
                onChange={(e) => { setForm({ ...form, suhu: e.target.value }); setError(''); }}
                className="h-11 w-full bg-transparent text-xs font-semibold outline-none"
              />
              <span className="text-[11px] font-bold text-ink-muted">°C</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Berat Badan</span>
            </div>
            <div className="mt-2 flex items-center rounded-xl bg-surface-input px-3">
              <input
                type="number"
                step="0.1"
                placeholder="65"
                value={form.berat}
                onChange={(e) => { setForm({ ...form, berat: e.target.value }); setError(''); }}
                className="h-11 w-full bg-transparent text-xs font-semibold outline-none"
              />
              <span className="text-[11px] font-bold text-ink-muted">Kg</span>
            </div>
          </div>
        </div>

        {error && <p role="alert" className="rounded-xl bg-danger-light p-3 text-xs font-semibold text-danger">{error}</p>}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <span className="flex items-center gap-1.5 text-xs text-ink-muted">
            <ShieldCheck className="size-4 text-brand" /> Data observasi otomatis meneruskan status antrean ke Dokter Poli.
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={resetForm}>Reset Form</Button>
            <Button type="submit" icon={CheckCircle2}>
              {observasi?.id_observasi ? 'Perbarui Observasi' : 'Simpan Observasi'}
            </Button>
          </div>
        </div>
      </form>
    </AppLayout>
  );
}
