import { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { AlertCircle, ArrowRight, BellRing, CheckCheck, Clock3, FileText, Hourglass, MailOpen, PackageCheck, Search, TrendingUp } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/ui/Button';
import Badge from '../../Components/ui/Badge';
import Pagination from '../../Components/ui/Pagination';
import StatCard from '../../Components/ui/StatCard';
import { toast } from '../../Components/ui/Toast';
import { resepApotekerDemo } from '../../data/apotekerDemo';
import { bacaDemo, simpanDemo } from '../../lib/demoStorage';
import { rute } from '../../lib/rute';

const PER_HALAMAN = 2;

function ambilResep() {
  const tersimpan = bacaDemo('polidokter-demo-eresep', []);
  const statusTersimpan = bacaDemo('polidokter-demo-eresep-status', {});
  const digabung = [...tersimpan, ...resepApotekerDemo];
  return digabung
    .filter((resep, index) => digabung.findIndex((item) => item.id === resep.id) === index)
    .map((item) => ({ ...item, ...(statusTersimpan[item.id] ?? {}) }));
}

export default function NotifikasiEResep({ resepServer }) {
  const [resep, setResep] = useState(() => Array.isArray(resepServer) ? resepServer : ambilResep());
  const [filter, setFilter] = useState('belum');
  const [kata, setKata] = useState('');
  const [halaman, setHalaman] = useState(1);
  const belumDibaca = resep.filter((item) => !item.dibaca).length;
  const hasil = useMemo(() => resep.filter((item) => {
    const cocokFilter = filter === 'semua' || (filter === 'belum' && !item.dibaca) || (filter === 'sudah' && item.dibaca);
    const q = kata.trim().toLowerCase();
    return cocokFilter && (!q || `${item.pasien} ${item.id} ${item.rm}`.toLowerCase().includes(q));
  }), [resep, filter, kata]);
  const totalHalaman = Math.max(1, Math.ceil(hasil.length / PER_HALAMAN));
  const halamanAman = Math.min(halaman, totalHalaman);
  const baris = hasil.slice((halamanAman - 1) * PER_HALAMAN, halamanAman * PER_HALAMAN);

  function simpanStatus(data) {
    try {
      simpanDemo('polidokter-demo-eresep-status', Object.fromEntries(data.map((item) => [
        item.id,
        { dibaca: item.dibaca, status: item.status },
      ])));
      simpanDemo('polidokter-demo-eresep', data.filter((item) => !resepApotekerDemo.some((seed) => seed.id === item.id)));
      setResep(data);
    } catch (error) {
      console.error('Gagal memperbarui status E-Resep demo.', error);
      toast.error('Status belum tersimpan di browser. Periksa izin penyimpanan lalu coba lagi.');
    }
  }

  function tandaiSemua() {
    simpanStatus(resep.map((item) => ({ ...item, dibaca: true })));
    toast.success('Semua notifikasi demo ditandai sudah dibaca.');
  }

  function bukaResep(item) {
    if (!item.dibaca) simpanStatus(resep.map((entry) => entry.id === item.id ? { ...entry, dibaca: true } : entry));
    router.visit(rute.apoteker.rincianEResep(item.id));
  }

  return (
    <AppLayout role="apoteker" title="Notifikasi E-Resep" contentClassName="pl-3 pr-9 xl:pl-[27px] xl:pr-[100px]">
      <header className="mt-[11px] mb-[11px] flex flex-wrap items-center justify-between gap-4">
        <div><div className="flex h-7 items-center gap-2"><Badge className="!px-2 !py-[2px] !leading-[14px]" tone="success">Farmasi Rawat Jalan</Badge><Badge className="!px-2 !py-[2px] !leading-[14px]" tone={Array.isArray(resepServer) ? 'success' : 'info'}>{Array.isArray(resepServer) ? 'Data server' : 'Demo lokal'}</Badge><span className="text-[10px] text-ink-muted">• Data E-Resep</span></div><h1 className="text-[28px] font-bold leading-10">Notifikasi E-Resep</h1></div>
        <div className="flex gap-2"><Badge tone="success" dot>Sistem HIS Aktif</Badge><Badge tone="neutral"><Clock3 className="size-3" />Update 10 dtk lalu</Badge></div>
      </header>

      <section className="mb-[3px] grid gap-4 md:grid-cols-3">
        <StatCard label="Total Notifikasi Hari Ini" value={18 + Math.max(0, resep.length - resepApotekerDemo.length)} unit="Notifikasi" icon={BellRing} detail="Tercatat sejak 07:00 WIB" detailIcon={TrendingUp} />
        <StatCard label="E-Resep Belum Dibaca" value={belumDibaca} unit="Resep Baru" icon={MailOpen} tone="brand" detail="Memerlukan telaah resep segera" detailIcon={AlertCircle} />
        <StatCard label="Menunggu Peracikan" value={resep.filter((item) => ['Menunggu Telaah Resep', 'Perlu Diracik'].includes(item.status)).length + 3} unit="Antrean Farmasi" icon={PackageCheck} detail="Estimasi durasi: ~15 menit" detailIcon={Hourglass} />
      </section>

      <section className="-mb-3 rounded-2xl bg-white p-4 shadow-card">
        <div className="flex flex-wrap items-center gap-2">
          {[['semua', 'Semua'], ['belum', 'Belum Dibaca'], ['sudah', 'Sudah Dibaca']].map(([key, label]) => <button key={key} type="button" onClick={() => { setFilter(key); setHalaman(1); }} className={`rounded-lg px-3 py-2 text-xs ${filter === key ? 'bg-brand-light-active font-semibold text-brand-dark' : 'bg-surface-low text-ink-soft hover:bg-surface-mid'}`}>{label}</button>)}
          <label className="relative ml-auto w-full sm:w-64"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" /><input value={kata} onChange={(e) => { setKata(e.target.value); setHalaman(1); }} placeholder="Cari nama pasien atau ID E-Resep..." className="h-10 w-full rounded-lg bg-surface-low pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-brand/30" /></label>
          <Button variant="outline" icon={CheckCheck} onClick={tandaiSemua} disabled={belumDibaca === 0}>Tandai Semua Dibaca</Button>
        </div>
      </section>

      <section className="space-y-3">
        {baris.map((item) => <article key={item.id} className={`flex min-h-[136px] flex-wrap items-center justify-between gap-4 rounded-2xl border-l-4 ${item.dibaca ? 'border-line bg-white' : 'border-brand bg-white'} p-5 shadow-card`}>
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <span className="relative flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-light-active text-brand"><FileText className="size-6" />{!item.dibaca && <i className="absolute -right-1 -top-1 size-3 rounded-full bg-brand ring-2 ring-white" />}</span>
            <div className="min-w-0 flex-1">
              <h2 className="flex flex-wrap items-center gap-2 text-base font-bold">E-Resep baru diterima {!item.dibaca && <Badge tone="success">Baru</Badge>} <span className="text-[11px] font-medium text-brand">◷ {new Date(item.tanggal).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></h2>
              <div className="mt-2 grid gap-2 text-[11px] text-ink-soft sm:grid-cols-3"><span>Pasien: <b>{item.pasien}</b></span><span>Dokter: <b>{item.dokter}</b></span><span>Poli: <Badge tone="neutral">{item.poli}</Badge></span></div>
              <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-ink-muted"><span className="flex items-center gap-1"><FileText className="size-3" />ID Resep: {item.id}</span><span>• {item.items?.length ?? 0} R/ Obat</span><span>• {item.jaminan}</span></div>
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
