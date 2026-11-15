import { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import {
  ArrowLeft, ArrowRight, ClipboardList, Download, FileHeart, HeartPulse, Search,
  ShieldAlert, Stethoscope, Weight,
} from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/ui/Button';
import Badge from '../../Components/ui/Badge';
import { Input } from '../../Components/ui/Input';
import { rute } from '../../lib/rute';

function ProfilPasien({ pasien, onKembali, riwayatMedis, triageTerbaru, antreanId }) {
  return (
    <>
      <div className="flex items-center justify-between">
        <Button variant="ghost" icon={ArrowLeft} onClick={onKembali}>Kembali ke daftar</Button>
        <Button variant="outline" icon={Download} onClick={() => window.print()}>Cetak / Simpan PDF</Button>
      </div>
      <section className="flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-white p-5 shadow-card">
        <div className="flex items-center gap-4">
          <span aria-hidden="true" className="flex size-16 items-center justify-center rounded-xl bg-brand-light-active text-xl font-bold text-brand">{pasien.nama.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span>
          <div>
            <h1 className="text-2xl font-bold">{pasien.nama} <Badge tone="success">ID Pasien {pasien.rm}</Badge></h1>
            <p className="mt-1 text-[11px] text-ink-muted">NIK: {pasien.nik}</p>
            <p className="mt-2 flex flex-wrap gap-3 text-[11px] text-ink-soft"><span>{pasien.umur} Tahun ({pasien.tanggalLahir})</span><span>{pasien.jk}</span><span>{pasien.golDarah}</span><span>{pasien.telepon}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-danger-light p-3 text-danger">
            <p className="flex items-center gap-1 text-[9px] font-bold uppercase"><ShieldAlert className="size-3" />Peringatan Alergi</p>
            <p className="mt-1 text-xs font-semibold">{pasien.alergi.join(', ')}</p>
          </div>
          <div className="rounded-xl bg-surface-low p-3"><small className="block text-[9px] uppercase text-ink-muted">Antrean Dokter</small><b className="text-xl text-brand">{pasien.antrean}</b></div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_1fr]">
        <div className="space-y-4">
          <section className="rounded-2xl bg-white p-5 shadow-card">
            <h2 className="flex items-center gap-2 font-bold"><HeartPulse className="size-5 text-brand" />Hasil Observasi Triage Terakhir</h2>
            <p className="mt-1 text-[10px] text-ink-muted">Waktu pemeriksaan: {triageTerbaru?.waktu_observasi ?? 'Belum tercatat'}</p>
            <Badge tone="success" className="mt-3">Status Stabil</Badge>
            <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3">
              {[
              ['Tekanan Darah', triageTerbaru?.tekanan_darah ?? 'Belum tercatat'], ['Suhu Tubuh', triageTerbaru?.suhu ?? 'Belum tercatat'], ['Berat Badan', triageTerbaru?.berat_badan ?? 'Belum tercatat'],
              ].map(([label, value]) => <div key={label} className="rounded-lg bg-surface-low p-3"><small className="block text-[9px] uppercase text-ink-muted">{label}</small><b className="text-base">{value}</b></div>)}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-card">
            <h2 className="flex items-center gap-2 font-bold"><ClipboardList className="size-5 text-danger" />Keluhan &amp; Riwayat Penyakit</h2>
            <p className="mt-3 text-[9px] font-semibold uppercase tracking-wide text-ink-muted">Keluhan utama (anamnesis hari ini)</p>
            <p className="mt-1 text-sm leading-6">{pasien.keluhan}</p>
            <div className="mt-4 grid gap-4 border-t border-line pt-4 md:grid-cols-2">
              <div><p className="text-[9px] font-semibold uppercase tracking-wide text-ink-muted">Riwayat Penyakit Dahulu (RPD)</p><ul className="mt-2 list-inside list-disc space-y-1 text-[11px]">{(riwayatMedis?.riwayat_penyakit ? [riwayatMedis.riwayat_penyakit] : pasien.penyakit).map((item) => <li key={item}>{item}</li>)}</ul></div>
              <div><p className="text-[9px] font-semibold uppercase tracking-wide text-danger">Rincian Alergi &amp; Reaksi Obat</p><p className="mt-2 rounded-lg bg-danger-light p-3 text-[11px] text-danger"><b>{pasien.alergi[0]}</b><br />{pasien.alergi[0] === 'Tidak ada data alergi' ? 'Data alergi belum tersedia di rekam medis.' : 'Verifikasi informasi alergi sebelum memberikan obat.'}</p></div>
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
                {item.tipe === 'Rawat Jalan' && <div className="mt-2 flex gap-2"><button type="button" className="text-[10px] font-semibold text-brand" onClick={() => router.visit(rute.dokter.formEResep(antreanId))}>E-Resep</button></div>}
              </li>)}
            </ol>
          </section>
          <section className="rounded-2xl bg-white p-5 shadow-card">
            <h2 className="flex items-center gap-2 font-bold"><Stethoscope className="size-5 text-brand" />Pemeriksaan Penunjang Cepat</h2>
            <p className="mt-1 text-[10px] text-ink-muted">Hasil radiologi dan lab 30 hari terakhir</p>
            <p className="mt-3 rounded-lg bg-surface-low p-3 text-xs text-ink-muted">Belum ada data pemeriksaan penunjang pada rekam medis pasien.</p>
          </section>
          <Button icon={Weight} className="w-full" disabled={!antreanId} onClick={() => router.visit(rute.dokter.formDiagnosis(antreanId))}>Lanjutkan ke Form Diagnosis</Button>
        </div>
      </div>
    </>
  );
}

export default function RiwayatMedis({ antreanId, pasien: dataPasien, daftarPasien, riwayatMedis = null, triageTerbaru = null }) {
  const [kata, setKata] = useState('');
  const pasienTerpilih = dataPasien ? {
    id: String(dataPasien.id_pasien),
    nama: dataPasien.nama_lengkap,
    rm: String(dataPasien.id_pasien),
    jaminan: null,
    nik: dataPasien.nik,
    rujukan: '—',
    umur: dataPasien.tanggal_lahir ? Math.max(0, new Date().getFullYear() - new Date(dataPasien.tanggal_lahir).getFullYear()) : '—',
    tanggalLahir: dataPasien.tanggal_lahir ?? '—',
    jk: dataPasien.jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki',
    golDarah: dataPasien.golongan_darah ?? 'Golongan darah belum tercatat',
    telepon: dataPasien.kontak_darurat ?? '—',
    alergi: riwayatMedis?.alergi && riwayatMedis.alergi !== '-' ? [riwayatMedis.alergi] : ['Tidak ada data alergi'],
    antrean: triageTerbaru?.id_antrean ?? '—',
    td: triageTerbaru?.tekanan_darah ?? '—',
    suhu: triageTerbaru?.suhu ?? '—',
    nadi: '—', respirasi: '—', spo2: '—', berat: triageTerbaru?.berat_badan ?? '—', tinggi: '—',
    catatanPerawat: 'Catatan tidak tersedia pada data observasi ini.',
    keluhan: 'Keluhan belum tercatat.',
    penyakit: riwayatMedis?.riwayat_penyakit && riwayatMedis.riwayat_penyakit !== 'Nihil' ? [riwayatMedis.riwayat_penyakit] : ['Nihil'],
    obatRutin: 'Data obat rutin belum tersedia.',
    riwayat: [],
  } : null;
  const sumberDaftar = Array.isArray(daftarPasien) ? daftarPasien : [];
  const daftar = useMemo(() => sumberDaftar.filter((pasien) => {
    const q = kata.trim().toLowerCase();
    return !q || pasien.nama.toLowerCase().includes(q) || pasien.rm.toLowerCase().includes(q) || pasien.nik.includes(q);
  }), [kata, sumberDaftar]);

  return (
    <AppLayout role="dokter" title="Riwayat Medis">
      {pasienTerpilih ? (
        <><div className="flex justify-end"><Badge tone="success">Data database</Badge></div><ProfilPasien pasien={pasienTerpilih} riwayatMedis={riwayatMedis} triageTerbaru={triageTerbaru} antreanId={antreanId} onKembali={() => router.visit(rute.dokter.riwayatMedis())} /></>
      ) : (
        <>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><h1 className="flex items-center gap-2 text-[28px] font-bold">Daftar Rekam Medis <Badge tone="success">Data database</Badge></h1><p className="text-[13px] text-ink-muted">Pilih pasien untuk melihat riwayat medis dan informasi klinis.</p></div>
            <div className="w-full md:w-80"><Input icon={Search} value={kata} onChange={(e) => setKata(e.target.value)} placeholder="Cari nama, No. RM, atau NIK..." aria-label="Cari pasien" /></div>
          </div>
          <div className="space-y-4">
            {daftar.map((pasien) => <article key={pasien.id} className="flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-white p-5 shadow-card">
              <div className="flex items-center gap-4">
                <span aria-hidden="true" className="flex size-16 items-center justify-center rounded-xl bg-brand-light-active text-xl font-bold text-brand">{pasien.nama.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span>
                <div><h2 className="text-xl font-bold">{pasien.nama} <span className="rounded bg-brand-light-active px-2 py-1 text-[10px] font-semibold text-brand-dark">ID Pasien {pasien.rm}</span></h2>
                  <p className="mt-1 text-[10px] text-ink-muted">NIK: {pasien.nik}</p>
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
          <p className="text-xs text-ink-muted">Menampilkan {daftar.length} data pasien</p>
        </>
      )}
    </AppLayout>
  );
}
