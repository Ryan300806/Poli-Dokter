import { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { Activity, AlertTriangle, CheckCircle2, Clock3, Filter, RefreshCw, Search } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/ui/Button';
import Badge from '../../Components/ui/Badge';
import Pagination from '../../Components/ui/Pagination';
import StatCard from '../../Components/ui/StatCard';
import { Input } from '../../Components/ui/Input';
import { toast } from '../../Components/ui/Toast';
import { rute } from '../../lib/rute';

const PER_HALAMAN = 6;

function statusTriage(row, sudahDiukur) {
  if (sudahDiukur) return { text: 'Triage Selesai', tone: 'success' };
  if (row.status === 'Sedang Diobservasi') return { text: 'Sedang Diobservasi', tone: 'neutral' };
  return { text: 'Belum Diukur', tone: 'warning' };
}

export default function AntreanTriage({ antrean: antreanBackend }) {
  const sumberAntrean = Array.isArray(antreanBackend) ? antreanBackend : [];
  const [kata, setKata] = useState('');
  const [poli, setPoli] = useState('semua');
  const [filterStatus, setFilterStatus] = useState('semua');
  const [kategori, setKategori] = useState('semua');
  const [halaman, setHalaman] = useState(1);
  const observasi = {};

  const hasil = useMemo(() => sumberAntrean.filter((row) => {
    const q = kata.trim().toLowerCase();
    const sudahDiukur = Boolean(row.id_observasi || observasi[row.id]);
    const cocokKategori = kategori === 'semua' || row.kategori === kategori;
    const cocokPoli = poli === 'semua' || row.poli === poli;
    const cocokStatus = filterStatus === 'semua'
      || (filterStatus === 'belum' && !sudahDiukur && row.status !== 'Sedang Diobservasi')
      || (filterStatus === 'selesai' && sudahDiukur)
      || (filterStatus === 'observasi' && row.status === 'Sedang Diobservasi' && !sudahDiukur);
    return cocokKategori && cocokPoli && cocokStatus
      && (!q || `${row.nama} ${row.rm} ${row.nik}`.toLowerCase().includes(q));
  }), [kata, poli, filterStatus, kategori, sumberAntrean]);
  const halamanAman = Math.min(halaman, Math.max(1, Math.ceil(hasil.length / PER_HALAMAN)));
  const baris = hasil.slice((halamanAman - 1) * PER_HALAMAN, halamanAman * PER_HALAMAN);
  const sudahTriage = sumberAntrean.filter((row) => row.id_observasi).length;
  const belumDiukur = hasil.filter((row) => !row.id_observasi).length;

  function ubahFilter(setter, value) {
    setter(value);
    setHalaman(1);
  }

  return (
    <AppLayout role="perawat" title="Antrean Triage Rawat Jalan" contentClassName="pl-3 pr-9 xl:pl-[27px] xl:pr-[25px]">
      <header className="-mt-0.5 flex flex-wrap items-end justify-between gap-4 pb-px xl:ml-[2px] xl:max-w-[895px]">
        <div>
          <div className="xl:max-w-[548px]">
            <div className="mb-1 flex items-center gap-2"><Badge className="!px-2 !py-[2px] !leading-[14px]" tone="success">Unit Rawat Jalan</Badge><Badge className="!px-2 !py-[2px] !leading-[14px]" tone="success">Data database</Badge></div>
            <h1 className="text-[28px] font-bold leading-10 tracking-tight">Daftar Antrean Triage Rawat Jalan</h1>
            <p className="mt-1 max-w-2xl text-[13px] text-ink-muted">Pemeriksaan tanda-tanda vital, anamnesis keluhan utama, dan skrining awal pasien sebelum masuk ruang periksa dokter spesialis.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button className="!h-[52px] !px-3" variant="outline" icon={RefreshCw} onClick={() => router.reload({ only: ['antrean'], preserveScroll: true })}>Refresh Antrean</Button>
        </div>
      </header>

      <section className="-mb-1 grid gap-4 md:grid-cols-3 xl:ml-[2px] xl:max-w-[895px]">
        <StatCard label="Menunggu Pengukuran" value={belumDiukur} unit="Pasien di lobi triage" icon={Clock3} className="min-h-[98px]" />
        <StatCard label="Triage Selesai" value={sudahTriage + 24} unit="Menuju ruang tunggu poli" icon={CheckCircle2} className="min-h-[98px]" tone="brand" />
        <StatCard label="Total Antrean" value={sumberAntrean.length} unit="Pasien hari ini" icon={AlertTriangle} className="min-h-[98px]" />
      </section>

      <section className="overflow-hidden rounded-2xl bg-white shadow-card">
        <div className="flex flex-wrap items-center gap-2 p-4">
          <span className="flex items-center gap-2 text-xs font-semibold"><Filter className="size-4 text-ink-muted" />Filter:</span>
          <select aria-label="Filter poli" value={poli} onChange={(e) => ubahFilter(setPoli, e.target.value)} className="h-9 rounded-lg bg-surface-low px-3 text-xs">
            <option value="semua">Semua Poli</option>{[...new Set(sumberAntrean.map((row) => row.poli))].map((item) => <option key={item}>{item}</option>)}
          </select>
          <select aria-label="Filter status triage" value={filterStatus} onChange={(e) => ubahFilter(setFilterStatus, e.target.value)} className="h-9 rounded-lg bg-surface-low px-3 text-xs">
            <option value="semua">Semua Status Triage</option><option value="belum">Belum Diukur</option><option value="observasi">Sedang Diobservasi</option><option value="selesai">Triage Selesai</option>
          </select>
          <div className="ml-auto w-full sm:w-64"><Input icon={Search} value={kata} onChange={(e) => ubahFilter(setKata, e.target.value)} placeholder="Cari nama pasien, No. RM..." aria-label="Cari pasien" /></div>
          <div className="flex w-full gap-2 text-[10px] sm:w-auto">
            {[['semua', 'Semua'], ...[...new Set(sumberAntrean.map((row) => row.kategori).filter(Boolean))].map((item) => [item, item])].map(([key, label]) => <button key={key} type="button" onClick={() => ubahFilter(setKategori, key)} className={`rounded-full px-3 py-1.5 ${kategori === key ? 'bg-brand-light-active font-semibold text-brand-dark' : 'text-ink-muted hover:bg-surface-low'}`}>{label}</button>)}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[972px] text-left">
            <thead className="bg-surface-low text-[10px] uppercase tracking-wide text-ink-muted"><tr>{['No. Urut', 'Waktu Tiba', 'No. RM & NIK', 'Nama Pasien', 'Poli Tujuan', 'Status Observasi', 'Aksi'].map((head) => <th key={head} className="px-4 py-3 font-semibold">{head}</th>)}</tr></thead>
            <tbody className="divide-y divide-line">
              {baris.map((row) => {
                const sudahDiukur = Boolean(row.id_observasi || observasi[row.id]);
                const status = statusTriage(row, sudahDiukur);
                return <tr key={row.id} className="hover:bg-surface">
                  <td className="px-4 py-3"><span className={`rounded-lg px-2 py-1.5 font-bold ${row.no === 'T-01' ? 'bg-brand-light-active text-brand-dark' : 'bg-surface-mid text-ink'}`}>{row.no}</span></td>
                  <td className="px-4 py-3 text-xs font-semibold">{row.jam} WIB<small className="mt-1 block text-[9px] font-normal text-ink-muted">{row.tunggu}</small></td>
                  <td className="px-4 py-3 text-xs font-semibold">{row.rm}<small className="mt-1 block text-[9px] font-normal text-ink-muted">NIK: {row.nik}</small></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-full bg-surface-mid font-semibold text-brand">{row.nama.split(' ').map((part) => part[0]).slice(0, 1)}</span><div><b className="text-xs">{row.nama}</b><small className="block text-[10px] text-ink-muted">{row.jk}, {row.umur} thn • {row.jaminan}</small></div></div></td>
                  <td className="px-4 py-3"><Badge tone="neutral" icon={Activity}>{row.poli}</Badge></td>
                  <td className="px-4 py-3"><Badge tone={status.tone} dot>{status.text}</Badge></td>
                  <td className="px-4 py-3"><Button size="sm" icon={sudahDiukur ? CheckCircle2 : Activity} variant={sudahDiukur ? 'secondary' : 'primary'} onClick={() => router.visit(rute.perawat.formObservasi(row.idReservasi ?? row.id))}>{sudahDiukur ? 'Lihat / Ubah' : row.status === 'Sedang Diobservasi' ? 'Lanjutkan Form' : 'Lakukan Observasi'}</Button></td>
                </tr>;
              })}
              {baris.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-ink-muted">Tidak ada antrean yang cocok dengan filter.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between bg-surface-low px-5 py-3 text-[10px] text-ink-muted"><span>Menampilkan {baris.length ? (halamanAman - 1) * PER_HALAMAN + 1 : 0}-{(halamanAman - 1) * PER_HALAMAN + baris.length} dari {hasil.length} antrean</span><Pagination halaman={halamanAman} totalHalaman={Math.max(1, Math.ceil(hasil.length / PER_HALAMAN))} onUbah={setHalaman} /></div>
      </section>

    </AppLayout>
  );
}
