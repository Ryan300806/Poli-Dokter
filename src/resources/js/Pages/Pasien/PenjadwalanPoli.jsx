import { useMemo, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { ArrowRight, CalendarDays, CalendarX, CheckCircle2, Info, MapPin, Stethoscope } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/ui/Button';
import Badge from '../../Components/ui/Badge';
import Modal from '../../Components/ui/Modal';
import { rute } from '../../lib/rute';

const fmtDate = (v) => new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${v}T00:00:00`));

export default function PenjadwalanPoli({ poli = [], dokter = [], slots = [], poliTerpilih = null }) {
  const { errors = {} } = usePage().props;
  const [dokterTerpilih, setDokterTerpilih] = useState('');
  const [tanggalTerpilih, setTanggalTerpilih] = useState('');
  const [slotDipilih, setSlotDipilih] = useState(null);
  const [modalPenuh, setModalPenuh] = useState(false);

  const filteredSlots = useMemo(() => {
    return slots.filter((s) => (
      (!dokterTerpilih || String(s.id_dokter) === dokterTerpilih)
      && (!tanggalTerpilih || s.tanggal === tanggalTerpilih)
    ));
  }, [slots, dokterTerpilih, tanggalTerpilih]);

  // Kelompokkan slot per dokter + tanggal seperti desain _p16
  const grouped = useMemo(() => {
    const map = new Map();
    for (const s of filteredSlots) {
      const key = `${s.id_dokter}-${s.tanggal}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          id_dokter: s.id_dokter,
          nama_dokter: s.nama_dokter,
          nama_poli: s.nama_poli,
          tanggal: s.tanggal,
          sesi: [],
        });
      }
      map.get(key).sesi.push(s);
    }
    return Array.from(map.values());
  }, [filteredSlots]);

  const selectedSlotObj = slots.find((s) => s.id_slot === slotDipilih) || null;

  function pilihPoli(val) {
    setDokterTerpilih('');
    setSlotDipilih(null);
    router.get(rute.pasien.penjadwalanPoli, val ? { poli: val } : {}, { preserveScroll: true, preserveState: true });
  }

  function konfirmasiBooking() {
    if (!selectedSlotObj) return;
    if (selectedSlotObj.sisa_kuota < 1) {
      setModalPenuh(true);
      return;
    }
    router.post(rute.pasien.reservasi, { id_slot: selectedSlotObj.id_slot }, {
      onError: () => setModalPenuh(true),
    });
  }

  return (
    <AppLayout role="pasien" title="Penjadwalan Poli">
      <header>
        <h1 className="text-3xl font-extrabold text-ink">Penjadwalan Poli</h1>
        <p className="mt-1 text-xs text-ink-soft">Lihat ketersediaan dokter dan buat janji temu rawat jalan dengan cepat.</p>
      </header>

      {/* Filter Bar 3 Kolom (_p16) */}
      <section className="grid gap-4 rounded-2xl bg-white p-5 shadow-card md:grid-cols-3">
        <label className="text-xs font-bold text-ink">
          Pilih Poli
          <select
            value={poliTerpilih ?? ''}
            onChange={(e) => pilihPoli(e.target.value)}
            className="mt-2 h-11 w-full rounded-xl bg-surface-input px-3 text-xs font-medium text-ink outline-none focus:ring-2 focus:ring-brand/30"
          >
            <option value="">Semua Poli</option>
            {poli.map((p) => <option key={p.id_poli} value={p.id_poli}>{p.nama_poli}</option>)}
          </select>
        </label>
        <label className="text-xs font-bold text-ink">
          Pilih Dokter Spesialis
          <select
            value={dokterTerpilih}
            onChange={(e) => { setDokterTerpilih(e.target.value); setSlotDipilih(null); }}
            className="mt-2 h-11 w-full rounded-xl bg-surface-input px-3 text-xs font-medium text-ink outline-none focus:ring-2 focus:ring-brand/30"
          >
            <option value="">Semua Dokter Spesialis</option>
            {dokter.map((d) => <option key={d.id_dokter} value={d.id_dokter}>{d.nama_dokter}</option>)}
          </select>
        </label>
        <label className="text-xs font-bold text-ink">
          Pilih Tanggal
          <input
            type="date"
            min={new Date().toLocaleDateString('sv-SE')}
            value={tanggalTerpilih}
            onChange={(e) => { setTanggalTerpilih(e.target.value); setSlotDipilih(null); }}
            className="mt-2 h-11 w-full rounded-xl bg-surface-input px-3 text-xs font-medium text-ink outline-none focus:ring-2 focus:ring-brand/30"
          />
        </label>
      </section>

      {errors.id_slot && <p role="alert" className="rounded-xl bg-danger-light px-4 py-3 text-xs font-semibold text-danger">{errors.id_slot}</p>}

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        {/* Daftar Dokter & Sesi Praktek */}
        <section className="space-y-4">
          {grouped.length > 0 ? grouped.map((grp) => (
            <article key={grp.key} className="rounded-2xl border-l-4 border-brand bg-white p-5 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <span className="flex size-12 items-center justify-center rounded-full bg-brand-light-active text-sm font-bold text-brand-dark">
                    {grp.nama_dokter.replace(/^drg?\.\s*/i, '').slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-bold text-ink">{grp.nama_dokter}</h2>
                      <Badge tone="success">Tersedia</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-ink-soft">{grp.nama_poli} • {fmtDate(grp.tanggal)}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-xl bg-surface-low px-3 py-1.5 text-xs font-bold text-brand-dark">
                  <MapPin className="size-3.5" /> Rawat Jalan
                </span>
              </div>

              <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-ink-muted">PILIH SESI PRAKTIK DOKTER</p>
              <div className="mt-2 flex flex-wrap gap-2.5">
                {grp.sesi.map((s) => {
                  const penuh = s.sisa_kuota < 1;
                  const aktif = slotDipilih === s.id_slot;
                  return (
                    <button
                      key={s.id_slot}
                      type="button"
                      onClick={() => (penuh ? setModalPenuh(true) : setSlotDipilih(s.id_slot))}
                      className={`min-w-24 rounded-xl px-4 py-2.5 text-center transition cursor-pointer ${
                        aktif
                          ? 'bg-brand text-white shadow-sm'
                          : penuh
                            ? 'bg-surface-low text-ink-muted hover:bg-danger-light'
                            : 'bg-surface-low text-ink hover:bg-brand-light'
                      }`}
                    >
                      <span className="block text-xs font-bold">{String(s.jam).slice(0, 5)}</span>
                      <span className={`block text-[10px] font-semibold ${aktif ? 'text-white/90' : penuh ? 'text-danger' : 'text-brand'}`}>
                        {aktif ? 'Terpilih' : penuh ? 'Penuh' : `Sisa ${s.sisa_kuota}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </article>
          )) : (
            <div className="rounded-2xl bg-white p-12 text-center shadow-card">
              <Stethoscope className="mx-auto size-10 text-ink-muted" />
              <h2 className="mt-3 text-base font-bold text-ink">Belum ada jadwal tersedia</h2>
              <p className="mt-1 text-xs text-ink-muted">Coba ubah filter poli, dokter, atau tanggal.</p>
            </div>
          )}
        </section>

        {/* Ringkasan Janji (_p16) */}
        <aside className="sticky top-24 rounded-2xl bg-white p-5 shadow-card">
          <div className="flex items-center gap-3 border-b border-line pb-4">
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand-light-active text-brand">
              <CalendarDays className="size-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-ink">Ringkasan Janji</h2>
              <p className="text-[11px] text-ink-muted">Periksa kembali rincian booking</p>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="flex justify-between gap-2">
              <span className="text-ink-muted">Poliklinik Tujuan</span>
              <b className="text-right text-ink">{selectedSlotObj?.nama_poli || '—'}</b>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-ink-muted">Dokter Pemeriksa</span>
              <b className="text-right text-ink">{selectedSlotObj?.nama_dokter || '—'}</b>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-ink-muted">Hari &amp; Tanggal</span>
              <b className="text-right text-ink">{selectedSlotObj ? fmtDate(selectedSlotObj.tanggal) : '—'}</b>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-ink-muted">Jam Praktik</span>
              <b className="text-right text-ink">{selectedSlotObj ? `${String(selectedSlotObj.jam).slice(0, 5)} WIB` : '—'}</b>
            </div>
          </div>

          <div className="mt-4 flex gap-2 rounded-xl bg-surface-low p-3 text-[11px] text-ink-soft">
            <Info className="mt-0.5 size-4 shrink-0 text-brand" />
            <span>Pastikan hadir <b>15 menit sebelum</b> jam praktek untuk verifikasi administrasi dan triase perawat.</span>
          </div>

          <Button
            icon={ArrowRight}
            disabled={!selectedSlotObj}
            onClick={konfirmasiBooking}
            className="mt-5 w-full h-11"
          >
            Konfirmasi Booking
          </Button>
        </aside>
      </div>

      {/* Modal Kuota Slot Penuh (_p31) */}
      <Modal open={modalPenuh} onClose={() => setModalPenuh(false)} title="Kuota Slot Penuh" maxWidth="max-w-sm">
        <div className="text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-danger-light text-danger">
            <CalendarX className="size-7" />
          </span>
          <p className="mt-4 text-xs leading-relaxed text-ink-soft">
            Silakan pilih slot jam atau hari lain untuk dokter yang bersangkutan karena batas kapasitas pelayanan telah tercapai.
          </p>
          <Button className="mt-5 w-full" onClick={() => setModalPenuh(false)}>Pilih Jadwal Lain</Button>
        </div>
      </Modal>
    </AppLayout>
  );
}
