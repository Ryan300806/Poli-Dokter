import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { CalendarDays, CheckCircle2, Clock3, Download, Info, QrCode, RefreshCw, Search, Ticket, XCircle } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/ui/Button';
import Badge from '../../Components/ui/Badge';
import Modal from '../../Components/ui/Modal';
import { rute } from '../../lib/rute';

const fmtDate = (v) => new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${v}T00:00:00`));
const TABS = { aktif: 'Aktif & Mendatang', selesai: 'Riwayat Selesai', dibatalkan: 'Dibatalkan' };

export default function RiwayatReservasi({ reservasi = [], tab = 'aktif', slots = [] }) {
  const { props } = usePage();
  const { errors = {}, flash = {}, auth = {} } = props;
  const bookingSuccess = flash.bookingSuccess || null;

  const [cari, setCari] = useState('');
  const [tiketAktif, setTiketAktif] = useState(reservasi[0] || null);
  const [ubahItem, setUbahItem] = useState(null);
  const [slotBaru, setSlotBaru] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(Boolean(bookingSuccess));

  const filtered = reservasi.filter((r) => `${r.nama_dokter} ${r.nama_poli}`.toLowerCase().includes(cari.toLowerCase()));
  const tiket = tiketAktif && filtered.some((x) => x.id_reservasi === tiketAktif.id_reservasi) ? tiketAktif : filtered[0];

  function pindahTab(key) {
    router.get(rute.pasien.riwayatReservasi, { status: key }, { preserveScroll: true, preserveState: true });
  }

  function batalkan(id) {
    if (window.confirm('Batalkan reservasi ini? Kuota slot dokter akan dikembalikan secara otomatis.')) {
      router.delete(rute.pasien.batalkanReservasi(id), { preserveScroll: true });
    }
  }

  function simpanUbah() {
    if (!ubahItem || !slotBaru) return;
    router.put(rute.pasien.ubahReservasi(ubahItem.id_reservasi), { id_slot: Number(slotBaru) }, {
      preserveScroll: true,
      onSuccess: () => { setUbahItem(null); setSlotBaru(''); },
    });
  }

  return (
    <AppLayout role="pasien" title="Riwayat Reservasi">
      <header>
        <h1 className="text-3xl font-extrabold text-ink">Riwayat Reservasi</h1>
        <p className="mt-1 text-xs text-ink-soft">Kelola jadwal kunjungan dan pantau tiket antrean aktif Anda secara real-time.</p>
      </header>

      {/* Tabs + Search (_p17, _p18, _p19) */}
      <section className="flex flex-wrap items-center gap-3 rounded-2xl bg-white px-4 py-2 shadow-card">
        <div className="flex flex-wrap gap-1">
          {Object.entries(TABS).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => pindahTab(key)}
              className={`border-b-2 px-4 py-3 text-xs font-bold transition cursor-pointer ${
                tab === key ? 'border-brand text-brand' : 'border-transparent text-ink-soft hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="relative ml-auto w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
          <input
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari dokter atau poli..."
            className="h-9 w-full rounded-xl bg-surface-input pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-brand/30"
          />
        </label>
      </section>

      {tab === 'aktif' && (
        <div className="flex items-start gap-2.5 rounded-2xl bg-surface-mid/70 px-4 py-3 text-xs text-ink-soft">
          <Info className="mt-0.5 size-4 shrink-0 text-ink" />
          <div>
            <b className="text-ink">Ketentuan Perubahan &amp; Pembatalan Jadwal</b>
            <p className="mt-0.5">Pembatalan atau pergantian jadwal paling lambat dilakukan <b>2 jam</b> sebelum sesi poli dimulai.</p>
          </div>
        </div>
      )}

      {(errors.id_slot || errors.alasan) && (
        <p role="alert" className="rounded-xl bg-danger-light px-4 py-3 text-xs font-semibold text-danger">
          {errors.id_slot || errors.alasan}
        </p>
      )}

      <div className={tab === 'aktif' && tiket ? 'grid items-start gap-6 xl:grid-cols-[1fr_370px]' : 'space-y-4'}>
        {/* Daftar Kartu Reservasi */}
        <section className="space-y-4">
          {filtered.length > 0 ? filtered.map((item) => (
            <article
              key={item.id_reservasi}
              onClick={() => setTiketAktif(item)}
              className={`cursor-pointer rounded-2xl border-l-4 bg-white p-5 shadow-card transition ${
                tab === 'dibatalkan' ? 'border-danger' : 'border-brand'
              } ${tiket?.id_reservasi === item.id_reservasi && tab === 'aktif' ? 'ring-2 ring-brand/25' : ''}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge tone={tab === 'dibatalkan' ? 'danger' : 'success'} dot>
                    {tab === 'aktif' ? 'Aktif' : tab === 'selesai' ? 'Selesai Diperiksa' : 'Dibatalkan'}
                  </Badge>
                  <span className="text-[11px] font-semibold text-ink-muted">#REG-{String(item.id_reservasi).padStart(4, '0')}</span>
                </div>
                <span className="text-xs font-semibold text-ink-soft">{fmtDate(item.tanggal)} • {String(item.jam).slice(0, 5)} WIB</span>
              </div>

              <div className="mt-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-brand">{item.nama_poli}</p>
                <h2 className="mt-0.5 text-base font-bold text-ink">{item.nama_dokter}</h2>
                {item.nama_diagnosis && (
                  <p className="mt-1 text-xs text-ink-soft"><b>Diagnosis:</b> {item.nama_diagnosis}</p>
                )}
              </div>

              {tab === 'aktif' && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                  <span className="text-xs font-semibold text-ink-soft">
                    Nomor Antrean: <b className="text-brand">A-{String(item.nomor_antrean).padStart(3, '0')}</b> ({item.status_antrean || 'menunggu'})
                  </span>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button variant="softDanger" icon={XCircle} onClick={() => batalkan(item.id_reservasi)}>Batalkan</Button>
                    <Button variant="softBrand" icon={RefreshCw} onClick={() => { setUbahItem(item); setSlotBaru(''); }}>Ubah Jadwal</Button>
                  </div>
                </div>
              )}

              {tab === 'selesai' && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                  <Badge tone="neutral">{item.nama_diagnosis ? 'Diagnosis Tersedia' : 'Kunjungan Selesai'}</Badge>
                  <Button href={rute.pasien.penjadwalanPoli} icon={RefreshCw}>Reservasi Ulang</Button>
                </div>
              )}
            </article>
          )) : (
            <div className="rounded-2xl bg-white p-12 text-center shadow-card">
              <Ticket className="mx-auto size-10 text-ink-muted" />
              <p className="mt-3 text-sm font-bold text-ink">Belum ada data reservasi pada tab ini</p>
            </div>
          )}
        </section>

        {/* Tiket Antrean Resmi (_p15 / _p17) */}
        {tab === 'aktif' && tiket && (
          <aside className="overflow-hidden rounded-2xl bg-white shadow-card">
            <div className="h-2 bg-brand" />
            <div className="p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-brand-light-active text-brand">
                    <Ticket className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-ink">Tiket Antrean Resmi</h3>
                    <p className="text-[10px] text-ink-muted">RS Citra Medika • Rawat Jalan</p>
                  </div>
                </div>
                <Badge tone="success">{tiket.tanggal}</Badge>
              </div>

              <div className="mt-4 rounded-2xl bg-surface-low px-4 py-5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand">NOMOR ANTREAN ANDA</p>
                <p className="mt-1 text-4xl font-extrabold text-brand">A-{String(tiket.nomor_antrean).padStart(3, '0')}</p>
                <p className="mt-1.5 text-[11px] text-ink-soft">Status: <b>{tiket.status_antrean || 'menunggu'}</b></p>
              </div>

              <div className="my-4 border-t-2 border-dashed border-line" />

              <div className="space-y-2.5 text-xs">
                <p className="flex justify-between"><span className="text-ink-muted">Nama Pasien</span><b>{auth.user?.nama || 'Pasien'}</b></p>
                <p className="flex justify-between"><span className="text-ink-muted">Poli</span><b>{tiket.nama_poli}</b></p>
                <p className="flex justify-between"><span className="text-ink-muted">Dokter</span><b>{tiket.nama_dokter}</b></p>
                <p className="flex justify-between"><span className="text-ink-muted">Waktu Kunjungan</span><b>{String(tiket.jam).slice(0, 5)} WIB</b></p>
              </div>

              <div className="mt-5 rounded-xl border border-line p-4 text-center">
                <QrCode className="mx-auto size-16 text-ink" />
                <p className="mt-2 text-[11px] font-bold text-ink-soft">{tiket.kode_tiket}</p>
                <p className="text-[10px] text-ink-muted">Tunjukkan kode ini saat check-in di loket poli.</p>
              </div>

              <Button icon={Download} className="mt-4 w-full" onClick={() => window.print()}>
                Unduh / Cetak E-Tiket
              </Button>
            </div>
          </aside>
        )}
      </div>

      {/* Modal Ubah Jadwal */}
      <Modal
        open={Boolean(ubahItem)}
        onClose={() => setUbahItem(null)}
        title="Ubah Jadwal Kunjungan"
        subtitle={ubahItem ? `${ubahItem.nama_poli} — ${ubahItem.nama_dokter}` : ''}
        icon={CalendarDays}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setUbahItem(null)}>Batal</Button>
            <Button onClick={simpanUbah} disabled={!slotBaru}>Simpan Jadwal Baru</Button>
          </>
        )}
      >
        <label className="block text-xs font-bold text-ink">
          Pilih Slot Jadwal Pengganti
          <select
            value={slotBaru}
            onChange={(e) => setSlotBaru(e.target.value)}
            className="mt-2 h-11 w-full rounded-xl bg-surface-input px-3 text-xs outline-none focus:ring-2 focus:ring-brand/30"
          >
            <option value="">-- Pilih Jadwal Tersedia --</option>
            {slots.map((s) => (
              <option key={s.id_slot} value={s.id_slot}>
                {s.nama_poli} — {s.nama_dokter} ({s.tanggal} • {String(s.jam).slice(0, 5)} | Sisa {s.sisa_kuota})
              </option>
            ))}
          </select>
        </label>
      </Modal>

      {/* Modal Berhasil Booking (_p29) */}
      <Modal open={showBookingModal && Boolean(bookingSuccess)} onClose={() => setShowBookingModal(false)} title="Berhasil Booking" maxWidth="max-w-sm">
        {bookingSuccess && (
          <div className="text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-light-active text-brand">
              <CheckCircle2 className="size-8" />
            </span>
            <p className="mt-3 text-xs text-ink-soft">Janji temu Anda telah terkonfirmasi oleh sistem rawat jalan.</p>
            <div className="mt-4 rounded-2xl border border-dashed border-brand/40 bg-surface-low p-4 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-ink-muted">NOMOR ANTREAN POLI</span>
                <Badge tone="success">Tervalidasi</Badge>
              </div>
              <p className="mt-1 text-3xl font-extrabold text-brand">A-{String(bookingSuccess.nomor_antrean).padStart(3, '0')}</p>
              <div className="mt-3 space-y-1 border-t border-line pt-2 text-xs">
                <p className="flex justify-between"><span className="text-ink-muted">Poli:</span><b>{bookingSuccess.nama_poli}</b></p>
                <p className="flex justify-between"><span className="text-ink-muted">Dokter:</span><b>{bookingSuccess.nama_dokter}</b></p>
                <p className="flex justify-between"><span className="text-ink-muted">Waktu:</span><b>{bookingSuccess.tanggal} • {bookingSuccess.jam} WIB</b></p>
              </div>
            </div>
            <Button className="mt-5 w-full" onClick={() => setShowBookingModal(false)}>Lihat Tiket Antrean</Button>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
