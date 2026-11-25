import { useMemo, useState } from 'react';
import { router, usePoll } from '@inertiajs/react';
import {
  Building2, CalendarDays, CheckCircle2, ClipboardCheck, ClipboardClock,
  FileText, FolderOpen, Megaphone, Radio, RefreshCw, Search, Stethoscope, Users,
} from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/ui/Button';
import Badge from '../../Components/ui/Badge';
import Modal from '../../Components/ui/Modal';
import StatCard from '../../Components/ui/StatCard';
import { rute } from '../../lib/rute';

export default function AntreanPeriksa({ dokter = {}, antrean = [] }) {
  const [kata, setKata] = useState('');
  const [filter, setFilter] = useState('semua');
  const [layarDepan, setLayarDepan] = useState(false);

  const [halaman, setHalaman] = useState(1);
  const [konfirmasi, setKonfirmasi] = useState(null);
  const [sibuk, setSibuk] = useState(false);
  const [pesan, setPesan] = useState('');
  usePoll(30000, { only: ['antrean'], preserveScroll: true });
  const hasil = useMemo(() => antrean.filter((p) => {
    const q = kata.trim().toLowerCase();
    const cocokStatus = filter === 'semua' || p.status === filter;
    return cocokStatus && (!q || `${p.nama} ${p.rm} ${p.no}`.toLowerCase().includes(q));
  }), [antrean, kata, filter]);

  const page = Math.min(halaman, Math.max(1, Math.ceil(hasil.length / 5)));
  const tampil = hasil.slice((page - 1) * 5, page * 5);
  const sedangDilayani = antrean.find((item) => item.status === 'sedang');
  const total = antrean.length;
  const sedang = antrean.filter((x) => x.status === 'sedang').length;
  const menunggu = antrean.filter((x) => x.status === 'menunggu').length;
  const selesai = antrean.filter((x) => x.status === 'selesai').length;

  function panggil(item) {
    if (!item || sibuk) return;
    setSibuk(true);
    router.post(`/dokter/antrean-periksa/${item.id}/panggil`, {}, {
      preserveScroll: true, onSuccess: () => setKonfirmasi(null),
      onError: (errs) => setPesan(Object.values(errs)[0]), onFinish: () => setSibuk(false),
    });
  }

  return (
    <AppLayout role="dokter" title="Antrean Periksa">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl sm:text-3xl font-bold text-ink">
            <Stethoscope className="size-7 text-brand" /> Daftar Antrean Ruang Periksa
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
            <b className="text-ink">{dokter.nama}</b>
            <span>•</span>
            <span className="inline-flex items-center gap-1 font-semibold text-brand">
              <Building2 className="size-3.5" /> {dokter.poli}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3.5" /> {new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date())}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          
          <Button variant="outline" icon={Radio} onClick={() => setLayarDepan(true)}>Layar Antrean Depan</Button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="TOTAL ANTREAN" value={total} unit="pasien" icon={Users} />
        <StatCard label="SEDANG DIPERIKSA" value={sedang} unit="di ruang poli" icon={ClipboardCheck} tone="brand" />
        <StatCard label="MENUNGGU GILIRAN" value={menunggu} unit="di ruang tunggu" icon={ClipboardClock} />
        <StatCard label="SELESAI KONSULTASI" value={selesai} unit="terlayani" icon={CheckCircle2} />
      </section>

      <section className="rounded-2xl bg-white shadow-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
          <label className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
            <input
              value={kata}
              aria-label="Cari nama, nomor antrean, atau nomor rekam medis" onChange={(e) => { setKata(e.target.value); setHalaman(1); }}
              placeholder="Cari nama pasien, No. RM..."
              className="h-10 w-full rounded-xl bg-surface-input pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-brand/30"
            />
          </label>
          <div className="flex items-center gap-2">
            <select
              value={filter}
              aria-label="Status antrean" onChange={(e) => { setFilter(e.target.value); setHalaman(1); }}
              className="h-10 rounded-xl bg-surface-input px-3 text-xs font-semibold outline-none"
            >
              <option value="semua">Semua Status</option>
              <option value="sedang">Sedang Diperiksa</option>
              <option value="menunggu">Menunggu Giliran</option>
              <option value="selesai">Selesai</option>
            </select>
            <Button variant="outline" icon={RefreshCw} onClick={() => router.reload({ only: ['antrean'] })}>
              Muat Ulang
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-low text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-5 py-3.5">No. Antrean</th>
                <th className="px-4 py-3.5">Waktu</th>
                <th className="px-4 py-3.5">No. RM</th>
                <th className="px-4 py-3.5">Nama Pasien</th>
                <th className="px-4 py-3.5">Status Triase / Vital</th>
                <th className="px-4 py-3.5">Status Antrean</th>
                <th className="px-5 py-3.5 text-right">Aksi Dokter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {hasil.length > 0 ? tampil.map((p) => (
                <tr key={p.id} className={p.status === 'sedang' ? 'bg-brand-light/40' : 'hover:bg-surface/60'}>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-xl px-3 py-2 text-sm font-extrabold ${
                      p.status === 'sedang' ? 'bg-brand text-white' : 'bg-surface-mid text-ink'
                    }`}>
                      {p.no}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-bold text-ink">{p.jam} WIB</td>
                  <td className="px-4 py-4">
                    <p className="font-bold text-ink">{p.rm}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-bold text-ink text-sm">{p.nama}</p>
                    <p className="text-[11px] text-ink-soft">{p.jk} • {p.umur ?? '—'} tahun</p>
                  </td>
                  <td className="px-4 py-4">
                    {p.triage ? (
                      <div>
                        <Badge tone="success">Triase Selesai</Badge>
                        <p className="mt-1 text-[11px] text-ink-soft">TD {p.triage.td} • Suhu {p.triage.suhu}°C</p>
                      </div>
                    ) : (
                      <Badge tone="warning">Belum Triase</Badge>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <Badge tone={p.status === 'sedang' ? 'brand' : p.status === 'selesai' ? 'success' : 'neutral'} dot>
                      {p.status === 'sedang' ? 'Sedang Diperiksa' : p.status === 'selesai' ? 'Selesai' : 'Menunggu Giliran'}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {p.status === 'menunggu' && (
                        <Button variant="outline" icon={Megaphone} disabled={sedang > 0 || !p.triageSelesai} onClick={() => { setPesan(''); setKonfirmasi(p); }}>Panggil</Button>
                      )}
                      <Button
                        icon={FolderOpen}
                        variant={p.status === 'selesai' ? 'outline' : 'primary'}
                        onClick={() => router.visit(`${rute.dokter.riwayatMedis(p.pasienId)}?antreanId=${p.id}`)}
                      >
                        Buka RM
                      </Button>
                      {p.hasDiagnosis && (
                        <Button
                          variant={p.eresepStatus === 'ditolak' ? 'danger' : 'softBrand'}
                          icon={FileText}
                          onClick={() => router.visit(rute.dokter.formEResep(p.id))}
                        >
                          {p.eresepStatus === 'ditolak' ? 'Perbaiki E-Resep' : p.eresepStatus === 'terkirim' ? 'Edit e-resep' : p.eresepStatus ? 'Lihat e-resep' : 'Buat e-resep'}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-ink-muted">
                    {kata || filter !== 'semua' ? 'Tidak ada pasien yang sesuai dengan filter.' : 'Belum ada pasien yang selesai menjalani triase hari ini.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3 text-xs text-ink-soft">
          <span>{hasil.length ? `${(page-1)*5+1}–${Math.min(page*5,hasil.length)} dari ${hasil.length} pasien` : '0 pasien'} · Pembaruan setiap 30 detik</span>
          {hasil.length > 5 && <div className="flex gap-2">
            <Button variant="outline" disabled={page === 1} onClick={() => setHalaman(page-1)}>Sebelumnya</Button>
            <Button variant="outline" disabled={page * 5 >= hasil.length} onClick={() => setHalaman(page+1)}>Berikutnya</Button>
          </div>}
        </div>
      </section>

      <Modal open={Boolean(konfirmasi)} onClose={() => { if (!sibuk) setKonfirmasi(null); }} title="Panggil pasien ke ruang periksa?"
        footer={<><Button variant="outline" disabled={sibuk} onClick={() => setKonfirmasi(null)}>Kembali</Button>
          <Button disabled={sibuk} icon={Megaphone} onClick={() => panggil(konfirmasi)}>Panggil pasien</Button></>}>
        {konfirmasi && <p>{konfirmasi.no} · <b>{konfirmasi.nama}</b> · {konfirmasi.rm}</p>}
        {pesan && <p role="alert" className="field-error">{pesan}</p>}
      </Modal>

      <Modal layarPublik open={layarDepan} onClose={() => setLayarDepan(false)} title="Layar Antrean Depan" subtitle={`${dokter.poli} — ${dokter.nama}`}>
        <div className="space-y-4 text-center">
          <div className="rounded-2xl bg-brand p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-widest opacity-80">SEDANG DIPERIKSA</p>
            <p className="mt-2 text-5xl font-extrabold">{sedangDilayani?.no || '—'}</p>
            {sedangDilayani && <p className="mt-2 text-sm">Sesi {sedangDilayani.jam} WIB</p>}

          </div>
          <div className="rounded-xl bg-surface-low p-4 text-left">
            <p className="text-[11px] font-bold uppercase text-ink-muted">ANTREAN BERIKUTNYA</p>
            <div className="mt-2 space-y-1.5 text-xs">
              {antrean.filter((x) => x.status === 'menunggu').slice(0, 3).map((x) => (
                <div key={x.id} className="flex justify-between">
                  <b>{x.no}</b>
                  <span className="text-ink-muted">{x.jam} WIB</span>
                </div>
              ))}
              {antrean.filter((x) => x.status === 'menunggu').length === 0 && <p className="text-ink-muted">Tidak ada antrean menunggu.</p>}
            </div>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
