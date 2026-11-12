// KH-IM-004 | UI-010 | Dasbor Pasien (Beranda) | Penulis: KH
// Sumber desain: Figma node 252:2005. Sumber kebutuhan: Modul 2 bagian 3.7 (UI-010).
// Rute: GET /pasien/dasbor  (routes/fe/kh.php, nama rute: pasien.dasbor)
import { useState } from 'react';
import {
  CheckCircle2,
  CalendarCheck,
  Building2,
  Stethoscope,
  Clock,
  Ticket,
  ArrowRight,
  Plus,
  QrCode,
  Download,
  Map as IkonPeta,
  Share2,
} from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import PageHeader from '../../Components/ui/PageHeader';
import Button from '../../Components/ui/Button';
import Modal from '../../Components/ui/Modal';
import { toast } from '../../Components/ui/Toast';
import { pasienContoh, kunjunganContoh } from '../../data/dasborPasienDummy';

const URL_PENJADWALAN = '/pasien/penjadwalan-poli';

// Contoh: "Kamis, 12 Nov 2026"
const FORMAT_PENDEK = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
// Contoh: "12 Nov 2026"
const FORMAT_TIKET = { day: 'numeric', month: 'short', year: 'numeric' };

// ---------- Fungsi bantu tanggal ----------
function keISO(d) {
  const bulan = String(d.getMonth() + 1).padStart(2, '0');
  const hari = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${bulan}-${hari}`;
}

function hariIniISO() {
  return keISO(new Date());
}

function geserTanggal(iso, n) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return keISO(d);
}

// Tambah "T00:00:00" supaya dibaca sebagai waktu lokal, bukan UTC
function formatTanggal(iso, opsi) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('id-ID', opsi);
}

// Label pada kartu: menandai kunjungan yang paling dekat waktunya
function labelJadwal(tanggal, hariIni) {
  if (tanggal === hariIni) return 'Jadwal Terdekat Hari Ini';
  if (tanggal === geserTanggal(hariIni, 1)) return 'Jadwal Terdekat Besok';
  return 'Jadwal Mendatang';
}

// Fitur yang ada di Figma tetapi belum ada kebutuhannya di Modul 2
function belumTersedia() {
  toast.error('Fitur belum tersedia');
}

export default function DasborPasien({ pasien = pasienContoh, kunjungan = kunjunganContoh }) {
  const [detail, setDetail] = useState(null); // kunjungan yang tiketnya sedang dibuka

  const hariIni = hariIniISO();

  // Kunjungan paling dekat tampil paling atas
  const daftar = [...kunjungan].sort((a, b) =>
    `${a.tanggal} ${a.jam}`.localeCompare(`${b.tanggal} ${b.jam}`)
  );

  return (
    <AppLayout role="pasien" title="Beranda Pasien">
      <div className="space-y-6">
        {/* Banner selamat datang */}
        <div>
          <PageHeader title={`Selamat Datang, ${pasien.nama}`} />
          <p className="-mt-2 text-sm text-ink-soft">
            Kelola layanan rawat jalan, verifikasi nomor antrean klinik, dan pantau informasi
            jadwal konsultasi kesehatan Anda secara real-time.
          </p>
        </div>

        {/* Kartu jadwal kunjungan */}
        {daftar.length === 0 && (
          <div className="rounded-2xl bg-white p-6 shadow-card">
            <p className="text-sm text-ink-soft">Belum ada kunjungan terjadwal.</p>
            <div className="mt-4">
              <Button href={URL_PENJADWALAN}>Buat Janji Temu</Button>
            </div>
          </div>
        )}

        {daftar.map((k) => (
          <article key={k.id} className="rounded-2xl border-l-4 border-brand bg-white p-6 shadow-card">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1.5 rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand">
                    <CheckCircle2 className="h-4 w-4" />
                    Kunjungan Terkonfirmasi
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                    <CalendarCheck className="h-4 w-4" />
                    {labelJadwal(k.tanggal, hariIni)}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <InfoKunjungan
                    ikon={Building2}
                    label="Poliklinik & Ruang"
                    nilai={k.poli}
                    sub={`${k.lokasi} (${k.ruang})`}
                  />
                  <InfoKunjungan
                    ikon={Stethoscope}
                    label="Dokter Spesialis"
                    nilai={k.dokter}
                    sub={`${k.lokasi} (${k.ruang})`}
                  />
                  <InfoKunjungan
                    ikon={Clock}
                    label="Tanggal & Jam Kunjungan"
                    nilai={formatTanggal(k.tanggal, FORMAT_PENDEK)}
                    sub={`${k.jam} WIB • ${k.gedung}`}
                  />
                </div>
              </div>

              {/* Nomor antrean + tombol Lihat Detail */}
              <div className="flex shrink-0 flex-col items-stretch gap-2 lg:w-56 lg:items-end">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Nomor Antrean Anda
                </p>
                <div className="flex items-center justify-center gap-2 rounded-2xl bg-brand-light px-5 py-3 text-xl font-bold text-brand">
                  <Ticket className="h-6 w-6" />
                  {k.nomorAntrean}
                </div>
                <p className="text-xs text-ink-soft lg:text-right">
                  Est. giliran: {k.estimasiDipanggil} WIB
                </p>
                <Button className="mt-2 w-full justify-center" onClick={() => setDetail(k)}>
                  Lihat Detail
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Pop-up detail tiket antrean */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title="Detail Tiket Antrean"
        footer={<Button variant="secondary" onClick={() => setDetail(null)}>Tutup</Button>}
      >
        {detail && (
          <div className="max-h-[70vh] overflow-y-auto">
            <TiketDetail k={detail} pasien={pasien} hariIni={hariIni} />
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}

// Satu kotak informasi pada kartu kunjungan (poli, dokter, atau tanggal & jam)
function InfoKunjungan({ ikon, label, nilai, sub }) {
  const Ikon = ikon;
  return (
    <div className="flex gap-3 rounded-xl bg-surface-low p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-mid text-brand">
        <Ikon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-ink-soft">{label}</p>
        <p className="font-semibold text-ink">{nilai}</p>
        <p className="text-xs text-ink-soft">{sub}</p>
      </div>
    </div>
  );
}

// Tiket Antrean Resmi (isi pop-up Lihat Detail). Semua isinya berasal dari objek kunjungan yang sama.
function TiketDetail({ k, pasien, hariIni }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line border-t-4 border-t-brand bg-white">
      {/* Kepala tiket */}
      <div className="flex items-center gap-3 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
          <Plus className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">Tiket Antrean Resmi</p>
          <p className="text-xs text-ink-soft">RS Citra Medika • Rawat Jalan</p>
        </div>
        <span className="rounded-lg bg-brand-light px-2.5 py-1 text-xs font-semibold text-brand">
          {k.tanggal === hariIni ? 'Hari Ini • ' : ''}
          {formatTanggal(k.tanggal, FORMAT_TIKET)}
        </span>
      </div>

      {/* Nomor antrean */}
      <div className="mx-5 rounded-2xl bg-surface-mid p-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand">
          Nomor Antrean Anda
        </p>
        <p className="text-5xl font-bold text-brand">{k.nomorAntrean}</p>
        <p className="mt-2 flex items-center justify-center gap-2 text-xs text-ink-soft">
          <span className="h-2 w-2 rounded-full bg-brand" />
          Estimasi dipanggil: <strong className="text-ink">{k.estimasiDipanggil} WIB</strong>
        </p>
        <p className="mx-auto mt-2 w-fit rounded-full bg-white px-3 py-1 text-xs text-brand">
          {k.antreanSebelum} antrean sebelum giliran Anda
        </p>
      </div>

      {/* Garis sobekan tiket */}
      <div className="relative my-5">
        <div className="border-t-2 border-dashed border-line" />
        <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-surface-mid" />
        <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-surface-mid" />
      </div>

      {/* Rincian kunjungan */}
      <dl className="space-y-3 px-5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-ink-soft">Nama Pasien</dt>
          <dd className="text-right font-semibold text-ink">
            {pasien.nama}
            <span className="block text-xs font-normal text-ink-soft">NIK: {pasien.nik}</span>
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-soft">Poli & Lokasi</dt>
          <dd className="text-right font-semibold text-ink">
            {k.poli}
            <span className="block text-xs font-normal text-brand">
              {k.lokasi}, {k.ruang}
            </span>
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-soft">Dokter Pemeriksa</dt>
          <dd className="text-right font-semibold text-ink">{k.dokter}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-soft">Waktu Kedatangan</dt>
          <dd className="text-right font-semibold text-ink">
            {k.jam} WIB (Sesi {k.sesi})
          </dd>
        </div>
      </dl>

      {/* QR check-in */}
      <div className="mx-5 mt-5 flex flex-col items-center rounded-xl border border-line p-4">
        <QrCode className="h-24 w-24 text-ink" />
        <p className="mt-2 text-xs text-ink-soft">Pindai di Kios Check-in Rumah Sakit</p>
        <p className="text-xs text-ink-muted">SECURE-TOKEN-{k.nomorAntrean.replace('-', '')}-9921</p>
      </div>

      {/* Tombol aksi */}
      <div className="space-y-2 p-5">
        <Button className="w-full justify-center" onClick={belumTersedia}>
          <Download className="mr-2 h-4 w-4" />
          Unduh E-Tiket (PDF)
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" className="justify-center" onClick={belumTersedia}>
            <IkonPeta className="mr-2 h-4 w-4" />
            Panduan Denah
          </Button>
          <Button variant="secondary" className="justify-center" onClick={belumTersedia}>
            <Share2 className="mr-2 h-4 w-4" />
            Kirim via WA
          </Button>
        </div>
      </div>

      {/* Status antrean berjalan */}
      <div className="flex items-center justify-between bg-brand-light px-5 py-3 text-xs text-ink-soft">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-brand" />
          Sedang melayani: <strong className="text-ink">{k.sedangMelayani}</strong>
        </span>
        <span>Pembaruan auto: 15s</span>
      </div>
    </div>
  );
}