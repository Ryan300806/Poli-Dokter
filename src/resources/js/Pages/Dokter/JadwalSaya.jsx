// KH-IM-003 | UI-009 | Jadwal Saya Dokter | Penulis: KH
// Sumber desain: Figma node 251:901. Sumber kebutuhan: Modul 2 bagian 3.7 (UI-009).
// Rute: GET /dokter/jadwal-saya  (routes/fe/kh.php, nama rute: dokter.jadwal-saya)
import { useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Users,
  CheckCircle2,
  UserCheck,
  Clock,
  Pencil,
  Trash2,
  Plus,
  Search,
  Info,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import PageHeader from '../../Components/ui/PageHeader';
import Button from '../../Components/ui/Button';
import Modal from '../../Components/ui/Modal';
import { Table, Thead, Tbody, Tr, Th, Td } from '../../Components/ui/Table';
import { toast } from '../../Components/ui/Toast';
import {
  praktikContoh,
  jadwalContoh,
  pasienTerdaftarContoh,
} from '../../data/jadwalSayaDokterDummy';

const FORMAT_PANJANG = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
const FORMAT_SEDANG = { day: 'numeric', month: 'long', year: 'numeric' };

const GAYA_LABEL = 'mb-1.5 block text-sm font-semibold text-ink';
const GAYA_INPUT =
  'h-11 w-full rounded-lg bg-surface-mid px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-brand';

// Warna badge status slot: Penuh (merah), Tersedia (hijau), Hampir Penuh (kuning)
const GAYA_STATUS = {
  Penuh: 'bg-danger-light text-danger',
  Tersedia: 'bg-brand-light text-brand',
  'Hampir Penuh': 'bg-amber-100 text-amber-700',
};
const GAYA_SISA = {
  Penuh: 'text-danger',
  Tersedia: 'text-brand',
  'Hampir Penuh': 'text-amber-600',
};

const STATUS_PASIEN = {
  siap: { label: 'Siap Periksa', gaya: 'bg-brand-light text-brand' },
  menunggu: { label: 'Menunggu', gaya: 'bg-surface-mid text-ink-soft' },
};

// ---------- Fungsi bantu tanggal dan jam ----------
function keISO(d) {
  const bulan = String(d.getMonth() + 1).padStart(2, '0');
  const hari = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${bulan}-${hari}`;
}

function hariIniISO() {
  return keISO(new Date());
}

// Menggeser tanggal sebanyak n hari (negatif = mundur)
function geserTanggal(iso, n) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return keISO(d);
}

function formatTanggal(iso, opsi) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('id-ID', opsi);
}

// '09:30' -> 570 menit
function keMenit(jam) {
  const [h, m] = jam.split(':').map(Number);
  return h * 60 + m;
}

// 570 menit -> '09:30'
function dariMenit(menit) {
  const h = String(Math.floor(menit / 60)).padStart(2, '0');
  const m = String(menit % 60).padStart(2, '0');
  return `${h}:${m}`;
}

// ---------- Aturan slot ----------
// Penuh: sisa 0. Hampir Penuh: sisa <= 20% kapasitas. Selain itu: Tersedia.
function hitungStatus(slot) {
  const sisa = slot.kapasitas - slot.terisi;
  if (sisa <= 0) return 'Penuh';
  if (sisa / slot.kapasitas <= 0.2) return 'Hampir Penuh';
  return 'Tersedia';
}

// Padanan cekBentrokJadwal(idDokter, tanggal, jam) di Modul 2: dua slot bentrok jika rentang jamnya beririsan
function adaBentrok(daftar, tanggal, jamMulai, jamSelesai, abaikanId = null) {
  return daftar.some(
    (s) =>
      s.id !== abaikanId &&
      s.tanggal === tanggal &&
      s.jamMulai < jamSelesai &&
      jamMulai < s.jamSelesai
  );
}

function validasiSlot({ tanggal, jamMulai, jamSelesai, kuota }) {
  const galat = {};
  if (!tanggal) galat.tanggal = 'Tanggal praktek wajib diisi';
  if (!jamMulai) galat.jamMulai = 'Jam mulai wajib diisi';
  if (!jamSelesai) galat.jamSelesai = 'Jam selesai wajib diisi';
  if (jamMulai && jamSelesai && jamSelesai <= jamMulai) {
    galat.jamSelesai = 'Jam selesai harus setelah jam mulai';
  }
  if (!(Number(kuota) > 0)) galat.kuota = 'Kuota harus lebih dari 0';
  return galat;
}

const FORM_KOSONG = { tanggal: '', jamMulai: '', jamSelesai: '', kuota: '8' };

export default function JadwalSaya({
  praktik = praktikContoh,
  jadwalHarian = jadwalContoh,
  pasienTerdaftar = pasienTerdaftarContoh,
}) {
  const [jadwal, setJadwal] = useState(jadwalHarian);
  const [tanggal, setTanggal] = useState(hariIniISO());
  const [filterStatus, setFilterStatus] = useState('semua');
  const [kataPasien, setKataPasien] = useState('');

  // Pop-up Tambah Slot
  const [tambahBuka, setTambahBuka] = useState(false);
  const [form, setForm] = useState(FORM_KOSONG);
  const [galat, setGalat] = useState({});

  // Pop-up Ubah Slot
  const [slotUbah, setSlotUbah] = useState(null);
  const [jamBaru, setJamBaru] = useState('');
  const [galatUbah, setGalatUbah] = useState('');

  // Pop-up Hapus Slot
  const [slotHapus, setSlotHapus] = useState(null);

  const hariIni = hariIniISO();

  // Data untuk tanggal terpilih
  const jadwalHari = jadwal
    .filter((s) => s.tanggal === tanggal)
    .sort((a, b) => a.jamMulai.localeCompare(b.jamMulai));
  const jadwalTampil = jadwalHari.filter(
    (s) => filterStatus === 'semua' || hitungStatus(s) === filterStatus
  );

  // Ringkasan kartu
  const totalKapasitas = jadwalHari.reduce((jml, s) => jml + s.kapasitas, 0);
  const totalTerisi = jadwalHari.reduce((jml, s) => jml + s.terisi, 0);
  const totalTersedia = totalKapasitas - totalTerisi;
  const okupansi = totalKapasitas > 0 ? Math.round((totalTerisi / totalKapasitas) * 100) : 0;
  const terisiKemarin = jadwal
    .filter((s) => s.tanggal === geserTanggal(tanggal, -1))
    .reduce((jml, s) => jml + s.terisi, 0);
  const selisih = totalTerisi - terisiKemarin;
  const teksSelisih =
    selisih === 0 ? 'Sama seperti kemarin' : `${selisih > 0 ? '+' : ''}${selisih} dari kemarin`;

  const labelSesi =
    jadwalHari.length === 0
      ? 'Belum ada jadwal praktek'
      : tanggal === hariIni
        ? 'Sesi Praktek Aktif'
        : 'Ada Jadwal Praktek';

  // Daftar pasien terdaftar pada tanggal terpilih, disaring nama atau nomor antrean
  const kataKecil = kataPasien.trim().toLowerCase();
  const pasienHari = pasienTerdaftar.filter((p) => p.tanggal === tanggal);
  const pasienTampil = pasienHari.filter(
    (p) =>
      kataKecil === '' ||
      p.nama.toLowerCase().includes(kataKecil) ||
      p.antrean.toLowerCase().includes(kataKecil)
  );

  // ---------- Tambah Slot ----------
  function bukaTambah() {
    setForm({ ...FORM_KOSONG, tanggal });
    setGalat({});
    setTambahBuka(true);
  }

  function ubahForm(kolom, nilai) {
    setForm((lama) => ({ ...lama, [kolom]: nilai }));
  }

  // Padanan tambahSlot(idDokter, tanggal, jam, kuota) di Modul 2 (PSD-010)
  function simpanSlotBaru() {
    const hasilValidasi = validasiSlot(form);
    setGalat(hasilValidasi);

    // Jalur 1: isian belum valid
    if (Object.keys(hasilValidasi).length > 0) return;

    // Jalur 2: jadwal bentrok dengan slot lain
    if (adaBentrok(jadwal, form.tanggal, form.jamMulai, form.jamSelesai)) {
      toast.error('Jadwal Bentrok');
      return;
    }

    // Jalur 3: slot baru tersimpan
    const idBaru = jadwal.reduce((maks, s) => Math.max(maks, s.id), 0) + 1;
    setJadwal([
      ...jadwal,
      {
        id: idBaru,
        tanggal: form.tanggal,
        jamMulai: form.jamMulai,
        jamSelesai: form.jamSelesai,
        kapasitas: Number(form.kuota),
        terisi: 0,
      },
    ]);
    toast.success('Jadwal Berhasil Ditambahkan');
    setTanggal(form.tanggal);
    setTambahBuka(false);
  }

  // ---------- Ubah Slot ----------
  function bukaUbah(slot) {
    setSlotUbah(slot);
    setJamBaru(slot.jamMulai);
    setGalatUbah('');
  }

  // Padanan ubahSlot(idSlot, dataBaru) di Modul 2 (PSD-011). Durasi sesi dipertahankan.
  function konfirmasiUbah() {
    if (!jamBaru) {
      setGalatUbah('Jam baru wajib diisi');
      return;
    }

    const durasi = keMenit(slotUbah.jamSelesai) - keMenit(slotUbah.jamMulai);
    const selesaiBaruMenit = keMenit(jamBaru) + durasi;
    if (selesaiBaruMenit >= 24 * 60) {
      setGalatUbah('Jam baru melewati tengah malam');
      return;
    }

    const jamSelesaiBaru = dariMenit(selesaiBaruMenit);
    if (adaBentrok(jadwal, slotUbah.tanggal, jamBaru, jamSelesaiBaru, slotUbah.id)) {
      toast.error('Jadwal Bentrok');
      return;
    }

    setJadwal((lama) =>
      lama.map((s) =>
        s.id === slotUbah.id ? { ...s, jamMulai: jamBaru, jamSelesai: jamSelesaiBaru } : s
      )
    );
    toast.success('Jadwal Berhasil Diperbarui');
    setSlotUbah(null);
  }

  // ---------- Hapus Slot ----------
  // Padanan hapusSlot(idSlot) di Modul 2 (PSD-012)
  function konfirmasiHapus() {
    if (!slotHapus) {
      toast.error('Gagal menghapus jadwal, coba lagi');
      return;
    }
    setJadwal((lama) => lama.filter((s) => s.id !== slotHapus.id));
    toast.success('Jadwal Berhasil Dihapus');
    setSlotHapus(null);
  }

  return (
    <AppLayout role="dokter" title="Jadwal Saya">
      <div className="space-y-6">
        {/* Judul halaman + navigasi tanggal */}
        <div>
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            {praktik.poli} • {praktik.ruang}
          </span>
          <PageHeader
            title="Manajemen Jadwal Praktek"
            actions={
              <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-2 shadow-card">
                <button
                  type="button"
                  aria-label="Hari sebelumnya"
                  onClick={() => setTanggal(geserTanggal(tanggal, -1))}
                  className="rounded-lg p-1.5 text-ink-soft hover:bg-surface-mid"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <CalendarDays className="h-5 w-5 text-brand" />
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {formatTanggal(tanggal, FORMAT_PANJANG)}
                  </p>
                  <p className="text-xs text-brand">{labelSesi}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTanggal(hariIni)}
                  className="text-xs font-semibold text-brand hover:underline"
                >
                  Hari Ini
                </button>
                <button
                  type="button"
                  aria-label="Hari berikutnya"
                  onClick={() => setTanggal(geserTanggal(tanggal, 1))}
                  className="rounded-lg p-1.5 text-ink-soft hover:bg-surface-mid"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            }
          />
          <p className="-mt-2 text-sm text-ink-soft">
            Atur kuota jam praktek dan pantau registrasi pasien secara terintegrasi
          </p>
        </div>

        {/* Tiga kartu ringkasan */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  {tanggal === hariIni ? 'Total Pasien Hari Ini' : 'Total Pasien'}
                </p>
                <p className="mt-2 text-4xl font-bold text-ink">
                  {totalTerisi} <span className="text-lg font-medium">Pasien</span>
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-light text-brand">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <p className="mt-3 flex items-center gap-1 text-xs font-medium text-brand">
              <TrendingUp className="h-3.5 w-3.5" />
              {teksSelisih}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Slot Tersedia
                </p>
                <p className="mt-2 text-4xl font-bold text-ink">
                  {totalTersedia} <span className="text-lg font-medium">Slot</span>
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-mid text-brand">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
            <p className="mt-3 text-xs text-ink-soft">
              Dari total {totalKapasitas} kapasitas harian
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Slot Terisi
                </p>
                <p className="mt-2 text-4xl font-bold text-ink">
                  {totalTerisi} <span className="text-lg font-medium">Slot</span>
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-mid text-ink-soft">
                <UserCheck className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-3 flex justify-between text-xs">
              <span className="font-medium text-ink-soft">Tingkat Okupansi</span>
              <span className="font-semibold text-brand">{okupansi}%</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-mid">
              <div className="h-full rounded-full bg-brand" style={{ width: `${okupansi}%` }} />
            </div>
          </div>
        </section>

        {/* Tabel Jadwal Praktek Harian */}
        <section className="overflow-hidden rounded-2xl bg-white shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-4 p-6">
            <div className="flex items-center gap-3">
              <span className="h-8 w-1.5 rounded-full bg-brand" />
              <div>
                <h2 className="font-semibold text-ink">Jadwal Praktek Harian</h2>
                <p className="text-xs text-ink-soft">
                  {jadwalHari.length} Sesi Terdaftar untuk poli spesialis
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-10 rounded-lg bg-surface-mid px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="semua">Semua Status</option>
                <option value="Penuh">Penuh</option>
                <option value="Tersedia">Tersedia</option>
                <option value="Hampir Penuh">Hampir Penuh</option>
              </select>
              <Button onClick={bukaTambah}>
                <Plus className="mr-1 h-4 w-4" />
                Tambah Slot
              </Button>
            </div>
          </div>

          {jadwalTampil.length === 0 ? (
            <p className="border-t border-line px-6 py-8 text-center text-sm text-ink-soft">
              {jadwalHari.length === 0
                ? 'Belum ada slot jadwal praktek pada tanggal ini'
                : 'Tidak ada slot dengan status tersebut'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <Thead>
                  <Tr>
                    <Th>Jam Mulai</Th>
                    <Th>Jam Selesai</Th>
                    <Th>Kapasitas</Th>
                    <Th>Sisa Kuota</Th>
                    <Th>Status</Th>
                    <Th className="text-right">Aksi</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {jadwalTampil.map((s) => {
                    const status = hitungStatus(s);
                    return (
                      <Tr key={s.id}>
                        <Td>
                          <span className="flex items-center gap-2 font-semibold text-ink">
                            <Clock className="h-4 w-4 text-ink-soft" />
                            {s.jamMulai} WIB
                          </span>
                        </Td>
                        <Td>{s.jamSelesai} WIB</Td>
                        <Td>{s.kapasitas} Pasien</Td>
                        <Td>
                          <span className={`font-semibold ${GAYA_SISA[status]}`}>
                            {s.kapasitas - s.terisi} Slot
                          </span>
                        </Td>
                        <Td>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${GAYA_STATUS[status]}`}
                          >
                            {status}
                          </span>
                        </Td>
                        <Td className="text-right">
                          <button
                            type="button"
                            aria-label="Ubah slot"
                            onClick={() => bukaUbah(s)}
                            className="rounded-lg p-2 text-ink-soft hover:bg-surface-mid hover:text-brand"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            aria-label="Hapus slot"
                            onClick={() => setSlotHapus(s)}
                            className="rounded-lg p-2 text-ink-soft hover:bg-surface-mid hover:text-danger"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 bg-surface-low px-6 py-3 text-xs text-ink-soft">
            <span className="flex items-center gap-2">
              <Info className="h-4 w-4 text-brand" />
              Perubahan kuota otomatis tersinkronisasi ke sistem antrean Anjungan Mandiri RS.
            </span>
            <span className="font-medium">
              Total Kapasitas: {totalKapasitas} Pasien ({jadwalHari.length} Sesi)
            </span>
          </div>
        </section>

        {/* Daftar Pasien Terdaftar */}
        <section className="rounded-2xl bg-white p-6 shadow-card">
          <div className="flex items-start justify-between border-b border-line pb-4">
            <div>
              <h2 className="font-semibold text-ink">Daftar Pasien Terdaftar</h2>
              <p className="text-xs font-medium text-brand">
                {pasienHari.length} Pasien Terdekat
              </p>
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-light text-sm font-semibold text-brand">
              {pasienHari.length}
            </span>
          </div>

          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              value={kataPasien}
              onChange={(e) => setKataPasien(e.target.value)}
              placeholder="Cari nama atau No. Antrean"
              className="h-11 w-full rounded-lg bg-surface-mid pl-9 pr-3 text-sm text-ink outline-none placeholder:text-ink-muted focus:ring-2 focus:ring-brand"
            />
          </div>

          {pasienTampil.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-soft">
              {pasienHari.length === 0
                ? 'Belum ada pasien terdaftar pada tanggal ini'
                : 'Pasien tidak ditemukan'}
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-line">
              {pasienTampil.map((p) => {
                const st = STATUS_PASIEN[p.status];
                return (
                  <li key={p.id} className="flex items-center gap-4 py-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-light font-semibold text-brand">
                      {p.nama.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink">{p.nama}</p>
                      <p className="text-xs text-ink-soft">
                        Antrean {p.antrean} • {p.jam} WIB
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${st.gaya}`}>
                      {st.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* Pop-up Tambah Slot Jadwal Baru */}
      <Modal
        open={tambahBuka}
        onClose={() => setTambahBuka(false)}
        title="Tambah Slot Jadwal Baru"
        footer={
          <>
            <Button variant="secondary" onClick={() => setTambahBuka(false)}>Batal</Button>
            <Button onClick={simpanSlotBaru}>Simpan Slot</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className={GAYA_LABEL}>
              Tanggal Praktek <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              value={form.tanggal}
              onChange={(e) => ubahForm('tanggal', e.target.value)}
              className={GAYA_INPUT}
            />
            {galat.tanggal && <p className="mt-1 text-xs text-danger">{galat.tanggal}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={GAYA_LABEL}>
                Jam Mulai <span className="text-danger">*</span>
              </label>
              <input
                type="time"
                value={form.jamMulai}
                onChange={(e) => ubahForm('jamMulai', e.target.value)}
                className={GAYA_INPUT}
              />
              {galat.jamMulai && <p className="mt-1 text-xs text-danger">{galat.jamMulai}</p>}
            </div>
            <div>
              <label className={GAYA_LABEL}>
                Jam Selesai <span className="text-danger">*</span>
              </label>
              <input
                type="time"
                value={form.jamSelesai}
                onChange={(e) => ubahForm('jamSelesai', e.target.value)}
                className={GAYA_INPUT}
              />
              {galat.jamSelesai && <p className="mt-1 text-xs text-danger">{galat.jamSelesai}</p>}
            </div>
          </div>

          <div>
            <label className={GAYA_LABEL}>
              Kuota Pasien Maksimum <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={form.kuota}
              onChange={(e) => ubahForm('kuota', e.target.value)}
              className={GAYA_INPUT}
            />
            {galat.kuota && <p className="mt-1 text-xs text-danger">{galat.kuota}</p>}
            <p className="mt-1 text-xs text-ink-soft">
              Disarankan maksimal 8 pasien per interval 60 menit.
            </p>
          </div>
        </div>
      </Modal>

      {/* Pop-up Ubah Slot (isi mengikuti UI-013 milik MH).
          TODO: setelah UbahSlotModal milik MH selesai, ganti blok Modal ini dengan komponennya
          dan samakan props-nya dengan MH. */}
      <Modal
        open={!!slotUbah}
        onClose={() => setSlotUbah(null)}
        title="Ubah Slot Jadwal"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSlotUbah(null)}>Batal</Button>
            <Button onClick={konfirmasiUbah}>Konfirmasi Ubah Slot</Button>
          </>
        }
      >
        {slotUbah && (
          <div className="space-y-4 text-sm">
            <dl className="space-y-2 rounded-xl bg-surface-low p-4">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Tanggal</dt>
                <dd className="font-medium text-ink">
                  {formatTanggal(slotUbah.tanggal, FORMAT_SEDANG)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Jam Saat Ini</dt>
                <dd className="font-medium text-ink">
                  {slotUbah.jamMulai} - {slotUbah.jamSelesai} WIB
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Pasien Terdaftar</dt>
                <dd className="font-medium text-ink">{slotUbah.terisi} pasien</dd>
              </div>
            </dl>

            <div>
              <label className={GAYA_LABEL}>
                Jam Baru <span className="text-danger">*</span>
              </label>
              <input
                type="time"
                value={jamBaru}
                onChange={(e) => setJamBaru(e.target.value)}
                className={GAYA_INPUT}
              />
              {galatUbah && <p className="mt-1 text-xs text-danger">{galatUbah}</p>}
              <p className="mt-1 text-xs text-ink-soft">Durasi sesi tetap sama dengan jadwal saat ini.</p>
            </div>

            {slotUbah.terisi > 0 && (
              <div className="flex gap-2 rounded-xl bg-amber-100 p-3 text-xs text-amber-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  {slotUbah.terisi} pasien terdaftar akan menerima notifikasi perubahan jadwal
                  beserta opsi pendaftaran ulang.
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Pop-up Konfirmasi Hapus Slot (isi mengikuti UI-019 milik RG).
          TODO: setelah HapusSlotModal milik RG selesai, ganti blok Modal ini dengan komponennya
          dan samakan props-nya dengan RG. */}
      <Modal
        open={!!slotHapus}
        onClose={() => setSlotHapus(null)}
        title="Hapus Slot Jadwal?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSlotHapus(null)}>Batal</Button>
            <Button onClick={konfirmasiHapus}>Hapus Slot</Button>
          </>
        }
      >
        {slotHapus && (
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-danger" />
              <p className="text-ink">
                Apakah Anda yakin ingin menghapus slot jadwal praktek berikut?
              </p>
            </div>
            <dl className="space-y-2 rounded-xl bg-surface-low p-4">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Tanggal Praktek</dt>
                <dd className="font-medium text-ink">
                  {formatTanggal(slotHapus.tanggal, FORMAT_SEDANG)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Jam Praktek</dt>
                <dd className="font-medium text-ink">
                  {slotHapus.jamMulai} - {slotHapus.jamSelesai} WIB
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Poliklinik & Ruang</dt>
                <dd className="font-medium text-ink">
                  {praktik.poli}, {praktik.ruang}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Kapasitas Slot</dt>
                <dd className="font-medium text-ink">
                  {slotHapus.kapasitas} pasien • {slotHapus.terisi} reservasi terdaftar
                </dd>
              </div>
            </dl>
            <p className="rounded-xl bg-danger-light p-3 text-xs text-danger">
              Slot yang dihapus tidak lagi tersedia untuk reservasi pasien baru melalui portal
              rawat jalan.
            </p>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}