import { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import {
  Activity, ArrowLeft, ArrowRight, ClipboardPlus, HeartPulse, LockKeyhole,
  PlusCircle, Save, ShieldCheck, Stethoscope, UserRound, Weight,
} from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/ui/Button';
import Badge from '../../Components/ui/Badge';
import Modal from '../../Components/ui/Modal';
import { Textarea } from '../../Components/ui/Input';
import { toast } from '../../Components/ui/Toast';
import { rute } from '../../lib/rute';
import { pasienRiwayatDemo } from '../../data/dokterDemo';
import { bacaDemo, simpanDemo } from '../../lib/demoStorage';

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

export default function FormDiagnosis({ antreanId }) {
  const pasien = useMemo(
    () => pasienRiwayatDemo.find((item) => item.id === String(antreanId)) ?? pasienRiwayatDemo[0],
    [antreanId],
  );
  const [mulai, setMulai] = useState(false);
  const [modalRujuk, setModalRujuk] = useState(false);
  const [formRujuk, setFormRujuk] = useState({ poli: 'Poli Jantung', alasan: '' });
  const [errorRujuk, setErrorRujuk] = useState('');
  const [form, setForm] = useState({ diagnosis: '', rencana: '', catatan: '', resep: '' });
  const [error, setError] = useState('');
  const [tersimpan, setTersimpan] = useState(false);

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
    router.visit(rute.dokter.formEResep(pasien.id));
  }

  function simpanRujukan() {
    if (!formRujuk.alasan.trim()) {
      setErrorRujuk('Alasan rujukan wajib diisi.');
      return;
    }

    try {
      const daftar = bacaDemo('polidokter-demo-rujukan', []);
      simpanDemo('polidokter-demo-rujukan', [...daftar, { id: Date.now(), pasienId: pasien.id, poli: formRujuk.poli, alasan: formRujuk.alasan.trim() }]);
      setModalRujuk(false);
      setFormRujuk({ poli: 'Poli Jantung', alasan: '' });
      setErrorRujuk('');
      toast.success('Rujukan internal dicatat sebagai demo lokal.');
    } catch (saveError) {
      console.error('Gagal menyimpan rujukan demo.', saveError);
      setErrorRujuk('Rujukan belum tersimpan. Periksa izin penyimpanan browser lalu coba lagi.');
    }
  }

  return (
    <AppLayout role="dokter" title="Form Diagnosis" contentClassName="pl-3 pr-9 xl:pl-[30px] xl:pr-[18px]">
      {!mulai ? (
        <section className="flex items-center justify-between gap-5 rounded-2xl bg-white px-6 py-5 shadow-card">
          <div className="flex items-center gap-4">
            <span className="flex size-10 items-center justify-center rounded-full bg-brand/15 text-brand"><Stethoscope className="size-5" /></span>
            <div>
              <h1 className="text-base font-bold text-ink">Siap melakukan tindakan periksa? <Badge tone="info">Demo lokal</Badge></h1>
              <p className="text-[13px] text-ink-muted">Pemeriksaan akan dicatat langsung ke Sistem Informasi Rekam Medis (demo).</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" icon={ArrowRight} onClick={() => setModalRujuk(true)}>Rujuk Internal</Button>
            <Button icon={PlusCircle} onClick={() => setMulai(true)}>Buat Diagnosis Baru</Button>
          </div>
        </section>
      ) : (
        <>
          <header className="mt-[9px] mb-[9px] flex items-center justify-between pb-2">
            <div>
              <h1 className="flex items-center gap-2 text-[28px] font-bold leading-9 tracking-tight">Form Diagnosis <Badge tone="info">Demo</Badge></h1>
              <p className="text-[13px] text-ink-muted">Pencatatan rekam medis pemeriksaan klinis pasien rawat jalan secara terpusat</p>
            </div>
            <Button variant="ghost" icon={ArrowLeft} onClick={() => setMulai(false)}>Kembali</Button>
          </header>

          <section className="min-h-[304px] rounded-2xl border-t-4 border-brand bg-white p-6 shadow-card">
            <div className="mt-3 flex min-h-16 flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex size-14 items-center justify-center rounded-full bg-brand/15 text-brand"><UserRound className="size-6" /></span>
                <div>
                  <h2 className="text-lg font-bold">{pasien.nama} <span className="ml-1 rounded-full bg-brand-light-active px-2 py-1 text-[10px] font-semibold text-brand-dark">Pasien Umum / BPJS Aktif</span></h2>
                  <p className="text-[11px] text-ink-muted">No. Rekam Medis: {pasien.rm} • Status Triase: <b className="text-brand">{pasien.triage}</b></p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="rounded-lg bg-surface-low px-4 py-2 text-center"><small className="block text-[9px] uppercase text-ink-muted">Antrean</small><b className="text-brand">{pasien.antrean}</b></div>
                <div className="rounded-lg bg-surface-low px-4 py-2 text-center"><small className="block text-[9px] uppercase text-ink-muted">Waktu Masuk</small><b>{pasien.waktu}</b></div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-surface-low px-4 py-2.5 text-[11px] md:grid-cols-4">
              <span><small className="block text-ink-muted">Nomor Induk Kependudukan (NIK)</small><b>{pasien.nik}</b></span>
              <span><small className="block text-ink-muted">Umur / Jenis Kelamin</small><b>{pasien.umur} Tahun ({pasien.jk})</b></span>
              <span><small className="block text-ink-muted">Poliklinik Rujukan</small><b>Poli Penyakit Dalam</b></span>
              <span><small className="block text-ink-muted">Alergi Terdata</small><b className="text-danger">{pasien.alergi.join(', ')}</b></span>
            </div>
            <p className="mb-2 mt-4 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">Tanda-tanda vital (TTV) &amp; antropometri pra-pemeriksaan</p>
            <div className="grid gap-3 md:grid-cols-3">
              <InfoVital icon={HeartPulse} label="Tekanan Darah" value={`${pasien.td} mmHg`} detail="Normal" />
              <InfoVital icon={Activity} label="Suhu Tubuh" value={`${pasien.suhu} °C`} detail="Normal" />
              <InfoVital icon={Weight} label="Berat Badan" value={`${pasien.berat} kg`} detail={`TB: ${pasien.tinggi} cm • BMI ${pasien.bmi}`} />
            </div>
          </section>

          <form onSubmit={simpanDiagnosis} className="mt-[7px] min-h-[633px] rounded-2xl bg-white p-6 shadow-card">
            <div className="mb-6 min-h-[52px] flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Hasil Pemeriksaan &amp; Rencana Medis</h2>
                <p className="text-[11px] text-ink-muted">Lengkapi diagnosa kerja, instruksi farmakologis, serta rekomendasi lanjutan sesuai standar ICD-10.</p>
              </div>
              <span className="flex items-center gap-1 text-[10px] text-ink-muted"><LockKeyhole className="size-3 text-brand" />Waktu Sesi Konsultasi: 08:15</span>
            </div>

            <div className="mb-1.5 flex h-5 items-center justify-between gap-3 text-xs font-semibold">
              <label>Nama Diagnosis Klinis / ICD-10 <span className="text-danger">*</span></label>
              <div className="flex shrink-0 gap-1 text-[10px]">
                <button type="button" onClick={() => setForm({ ...form, diagnosis: 'Dispepsia Fungsional (K30)' })} className="rounded bg-surface-low px-2 py-1">+ Dispepsia Fungsional (K30)</button>
                <button type="button" onClick={() => setForm({ ...form, diagnosis: 'Gastritis Akut (K29.7)' })} className="rounded bg-surface-low px-2 py-1">+ Gastritis Akut (K29.7)</button>
              </div>
            </div>
            <div className="relative">
              <Stethoscope className="absolute left-3 top-3 size-4 text-ink-muted" />
              <input className={`${fieldClass} pl-10`} value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} placeholder="Contoh: Dispepsia Fungsional / Gastritis Akut (K29.7)" />
            </div>
            <p className="mt-[5px] h-4 text-[10px] text-ink-muted">Masukkan kode ICD-10 atau nama diagnosis klinis yang ditegakkan dokter.</p>

            <label className="mb-1.5 mt-6 flex h-5 items-center justify-between text-xs font-semibold leading-5"><span>Rencana Tindakan &amp; Intervensi Medis <span className="text-danger">*</span></span><span className="text-[10px] font-normal text-ink-muted">{form.rencana.length} / 500 karakter</span></label>
            <textarea className={`${fieldClass} min-h-[140px] resize-y py-3 block`} maxLength={500} value={form.rencana} onChange={(e) => setForm({ ...form, rencana: e.target.value })} placeholder="Rincian rencana terapi, instruksi diet lambung, pemeriksaan penunjang lab darah rutin/USG, atau edukasi kepatuhan minum obat..." />
            <p className="mt-1.5 flex h-[22px] items-center text-[10px] text-ink-muted">Dokumentasikan advis istirahat, anjuran nutrisi, dan konseling gaya hidup pasien.</p>

            <div className="mt-6 grid min-h-24 gap-4 md:grid-cols-2">
              <label className="text-xs font-semibold">Catatan Tambahan &amp; Kontrol Lanjutan
                <input className={`${fieldClass} mt-2`} value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} placeholder="Misal: Kontrol 7 hari jika nyeri epigastrium berlanjut" />
                <span className="mt-1 block text-[10px] font-normal text-ink-muted">Jadwal evaluasi klinis ulang atau catatan observasi perawat poli.</span>
              </label>
              <label className="text-xs font-semibold">Draft Resep Elektronik Cepat
                <select className={`${fieldClass} mt-2`} value={form.resep} onChange={(e) => setForm({ ...form, resep: e.target.value })}>
                  <option value="">Pilih Protokol Terapi Lambung Standar...</option>
                  <option>Omeprazole 20 mg + Antasida</option>
                  <option>Amlodipine 5 mg (kontrol tekanan darah)</option>
                </select>
                <span className="mt-1 block text-[10px] font-normal text-ink-muted">Terintegrasi otomatis dengan sistem farmasi rawat jalan (demo).</span>
              </label>
            </div>

            {error && <p className="mt-4 rounded-lg bg-danger-light p-3 text-xs text-danger" role="alert">{error}</p>}
            <div className="mt-6 flex min-h-14 flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
      <span className="flex items-center gap-2 text-[10px] text-ink-muted"><ShieldCheck className="size-4 text-brand" />{tersimpan ? 'Diagnosis tersimpan ke rekam medis' : 'Diagnosis akan disimpan ke server'}</span>
              <div className="flex gap-2">
                <Button type="button" className="h-10" variant="secondary" onClick={() => setForm({ diagnosis: '', rencana: '', catatan: '', resep: '' })}>Batal</Button>
                <Button type="submit" className="h-10" icon={Save}>Simpan Diagnosis</Button>
                {tersimpan && <Button type="button" icon={ArrowRight} onClick={lanjutKeResep}>Buat E-Resep</Button>}
              </div>
            </div>
          </form>
        </>
      )}

      <Modal open={modalRujuk} onClose={() => { setModalRujuk(false); setErrorRujuk(''); }} title="Rujuk Internal" description={`Rujukan demo untuk ${pasien.nama}`} footer={<><Button variant="secondary" onClick={() => setModalRujuk(false)}>Batal</Button><Button icon={ClipboardPlus} onClick={simpanRujukan}>Simpan Rujukan</Button></>}>
        <label className="block text-xs font-semibold">Poli tujuan<select value={formRujuk.poli} onChange={(e) => setFormRujuk({ ...formRujuk, poli: e.target.value })} className={`${fieldClass} mt-2`}><option>Poli Jantung</option><option>Poli Saraf</option><option>Poli Gizi</option></select></label>
        <label className="mt-4 block text-xs font-semibold">Alasan rujukan<textarea value={formRujuk.alasan} onChange={(e) => { setFormRujuk({ ...formRujuk, alasan: e.target.value }); setErrorRujuk(''); }} className={`${fieldClass} mt-2 min-h-20 py-2`} placeholder="Tuliskan alasan rujukan..." /></label>
        {errorRujuk && <p role="alert" className="mt-2 text-xs text-danger">{errorRujuk}</p>}
      </Modal>
    </AppLayout>
  );
}
