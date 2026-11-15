import { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { AlertCircle, ArrowRight, BellRing, Clock3, FileText, Hourglass, MailOpen, PackageCheck, Search, TrendingUp } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/ui/Button';
import Badge from '../../Components/ui/Badge';
import Pagination from '../../Components/ui/Pagination';
import StatCard from '../../Components/ui/StatCard';
import { rute } from '../../lib/rute';

const PER_HALAMAN = 2;

export default function NotifikasiEResep({ resepServer }) {
  const resep = Array.isArray(resepServer) ? resepServer : [];
  const [filter, setFilter] = useState('semua');
  const [kata, setKata] = useState('');
  const [halaman, setHalaman] = useState(1);
  const hasil = useMemo(() => resep.filter((item) => {
    const cocokFilter = filter === 'semua' || (filter === 'belum' && ['Menunggu Telaah Resep', 'Perlu Diracik'].includes(item.status));
    const q = kata.trim().toLowerCase();
    return cocokFilter && (!q || `${item.pasien} ${item.id} ${item.pasienId}`.toLowerCase().includes(q));
  }), [resep, filter, kata]);
  const totalHalaman = Math.max(1, Math.ceil(hasil.length / PER_HALAMAN));
  const halamanAman = Math.min(halaman, totalHalaman);
  const baris = hasil.slice((halamanAman - 1) * PER_HALAMAN, halamanAman * PER_HALAMAN);

  function bukaResep(item) {
    router.visit(rute.apoteker.rincianEResep(item.id));
  }

  return (
    <AppLayout role="apoteker" title="Notifikasi E-Resep" contentClassName="pl-3 pr-9 xl:pl-[27px] xl:pr-[100px]">
      <header className="mt-[11px] mb-[11px] flex flex-wrap items-center justify-between gap-4">
        <div><div className="flex h-7 items-center gap-2"><Badge className="!px-2 !py-[2px] !leading-[14px]" tone="success">Farmasi Rawat Jalan</Badge><Badge className="!px-2 !py-[2px] !leading-[14px]" tone="success">Data database</Badge><span className="text-[10px] text-ink-muted">• Data E-Resep</span></div><h1 className="text-[28px] font-bold leading-10">Notifikasi E-Resep</h1></div>
        <div className="flex gap-2"><Badge tone="success" dot>Sistem HIS Aktif</Badge><Badge tone="neutral"><Clock3 className="size-3" />Update 10 dtk lalu</Badge></div>
      </header>

      <section className="mb-[3px] grid gap-4 md:grid-cols-3">
        <StatCard label="Total E-Resep" value={resep.length} unit="Resep" icon={BellRing} detail="Diambil dari database" detailIcon={TrendingUp} />
        <StatCard label="Menunggu Telaah" value={resep.filter((item) => item.status === 'Menunggu Telaah Resep').length} unit="Resep" icon={MailOpen} tone="brand" detail="Memerlukan telaah" detailIcon={AlertCircle} />
        <StatCard label="Menunggu Peracikan" value={resep.filter((item) => item.status === 'Perlu Diracik').length} unit="Resep" icon={PackageCheck} detail="Status database" detailIcon={Hourglass} />
      </section>

      <section className="-mb-3 rounded-2xl bg-white p-4 shadow-card">
        <div className="flex flex-wrap items-center gap-2">
          {[['semua', 'Semua'], ['belum', 'Perlu Ditelaah']].map(([key, label]) => <button key={key} type="button" onClick={() => { setFilter(key); setHalaman(1); }} className={`rounded-lg px-3 py-2 text-xs ${filter === key ? 'bg-brand-light-active font-semibold text-brand-dark' : 'bg-surface-low text-ink-soft hover:bg-surface-mid'}`}>{label}</button>)}
          <label className="relative ml-auto w-full sm:w-64"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" /><input value={kata} onChange={(e) => { setKata(e.target.value); setHalaman(1); }} placeholder="Cari nama pasien atau ID E-Resep..." className="h-10 w-full rounded-lg bg-surface-low pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-brand/30" /></label>
        </div>
      </section>

      <section className="space-y-3">
        {baris.map((item) => <article key={item.id} className="flex min-h-[136px] flex-wrap items-center justify-between gap-4 rounded-2xl border-l-4 border-brand bg-white p-5 shadow-card">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <span className="relative flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-light-active text-brand"><FileText className="size-6" /></span>
            <div className="min-w-0 flex-1">
              <h2 className="flex flex-wrap items-center gap-2 text-base font-bold">E-Resep <span className="text-[11px] font-medium text-brand">◷ {new Date(item.tanggal).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></h2>
              <div className="mt-2 grid gap-2 text-[11px] text-ink-soft sm:grid-cols-3"><span>Pasien: <b>{item.pasien}</b></span><span>Dokter: <b>{item.dokter}</b></span><span>Poli: <Badge tone="neutral">{item.poli}</Badge></span></div>
              <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-ink-muted"><span className="flex items-center gap-1"><FileText className="size-3" />ID Resep: {item.id}</span><span>• {item.items?.length ?? 0} R/ Obat</span></div>
            </div>
          </div>
          <div className="flex min-w-40 flex-col items-end gap-2"><Badge tone={item.status === 'Siap Diserahkan' ? 'success' : 'success'} dot>{item.status}</Badge><Button icon={ArrowRight} onClick={() => bukaResep(item)}>Buka E-Resep</Button></div>
        </article>)}
        {baris.length === 0 && <p className="rounded-2xl bg-white p-12 text-center text-sm text-ink-muted">Tidak ada notifikasi yang sesuai dengan pencarian atau filter.</p>}
      </section>
      <div className="flex items-center justify-between text-xs text-ink-muted"><span>Menampilkan {baris.length} dari {hasil.length} resep pada halaman {halamanAman}</span><Pagination halaman={halamanAman} totalHalaman={totalHalaman} onUbah={setHalaman} /></div>
    </AppLayout>
  );
}
