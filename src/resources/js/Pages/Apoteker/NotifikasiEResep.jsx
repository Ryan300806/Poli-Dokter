import { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import {
  ArrowRight, BellRing, BriefcaseMedical, CalendarClock, CheckCheck, ClipboardList,
  FileText, Info, MailCheck, Pill, Search, Stethoscope,
} from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import Pagination from '../../Components/ui/Pagination';
import { rute } from '../../lib/rute';

const PER_HALAMAN = 2;

function formatTanggal(nilai) {
  if (!nilai) return 'Waktu tidak tersedia';
  const tanggal = new Date(nilai);
  if (Number.isNaN(tanggal.getTime())) return 'Waktu tidak tersedia';

  return tanggal.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }) + ' WIB';
}

function nadaStatus(status) {
  switch (status) {
    case 'Menunggu Telaah Resep':
      return 'success';
    case 'Perlu Diracik':
      return 'info';
    case 'Siap Diserahkan':
    case 'Obat Sudah Diberikan':
      return 'success';
    case 'Ditolak':
      return 'danger';
    default:
      return 'neutral';
  }
}

function KartuStat({ label, nilai, satuan, detail, ikon: Ikon, disorot = false }) {
  return (
    <article className={`flex h-[114px] items-center justify-between rounded-xl bg-white px-[15px] py-3 shadow-card ${disorot ? 'border-l-[5px] border-brand' : ''}`}>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase leading-4 tracking-[0.35px] text-ink-muted">{label}</p>
        <p className="mt-1 flex items-baseline gap-2">
          <span className={`text-[32px] font-bold leading-[36px] ${disorot ? 'text-brand-dark' : 'text-ink'}`}>{nilai}</span>
          {satuan && <span className="text-xs font-semibold text-ink-soft">{satuan}</span>}
        </p>
        <p className={`mt-1 flex items-center gap-1 text-[11px] leading-4 ${disorot ? 'font-semibold text-brand-dark' : 'text-ink-muted'}`}>
          <Info className="size-3.5 shrink-0" />
          <span className="truncate">{detail}</span>
        </p>
      </div>
      <span className={`ml-2 flex size-[44px] shrink-0 items-center justify-center rounded-xl ${disorot ? 'bg-brand-light-active text-brand-dark' : 'bg-surface-mid text-ink-soft'}`}>
        <Ikon className="size-5" />
      </span>
    </article>
  );
}

export default function NotifikasiEResep({ resepServer }) {
  const resep = Array.isArray(resepServer) ? resepServer : [];
  const [kata, setKata] = useState('');
  const [halaman, setHalaman] = useState(1);

  const hasil = useMemo(() => {
    const q = kata.trim().toLocaleLowerCase('id-ID');
    return resep.filter((item) => {
      if (!q) return true;
      const teksCari = `${item.pasien ?? ''} ${item.id ?? ''} ${item.pasienId ?? ''} ${item.dokter ?? ''} ${item.poli ?? ''}`;
      return teksCari.toLocaleLowerCase('id-ID').includes(q);
    });
  }, [resep, kata]);

  const sekarang = new Date();
  const awalHariIni = new Date(sekarang.getFullYear(), sekarang.getMonth(), sekarang.getDate());
  const awalBesok = new Date(sekarang.getFullYear(), sekarang.getMonth(), sekarang.getDate() + 1);
  const jumlahHariIni = resep.filter((item) => {
    if (!item.tanggal) return false;
    const tanggal = new Date(item.tanggal);
    return !Number.isNaN(tanggal.getTime()) && tanggal >= awalHariIni && tanggal < awalBesok;
  }).length;
  const jumlahPerluDiracik = resep.filter((item) => item.status === 'Perlu Diracik').length;
  const totalHalaman = Math.max(1, Math.ceil(hasil.length / PER_HALAMAN));
  const halamanAman = Math.min(halaman, totalHalaman);
  const baris = hasil.slice((halamanAman - 1) * PER_HALAMAN, halamanAman * PER_HALAMAN);

  function bukaResep(item) {
    router.visit(rute.apoteker.rincianEResep(item.id));
  }

  return (
    <AppLayout
      role="apoteker"
      title="Notifikasi E-Resep"
      apotekerNotifikasi
      contentClassName="pl-[21px] pr-[90px] max-[900px]:pl-5 max-[900px]:pr-5"
    >
      <div className="w-full space-y-6">
        <header className="flex min-h-[72px] flex-wrap items-start justify-between gap-3 pt-1">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="!px-[10px] !py-[3px] !text-[9px] !leading-3" tone="success">
                Farmasi Rawat Jalan
              </Badge>
              <span className="text-[10px] text-ink-muted">Data E-Resep dari database</span>
            </div>
            <h1 className="mt-1 text-[27px] font-bold leading-8 tracking-[-0.5px] text-ink">
              Notifikasi E-Resep
            </h1>
          </div>
          <Badge className="mt-1" tone="neutral" dot>Data diperbarui saat halaman dibuka</Badge>
        </header>

        <section className="grid grid-cols-1 gap-[14px] sm:grid-cols-3" aria-label="Ringkasan E-Resep">
          <KartuStat
            label="Total Notifikasi Hari Ini"
            nilai={jumlahHariIni}
            satuan="Resep"
            detail="Berdasarkan waktu kirim resep"
            ikon={BellRing}
          />
          <KartuStat
            label="E-Resep Belum Dibaca"
            nilai="—"
            satuan=""
            detail="Status baca belum tersedia"
            ikon={MailCheck}
            disorot
          />
          <KartuStat
            label="Menunggu Peracikan"
            nilai={jumlahPerluDiracik}
            satuan="Resep"
            detail="Status: Perlu Diracik"
            ikon={BriefcaseMedical}
          />
        </section>

        <section className="rounded-xl bg-white p-[14px] shadow-card" aria-label="Filter dan pencarian">
          <div className="flex min-h-[38px] flex-wrap items-center gap-2">
            <div className="flex shrink-0 items-center gap-1.5" role="group" aria-label="Filter status baca">
              <button
                type="button"
                aria-pressed="true"
                className="h-[34px] rounded-lg bg-brand-light-active px-3 text-xs font-semibold text-brand-dark transition-colors"
              >
                Semua
              </button>
              <button
                type="button"
                disabled
                title="Filter status baca belum tersedia dari backend."
                className="h-[34px] cursor-not-allowed rounded-lg bg-surface-low px-3 text-[11px] text-ink-muted opacity-60"
              >
                Belum Dibaca
              </button>
              <button
                type="button"
                disabled
                title="Filter status baca belum tersedia dari backend."
                className="h-[34px] cursor-not-allowed rounded-lg bg-surface-low px-3 text-[11px] text-ink-muted opacity-70"
              >
                Sudah Dibaca
              </button>
            </div>

            <label className="relative min-w-[210px] flex-1">
              <span className="sr-only">Cari E-Resep</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
              <input
                type="search"
                value={kata}
                onChange={(event) => {
                  setKata(event.target.value);
                  setHalaman(1);
                }}
                placeholder="Cari nama pasien atau ID E-Resep..."
                className="h-[36px] w-full rounded-lg bg-surface-low pl-9 pr-3 text-xs text-ink outline-none placeholder:text-ink-muted transition-colors hover:bg-surface-mid focus:ring-2 focus:ring-brand/30"
              />
            </label>

            <Button
              variant="ghost"
              icon={CheckCheck}
              className="h-[36px] whitespace-nowrap px-2 text-xs text-brand-dark opacity-70"
              disabled
              title="Status baca notifikasi belum didukung backend."
            >
              Tandai Semua Dibaca
            </Button>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-[10px] text-ink-muted">
            <Info className="size-3 shrink-0" />
            Status baca belum didukung backend; tab tersebut tidak mengubah daftar resep.
          </p>
        </section>

        <section className="space-y-[13px]" aria-label="Daftar E-Resep">
          {baris.map((item) => {
            const jumlahItem = Array.isArray(item.items) ? item.items.length : 0;
            const status = item.status || 'Status tidak tersedia';

            return (
              <article
                key={item.id}
                className="flex min-h-[156px] flex-wrap items-center justify-between gap-x-4 gap-y-3 rounded-xl border-l-[5px] border-brand bg-white px-6 py-[18px] shadow-card transition-shadow hover:shadow-md sm:flex-nowrap"
              >
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <span className="mt-0.5 flex size-[44px] shrink-0 items-center justify-center rounded-xl bg-brand-light-active text-brand-dark">
                    <ClipboardList className="size-[22px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <h2 className="text-[17px] font-bold leading-5 text-ink">E-Resep diterima</h2>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-dark">
                        <CalendarClock className="size-4 shrink-0" />
                        {formatTanggal(item.tanggal)}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-x-5 gap-y-2 text-[11px] text-ink-soft sm:grid-cols-3">
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span className="shrink-0">Pasien:</span>
                        <b className="truncate font-semibold text-ink">{item.pasien || 'Tidak tersedia'}</b>
                      </span>
                      <span className="flex min-w-0 items-center gap-1.5">
                        <Stethoscope className="size-3.5 shrink-0 text-ink-muted" />
                        <span className="shrink-0">Dokter:</span>
                        <b className="truncate font-semibold text-ink">{item.dokter || 'Tidak tersedia'}</b>
                      </span>
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span className="shrink-0">Poli:</span>
                        <Badge className="max-w-full truncate !px-2 !py-[3px] !text-[9px] !leading-3" tone="neutral">
                          {item.poli || 'Belum tercatat'}
                        </Badge>
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-ink-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <FileText className="size-3.5" />
                        ID Resep: {item.id || 'Tidak tersedia'}
                      </span>
                      <span aria-hidden="true" className="text-brand-light-active">•</span>
                      <span className="inline-flex items-center gap-1.5">
                        <Pill className="size-3.5" />
                        {jumlahItem} jenis obat
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex w-full shrink-0 flex-row items-center justify-between gap-3 pl-[60px] sm:w-auto sm:flex-col sm:items-end sm:pl-0">
                  <Badge className="!px-2.5 !py-1 !text-[10px] !leading-3" tone={nadaStatus(item.status)} dot>
                    {status}
                  </Badge>
                  <Button
                    icon={ArrowRight}
                    className="h-[38px] whitespace-nowrap px-[15px] text-xs"
                    onClick={() => bukaResep(item)}
                  >
                    Buka E-Resep
                  </Button>
                </div>
              </article>
            );
          })}

          {baris.length === 0 && (
            <div className="rounded-xl bg-white px-6 py-12 text-center shadow-card">
              <FileText className="mx-auto size-8 text-ink-muted" />
              <p className="mt-3 text-sm font-semibold text-ink">
                {resep.length === 0 ? 'Belum ada E-Resep' : 'E-Resep tidak ditemukan'}
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                {resep.length === 0
                  ? 'E-Resep yang masuk dari database akan ditampilkan di sini.'
                  : 'Coba kata kunci atau filter status yang berbeda.'}
              </p>
            </div>
          )}
        </section>

        {totalHalaman > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] text-ink-muted">
            <span>
              Menampilkan {baris.length} dari {hasil.length} resep · Halaman {halamanAman} dari {totalHalaman}
            </span>
            <Pagination halaman={halamanAman} totalHalaman={totalHalaman} onUbah={setHalaman} />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
