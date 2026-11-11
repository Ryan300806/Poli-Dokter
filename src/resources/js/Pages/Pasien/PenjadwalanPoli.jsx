// KH-IM-001 | UI-007 | Penjadwalan Poli | Penulis: KH
// Sumber desain: Figma node 250:118. Sumber kebutuhan: Modul 2 bagian 3.7 (UI-007).
// Rute: GET /pasien/penjadwalan-poli  (routes/fe/kh.php, nama rute: pasien.penjadwalan-poli)
import { useState } from 'react';
import { Building2, Stethoscope, CalendarDays, Star, Check, ArrowRight, Info } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import PageHeader from '../../Components/ui/PageHeader';
import Button from '../../Components/ui/Button';
import Modal from '../../Components/ui/Modal';
import { Input, Select } from '../../Components/ui/Input';
import { toast } from '../../Components/ui/Toast';
import { poliContoh, dokterContoh } from '../../data/penjadwalanPoliDummy';

// URL halaman Riwayat Reservasi / Tiket Antrean (UI-008)
const URL_RIWAYAT = '/pasien/riwayat-reservasi';

// Tanggal hari ini dalam format YYYY-MM-DD (dipakai sebagai nilai awal date picker)
function hariIniISO() {
  const d = new Date();
  const bulan = String(d.getMonth() + 1).padStart(2, '0');
  const hari = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${bulan}-${hari}`;
}

// Tambah "T00:00:00" supaya dibaca sebagai waktu lokal, bukan UTC (menghindari tanggal bergeser sehari)
function parseTanggal(iso) {
  return new Date(`${iso}T00:00:00`);
}

// Contoh hasil: "Kamis, 24 Oktober 2026"
function formatTanggalPanjang(iso) {
  if (!iso) return '-';
  return parseTanggal(iso).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Padanan cekKetersediaanSlot(idSlot, tanggal) di Modul 2. Nanti dijawab oleh BE.
function cekKetersediaanSlot(slot) {
  return slot.sisa > 0 ? 'tersedia' : 'penuh';
}

// Nomor antrean = urutan pendaftar pada sesi tersebut, contoh: A-003
function buatNomorAntrean(slot) {
  const urutan = slot.kuota - slot.sisa + 1;
  return `A-${String(urutan).padStart(3, '0')}`;
}

export default function PenjadwalanPoli({ poli = poliContoh, dokter = dokterContoh }) {
  const [daftarDokter, setDaftarDokter] = useState(dokter);
  const [idPoli, setIdPoli] = useState(String(poli[0]?.id ?? ''));
  const [idDokter, setIdDokter] = useState(''); // '' = semua dokter pada poli terpilih
  const [tanggal, setTanggal] = useState(hariIniISO());
  const [sesi, setSesi] = useState(null); // { idDokter, idSlot }
  const [hasil, setHasil] = useState(null); // { status: 'berhasil' | 'gagal', ... }

  const poliTerpilih = poli.find((p) => String(p.id) === idPoli);
  const dokterPoli = daftarDokter.filter((d) => String(d.idPoli) === idPoli);
  const dokterTampil = dokterPoli.filter((d) => idDokter === '' || String(d.id) === idDokter);
  const hariTerpilih = tanggal ? parseTanggal(tanggal).getDay() : null;

  const dokterSesi = sesi ? daftarDokter.find((d) => d.id === sesi.idDokter) : null;
  const slotSesi = dokterSesi ? dokterSesi.slot.find((s) => s.id === sesi.idSlot) : null;

  // Dokter "Tersedia Hari Ini" jika punya jadwal praktik pada tanggal terpilih
  function praktikPadaTanggal(d) {
    return hariTerpilih !== null && d.hariPraktik.includes(hariTerpilih);
  }

  // Mengganti poli, dokter, atau tanggal membatalkan sesi yang sudah dipilih
  function ubahPoli(e) {
    setIdPoli(e.target.value);
    setIdDokter('');
    setSesi(null);
  }

  function ubahDokter(e) {
    setIdDokter(e.target.value);
    setSesi(null);
  }

  function ubahTanggal(e) {
    setTanggal(e.target.value);
    setSesi(null);
  }

  function pilihSesi(d, slot) {
    if (cekKetersediaanSlot(slot) === 'penuh') return;
    setSesi({ idDokter: d.id, idSlot: slot.id });
  }

  // Padanan kurangiKuotaSlot(idSlot) di Modul 2
  function kurangiKuotaSlot(idDokterTujuan, idSlot) {
    setDaftarDokter((lama) =>
      lama.map((d) =>
        d.id !== idDokterTujuan
          ? d
          : { ...d, slot: d.slot.map((s) => (s.id === idSlot ? { ...s, sisa: s.sisa - 1 } : s)) }
      )
    );
  }

  // Alur Konfirmasi Booking (SD-005 / UC-004)
  function konfirmasiBooking() {
    // Jalur 1: belum memilih sesi jam praktik
    if (!sesi || !dokterSesi || !slotSesi) {
      toast.error('Data Tidak Lengkap');
      return;
    }

    // Jalur 2: slot sudah penuh saat dikonfirmasi
    if (cekKetersediaanSlot(slotSesi) === 'penuh') {
      toast.error('Kuota Slot Penuh');
      setHasil({ status: 'gagal' });
      return;
    }

    // Jalur 3: booking berhasil
    const nomorAntrean = buatNomorAntrean(slotSesi);
    kurangiKuotaSlot(dokterSesi.id, slotSesi.id);
    toast.success('Berhasil Booking');
    setHasil({
      status: 'berhasil',
      nomorAntrean,
      namaDokter: dokterSesi.nama,
      jam: slotSesi.jam,
      tanggal,
    });
  }

  // Tombol "OK" / "Tutup": kembali ke halaman pilihan slot jam
  function tutupHasil() {
    setHasil(null);
    setSesi(null);
  }

  return (
    <AppLayout role="pasien" title="Penjadwalan Poli">
      <PageHeader title="Penjadwalan Poli" />
      <p className="-mt-2 mb-6 text-sm text-ink-soft">
        Lihat ketersediaan dokter dan buat janji temu rawat jalan dengan cepat
      </p>

      {/* Filter: poli, dokter spesialis, tanggal */}
      <section className="mb-6 grid grid-cols-1 gap-4 rounded-2xl bg-white p-6 shadow-card md:grid-cols-3">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
            <Building2 className="h-4 w-4 text-brand" />
            Pilih Poli
          </div>
          <Select value={idPoli} onChange={ubahPoli}>
            {poli.map((p) => (
              <option key={p.id} value={p.id}>{p.nama}</option>
            ))}
          </Select>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
            <Stethoscope className="h-4 w-4 text-brand" />
            Pilih Dokter Spesialis
          </div>
          <Select value={idDokter} onChange={ubahDokter}>
            <option value="">Semua Dokter Spesialis</option>
            {dokterPoli.map((d) => (
              <option key={d.id} value={d.id}>{d.nama}</option>
            ))}
          </Select>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
            <CalendarDays className="h-4 w-4 text-brand" />
            Pilih Tanggal
          </div>
          <Input type="date" value={tanggal} min={hariIniISO()} onChange={ubahTanggal} />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Daftar kartu dokter */}
        <div className="space-y-4 lg:col-span-2">
          {dokterTampil.length === 0 && (
            <div className="rounded-2xl bg-white p-6 text-sm text-ink-soft shadow-card">
              Belum ada dokter pada poli ini.
            </div>
          )}

          {dokterTampil.map((d) => {
            const praktik = praktikPadaTanggal(d);
            return (
              <article
                key={d.id}
                className={`overflow-hidden rounded-2xl border-l-4 bg-white shadow-card ${
                  praktik ? 'border-brand' : 'border-line'
                }`}
              >
                <div className="flex items-start gap-4 p-5">
                  {/* Foto dokter diganti inisial karena belum ada gambar */}
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-light text-lg font-semibold text-brand">
                    {d.nama.replace('dr. ', '').charAt(0)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-ink">{d.nama}</h3>
                    {praktik ? (
                      <span className="mt-1 inline-block rounded-full bg-brand-light px-2 py-0.5 text-xs font-medium text-brand">
                        Tersedia Hari Ini
                      </span>
                    ) : (
                      <span className="mt-1 inline-block rounded-full bg-surface-mid px-2 py-0.5 text-xs font-medium text-ink-muted">
                        Tidak praktik pada tanggal ini
                      </span>
                    )}
                    <p className="mt-1 text-xs text-ink-soft">
                      {poli.find((p) => p.id === d.idPoli)?.nama} • SIP: {d.sip}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-ink-soft">
                      <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
                      <span className="font-medium text-ink">{d.rating}</span>
                      ({d.ulasan} ulasan pasien)
                    </p>
                  </div>

                  <span className="rounded-lg bg-brand-light px-3 py-1.5 text-sm font-semibold text-brand">
                    {d.ruang}
                  </span>
                </div>

                {praktik && (
                  <div className="bg-surface-low px-5 py-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                      Pilih sesi praktik dokter
                    </p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {d.slot.map((s) => {
                        const penuh = cekKetersediaanSlot(s) === 'penuh';
                        const terpilih = sesi?.idDokter === d.id && sesi?.idSlot === s.id;
                        let gaya = 'border border-line bg-white text-ink hover:border-brand';
                        if (terpilih) gaya = 'bg-brand text-white';
                        if (penuh) gaya = 'cursor-not-allowed bg-surface-mid text-ink-muted';
                        return (
                          <button
                            key={s.id}
                            type="button"
                            disabled={penuh}
                            onClick={() => pilihSesi(d, s)}
                            className={`rounded-xl px-3 py-2 text-center transition ${gaya}`}
                          >
                            <span className="flex items-center justify-center gap-1 text-sm font-semibold">
                              {s.jam}
                              {terpilih && <Check className="h-3.5 w-3.5" />}
                            </span>
                            <span className="block text-xs">
                              {penuh ? 'Penuh' : terpilih ? 'Terpilih' : `Sisa ${s.sisa}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* Panel Ringkasan Janji */}
        <aside className="h-fit rounded-2xl bg-white p-6 shadow-card">
          <h3 className="font-semibold text-ink">Ringkasan Janji</h3>
          <p className="mb-4 text-xs text-ink-soft">Periksa kembali rincian booking</p>

          <dl className="space-y-3 border-t border-line pt-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">Poliklinik Tujuan</dt>
              <dd className="text-right font-medium text-ink">{poliTerpilih?.nama ?? '-'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">Dokter Pemeriksa</dt>
              <dd className="text-right font-medium text-ink">{dokterSesi?.nama ?? '-'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">Hari & Tanggal</dt>
              <dd className="text-right font-medium text-ink">{formatTanggalPanjang(tanggal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">Jam Praktik</dt>
              <dd className="text-right font-medium text-ink">
                {slotSesi ? `${slotSesi.jam} WIB` : '-'}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-ink-soft">Biaya Konsultasi</dt>
              <dd>
                <span className="rounded-full bg-brand-light px-2 py-0.5 text-xs font-medium text-brand">
                  BPJS / Asuransi (Rp 0)
                </span>
              </dd>
            </div>
          </dl>

          <div className="mt-5 flex gap-2 rounded-xl bg-surface-low p-3 text-xs text-ink-soft">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Pastikan hadir <strong>15 menit sebelum</strong> jam praktik untuk verifikasi
              administrasi dan sidik jari di loket poli.
            </p>
          </div>

          <div className="mt-5">
            <Button className="w-full justify-center" onClick={konfirmasiBooking}>
              Konfirmasi Booking
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </aside>
      </div>

      {/* Pop-up hasil booking: berhasil atau kuota penuh */}
      <Modal
        open={!!hasil}
        onClose={tutupHasil}
        title={hasil?.status === 'berhasil' ? 'Berhasil Booking' : 'Kuota Slot Penuh'}
        footer={
          hasil?.status === 'berhasil' ? (
            <>
              <Button variant="secondary" onClick={tutupHasil}>Tutup</Button>
              <Button href={URL_RIWAYAT}>Lihat Tiket Antrean</Button>
            </>
          ) : (
            <Button onClick={tutupHasil}>OK</Button>
          )
        }
      >
        {hasil?.status === 'berhasil' && (
          <div className="space-y-1 text-sm text-ink">
            <p>Nomor antrean kamu: <strong>{hasil.nomorAntrean}</strong></p>
            <p>{hasil.namaDokter}</p>
            <p>{formatTanggalPanjang(hasil.tanggal)}, pukul {hasil.jam} WIB</p>
          </div>
        )}
        {hasil?.status === 'gagal' &&
          'Sesi yang kamu pilih sudah penuh. Silakan pilih sesi jam lain.'}
      </Modal>
    </AppLayout>
  );
}