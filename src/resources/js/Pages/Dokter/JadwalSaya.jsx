
import { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import {
  CalendarDays, Clock3, Users, Plus, Pencil,
  Trash2, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Search,
} from 'lucide-react';

import AppLayout from '../../Layouts/AppLayout';
import StatCard from '../../Components/ui/StatCard';
import Button from '../../Components/ui/Button';
import Modal from '../../Components/ui/Modal';
import Badge from '../../Components/ui/Badge';
import { toast } from '../../Components/ui/Toast';

const FORM_AWAL = {
  tanggal: '',
  mulai: '',
  kuota: '',
  status: 'Aktif',
};

const kelasInput =
  'w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20';
const formatTanggal = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export default function JadwalSaya({ jadwalServer, pasienServer = [], idDokter, daftarDokter = [], tanggal: tanggalServer }) {
  const memakaiServer = Array.isArray(jadwalServer);
  const [jadwal, setJadwal] = useState(() => memakaiServer ? jadwalServer : []);
  const [modalForm, setModalForm] = useState(false);
  const [modalHapus, setModalHapus] = useState(false);
  const [dipilih, setDipilih] = useState(null);
  const [form, setForm] = useState(FORM_AWAL);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('semua');
  const [kataPasien, setKataPasien] = useState('');
  const [hariOffset, setHariOffset] = useState(0);

  const statistik = useMemo(() => ({
    kuota: jadwal.reduce((total, item) => total + Number(item.kuota), 0),
    terisi: jadwal.reduce((total, item) => total + Number(item.terisi), 0),
  }), [jadwal]);
  useEffect(() => { if (memakaiServer) setJadwal(jadwalServer); }, [memakaiServer, jadwalServer]);
  const tanggal = new Date(tanggalServer ? `${tanggalServer}T00:00:00` : new Date().toDateString());
  tanggal.setDate(tanggal.getDate() + hariOffset);
  const jadwalTerfilter = jadwal.filter((item) => {
    const sisa = Math.max(0, Number(item.kuota) - Number(item.terisi));
    const status = item.status !== 'Aktif' ? 'nonaktif' : sisa === 0 ? 'penuh' : sisa <= 2 ? 'hampir' : 'tersedia';
    return filterStatus === 'semua' || filterStatus === status;
  });
  const daftarPasien = Array.isArray(pasienServer)
    ? pasienServer.map((item) => ({ nama: item.nama_lengkap, antrean: item.nomor_antrean, waktu: tanggalServer ?? '', status: item.status_reservasi }))
    : [];
  const pasienTerfilter = daftarPasien.filter((item) =>
    `${item.nama} ${item.antrean}`.toLowerCase().includes(kataPasien.trim().toLowerCase()));

  function bukaTambah() {
    setDipilih(null);
    setForm({ ...FORM_AWAL });
    setError('');
    setModalForm(true);
  }

  function bukaUbah(item) {
    setDipilih(item);
    setForm({
      tanggal: item.tanggal,
      mulai: item.mulai,
      kuota: item.kuota,
      status: item.status,
    });
    setError('');
    setModalForm(true);
  }

  function ubahInput(nama, nilai) {
    setForm(prev => ({ ...prev, [nama]: nilai }));
    setError('');
  }

  function simpanJadwal() {
    const kuota = Number(form.kuota);

    if (!form.tanggal || !form.mulai) {
      setError('Tanggal dan jam slot wajib diisi.');
      return;
    }

    if (!Number.isInteger(kuota) || kuota < 1) {
      setError('Kuota pasien harus berupa bilangan bulat minimal 1.');
      return;
    }

    if (dipilih && kuota < dipilih.terisi) {
      setError('Kuota tidak boleh lebih kecil dari jumlah pasien terdaftar.');
      return;
    }

    if (memakaiServer) {
      const payload = {
        tanggal: form.tanggal,
        jam: form.mulai,
        kuota,
        ...(dipilih ? { status_slot: form.status === 'Aktif' ? 'tersedia' : 'nonaktif' } : { id_dokter: idDokter }),
      };
      const options = {
        preserveScroll: true,
        onSuccess: () => {
          setModalForm(false);
          setDipilih(null);
          setError('');
          toast.success(dipilih ? 'Slot jadwal berhasil diperbarui.' : 'Slot jadwal berhasil ditambahkan.');
          router.reload({ only: ['jadwalServer', 'pasienServer'], preserveScroll: true });
        },
        onError: (errors) => setError(errors.jam || errors.tanggal || errors.kuota || 'Slot jadwal gagal disimpan.'),
      };
      if (dipilih) router.put(`/dokter/jadwal-saya/slot/${dipilih.id}`, payload, options);
      else router.post('/dokter/jadwal-saya/slot', payload, options);
      return;
    }

    setError('Data jadwal belum diterima dari server. Tidak ada perubahan yang disimpan.');
  }

  function bukaHapus(item) {
    setDipilih(item);
    setModalHapus(true);
  }

  function hapusJadwal() {
    if (!dipilih) return;
    if (memakaiServer) {
      router.delete(`/dokter/jadwal-saya/slot/${dipilih.id}`, {
        preserveScroll: true,
        onSuccess: () => { setModalHapus(false); setDipilih(null); toast.success('Slot jadwal berhasil dihapus.'); router.reload({ only: ['jadwalServer', 'pasienServer'] }); },
        onError: () => toast.error('Slot tidak bisa dihapus karena masih direferensikan oleh riwayat reservasi.'),
      });
      return;
    }
    toast.error('Jadwal belum dimuat dari server. Tidak ada perubahan yang disimpan.');
  }

  function geserHari(delta) {
    if (!memakaiServer || !idDokter) return;
    const berikutnya = new Date(tanggal);
    berikutnya.setDate(berikutnya.getDate() + delta);
    setHariOffset(0);
    router.get(`/dokter/jadwal-saya/${idDokter}`, { tanggal: formatTanggal(berikutnya) }, { preserveScroll: true, preserveState: true });
  }

  return (
    <AppLayout role="dokter" title="Jadwal Saya">
      <div className="mt-[17px]">
        <Badge tone="success" dot className="w-fit rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase leading-3 tracking-wide">
          Jadwal praktik dokter
        </Badge>
        <div className="mt-2 flex min-h-16 items-start justify-between gap-6">
          <div>
            <h1 className="text-[28px] font-semibold leading-8 tracking-tight text-ink">Manajemen Jadwal Praktek</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p className="text-xs leading-4 text-ink-muted">Atur kuota jam praktek dan pantau registrasi pasien secara terintegrasi.</p>
              <Badge tone="success" className="px-2 py-0.5 text-[9px] leading-3">Data database</Badge>
            </div>
          </div>
          <div className="flex h-[52px] w-[394px] shrink-0 items-center justify-between rounded-xl bg-white px-2 shadow-card">
            <Button variant="ghost" size="sm" icon={ChevronLeft} aria-label="Hari sebelumnya" onClick={() => geserHari(-1)} />
            <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
              <CalendarDays className="size-4 shrink-0 text-brand" />
              <span className="min-w-0 text-center text-xs font-semibold">
                {tanggal.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                <small className="block text-[10px] font-normal text-brand">Sesi Praktek Aktif</small>
              </span>
            </div>
            <span className="whitespace-nowrap px-2 text-[10px] font-semibold text-brand">
              {hariOffset === 0 ? 'Hari Ini' : 'Tanggal Dipilih'}
            </span>
            <Button variant="ghost" size="sm" icon={ChevronRight} aria-label="Hari berikutnya" onClick={() => geserHari(1)} />
          </div>
        </div>
      </div>

      {!idDokter && <section className="rounded-xl bg-white p-4 shadow-card"><label className="block max-w-xl text-sm font-semibold">Pilih dokter dari database<select className={`${kelasInput} mt-2`} value="" onChange={(event) => { if (event.target.value) router.visit(`/dokter/jadwal-saya/${event.target.value}`); }}><option value="">Pilih dokter</option>{daftarDokter.map((item) => <option key={item.id_dokter} value={item.id_dokter}>{item.nama_dokter}{item.nama_poli ? ` — ${item.nama_poli}` : ''}</option>)}</select></label>{daftarDokter.length === 0 && <p className="mt-2 text-xs text-ink-muted">Belum ada data dokter di database.</p>}</section>}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Total Pasien Hari Ini" value={statistik.terisi} unit="Pasien" icon={Users} tone="brand" />
        <StatCard label="Slot Tersedia" value={Math.max(0, statistik.kuota - statistik.terisi)} unit="Slot" icon={CheckCircle2} />
        <StatCard label="Slot Terisi" value={statistik.terisi} unit="Slot" icon={Clock3} tone="brand" />
      </section>

      <section className="overflow-hidden rounded-2xl bg-white shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-3"><span className="h-8 w-2 rounded-full bg-brand" /><div><h2 className="text-sm font-bold">Jadwal Praktek Harian</h2><p className="text-[10px] text-ink-muted">{jadwal.length} sesi terdaftar untuk poli spesialis</p></div></div>
          <div className="flex items-center gap-2">
            <select aria-label="Filter status jadwal" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-9 rounded-lg bg-surface-low px-3 text-xs outline-none focus:ring-2 focus:ring-brand/30">
              <option value="semua">Semua Status</option><option value="tersedia">Tersedia</option><option value="hampir">Hampir Penuh</option><option value="penuh">Penuh</option><option value="nonaktif">Tidak Aktif</option>
            </select>
            <Button icon={Plus} size="sm" onClick={bukaTambah} disabled={!idDokter}>Tambah Slot</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="bg-surface-low text-[10px] uppercase tracking-wide text-ink-muted">
              <tr>{['Jam Mulai', 'Jam Selesai', 'Kapasitas', 'Sisa Kuota', 'Status', 'Aksi'].map((label) => <th key={label} className="px-5 py-3 font-semibold">{label}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-line">
              {jadwalTerfilter.map((item) => {
                const sisa = Math.max(0, Number(item.kuota) - Number(item.terisi));
                const status = item.status !== 'Aktif' ? 'Tidak Aktif' : sisa === 0 ? 'Penuh' : sisa <= 2 ? 'Hampir Penuh' : 'Tersedia';
                return (
                  <tr key={item.id} className="hover:bg-surface">
                    <td className="px-5 py-4 font-medium"><span className="inline-flex items-center gap-2"><Clock3 className="size-4 text-ink-muted" />{item.mulai} WIB</span></td>
                    <td className="px-5 py-4">{item.selesai} WIB</td><td className="px-5 py-4">{item.kuota} Pasien</td>
                    <td className={`px-5 py-4 font-semibold ${sisa === 0 ? 'text-danger' : 'text-brand'}`}>{sisa} Slot</td>
                    <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-[10px] font-semibold ${status === 'Penuh' ? 'bg-danger-light text-danger' : status === 'Hampir Penuh' ? 'bg-warning-light text-warning' : status === 'Tidak Aktif' ? 'bg-surface-high text-ink-muted' : 'bg-brand-light-active text-brand-dark'}`}>{status}</span></td>
                    <td className="px-5 py-4"><div className="flex gap-1"><Button variant="ghost" size="sm" icon={Pencil} aria-label={`Ubah slot ${item.mulai}`} onClick={() => bukaUbah(item)} /><Button variant="ghost" size="sm" icon={Trash2} aria-label={`Hapus slot ${item.mulai}`} onClick={() => bukaHapus(item)} disabled={item.terisi > 0} title={item.terisi > 0 ? 'Slot dengan pasien terdaftar tidak dapat dihapus' : 'Hapus slot'} /></div></td>
                  </tr>
                );
              })}
              {jadwalTerfilter.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-ink-muted">Tidak ada slot dengan status tersebut.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 bg-surface-low px-5 py-3 text-[10px] text-ink-muted"><span>Perubahan jadwal tersimpan pada database.</span><span>Total Kapasitas: {statistik.kuota} Pasien</span></div>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-card">
        <div className="flex items-center justify-between gap-4">
          <div><h2 className="text-sm font-bold">Daftar Pasien Terdaftar</h2><p className="text-[10px] text-brand">{pasienTerfilter.length} pasien terdaftar</p></div>
          <label className="relative w-64 max-w-full"><Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-muted" /><input value={kataPasien} onChange={(e) => setKataPasien(e.target.value)} placeholder="Cari nama atau No. Antrean" className="h-9 w-full rounded-lg bg-surface-low pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-brand/30" /></label>
        </div>
        <div className="mt-3 divide-y divide-line">
          {pasienTerfilter.map((item) => <div key={item.antrean} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3"><span aria-hidden="true" className="flex size-9 items-center justify-center rounded-full bg-brand-light-active text-sm font-semibold text-brand">{item.nama?.slice(0, 1) ?? '?'}</span><div><p className="text-xs font-semibold">{item.nama}</p><p className="text-[10px] text-ink-muted">Antrean {item.antrean} • {item.waktu}</p></div></div>
            <span className={`rounded-full px-3 py-1 text-[10px] ${item.status === 'Siap Periksa' ? 'bg-brand-light-active font-semibold text-brand-dark' : 'bg-surface-low text-ink-soft'}`}>{item.status}</span>
          </div>)}
          {pasienTerfilter.length === 0 && <p className="py-6 text-center text-xs text-ink-muted">Pasien tidak ditemukan.</p>}
        </div>
      </section>

      <Modal
        open={modalForm}
        onClose={() => setModalForm(false)}
        title={dipilih ? 'Ubah Slot Praktik' : 'Tambah Slot Praktik'}
        description="Atur jadwal dan kapasitas pelayanan dokter."
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalForm(false)}>
              Batal
            </Button>
            <Button onClick={simpanJadwal}>
              {dipilih ? 'Simpan Perubahan' : 'Tambah Slot'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="space-y-1.5"><span className="font-semibold text-ink-soft">Tanggal</span><input type="date" min={tanggalServer ?? formatTanggal(new Date())} className={kelasInput} value={form.tanggal} onChange={e => ubahInput('tanggal', e.target.value)} /></label>

          <label className="space-y-1.5">
            <span className="font-semibold text-ink-soft">Kuota Pasien</span>
            <input
              type="number"
              min="1"
              step="1"
              className={kelasInput}
              value={form.kuota}
              onChange={e => ubahInput('kuota', e.target.value)}
            />
          </label>

          <label className="space-y-1.5">
            <span className="font-semibold text-ink-soft">Jam Mulai</span>
            <input type="time" className={kelasInput}
              value={form.mulai}
              onChange={e => ubahInput('mulai', e.target.value)} />
          </label>

          <label className="space-y-1.5 sm:col-span-2">
            <span className="font-semibold text-ink-soft">Status Jadwal</span>
            <select className={kelasInput} value={form.status}
              onChange={e => ubahInput('status', e.target.value)}>
              <option value="Aktif">Aktif</option>
              <option value="Tidak Aktif">Tidak Aktif</option>
            </select>
          </label>
        </div>

        {error && (
          <div role="alert" className="mt-4 flex gap-2 rounded-lg bg-danger-light p-3 text-danger">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </Modal>

      <Modal
        open={modalHapus}
        onClose={() => setModalHapus(false)}
        title="Konfirmasi Hapus Slot"
        description="Tindakan ini akan menghapus slot jadwal dari database."
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalHapus(false)}>
              Batal
            </Button>
            <Button variant="danger" icon={Trash2} onClick={hapusJadwal}>
              Ya, Hapus Slot
            </Button>
          </>
        }
      >
        Apakah kamu yakin ingin menghapus slot tanggal <strong>{dipilih?.tanggal}</strong> pukul <strong>{dipilih?.mulai}</strong>?
      </Modal>
    </AppLayout>
  );
}
