import { router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, ClipboardList, HeartPulse, ShieldAlert, Stethoscope } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/ui/Button';
import Badge from '../../Components/ui/Badge';
import { rute } from '../../lib/rute';

export default function RiwayatMedis({ daftarPasien = null, pasien = null, riwayatMedis = {}, triageTerbaru = {}, riwayatDiagnosis = [], antreanId = null }) {
  // Mode 1: Daftar pasien poli dokter (_p23)
  if (Array.isArray(daftarPasien)) {
    return (
      <AppLayout role="dokter" title="Riwayat Medis Pasien">
        <header>
          <h1 className="text-3xl font-extrabold text-ink">Riwayat Medis Pasien</h1>
          <p className="mt-1 text-xs text-ink-soft">Daftar pasien yang terdaftar pada jadwal praktek Anda.</p>
        </header>

        <div className="space-y-4">
          {daftarPasien.length > 0 ? daftarPasien.map((p) => (
            <article key={p.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-card">
              <div className="flex items-center gap-4">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-light-active text-lg font-extrabold text-brand-dark">
                  {p.nama.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-ink">{p.nama}</h2>
                    <Badge tone="success">{p.rm}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-ink-muted">NIK: {p.nik} • {p.umur} Tahun ({p.jk})</p>
                  <p className="mt-1 text-xs text-ink-soft">Gol. Darah: <b>{p.golDarah}</b> • Telp: <b>{p.telepon}</b></p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-danger-light px-4 py-2.5 text-danger">
                  <p className="flex items-center gap-1 text-[10px] font-bold uppercase"><ShieldAlert className="size-3.5" /> Peringatan Alergi</p>
                  <p className="mt-0.5 text-xs font-bold">{p.alergi.join(', ')}</p>
                </div>
                <Button icon={ArrowRight} onClick={() => router.visit(rute.dokter.riwayatMedis(p.id))}>
                  Lihat Detail
                </Button>
              </div>
            </article>
          )) : (
            <div className="rounded-2xl bg-white p-12 text-center text-xs text-ink-muted shadow-card">
              Belum ada pasien yang tercatat pada jadwal Anda.
            </div>
          )}
        </div>
      </AppLayout>
    );
  }

  // Mode 2: Detail Riwayat Medis Pasien (_p27)
  const alergiText = riwayatMedis?.alergi && riwayatMedis.alergi !== '-' ? riwayatMedis.alergi : 'Tidak ada data alergi';
  const rmCode = `RM-${String(pasien?.id_pasien ?? 0).padStart(6, '0')}`;

  return (
    <AppLayout role="dokter" title="Detail Riwayat Medis">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" icon={ArrowLeft} onClick={() => router.visit(rute.dokter.antreanPeriksa)}>
          Kembali ke Antrean
        </Button>
        {antreanId && (
          <Button icon={Stethoscope} onClick={() => router.visit(rute.dokter.formDiagnosis(antreanId))}>
            Lanjut ke Form Diagnosis
          </Button>
        )}
      </div>

      <section className="flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-white p-6 shadow-card">
        <div className="flex items-center gap-4">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-brand-light-active text-xl font-extrabold text-brand-dark">
            {pasien?.nama_lengkap?.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-ink">{pasien?.nama_lengkap}</h1>
              <Badge tone="success">{rmCode}</Badge>
            </div>
            <p className="mt-1 text-xs text-ink-muted">NIK: {pasien?.nik}</p>
            <p className="mt-1 text-xs text-ink-soft">
              {pasien?.tempat_lahir}, {pasien?.tanggal_lahir} • {pasien?.jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki'} • Gol. {pasien?.golongan_darah || '—'}
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-danger-light p-3.5 text-danger">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase"><ShieldAlert className="size-4" /> Peringatan Alergi</p>
          <p className="mt-1 text-xs font-bold">{alergiText}</p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-5 shadow-card">
            <h2 className="flex items-center gap-2 text-base font-bold text-ink">
              <HeartPulse className="size-5 text-brand" /> Hasil Observasi Triage Terakhir
            </h2>
            <p className="mt-1 text-[11px] text-ink-muted">Waktu pemeriksaan: {triageTerbaru?.waktu_observasi || 'Belum tercatat'}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                ['TEKANAN DARAH', triageTerbaru?.tekanan_darah ? `${triageTerbaru.tekanan_darah} mmHg` : '—'],
                ['SUHU TUBUH', triageTerbaru?.suhu ? `${triageTerbaru.suhu} °C` : '—'],
                ['BERAT BADAN', triageTerbaru?.berat_badan ? `${triageTerbaru.berat_badan} kg` : '—'],
              ].map(([label, val]) => (
                <div key={label} className="rounded-xl bg-surface-low p-3.5">
                  <p className="text-[10px] font-bold uppercase text-ink-muted">{label}</p>
                  <p className="mt-1 text-base font-extrabold text-ink">{val}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-card">
            <h2 className="flex items-center gap-2 text-base font-bold text-ink">
              <ClipboardList className="size-5 text-danger" /> Riwayat Penyakit &amp; Alergi
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-surface-low p-4">
                <p className="text-[10px] font-bold uppercase text-ink-muted">RIWAYAT PENYAKIT DAHULU (RPD)</p>
                <p className="mt-2 text-xs font-semibold text-ink">{riwayatMedis?.riwayat_penyakit || 'Nihil'}</p>
              </div>
              <div className="rounded-xl bg-danger-light p-4 text-danger">
                <p className="text-[10px] font-bold uppercase">RINCIAN ALERGI</p>
                <p className="mt-2 text-xs font-bold">{alergiText}</p>
              </div>
            </div>
          </section>
        </div>

        <section className="rounded-2xl bg-white p-5 shadow-card">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <h2 className="text-base font-bold text-ink">Rekam Medis Terdahulu</h2>
            <Badge tone="neutral">{riwayatDiagnosis.length} Catatan</Badge>
          </div>
          <div className="mt-4 space-y-3">
            {riwayatDiagnosis.length > 0 ? riwayatDiagnosis.map((d) => (
              <div key={d.id_diagnosis} className="rounded-xl border-l-4 border-brand bg-surface-low p-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand">{d.tanggal_antrean}</span>
                  <Badge tone="success">{d.status_pemeriksaan}</Badge>
                </div>
                <p className="mt-1 font-bold text-ink">{d.nama_poli} — {d.nama_dokter}</p>
                <p className="mt-1 text-ink-soft"><b>Diagnosis:</b> {d.nama_diagnosis}</p>
                <p className="mt-0.5 text-ink-muted"><b>Tindakan:</b> {d.rencana_tindakan}</p>
              </div>
            )) : (
              <p className="py-8 text-center text-xs text-ink-muted">Belum ada catatan diagnosis terdahulu.</p>
            )}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
