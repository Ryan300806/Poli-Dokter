import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { CalendarDays, CheckCircle2, Clock3, MapPin, Stethoscope } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import PageHeader from '../../Components/ui/PageHeader';
import Button from '../../Components/ui/Button';
import { rute } from '../../lib/rute';

const tanggal = (value) => new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${value}T00:00:00`));
const jam = (value) => String(value).slice(0, 5);
const gelarDokter = (nama) => /^drg?\.?\s/i.test(nama) ? nama : `dr. ${nama}`;

export default function PenjadwalanPoli({ poli = [], dokter = [], slots = [], poliTerpilih = null }) {
  const { errors = {} } = usePage().props;
  const [dokterTerpilih, setDokterTerpilih] = useState('');
  const [tanggalTerpilih, setTanggalTerpilih] = useState('');
  const [slotDipilih, setSlotDipilih] = useState(null);
  const tersedia = slots.filter((slot) => (!dokterTerpilih || String(slot.id_dokter) === dokterTerpilih) && (!tanggalTerpilih || slot.tanggal === tanggalTerpilih));

  function filterPoli(value) {
    router.get(rute.pasien.penjadwalanPoli, value ? { poli: value } : {}, { preserveScroll: true, preserveState: true });
    setDokterTerpilih(''); setSlotDipilih(null);
  }
  function pesan() {
    if (!slotDipilih) return;
    router.post(rute.pasien.reservasi, { id_slot: slotDipilih }, { onSuccess: () => setSlotDipilih(null) });
  }

  return (
    <AppLayout role="pasien" title="Penjadwalan Poli">
      <PageHeader title="Penjadwalan Poli">Lihat ketersediaan dokter dan buat janji temu rawat jalan dengan cepat.</PageHeader>
      <section className="grid gap-4 rounded-2xl bg-white p-5 shadow-card md:grid-cols-3">
        <label className="text-sm font-semibold text-ink-soft">Pilih Poli
          <select value={poliTerpilih ?? ''} onChange={(e) => filterPoli(e.target.value)} className="mt-2 h-11 w-full rounded-lg bg-surface-input px-3 text-sm font-normal text-ink outline-none focus:ring-2 focus:ring-brand/30">
            <option value="">Semua Poli</option>{poli.map((item) => <option key={item.id_poli} value={item.id_poli}>{item.nama_poli}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-ink-soft">Pilih Dokter
          <select value={dokterTerpilih} onChange={(e) => setDokterTerpilih(e.target.value)} className="mt-2 h-11 w-full rounded-lg bg-surface-input px-3 text-sm font-normal text-ink outline-none focus:ring-2 focus:ring-brand/30">
            <option value="">Semua dokter spesialis</option>{dokter.map((item) => <option key={item.id_dokter} value={item.id_dokter}>{item.nama_dokter}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-ink-soft">Pilih Tanggal
          <input type="date" min={new Date().toLocaleDateString('sv-SE')} value={tanggalTerpilih} onChange={(e) => { setTanggalTerpilih(e.target.value); setSlotDipilih(null); }} className="mt-2 h-11 w-full rounded-lg bg-surface-input px-3 text-sm font-normal text-ink outline-none focus:ring-2 focus:ring-brand/30" />
        </label>
      </section>
      {errors.id_slot && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-danger">{errors.id_slot}</p>}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
        <section className="grid gap-4">
          {tersedia.length ? tersedia.map((slot) => (
            <button key={slot.id_slot} type="button" onClick={() => setSlotDipilih(slot.id_slot)} className={`rounded-2xl border bg-white p-5 text-left shadow-card transition ${slotDipilih === slot.id_slot ? 'border-brand ring-2 ring-brand/20' : 'border-transparent hover:border-brand/40'}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><p className="font-bold text-ink">{gelarDokter(slot.nama_dokter)}</p><p className="mt-1 text-sm text-ink-soft">{slot.nama_poli}</p></div>
                <span className="rounded-full bg-brand-light-active px-3 py-1 text-xs font-semibold text-brand">{slot.sisa_kuota} slot tersisa</span>
              </div>
              <div className="mt-5 flex flex-wrap gap-4 text-sm text-ink-soft"><span className="flex items-center gap-2"><CalendarDays className="size-4 text-brand" />{tanggal(slot.tanggal)}</span><span className="flex items-center gap-2"><Clock3 className="size-4 text-brand" />{jam(slot.jam)} WIB</span><span className="flex items-center gap-2"><MapPin className="size-4 text-brand" />Rawat jalan</span></div>
            </button>
          )) : <div className="rounded-2xl bg-white p-10 text-center shadow-card"><Stethoscope className="mx-auto size-8 text-ink-muted"/><h2 className="mt-3 font-semibold text-ink">Belum ada jadwal tersedia</h2><p className="mt-1 text-sm text-ink-muted">Coba pilih poli lain atau periksa kembali nanti.</p></div>}
        </section>
        <aside className="sticky top-20 rounded-2xl bg-white p-5 shadow-card">
          <h2 className="flex items-center gap-2 font-semibold text-ink"><CheckCircle2 className="size-5 text-brand"/>Ringkasan Janji</h2>
          {slots.find((item) => item.id_slot === slotDipilih) ? (() => { const slot = slots.find((item) => item.id_slot === slotDipilih); return <div className="mt-5 space-y-3 text-sm"><p className="flex justify-between gap-3"><span className="text-ink-muted">Poli</span><b className="text-right">{slot.nama_poli}</b></p><p className="flex justify-between gap-3"><span className="text-ink-muted">Dokter</span><b className="text-right">{gelarDokter(slot.nama_dokter)}</b></p><p className="flex justify-between gap-3"><span className="text-ink-muted">Tanggal</span><b className="text-right">{tanggal(slot.tanggal)}</b></p><p className="flex justify-between gap-3"><span className="text-ink-muted">Jam</span><b>{jam(slot.jam)} WIB</b></p></div>; })() : <p className="mt-4 text-sm text-ink-muted">Pilih jadwal dokter untuk melihat ringkasan booking.</p>}
          <Button className="mt-6 w-full justify-center" disabled={!slotDipilih} onClick={pesan}>Konfirmasi Booking</Button>
        </aside>
      </div>
    </AppLayout>
  );
}
