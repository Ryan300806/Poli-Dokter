// KH-IM-002 | UI-008 | Riwayat Reservasi / Tiket Antrean | Penulis: KH
// Sumber desain: Figma node 251:500, 119:70, 119:388. Sumber kebutuhan: Modul 2 bagian 3.7 (UI-008).
// Rute: GET /pasien/riwayat-reservasi  (routes/fe/kh.php, nama rute: pasien.riwayat-reservasi)
import { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Info,
  MapPin,
  ShieldCheck,
  XCircle,
  Clock,
  CheckCircle2,
  RotateCcw,
  FileText,
  QrCode,
  Download,
  Map as IkonPeta,
  Share2,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import PageHeader from '../../Components/ui/PageHeader';
import Button from '../../Components/ui/Button';
import Modal from '../../Components/ui/Modal';
import { toast } from '../../Components/ui/Toast';
import { reservasiContoh, pasienContoh } from '../../data/riwayatReservasiDummy';

const URL_PENJADWALAN = '/pasien/penjadwalan-poli';

const TAB = [
  { kunci: 'aktif', label: 'Aktif & Mendatang' },
  { kunci: 'selesai', label: 'Riwayat Selesai' },
  { kunci: 'dibatalkan', label: 'Dibatalkan' },
];

// Pesan daftar kosong per tab
const PESAN_KOSONG = {
  aktif: 'Belum ada reservasi aktif',
  selesai: 'Belum ada riwayat reservasi selesai',
  dibatalkan: 'Belum ada reservasi yang dibatalkan',
};

const FORMAT_PANJANG = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
const FORMAT_SEDANG = { day: 'numeric', month: 'long', year: 'numeric' };
const FORMAT_PENDEK = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };

// Tanggal hari ini dalam format YYYY-MM-DD
function hariIniISO() {
  const d = new Date();
  const bulan = String(d.getMonth() + 1).padStart(2, '0');
  const hari = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${bulan}-${hari}`;
}

// Tambah "T00:00:00" supaya dibaca sebagai waktu lokal, bukan UTC
function formatTanggal(iso, opsi) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('id-ID', opsi);
}

// Fitur yang ada di Figma tetapi belum ada kebutuhannya di Modul 2
function belumTersedia() {
  toast.error('Fitur belum tersedia');
}

export default function RiwayatReservasi({ reservasi = reservasiContoh, pasien = pasienContoh }) {
  const [daftar, setDaftar] = useState(reservasi);
  const [tab, setTab] = useState('aktif');
  const [kata, setKata] = useState('');
  const [tampilFilter, setTampilFilter] = useState(false);
  const [urut, setUrut] = useState('terbaru');
  const [idTiket, setIdTiket] = useState(null); // reservasi aktif yang tiketnya ditampilkan
  const [reservasiBatal, setReservasiBatal] = useState(null); // reservasi yang akan dibatalkan

  const hariIni = hariIniISO();
  const kataKecil = kata.trim().toLowerCase();

  // Daftar kartu pada tab terpilih: disaring status + kata kunci (dokter/poli), lalu diurutkan
  const daftarTab = daftar
    .filter((r) => r.status === tab)
    .filter(
      (r) =>
        kataKecil === '' ||
        r.dokter.toLowerCase().includes(kataKecil) ||
        r.poli.toLowerCase().includes(kataKecil)
    )
    .sort((a, b) => {
      const waktuA = `${a.tanggal} ${a.jam}`;
      const waktuB = `${b.tanggal} ${b.jam}`;
      return urut === 'terbaru' ? waktuB.localeCompare(waktuA) : waktuA.localeCompare(waktuB);
    });

  const adaDataDiTab = daftar.some((r) => r.status === tab);
  const tiket = tab === 'aktif' ? daftarTab.find((r) => r.id === idTiket) ?? daftarTab[0] ?? null : null;

  function ubahTab(kunci) {
    setTab(kunci);
    setKata('');
  }

  // Padanan batalkanReservasi(idReservasi) di Modul 2. Nanti diproses BE.
  function konfirmasiBatal() {
    // Jalur 1: tidak ada reservasi yang dipilih
    if (!reservasiBatal) {
      toast.error('Gagal Membatalkan Jadwal');
      return;
    }

    // Jalur 2: status reservasi menjadi "dibatalkan" dan slot dibuka kembali
    setDaftar((lama) =>
      lama.map((r) => (r.id === reservasiBatal.id ? { ...r, status: 'dibatalkan' } : r))
    );
    toast.success('Reservasi Berhasil Dibatalkan');
    setReservasiBatal(null);
  }

  return (
    <AppLayout role="pasien" title="Riwayat Reservasi">
            <PageHeader title="Riwayat Reservasi" />
      <p className="-mt-2 text-sm text-ink-soft">
        Kelola jadwal kunjungan dan pantau tiket antrean aktif Anda secara real-time
      </p>

      {/* Semua bagian di bawah memakai jarak seragam 24px (space-y-6) */}
      <div className="mt-6 space-y-6">
        {/* Tab, pencarian, dan filter */}
        <section className="rounded-2xl bg-white px-6 shadow-card">
          <div className="flex flex-wrap items-stretch justify-between gap-x-6">
            <nav className="flex gap-8">
              {TAB.map((t) => (
                <button
                  key={t.kunci}
                  type="button"
                  onClick={() => ubahTab(t.kunci)}
                  className={`-mb-px flex items-center border-b-2 py-4 text-sm font-semibold ${
                    tab === t.kunci
                      ? 'border-brand text-brand'
                      : 'border-transparent text-ink-soft hover:text-ink'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                <input
                  type="text"
                  value={kata}
                  onChange={(e) => setKata(e.target.value)}
                  placeholder="Cari dokter atau poli.."
                  className="h-10 w-64 rounded-lg bg-surface-mid pl-9 pr-3 text-sm text-ink outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <button
                type="button"
                onClick={() => setTampilFilter((b) => !b)}
                className="flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-semibold text-ink hover:border-brand"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filter
              </button>
            </div>
          </div>

          {tampilFilter && (
            <div className="flex items-center gap-3 border-t border-line py-3 text-sm">
              <span className="text-ink-soft">Urutkan:</span>
              <select
                value={urut}
                onChange={(e) => setUrut(e.target.value)}
                className="h-9 rounded-lg border border-line bg-white px-3 text-sm text-ink"
              >
                <option value="terbaru">Terbaru</option>
                <option value="terlama">Terlama</option>
              </select>
            </div>
          )}
        </section>

        {/* Ketentuan perubahan & pembatalan jadwal (hanya di tab aktif) */}
        {tab === 'aktif' && (
          <div className="flex gap-3 rounded-2xl bg-surface-mid p-4 text-sm">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
            <div>
              <p className="font-semibold text-ink">Ketentuan Perubahan & Pembatalan Jadwal</p>
              <p className="text-xs text-ink-soft">
                Pembatalan atau pergantian jadwal paling lambat dilakukan <strong>2 jam</strong>{' '}
                sebelum sesi poli dimulai. Keterlambatan lebih dari 30 menit dari jadwal tiket
                berpotensi menggeser urutan antrean Anda ke antrean susulan.
              </p>
            </div>
          </div>
        )}

        {/* Daftar reservasi + panel tiket */}
        <div className={tab === 'aktif' && tiket ? 'grid grid-cols-1 gap-6 lg:grid-cols-2' : ''}>
          <div className="space-y-4">
            {daftarTab.length === 0 && (
              <div className="rounded-2xl bg-white p-6 text-sm text-ink-soft shadow-card">
                {adaDataDiTab ? 'Reservasi tidak ditemukan' : PESAN_KOSONG[tab]}
              </div>
            )}

            {daftarTab.map((r) =>
              r.status === 'aktif' ? (
                <KartuAktif
                  key={r.id}
                  r={r}
                  hariIni={hariIni}
                  dipilih={tiket?.id === r.id}
                  onLihatTiket={() => setIdTiket(r.id)}
                  onBatalkan={() => setReservasiBatal(r)}
                />
              ) : (
                <KartuRiwayat key={r.id} r={r} />
              )
            )}
          </div>

          {tab === 'aktif' && tiket && <TiketAntrean r={tiket} pasien={pasien} hariIni={hariIni} />}
        </div>
      </div>

      {/* Pop-up konfirmasi pembatalan (isi mengikuti UI-018).
          TODO: setelah BatalReservasiModal milik RG selesai, ganti blok Modal ini dengan komponennya
          dan samakan props-nya dengan RG. */}
      <Modal
        open={!!reservasiBatal}
        onClose={() => setReservasiBatal(null)}
        title="Batalkan Reservasi?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setReservasiBatal(null)}>Kembali</Button>
            <Button onClick={konfirmasiBatal}>Ya, Batalkan Reservasi</Button>
          </>
        }
      >
        {reservasiBatal && (
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-danger" />
              <p className="text-ink">Apakah Anda yakin ingin membatalkan reservasi berikut?</p>
            </div>
            <dl className="space-y-2 rounded-xl bg-surface-low p-4">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Kode Reservasi</dt>
                <dd className="font-medium text-ink">#{reservasiBatal.kode}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Nama Pasien</dt>
                <dd className="font-medium text-ink">{pasien.nama}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Poliklinik</dt>
                <dd className="font-medium text-ink">{reservasiBatal.poli}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Dokter Pemeriksa</dt>
                <dd className="font-medium text-ink">{reservasiBatal.dokter}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Tanggal & Jam</dt>
                <dd className="font-medium text-ink">
                  {formatTanggal(reservasiBatal.tanggal, FORMAT_SEDANG)}, {reservasiBatal.jam} WIB
                </dd>
              </div>
            </dl>
            <p className="rounded-xl bg-danger-light p-3 text-xs text-danger">
              Reservasi yang dibatalkan tidak dapat dikembalikan dan slot akan dibuka kembali untuk
              pasien lain.
            </p>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}

// Foto dokter diganti inisial karena belum ada gambar. abu = tampilan reservasi dibatalkan.
function Avatar({ nama, abu = false }) {
  const huruf = nama.replace(/^(dr\.|drg\.)\s*/i, '').charAt(0);
  return (
    <div
      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-semibold ${
        abu ? 'bg-surface-mid text-ink-muted' : 'bg-brand-light text-brand'
      }`}
    >
      {huruf}
    </div>
  );
}

// Kartu reservasi pada tab Aktif & Mendatang
function KartuAktif({ r, hariIni, dipilih, onLihatTiket, onBatalkan }) {
  const hariIniKah = r.tanggal === hariIni;
  return (
    <article
      className={`rounded-2xl border-l-4 border-brand bg-white p-5 shadow-card ${
        dipilih ? 'ring-2 ring-brand' : ''
      }`}
    >
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="flex items-center gap-1 rounded-full bg-brand-light px-2 py-0.5 font-medium text-brand">
          <CheckCircle2 className="h-3 w-3" />
          {hariIniKah ? 'Aktif Hari Ini' : 'Mendatang'}
        </span>
        <span className="text-ink-soft">#{r.kode}</span>
        <span className="ml-auto flex items-center gap-1 rounded-full bg-surface-mid px-2 py-0.5 text-ink-soft">
          <MapPin className="h-3 w-3" />
          {r.lokasi} ({r.ruang})
        </span>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <Avatar nama={r.dokter} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">
            {r.poli} <span className="text-ink-muted">• {r.spesialis}</span>
          </p>
          <h3 className="font-semibold text-ink">{r.dokter}</h3>
          <p className="text-xs text-ink-soft">{r.keterangan}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 rounded-xl bg-surface-low p-3 text-xs">
        <div>
          <p className="text-ink-muted">Hari & Tanggal</p>
          <p className="font-semibold text-ink">{formatTanggal(r.tanggal, FORMAT_PENDEK)}</p>
        </div>
        <div>
          <p className="text-ink-muted">Waktu Periksa</p>
          <p className="font-semibold text-ink">{r.jam} WIB ({r.sesi})</p>
        </div>
        <div>
          <p className="text-ink-muted">Status Kedatangan</p>
          <p className="flex items-center gap-1 font-semibold text-brand">
            <UserCheck className="h-3.5 w-3.5" />
            {r.statusKedatangan}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 text-xs text-ink-soft">
          <ShieldCheck className="h-3.5 w-3.5 text-brand" />
          Jaminan {r.jaminan}
        </span>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={onLihatTiket}>Lihat Tiket Antrean</Button>
          <Button size="sm" variant="secondary" onClick={onBatalkan}>
            <XCircle className="mr-1 h-3.5 w-3.5" />
            Batalkan
          </Button>
          <Button size="sm" href={URL_PENJADWALAN}>
            <Clock className="mr-1 h-3.5 w-3.5" />
            Ubah Jadwal
          </Button>
        </div>
      </div>
    </article>
  );
}

// Kartu reservasi pada tab Riwayat Selesai dan Dibatalkan
function KartuRiwayat({ r }) {
  const batal = r.status === 'dibatalkan';
  return (
    <article className="rounded-2xl bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {batal ? (
          <span className="rounded-full bg-danger-light px-2 py-0.5 font-medium text-danger">
            Dibatalkan
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded-full bg-surface-mid px-2 py-0.5 font-medium text-ink-soft">
            <CheckCircle2 className="h-3 w-3" />
            Selesai Diperiksa
          </span>
        )}
        <span className="font-medium text-ink-soft">#{r.kode}</span>
        <span className="ml-auto font-semibold text-ink">
          {formatTanggal(r.tanggal, FORMAT_SEDANG)} • {r.jam} WIB
        </span>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <Avatar nama={r.dokter} abu={batal} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{r.poli}</p>
          <h3 className="font-semibold text-ink">{r.dokter}</h3>
          <p className="text-xs text-ink-muted">{r.keterangan}</p>
        </div>
      </div>

      {!batal && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
          {r.adaDiagnosis && (
            <span className="flex items-center gap-1 rounded bg-brand-light px-2 py-0.5 text-xs text-brand">
              <FileText className="h-3 w-3" />
              Diagnosis & Resep Tersedia
            </span>
          )}
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="secondary" onClick={belumTersedia}>
              <FileText className="mr-1 h-3.5 w-3.5" />
              Catatan Medis
            </Button>
            <Button size="sm" href={URL_PENJADWALAN}>
              <RotateCcw className="mr-1 h-3.5 w-3.5" />
              Reservasi Ulang
            </Button>
          </div>
        </div>
      )}
    </article>
  );
}

// Panel Tiket Antrean Resmi di sebelah kanan (tab Aktif)
function TiketAntrean({ r, pasien, hariIni }) {
  return (
    <aside className="h-fit overflow-hidden rounded-2xl border-t-4 border-brand bg-white shadow-card">
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">Tiket Antrean Resmi</p>
            <p className="text-xs text-ink-soft">RS Citra Medika • Rawat Jalan</p>
          </div>
          <span className="rounded-lg bg-brand-light px-2 py-1 text-xs font-medium text-brand">
            {r.tanggal === hariIni ? 'Hari Ini • ' : ''}
            {formatTanggal(r.tanggal, FORMAT_SEDANG)}
          </span>
        </div>

        <div className="mt-4 rounded-2xl bg-surface-mid p-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">Nomor Antrean Anda</p>
          <p className="text-5xl font-bold text-brand">{r.nomorAntrean}</p>
          <p className="mt-2 text-xs text-ink-soft">Estimasi dipanggil: <strong>{r.estimasiDipanggil} WIB</strong></p>
          <p className="mx-auto mt-2 w-fit rounded-full bg-white px-3 py-1 text-xs text-ink-soft">
            {r.antreanSebelum} antrean sebelum giliran Anda
          </p>
        </div>

        <dl className="mt-5 space-y-3 border-t border-dashed border-line pt-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-soft">Nama Pasien</dt>
            <dd className="text-right font-medium text-ink">
              {pasien.nama}
              <span className="block text-xs font-normal text-ink-soft">NIK: {pasien.nik}</span>
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-soft">Poli & Lokasi</dt>
            <dd className="text-right font-medium text-ink">
              {r.poli}
              <span className="block text-xs font-normal text-brand">{r.lokasi}, {r.ruang}</span>
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-soft">Dokter Pemeriksa</dt>
            <dd className="text-right font-medium text-ink">{r.dokter}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-soft">Waktu Kedatangan</dt>
            <dd className="text-right font-medium text-ink">{r.jam} WIB (Sesi {r.sesi})</dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-col items-center rounded-xl border border-line p-4">
          <QrCode className="h-24 w-24 text-ink" />
          <p className="mt-2 text-xs text-ink-soft">Pindai di Kios Check-in Rumah Sakit</p>
          <p className="text-xs text-ink-muted">SECURE-TOKEN-{r.nomorAntrean}-9921</p>
        </div>

        <div className="mt-5 space-y-2">
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
      </div>

      <div className="flex items-center justify-between bg-brand-light px-5 py-3 text-xs text-ink-soft">
        <span>Sedang melayani: <strong className="text-ink">{r.sedangMelayani}</strong></span>
        <span>Pembaruan auto: 15s</span>
      </div>
    </aside>
  );
}