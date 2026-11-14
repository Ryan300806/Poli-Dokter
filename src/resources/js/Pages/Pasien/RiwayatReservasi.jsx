import { useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { CalendarDays, CheckCircle2, Clock3, Download, FileText, MapPin, QrCode, RefreshCw, Search, ShieldCheck, Ticket, XCircle } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import PageHeader from '../../Components/ui/PageHeader';
import Button from '../../Components/ui/Button';
import { rute } from '../../lib/rute';

const fmtDate = (value) => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${value}T00:00:00`));
const fmtTime = (value) => String(value).slice(0, 5);
const gelarDokter = (nama) => /^drg?\.?\s/i.test(nama) ? nama : `dr. ${nama}`;
const tabLabel = { aktif: 'Aktif & Mendatang', selesai: 'Riwayat Selesai', dibatalkan: 'Dibatalkan' };

function TiketAntrean({ item }) {
  const kode = item.kode_tiket || `OC-${String(item.id_reservasi).padStart(5, '0')}`;
  return <section className="overflow-hidden rounded-2xl bg-white shadow-card">
    <div className="h-2 bg-brand-dark" />
    <div className="p-5">
      <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="rounded-lg bg-brand-light-active p-2 text-brand"><Ticket className="size-5"/></span><div><h3 className="font-bold text-ink">Tiket Antrean Resmi</h3><p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">Rumah Sakit Citra Medika • Rawat Jalan</p></div></div><span className="rounded bg-brand-light-active px-2 py-1 text-xs font-semibold text-brand">{fmtDate(item.tanggal)}</span></div>
      <div className="mt-4 rounded-xl bg-surface-low px-4 py-5 text-center"><p className="text-[11px] font-semibold uppercase tracking-[.2em] text-brand">Nomor antrean Anda</p><p className="mt-1 text-5xl font-bold text-brand">A-{String(item.nomor_antrean).padStart(3, '0')}</p><p className="mt-2 text-sm text-ink-soft">Estimasi mengikuti antrean di lokasi</p></div>
      <div className="my-4 border-t-2 border-dashed border-line"/>
      <div className="space-y-3 text-sm"><p className="flex justify-between gap-3"><span className="text-ink-soft">Pasien</span><b>{usePage().props.auth?.user?.nama}</b></p><p className="flex justify-between gap-3"><span className="text-ink-soft">Poli</span><b>{item.nama_poli}</b></p><p className="flex justify-between gap-3"><span className="text-ink-soft">Dokter</span><b className="text-right">{gelarDokter(item.nama_dokter)}</b></p><p className="flex justify-between gap-3"><span className="text-ink-soft">Waktu kunjungan</span><b>{fmtTime(item.jam)} WIB</b></p></div>
      <div className="mt-5 rounded-xl border border-line/60 p-5 text-center"><QrCode className="mx-auto size-16 text-ink"/><p className="mt-2 text-xs font-semibold text-ink-soft">Kode check-in: {kode}</p><p className="mt-1 text-[11px] text-ink-muted">Tunjukkan kode ini kepada petugas pendaftaran.</p></div>
      <Button icon={Download} className="mt-4 w-full" onClick={() => window.print()}>Cetak / Simpan E-Tiket</Button>
      <div className="mt-3 flex items-center gap-2 rounded-lg bg-brand-light px-3 py-2 text-xs text-brand-dark"><span className="size-2 rounded-full bg-brand"/>Status antrean: {item.status_antrean || 'menunggu'}</div>
    </div>
  </section>;
}

export default function RiwayatReservasi({ reservasi = [], tab = 'aktif', slots = [] }) {
  const { errors = {} } = usePage().props;
  const [cari, setCari] = useState('');
  const [ubahId, setUbahId] = useState(null);
  const [slotBaru, setSlotBaru] = useState('');
  const filtered = reservasi.filter((r) => `${r.nama_dokter} ${r.nama_poli}`.toLowerCase().includes(cari.toLowerCase()));
  const active = tab === 'aktif';

  useEffect(() => {
    if (!active) return undefined;
    const timer = window.setInterval(() => router.reload({ only: ['reservasi'], preserveScroll: true, preserveState: true }), 15000);
    return () => window.clearInterval(timer);
  }, [active]);

  function pindahTab(value) { router.get(rute.pasien.riwayatReservasi, { status: value }, { preserveScroll: true, preserveState: true }); }
  function batalkan(id) {
    if (window.confirm('Batalkan reservasi ini? Tindakan ini akan mengembalikan kuota jadwal.')) router.delete(rute.pasien.batalkanReservasi(id), { preserveScroll: true });
  }
  function simpanJadwal(id) {
    if (!slotBaru) return;
    router.put(rute.pasien.ubahReservasi(id), { id_slot: Number(slotBaru) }, { preserveScroll: true, onSuccess: () => { setUbahId(null); setSlotBaru(''); } });
  }

  return <AppLayout role="pasien" title="Riwayat Reservasi">
    <PageHeader title="Riwayat Reservasi">Kelola jadwal kunjungan dan pantau tiket antrean aktif Anda.</PageHeader>
    <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white p-2 shadow-card">
      {Object.entries(tabLabel).map(([key, label]) => <button key={key} type="button" onClick={() => pindahTab(key)} className={`border-b-2 px-4 py-3 text-sm font-semibold ${tab === key ? 'border-brand text-brand' : 'border-transparent text-ink-soft hover:text-ink'}`}>{label}</button>)}
      <label className="relative ml-auto min-w-52 flex-1 sm:max-w-xs"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"/><input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari dokter atau poli..." className="h-10 w-full rounded-lg bg-surface-input pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-brand/30"/></label>
    </div>
    {active && <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-ink-soft"><b className="text-ink">Ketentuan perubahan & pembatalan jadwal</b><p className="mt-1">Perubahan atau pembatalan dapat dilakukan paling lambat 2 jam sebelum jadwal kunjungan.</p></div>}
    <div className={active ? 'grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_390px]' : 'grid gap-4'}>
      <section className="grid content-start gap-4">
        {filtered.length ? filtered.map((item) => <article key={item.id_reservasi} className="rounded-2xl border-l-4 border-brand bg-white p-5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status_reservasi === 'dibatalkan' ? 'bg-red-100 text-danger' : item.status_reservasi === 'selesai' ? 'bg-surface-low text-ink-soft' : 'bg-brand-light-active text-brand'}`}>{item.status_reservasi === 'dibatalkan' ? 'Dibatalkan' : item.status_reservasi === 'selesai' ? 'Selesai diperiksa' : 'Aktif & mendatang'}</span><span className="text-xs font-semibold text-ink-muted">#BK-{String(item.id_reservasi).padStart(6, '0')}</span></div>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wide text-brand">{item.nama_poli}</p><h2 className="mt-1 text-lg font-semibold text-ink">{gelarDokter(item.nama_dokter)}</h2><p className="mt-1 flex items-center gap-2 text-sm text-ink-soft"><CalendarDays className="size-4"/>{fmtDate(item.tanggal)} <Clock3 className="ml-2 size-4"/>{fmtTime(item.jam)} WIB</p></div><span className="flex items-center gap-1 text-sm text-ink-soft"><MapPin className="size-4 text-brand"/>Rawat jalan</span></div>
          {item.status_reservasi === 'dibatalkan' && item.alasan_pembatalan && <p className="mt-3 text-xs text-ink-muted">Alasan: {item.alasan_pembatalan}</p>}
          {active && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line/60 pt-4"><span className="flex items-center gap-1 text-xs text-ink-soft"><ShieldCheck className="size-4 text-brand"/>Nomor antrean <b className="text-ink">{item.nomor_antrean}</b></span><div className="flex gap-2"><Button variant="danger" size="sm" icon={XCircle} onClick={() => batalkan(item.id_reservasi)}>Batalkan</Button><Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => { setUbahId(ubahId === item.id_reservasi ? null : item.id_reservasi); setSlotBaru(''); }}>Ubah Jadwal</Button></div></div>}
          {ubahId === item.id_reservasi && <div className="mt-4 grid gap-2 rounded-xl bg-surface-low p-4 sm:grid-cols-[1fr_auto]"><select value={slotBaru} onChange={(e) => setSlotBaru(e.target.value)} className="h-10 rounded-lg bg-white px-3 text-sm"><option value="">Pilih jadwal baru</option>{slots.filter((s) => s.id_slot !== item.id_slot).map((s) => <option key={s.id_slot} value={s.id_slot}>{s.nama_poli} — {gelarDokter(s.nama_dokter)}, {fmtDate(s.tanggal)} {fmtTime(s.jam)}</option>)}</select><Button size="sm" disabled={!slotBaru} onClick={() => simpanJadwal(item.id_reservasi)}>Simpan perubahan</Button>{errors.id_slot && <p className="text-sm text-danger sm:col-span-2">{errors.id_slot}</p>}</div>}
          {item.status_reservasi === 'selesai' && <div className="mt-4 flex items-center gap-2 border-t border-line/60 pt-3 text-xs text-brand"><FileText className="size-4"/>Kunjungan selesai tercatat pada riwayat Anda.</div>}
          {item.status_reservasi === 'selesai' && <Button href={rute.pasien.penjadwalanPoli} variant="secondary" size="sm" icon={RefreshCw} className="mt-4">Reservasi Ulang</Button>}
        </article>) : <div className="rounded-2xl bg-white p-10 text-center shadow-card"><CalendarDays className="mx-auto size-8 text-ink-muted"/><p className="mt-3 font-semibold text-ink">Belum ada {tabLabel[tab]?.toLowerCase()}.</p><p className="mt-1 text-sm text-ink-muted">Reservasi Anda akan tampil di halaman ini.</p></div>}
      </section>
      {active && filtered[0] && <TiketAntrean item={filtered[0]} />}
    </div>
  </AppLayout>;
}
