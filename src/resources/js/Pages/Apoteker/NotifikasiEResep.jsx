import { useState } from 'react';
import { Link, router, usePoll } from '@inertiajs/react';
import { ArrowRight, FileText, Hourglass, MailOpen, Search } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/ui/Button';
import Badge from '../../Components/ui/Badge';
import StatCard from '../../Components/ui/StatCard';
import { rute } from '../../lib/rute';

const tahapan = [
  ['', 'Semua status'], ['terkirim', 'Menunggu telaah'], ['diproses', 'Sedang diracik'],
  ['siap_diserahkan', 'Siap diserahkan'], ['ditolak', 'Ditolak'], ['selesai', 'Sudah diserahkan'],
];

export default function NotifikasiEResep({ resepServer, filters, jumlahStatus }) {
  const [kata, setKata] = useState(filters.q);
  const total = Object.values(jumlahStatus).reduce((sum, n) => sum + Number(n), 0);
  usePoll(30000, { only: ['resepServer', 'jumlahStatus'], preserveScroll: true });

  function cari(status, q) {
    router.get(rute.apoteker.notifikasiEResep, { status, q }, { preserveState: true, preserveScroll: true, replace: true });
  }

  return (
    <AppLayout role="apoteker" title="Notifikasi e-resep">
      <header>
        <h1 className="text-2xl font-bold sm:text-3xl">Notifikasi e-resep</h1>
        <p className="mt-1 text-sm text-ink-soft">Telaah resep dari dokter dan pantau obat sampai diserahkan ke pasien.</p>
      </header>
      <section aria-label="Ringkasan farmasi" className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Seluruh resep" value={total} unit="resep" icon={FileText} />
        <StatCard label="Menunggu telaah" value={jumlahStatus.terkirim || 0} unit="resep" icon={MailOpen} tone="brand" />
        <StatCard label="Siap diserahkan" value={jumlahStatus.siap_diserahkan || 0} unit="resep" icon={Hourglass} />
      </section>
      <section className="overflow-hidden rounded-xl border border-line bg-white">
        <form onSubmit={(e) => { e.preventDefault(); cari(filters.status, kata); }}
          className="flex flex-wrap items-end gap-3 border-b border-line p-4">
          <label className="min-w-44 flex-1 text-sm font-semibold">Cari resep
            <input type="search" className="field-input" placeholder="Nama pasien, dokter, atau nomor resep"
              maxLength={100} value={kata} onChange={(e) => setKata(e.target.value)} />
          </label>
          <label className="text-sm font-semibold">Tahap layanan
            <select className="field-input" value={filters.status} onChange={(e) => cari(e.target.value, kata)}>
              {tahapan.map(([value,label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <Button type="submit" variant="outline" icon={Search}>Cari</Button>
        </form>
        <ul className="divide-y divide-line">
          {resepServer.data.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="text-xs font-semibold text-ink-muted">Resep #{item.id} · {String(item.tanggal).replace('T',' ').slice(0,16)} WIB</p>
                <h2 className="mt-1 text-base font-bold">{item.pasien}</h2>
                <p className="mt-1 text-sm text-ink-soft">{item.dokter} · {item.poli} · {item.jumlahJenis} jenis obat</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {item.stokKurang && !['selesai','ditolak'].includes(item.statusRaw) && <Badge tone="warning">Stok kurang</Badge>}
                <Badge tone={item.statusRaw === 'ditolak' ? 'danger' : item.statusRaw === 'siap_diserahkan' ? 'success' : 'neutral'}>{item.status}</Badge>
                <Button href={rute.apoteker.rincianEResep(item.id)} variant="outline" icon={ArrowRight}>Buka resep</Button>
              </div>
            </li>
          ))}
        </ul>
        {!resepServer.data.length && <div className="p-9 text-center">
          <p className="font-semibold">{filters.q || filters.status ? 'Tidak ada resep yang cocok' : 'Belum ada resep masuk'}</p>
          <p className="mt-1 text-sm text-ink-soft">{filters.q || filters.status ? 'Ubah pencarian atau pilih semua status.' : 'Resep muncul setelah dokter mengirimkannya dari hasil pemeriksaan.'}</p>
        </div>}
        {resepServer.total > 0 && <nav aria-label="Halaman resep" className="flex flex-wrap items-center justify-between gap-2 border-t border-line p-4 text-sm">
          <span>{resepServer.from}–{resepServer.to} dari {resepServer.total} resep</span>
          <div className="flex gap-3">
            {resepServer.prev_page_url && <Link className="font-semibold text-brand" href={resepServer.prev_page_url}>Sebelumnya</Link>}
            {resepServer.next_page_url && <Link className="font-semibold text-brand" href={resepServer.next_page_url}>Berikutnya</Link>}
          </div>
        </nav>}
      </section>
    </AppLayout>
  );
}
