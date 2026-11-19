import { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { AlertCircle, ArrowRight, BellRing, FileText, Hourglass, MailOpen, Search } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/ui/Button';
import Badge from '../../Components/ui/Badge';
import StatCard from '../../Components/ui/StatCard';
import { rute } from '../../lib/rute';

export default function NotifikasiEResep({ resepServer = [] }) {
  const [filter, setFilter] = useState('semua');
  const [kata, setKata] = useState('');

  const hasil = useMemo(() => resepServer.filter((item) => {
    const cocokFilter = filter === 'semua'
      || (filter === 'belum' && ['Menunggu Telaah Resep', 'Perlu Diracik'].includes(item.status))
      || (filter === 'selesai' && ['Siap Diserahkan', 'Obat Sudah Diberikan'].includes(item.status));
    const q = kata.trim().toLowerCase();

    return cocokFilter && (!q || `${item.pasien} ${item.id} ${item.dokter}`.toLowerCase().includes(q));
  }), [resepServer, filter, kata]);

  const perluTelaah = resepServer.filter((x) => x.status === 'Menunggu Telaah Resep').length;
  const siapSerah = resepServer.filter((x) => x.status === 'Siap Diserahkan').length;

  return (
    <AppLayout role="apoteker" title="Notifikasi E-Resep">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Badge tone="success">FARMASI RAWAT JALAN</Badge>
          <h1 className="mt-1.5 text-3xl font-extrabold text-ink">Notifikasi E-Resep</h1>
        </div>
        <Badge tone="success" dot>Sistem HIS Aktif</Badge>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="TOTAL E-RESEP" value={resepServer.length} unit="Resep Masuk" icon={BellRing} />
        <StatCard label="MENUNGGU TELAAH" value={perluTelaah} unit="Resep Baru" icon={MailOpen} tone="brand" detail="Memerlukan telaah resep segera" />
        <StatCard label="SIAP DISERAHKAN" value={siapSerah} unit="Antrean Loket" icon={Hourglass} detail="Menunggu pengambilan pasien" />
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-card">
        <div className="flex flex-wrap gap-2">
          {[
            ['semua', 'Semua'],
            ['belum', 'Perlu Ditelaah'],
            ['selesai', 'Siap / Selesai'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                filter === key ? 'bg-brand-light-active text-brand-dark' : 'bg-surface-low text-ink-soft hover:bg-surface-mid'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
          <input
            value={kata}
            onChange={(e) => setKata(e.target.value)}
            placeholder="Cari nama pasien atau ID E-Resep..."
            className="h-10 w-full rounded-xl bg-surface-input pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-brand/30"
          />
        </label>
      </section>

      <section className="space-y-3">
        {hasil.length > 0 ? hasil.map((item) => {
          const kurang = (item.items ?? []).some((o) => Number(o.jumlah_stok ?? 0) < Number(o.jumlah_obat ?? 0));
          return (
            <article key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-l-4 border-brand bg-white p-5 shadow-card">
              <div className="flex items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-light-active text-brand">
                  <FileText className="size-6" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-bold text-ink">E-Resep #{item.id}</h2>
                    <span className="text-[11px] font-semibold text-brand">• {new Date(item.tanggal).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-4 text-xs text-ink-soft">
                    <span>Pasien: <b className="text-ink">{item.pasien}</b></span>
                    <span>Dokter: <b className="text-ink">{item.dokter}</b></span>
                    <span>Poli: <Badge tone="neutral">{item.poli || 'Poliklinik'}</Badge></span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] text-ink-muted">
                    <span>{item.items?.length ?? 0} R/ Obat</span>
                    <Badge tone={kurang ? 'danger' : 'success'}>
                      {kurang ? 'Ada Stok Kurang / Habis' : 'Stok Obat Tersedia'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <Badge tone={item.status === 'Ditolak' ? 'danger' : 'success'} dot>{item.status}</Badge>
                <Button icon={ArrowRight} onClick={() => router.visit(rute.apoteker.rincianEResep(item.id))}>
                  Buka E-Resep
                </Button>
              </div>
            </article>
          );
        }) : (
          <div className="rounded-2xl bg-white p-12 text-center text-xs text-ink-muted shadow-card">
            <AlertCircle className="mx-auto size-8 text-ink-muted" />
            <p className="mt-2 font-semibold">Tidak ada E-Resep yang cocok dengan filter.</p>
          </div>
        )}
      </section>
    </AppLayout>
  );
}
