import { Link } from '@inertiajs/react';
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, MapPin, Ticket } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import PageHeader from '../../Components/ui/PageHeader';
import Button from '../../Components/ui/Button';
import { rute } from '../../lib/rute';

const fmtDate = (value) => new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`));
const gelarDokter = (nama) => /^drg?\.?\s/i.test(nama) ? nama : `dr. ${nama}`;

export default function Beranda({ pasien = {}, jadwal = [] }) {
  return <AppLayout role="pasien" title="Beranda Pasien">
    <PageHeader title={`Selamat Datang, ${pasien.nama_lengkap?.split(' ')[0] || 'Pasien'}`}>Kelola layanan rawat jalan, buat janji temu, dan pantau informasi jadwal kunjungan Anda.</PageHeader>
    <div className="flex flex-wrap gap-3"><Button href={rute.pasien.penjadwalanPoli} icon={CalendarDays}>Buat Janji Temu</Button><Button href={rute.pasien.riwayatReservasi} variant="secondary" icon={Ticket}>Riwayat & Jadwal</Button></div>
    {jadwal.length ? <section className="grid gap-5">{jadwal.map((item) => <article key={item.id_reservasi} className="grid items-center gap-5 rounded-2xl border-l-4 border-brand bg-white p-5 shadow-card lg:grid-cols-[1fr_auto]">
      <div><div className="flex flex-wrap items-center gap-3"><span className="inline-flex items-center gap-1 rounded-full bg-brand-light-active px-3 py-1 text-xs font-semibold text-brand"><CheckCircle2 className="size-4"/>Kunjungan terkonfirmasi</span><span className="text-sm font-semibold text-ink-soft"><CalendarDays className="mr-1 inline size-4"/>Jadwal terdekat</span></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-surface-low p-4"><p className="text-xs text-ink-muted">Poliklinik</p><p className="mt-1 font-semibold text-ink">{item.nama_poli}</p></div><div className="rounded-xl bg-surface-low p-4"><p className="text-xs text-ink-muted">Dokter spesialis</p><p className="mt-1 font-semibold text-ink">{gelarDokter(item.nama_dokter)}</p></div><div className="rounded-xl bg-surface-low p-4"><p className="text-xs text-ink-muted">Tanggal & jam kunjungan</p><p className="mt-1 font-semibold text-ink">{fmtDate(item.tanggal)}</p><p className="text-xs text-ink-soft"><Clock3 className="mr-1 inline size-3.5"/>{String(item.jam).slice(0,5)} WIB</p></div></div>
        </div><div className="flex flex-col items-center gap-2 rounded-xl bg-brand-light px-6 py-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-brand-dark">Nomor antrean Anda</p><p className="flex items-center gap-2 text-3xl font-bold text-brand"><Ticket className="size-6"/>A-{String(item.nomor_antrean).padStart(3,'0')}</p><Link href={`${rute.pasien.riwayatReservasi}?status=aktif`} className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-brand">Lihat tiket <ArrowRight className="size-4"/></Link></div>
    </article>)}</section> : <section className="rounded-2xl bg-white p-8 text-center shadow-card"><CalendarDays className="mx-auto size-9 text-brand"/><h2 className="mt-3 text-lg font-semibold text-ink">Belum ada jadwal kunjungan</h2><p className="mt-1 text-sm text-ink-muted">Pilih poli dan jadwal dokter untuk membuat janji temu.</p><Button href={rute.pasien.penjadwalanPoli} className="mt-5">Lihat jadwal tersedia</Button></section>}
  </AppLayout>;
}
