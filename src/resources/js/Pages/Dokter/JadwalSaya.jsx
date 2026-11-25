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

  const [tinjau, setTinjau] = useState(false);
  const [hapus, setHapus] = useState(null);
  const [sibuk, setSibuk] = useState(false);

  const totalKuota = jadwalServer.reduce((sum, s) => sum + Number(s.kuota), 0);
  const totalTerisi = jadwalServer.reduce((sum, s) => sum + Number(s.terisi), 0);
  const totalSisa = Math.max(0, totalKuota - totalTerisi);

  function bukaTambah() {
    setEditItem(null);
    setForm({ tanggal: tanggal || new Date().toISOString().slice(0, 10), jam: '09:00', kuota: 8 });
    setError('');
    setTinjau(false);
    setModalOpen(true);
  }

  function bukaEdit(item) {
    setEditItem(item);
    setForm({ tanggal: item.tanggal, jam: item.mulai, kuota: item.kuota });
    setError('');
    setTinjau(false);
    setModalOpen(true);
  }

  function simpanSlot(e) {
    e.preventDefault();
    if (sibuk) return;
    if (editItem && !tinjau) {
      setError('');
      setTinjau(true);
      return;
    }
    setSibuk(true);
    if (editItem) {
      router.put(`/dokter/jadwal-saya/slot/${editItem.id}`, form, {
        onFinish: () => setSibuk(false),
        onSuccess: () => setModalOpen(false),
        onError: (errs) => { setTinjau(false); setError(Object.values(errs)[0] || 'Gagal memperbarui slot.'); },
      });
    } else {
      router.post('/dokter/jadwal-saya/slot', form, {
        onFinish: () => setSibuk(false),
        onSuccess: () => setModalOpen(false),
        onError: (errs) => setError(errs.jam || errs.tanggal || errs.kuota || 'Jadwal bentrok atau tidak valid.'),
      });
    }
  }

  function hapusSlot() {
    if (!hapus || sibuk) return;
    setSibuk(true);
    router.delete(`/dokter/jadwal-saya/slot/${hapus.id}`, {
      preserveScroll: true, onSuccess: () => setHapus(null),
      onError: (errs) => setError(Object.values(errs)[0]), onFinish: () => setSibuk(false),
    });
  }

  function gantiTanggal(val) {
    router.get(rute.dokter.jadwalSaya, { tanggal: val }, { preserveState: true });
  }

  return (
    <AppLayout role="dokter" title="Manajemen Jadwal Praktik">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge tone="success">{dokter.poli} • {dokter.nama}</Badge>
          <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold text-ink">Manajemen Jadwal Praktik</h1>
          <p className="mt-1 text-xs text-ink-soft">Atur jam dan kuota kunjungan untuk tanggal yang dipilih.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-card">
          <CalendarDays className="size-4 text-brand" />
          <input
            type="date"
            aria-label="Tanggal praktik" value={tanggal}
            onChange={(e) => gantiTanggal(e.target.value)}
            className="text-xs font-bold text-ink outline-none"
          />
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="PASIEN TERJADWAL" value={pasienServer.length} unit="Pasien" icon={Users} />
        <StatCard label="SLOT TERSEDIA" value={totalSisa} unit="Kuota tersisa" icon={CheckCircle2} tone="brand" />
        <StatCard label="SLOT TERISI" value={totalTerisi} unit={`dari ${totalKuota} kapasitas`} icon={Clock3} />
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <h2 className="text-base font-bold text-ink">Jadwal Praktik Harian</h2>
            <p className="text-[11px] text-ink-muted">{jadwalServer.length} Sesi Terdaftar pada {tanggal}</p>
          </div>
          <Button icon={Plus} onClick={bukaTambah}>Tambah Slot</Button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-low text-[11px] font-bold uppercase tracking-wider text-ink-muted">
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
                      <button type="button" aria-label={`Ubah slot ${slot.mulai}`} onClick={() => bukaEdit(slot)} className="rounded-lg p-2 text-ink-soft hover:bg-surface-low">
                        <Pencil className="size-4" />
                      </button>
                      <button type="button" aria-label={`Hapus slot ${slot.mulai}`} onClick={() => { setError(''); setHapus(slot); }} className="rounded-lg p-2 text-danger hover:bg-danger-light">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-ink-muted">Belum ada slot praktik pada tanggal ini.</td>
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
      <Modal open={Boolean(hapus)} onClose={() => { if (!sibuk) setHapus(null); }} title="Hapus slot praktik?"
        subtitle={hapus ? `${hapus.tanggal} · ${hapus.mulai} WIB · ${hapus.kuota} tempat` : ''}
        footer={<><Button variant="outline" disabled={sibuk} onClick={() => setHapus(null)}>Kembali</Button>
          <Button variant="danger" disabled={sibuk} onClick={hapusSlot}>Hapus slot</Button></>}>
        <p>Slot yang dihapus akan hilang dari pilihan jadwal pasien.</p>
        {error && <p role="alert" className="field-error">{error}</p>}
      </Modal>
      <Modal
        open={modalOpen}
        onClose={() => { if (!sibuk) setModalOpen(false); }}
        title={tinjau ? 'Konfirmasi perubahan slot' : editItem ? 'Ubah Slot Jadwal' : 'Tambah Slot Jadwal Baru'}
        icon={CalendarDays}
        footer={(
          <>
            <Button variant="outline" disabled={sibuk} onClick={() => tinjau ? setTinjau(false) : setModalOpen(false)}>{tinjau ? 'Kembali ke formulir' : 'Batal'}</Button>
            <Button disabled={sibuk} type="submit" form="form-slot">{sibuk ? 'Menyimpan…' : tinjau ? 'Konfirmasi perubahan' : editItem ? 'Tinjau perubahan' : 'Simpan slot'}</Button>
          </>
        )}
      >
        <form id="form-slot" onSubmit={simpanSlot} className="space-y-4">
          {tinjau ? (
            <dl className="space-y-3 text-sm">
              <div><dt className="font-semibold">Pasien terdaftar</dt><dd>{editItem.terisi} pasien. {editItem.terisi > 0 && 'Jam dan tanggal tetap selama masih ada reservasi. Kuota dapat disesuaikan.'}</dd></div>
              <div className="rounded-lg bg-surface-low p-3"><dt className="font-semibold">Jadwal saat ini</dt><dd>{editItem.tanggal} · {editItem.mulai} WIB · Kuota {editItem.kuota} pasien</dd></div>
              <div className="rounded-lg bg-brand-light p-3"><dt className="font-semibold">Jadwal yang akan disimpan</dt><dd>{form.tanggal} · {form.jam} WIB · Kuota {form.kuota} pasien</dd></div>
            </dl>
          ) : (<>
          <label className="block text-xs font-bold">
            Tanggal Praktik <span className="text-danger">*</span>
            <input
              type="date" required
              value={form.tanggal}
              onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
              className="mt-1.5 h-11 w-full rounded-xl bg-surface-input px-3 text-xs outline-none"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-bold">
              Jam Mulai <span className="text-danger">*</span>
              <input
                type="time" required
                value={form.jam}
                onChange={(e) => setForm({ ...form, jam: e.target.value })}
                className="mt-1.5 h-11 w-full rounded-xl bg-surface-input px-3 text-xs outline-none"
              />
            </label>
            <label className="block text-xs font-bold">
              Kuota Pasien Maksimum <span className="text-danger">*</span>
              <input
                type="number" required
                min={1}
                max={200}
                value={form.kuota}
                onChange={(e) => setForm({ ...form, kuota: Number(e.target.value) })}
                className="mt-1.5 h-11 w-full rounded-xl bg-surface-input px-3 text-xs outline-none"
              />
            </label>
          </div>
          </>)}
          {error && <p role="alert" className="rounded-xl bg-danger-light p-3 text-xs font-semibold text-danger">{error}</p>}
        </form>
      </Modal>
    </AppLayout>
  );
}
