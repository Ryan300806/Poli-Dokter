import { useState } from 'react';
import { router } from '@inertiajs/react';
import { CalendarDays, CheckCircle2, Clock3, Pencil, Plus, Trash2, Users } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/ui/Button';
import Badge from '../../Components/ui/Badge';
import Modal from '../../Components/ui/Modal';
import StatCard from '../../Components/ui/StatCard';
import { rute } from '../../lib/rute';

export default function JadwalSaya({ dokter = {}, jadwalServer = [], pasienServer = [], tanggal }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ tanggal: tanggal || '', jam: '08:00', kuota: 10 });
  const [error, setError] = useState('');

  const totalKuota = jadwalServer.reduce((sum, s) => sum + Number(s.kuota), 0);
  const totalTerisi = jadwalServer.reduce((sum, s) => sum + Number(s.terisi), 0);
  const totalSisa = Math.max(0, totalKuota - totalTerisi);

  function bukaTambah() {
    setEditItem(null);
    setForm({ tanggal: tanggal || new Date().toISOString().slice(0, 10), jam: '09:00', kuota: 8 });
    setError('');
    setModalOpen(true);
  }

  function bukaEdit(item) {
    setEditItem(item);
    setForm({ tanggal: item.tanggal, jam: item.mulai, kuota: item.kuota });
    setError('');
    setModalOpen(true);
  }

  function simpanSlot(e) {
    e.preventDefault();
    if (editItem) {
      router.put(`/dokter/jadwal-saya/slot/${editItem.id}`, form, {
        onSuccess: () => setModalOpen(false),
        onError: (errs) => setError(errs.jam || errs.tanggal || errs.kuota || 'Gagal memperbarui slot.'),
      });
    } else {
      router.post('/dokter/jadwal-saya/slot', form, {
        onSuccess: () => setModalOpen(false),
        onError: (errs) => setError(errs.jam || errs.tanggal || errs.kuota || 'Jadwal bentrok atau tidak valid.'),
      });
    }
  }

  function hapusSlot(id) {
    if (window.confirm('Hapus slot jadwal praktek ini?')) {
      router.delete(`/dokter/jadwal-saya/slot/${id}`, { preserveScroll: true });
    }
  }

  function gantiTanggal(val) {
    router.get(rute.dokter.jadwalSaya, { tanggal: val }, { preserveState: true });
  }

  return (
    <AppLayout role="dokter" title="Manajemen Jadwal Praktek">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge tone="success">{dokter.poli} • {dokter.nama}</Badge>
          <h1 className="mt-1.5 text-3xl font-extrabold text-ink">Manajemen Jadwal Praktek</h1>
          <p className="mt-1 text-xs text-ink-soft">Atur kuota jam praktek dan pantau registrasi pasien secara terintegrasi.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-card">
          <CalendarDays className="size-4 text-brand" />
          <input
            type="date"
            value={tanggal}
            onChange={(e) => gantiTanggal(e.target.value)}
            className="text-xs font-bold text-ink outline-none"
          />
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="TOTAL PASIEN HARI INI" value={pasienServer.length} unit="Pasien" icon={Users} />
        <StatCard label="SLOT TERSEDIA" value={totalSisa} unit="Kuota tersisa" icon={CheckCircle2} tone="brand" />
        <StatCard label="SLOT TERISI" value={totalTerisi} unit={`dari ${totalKuota} kapasitas`} icon={Clock3} />
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <h2 className="text-base font-bold text-ink">Jadwal Praktek Harian</h2>
            <p className="text-[11px] text-ink-muted">{jadwalServer.length} Sesi Terdaftar pada {tanggal}</p>
          </div>
          <Button icon={Plus} onClick={bukaTambah}>Tambah Slot</Button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-low text-[10px] font-bold uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-4 py-3">Jam Mulai</th>
                <th className="px-4 py-3">Jam Selesai</th>
                <th className="px-4 py-3">Sisa Kuota</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {jadwalServer.length > 0 ? jadwalServer.map((slot) => (
                <tr key={slot.id}>
                  <td className="px-4 py-3.5 font-bold text-ink">{slot.mulai} WIB</td>
                  <td className="px-4 py-3.5 text-ink-soft">{slot.selesai} WIB</td>
                  <td className="px-4 py-3.5 font-bold">{slot.sisa_kuota} / {slot.kuota} Slot</td>
                  <td className="px-4 py-3.5">
                    <Badge tone={slot.status === 'Penuh' ? 'danger' : slot.status === 'Hampir Penuh' ? 'warning' : 'success'}>
                      {slot.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="inline-flex gap-1">
                      <button type="button" onClick={() => bukaEdit(slot)} className="rounded-lg p-2 text-ink-soft hover:bg-surface-low">
                        <Pencil className="size-4" />
                      </button>
                      <button type="button" onClick={() => hapusSlot(slot.id)} className="rounded-lg p-2 text-danger hover:bg-danger-light">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-ink-muted">Belum ada slot praktek pada tanggal ini.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-card">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <h2 className="text-base font-bold text-ink">Daftar Pasien Terdaftar</h2>
          <Badge tone="success">{pasienServer.length} Pasien</Badge>
        </div>
        <div className="mt-3 divide-y divide-line">
          {pasienServer.length > 0 ? pasienServer.map((p) => (
            <div key={p.id_reservasi} className="flex items-center justify-between py-3 text-xs">
              <div>
                <p className="font-bold text-ink">{p.nama_lengkap}</p>
                <p className="text-[11px] text-ink-muted">Antrean A-{String(p.nomor_antrean).padStart(3, '0')} • NIK {p.nik}</p>
              </div>
              <Badge tone="success">{p.status_reservasi}</Badge>
            </div>
          )) : (
            <p className="py-6 text-center text-xs text-ink-muted">Belum ada pasien terdaftar pada tanggal ini.</p>
          )}
        </div>
      </section>

      {/* Modal Tambah/Edit Slot (_p30) */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? 'Ubah Slot Jadwal' : 'Tambah Slot Jadwal Baru'}
        icon={CalendarDays}
        footer={(
          <>
            <Button variant="danger" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button onClick={simpanSlot}>Simpan Slot</Button>
          </>
        )}
      >
        <form onSubmit={simpanSlot} className="space-y-4">
          <label className="block text-xs font-bold">
            Tanggal Praktek <span className="text-danger">*</span>
            <input
              type="date"
              value={form.tanggal}
              onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
              className="mt-1.5 h-11 w-full rounded-xl bg-surface-input px-3 text-xs outline-none"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-bold">
              Jam Mulai <span className="text-danger">*</span>
              <input
                type="time"
                value={form.jam}
                onChange={(e) => setForm({ ...form, jam: e.target.value })}
                className="mt-1.5 h-11 w-full rounded-xl bg-surface-input px-3 text-xs outline-none"
              />
            </label>
            <label className="block text-xs font-bold">
              Kuota Pasien Maksimum <span className="text-danger">*</span>
              <input
                type="number"
                min={1}
                max={200}
                value={form.kuota}
                onChange={(e) => setForm({ ...form, kuota: Number(e.target.value) })}
                className="mt-1.5 h-11 w-full rounded-xl bg-surface-input px-3 text-xs outline-none"
              />
            </label>
          </div>
          {error && <p className="rounded-xl bg-danger-light p-3 text-xs font-semibold text-danger">{error}</p>}
        </form>
      </Modal>
    </AppLayout>
  );
}
