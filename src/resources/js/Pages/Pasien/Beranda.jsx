import { CalendarDays, CheckCircle2, Clock3, Ticket, ArrowRight } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/ui/Button';
import Badge from '../../Components/ui/Badge';
import { rute } from '../../lib/rute';

const fmtDate = (v) => new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${v}T00:00:00`));

export default function Beranda({ pasien = {}, jadwal = [] }) {
  const namaDepan = pasien.nama_lengkap?.split(' ')[0] || 'Pasien';

  return (
    <AppLayout role="pasien" title="Beranda Pasien">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink">Selamat datang, {namaDepan}</h1>
          <p className="mt-1 text-xs text-ink-soft">
            Lihat nomor antrean dan jadwal kunjungan Anda.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button href={rute.pasien.penjadwalanPoli} icon={CalendarDays}>Buat Janji Temu</Button>
          <Button href={rute.pasien.riwayatReservasi} variant="outline" icon={Ticket}>Riwayat &amp; Jadwal</Button>
        </div>
      </header>

      {jadwal.length > 0 ? (
        <section className="space-y-4">
          {jadwal.map((item, index) => (
            <article
              key={item.id_reservasi}
              className="grid items-center gap-5 rounded-2xl border-l-4 border-brand bg-white p-6 shadow-card lg:grid-cols-[1fr_auto]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge tone="success"><CheckCircle2 className="size-3.5" /> Kunjungan Terkonfirmasi</Badge>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
                    <CalendarDays className="size-4 text-brand" /> {index === 0 ? 'Kunjungan terdekat' : 'Kunjungan berikutnya'}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-surface-low p-4">
                    <p className="text-[11px] text-ink-muted">Poliklinik</p>
                    <p className="mt-1 text-sm font-bold text-ink">{item.nama_poli}</p>
                  </div>
                  <div className="rounded-xl bg-surface-low p-4">
                    <p className="text-[11px] text-ink-muted">Dokter Spesialis</p>
                    <p className="mt-1 text-sm font-bold text-ink">{item.nama_dokter}</p>
                  </div>
                  <div className="rounded-xl bg-surface-low p-4">
                    <p className="text-[11px] text-ink-muted">Tanggal &amp; Jam Kunjungan</p>
                    <p className="mt-1 text-sm font-bold text-ink">{fmtDate(item.tanggal)}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-soft">
                      <Clock3 className="size-3.5 text-brand" /> {String(item.jam).slice(0, 5)} WIB
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 rounded-2xl bg-surface-low px-6 py-4 text-center">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">NOMOR ANTREAN ANDA</p>
                <div className="inline-flex items-center gap-2 rounded-xl bg-brand-light-active px-4 py-2 text-2xl font-extrabold text-brand-dark">
                  <Ticket className="size-5" /> A-{String(item.nomor_antrean).padStart(3, '0')}
                </div>
                <Button href={`/pasien/reservasi/${item.id_reservasi}`} icon={ArrowRight} className="mt-1 w-full">
                  Lihat Detail
                </Button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="rounded-2xl bg-white p-10 text-center shadow-card">
          <CalendarDays className="mx-auto size-10 text-brand" />
          <h2 className="mt-3 text-lg font-bold text-ink">Belum ada jadwal kunjungan</h2>
          <p className="mt-1 text-xs text-ink-muted">Pilih poli dan jadwal dokter untuk membuat janji temu rawat jalan.</p>
          <Button href={rute.pasien.penjadwalanPoli} className="mt-5">Lihat Jadwal Tersedia</Button>
        </section>
      )}
    </AppLayout>
  );
}
