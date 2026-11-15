import { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import {
  ArrowLeft, ArrowRight, CalendarDays, ClipboardList, Download, FileHeart, HeartPulse, Search,
  ShieldAlert, Stethoscope, Weight,
} from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/ui/Button';
import Badge from '../../Components/ui/Badge';
import { Input } from '../../Components/ui/Input';
import { toast } from '../../Components/ui/Toast';
import { pasienRiwayatDemo } from '../../data/dokterDemo';
import { rute } from '../../lib/rute';

function ProfilPasien({ pasien, onKembali }) {
  return (
    <>
      <div className="flex items-center justify-between">
        <Button variant="ghost" icon={ArrowLeft} onClick={onKembali}>Kembali ke daftar</Button>
        <Button variant="outline" icon={Download} onClick={() => window.print()}>Cetak / Simpan PDF</Button>
      </div>
      <section className="flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-white p-5 shadow-card">
        <div className="flex items-center gap-4">
          <img src={pasien.foto} alt={`Foto ${pasien.nama}`} className="size-16 rounded-xl object-cover" />
          <div>
            <h1 className="text-2xl font-bold">{pasien.nama} <Badge tone="success">{pasien.rm}</Badge></h1>
            <p className="mt-1 text-[11px] text-ink-muted">{pasien.jaminan} • NIK: {pasien.nik} • No. Rujukan: {pasien.rujukan}</p>
            <p className="mt-2 flex flex-wrap gap-3 text-[11px] text-ink-soft"><span>{pasien.umur} Tahun ({pasien.tanggalLahir})</span><span>{pasien.jk}</span><span>{pasien.golDarah}</span><span>{pasien.telepon}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-danger-light p-3 text-danger">
            <p className="flex items-center gap-1 text-[9px] font-bold uppercase"><ShieldAlert className="size-3" />Peringatan Alergi</p>
            <p className="mt-1 text-xs font-semibold">{pasien.alergi.join(', ')}</p>
          </div>
          <div className="rounded-xl bg-surface-low p-3"><small className="block text-[9px] uppercase text-ink-muted">Antrean Dokter</small><b className="text-xl text-brand">{pasien.antrean}</b><Badge tone="success">Giliran Periksa</Badge></div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_1fr]">
        <div className="space-y-4">
          <section className="rounded-2xl bg-white p-5 shadow-card">
            <h2 className="flex items-center gap-2 font-bold"><HeartPulse className="size-5 text-brand" />Hasil Observasi Triage Terakhir</h2>
            <p className="mt-1 text-[10px] text-ink-muted">Diperiksa oleh Ns. Ratna, S.Kep • Hari ini, 08:50 WIB</p>
            <Badge tone="success" className="mt-3">Status Stabil</Badge>
            <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3">
              {[
                ['Tekanan Darah', `${pasien.td} mmHg`], ['Suhu Tubuh', `${pasien.suhu} °C`], ['Detak Nadi', `${pasien.nadi} BPM`],
                ['Laju Napas', `${pasien.respirasi} x/menit`], ['Saturasi (SpO2)', pasien.spo2], ['Antropometri', `${pasien.berat} kg / ${pasien.tinggi} cm`],
              ].map(([label, value]) => <div key={label} className="rounded-lg bg-surface-low p-3"><small className="block text-[9px] uppercase text-ink-muted">{label}</small><b className="text-base">{value}</b></div>)}
            </div>
            <p className="mt-3 rounded-lg bg-surface-low p-3 text-[11px] text-ink-soft">Catatan Perawat: {pasien.catatanPerawat}</p>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-card">
            <h2 className="flex items-center gap-2 font-bold"><ClipboardList className="size-5 text-danger" />Keluhan &amp; Riwayat Penyakit</h2>
            <p className="mt-3 text-[9px] font-semibold uppercase tracking-wide text-ink-muted">Keluhan utama (anamnesis hari ini)</p>
            <p className="mt-1 text-sm leading-6">{pasien.keluhan}</p>
            <div className="mt-4 grid gap-4 border-t border-line pt-4 md:grid-cols-2">
              <div><p className="text-[9px] font-semibold uppercase tracking-wide text-ink-muted">Riwayat Penyakit Dahulu (RPD)</p><ul className="mt-2 list-inside list-disc space-y-1 text-[11px]">{pasien.penyakit.map((item) => <li key={item}>{item}</li>)}</ul></div>
              <div><p className="text-[9px] font-semibold uppercase tracking-wide text-danger">Rincian Alergi &amp; Reaksi Obat</p><p className="mt-2 rounded-lg bg-danger-light p-3 text-[11px] text-danger"><b>{pasien.alergi[0]}</b><br />Riwayat alergi tercatat. Verifikasi sebelum memberikan obat.</p></div>
            </div>
            <p className="mt-4 border-t border-line pt-3 text-[11px]"><b>Obat rutin saat ini:</b> {pasien.obatRutin}</p>
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl bg-white p-5 shadow-card">
            <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 font-bold"><FileHeart className="size-5 text-brand" />Rekam Medis Terdahulu</h2><span className="text-[10px] text-brand">Riwayat kunjungan &amp; tindakan di RS</span></div>
            <ol className="mt-4 space-y-4 border-l border-line pl-4">
              {pasien.riwayat.map((item) => <li key={`${item.tanggal}-${item.tipe}`} className="relative rounded-lg bg-surface-low p-3 before:absolute before:-left-[21px] before:top-4 before:size-3 before:rounded-full before:bg-brand">
                <div className="flex items-center justify-between text-[10px] text-ink-muted"><span>{item.tanggal} • {item.tipe}</span><Badge tone="success">{item.status}</Badge></div>
                <p className="mt-2 text-xs font-bold">{item.poli}</p><p className="mt-1 text-[11px]">{item.diagnosis}</p>
                {item.tipe === 'Rawat Jalan' && <div className="mt-2 flex gap-2"><button type="button" className="text-[10px] font-semibold text-brand" onClick={() => toast.info('Dokumen resume medis tersedia dalam mode demo.')}>Lihat Resume Medis</button><button type="button" className="text-[10px] font-semibold text-brand" onClick={() => router.visit(rute.dokter.formEResep(pasien.id))}>E-Resep</button></div>}
              </li>)}
            </ol>
          </section>
          <section className="rounded-2xl bg-white p-5 shadow-card">
            <h2 className="flex items-center gap-2 font-bold"><Stethoscope className="size-5 text-brand" />Pemeriksaan Penunjang Cepat</h2>
            <p className="mt-1 text-[10px] text-ink-muted">Hasil radiologi dan lab 30 hari terakhir</p>
            <div className="mt-3 space-y-2">{['USG Abdomen Atas • 15 Juli 2024', 'Rekaman EKG 12-Lead • 02 Feb 2024'].map((item) => <button key={item} type="button" onClick={() => toast.info(`${item} tersedia dalam data demo.`)} className="flex w-full items-center gap-2 rounded-lg bg-surface-low p-3 text-left text-xs hover:bg-brand-light"><CalendarDays className="size-4 text-brand" />{item}</button>)}</div>
          </section>
          <Button icon={Weight} className="w-full" onClick={() => router.visit(rute.dokter.formDiagnosis(pasien.id))}>Lanjutkan ke Form Diagnosis</Button>
        </div>
      </div>
    </>
  );
}

export default function RiwayatMedis({ antreanId }) {
  const [kata, setKata] = useState('');
  const pasienTerpilih = antreanId
    ? pasienRiwayatDemo.find((item) => item.id === String(antreanId)) ?? pasienRiwayatDemo[0]
    : null;
  const daftar = useMemo(() => pasienRiwayatDemo.filter((pasien) => {
    const q = kata.trim().toLowerCase();
    return !q || pasien.nama.toLowerCase().includes(q) || pasien.rm.toLowerCase().includes(q) || pasien.nik.includes(q);
  }), [kata]);

  return (
    <AppLayout role="dokter" title="Riwayat Medis">
      {pasienTerpilih ? (
        <><div className="flex justify-end"><Badge tone="info">Data demo</Badge></div><ProfilPasien pasien={pasienTerpilih} onKembali={() => router.visit(rute.dokter.riwayatMedis())} /></>
      ) : (
        <>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><h1 className="flex items-center gap-2 text-[28px] font-bold">Pasien Dalam Antrean <Badge tone="info">Data demo</Badge></h1><p className="text-[13px] text-ink-muted">Pilih pasien untuk melihat riwayat medis dan informasi klinis.</p></div>
            <div className="w-full md:w-80"><Input icon={Search} value={kata} onChange={(e) => setKata(e.target.value)} placeholder="Cari nama, No. RM, atau NIK..." aria-label="Cari pasien" /></div>
          </div>
          <div className="space-y-4">
            {daftar.map((pasien) => <article key={pasien.id} className="flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-white p-5 shadow-card">
              <div className="flex items-center gap-4">
                <img src={pasien.foto} alt={`Foto ${pasien.nama}`} className="size-16 rounded-xl object-cover" />
                <div><h2 className="text-xl font-bold">{pasien.nama} <span className="rounded bg-brand-light-active px-2 py-1 text-[10px] font-semibold text-brand-dark">{pasien.rm}</span></h2>
                  <p className="mt-1 text-[10px] text-ink-muted">{pasien.jaminan} • NIK: {pasien.nik} • No. Rujukan: {pasien.rujukan}</p>
                  <p className="mt-2 flex flex-wrap gap-3 text-[11px] text-ink-soft"><span>{pasien.umur} Tahun</span><span>{pasien.jk}</span><span>{pasien.golDarah}</span><span>{pasien.telepon}</span></p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-danger-light p-3 text-danger"><small className="flex items-center gap-1 text-[9px] font-bold uppercase"><ShieldAlert className="size-3" />Peringatan Alergi</small><b className="text-xs">{pasien.alergi.join(', ')}</b></div>
                <div className="rounded-lg bg-surface-low p-3"><small className="block text-[9px] uppercase text-ink-muted">Antrean Dokter</small><b className="text-xl text-brand">{pasien.antrean}</b><Badge tone="success">Giliran Periksa</Badge></div>
                <Button icon={ArrowRight} onClick={() => router.visit(rute.dokter.riwayatMedis(pasien.id))}>Lihat Detail</Button>
              </div>
            </article>)}
            {daftar.length === 0 && <p className="rounded-xl bg-white p-10 text-center text-sm text-ink-muted">Tidak ada pasien yang cocok dengan pencarian.</p>}
          </div>
          <p className="text-xs text-ink-muted">Menampilkan {daftar.length} data pasien demo</p>
        </>
      )}
    </AppLayout>
  );
}
