import { useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { CalendarDays, Contact, Lock, MapPin, Phone, ShieldCheck, UserCog, UserRound } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/ui/Button';
import Badge from '../../Components/ui/Badge';
import Modal from '../../Components/ui/Modal';
import { rute } from '../../lib/rute';

const fmtDate = (v) => (v ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${String(v).slice(0, 10)}T00:00:00`)) : '—');

function Baris({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line/60 py-3 text-xs last:border-b-0">
      <span className="text-ink-soft">{label}</span>
      <span className="font-semibold text-ink text-right">{value}</span>
    </div>
  );
}

export default function Profil({ pasien = {}, riwayat = [], infoPembaruan = {}, konfirmasi = false }) {
  const { props } = usePage();
  const flash = props.flash || {};
  const updateResult = flash.profileUpdateResult || null;

  const [sibuk, setSibuk] = useState(false);
  const [modalBuka, setModalBuka] = useState(konfirmasi);
  const [form, setForm] = useState({
    nama_lengkap: pasien.nama_lengkap ?? '',
    tempat_lahir: pasien.tempat_lahir ?? '',
    tanggal_lahir: pasien.tanggal_lahir ?? '',
    alamat: pasien.alamat ?? '',
    jenis_kelamin: pasien.jenis_kelamin ?? 'L',
    golongan_darah: pasien.golongan_darah ?? '',
    kontak_darurat: pasien.kontak_darurat ?? '',
    nama_kontak_darurat: pasien.nama_kontak_darurat ?? '',
  });

  useEffect(() => {
    setForm({
      nama_lengkap: pasien.nama_lengkap ?? '',
      tempat_lahir: pasien.tempat_lahir ?? '',
      tanggal_lahir: pasien.tanggal_lahir ?? '',
      alamat: pasien.alamat ?? '',
      jenis_kelamin: pasien.jenis_kelamin ?? 'L',
      golongan_darah: pasien.golongan_darah ?? '',
      kontak_darurat: pasien.kontak_darurat ?? '',
      nama_kontak_darurat: pasien.nama_kontak_darurat ?? '',
    });
  }, [pasien]);

  function submitUpdate(e) {
    e.preventDefault();
    if (sibuk) return;
    setSibuk(true);
    router.put(rute.pasien.profil, { ...form, lanjutReservasi: konfirmasi }, { preserveScroll: true, onFinish: () => setSibuk(false), onSuccess: () => setModalBuka(false) });
  }

  const rmCode = `RM-${String(pasien.id_pasien ?? 0).padStart(6, '0')}`;
  const isBlocked = updateResult?.status === 'blocked' || infoPembaruan.canUpdate === false;

  return (
    <AppLayout role="pasien" title="Profil Pasien">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-ink">Profil Pasien Terintegrasi</h1>
          </div>
        </div>
        <Button icon={UserCog} onClick={() => setModalBuka(true)}>Mutakhirkan Data Pasien</Button>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[5fr_7fr]">
        {/* Kartu Kiri: Identifikasi Rekam Medis (_p20) */}
        <section className="overflow-hidden rounded-2xl bg-white shadow-card">
          <div className="flex items-center justify-between bg-surface-low px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
              <Contact className="size-4 text-brand" /> Identifikasi Rekam Medis
            </h2>
            <div className="flex items-center gap-2">
              <Badge tone="neutral">{rmCode}</Badge>
              <Badge tone="success">AKTIF</Badge>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex items-center gap-4 rounded-2xl bg-surface-low p-4">
              <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-surface-mid text-ink-muted">
                <UserRound className="size-8" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase text-ink-muted">NAMA LENGKAP PASIEN</p>
                <p className="text-lg font-extrabold text-ink truncate">{pasien.nama_lengkap}</p>
                <p className="mt-1 text-xs font-semibold text-ink-soft">NIK: {pasien.nik}</p>
              </div>
            </div>

            <div>
              <Baris label="Tempat / Tgl Lahir" value={`${pasien.tempat_lahir}, ${fmtDate(pasien.tanggal_lahir)}`} />
              <Baris label="Jenis Kelamin" value={pasien.jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki'} />
              <Baris
                label="Golongan Darah"
                value={<span className="rounded bg-danger-light px-2 py-0.5 text-xs font-bold text-danger">{pasien.golongan_darah || 'Belum tercatat'}</span>}
              />
              <Baris label="Nomor Kartu Keluarga" value={pasien.no_kk || 'Belum tercatat'} />
              <Baris label="Nomor Rekam Medis" value={rmCode} />
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-brand-light px-3.5 py-2.5 text-xs font-medium text-brand-dark">
              <ShieldCheck className="size-4 shrink-0 text-brand" />
              <span>Terakhir diperbarui: {infoPembaruan.lastUpdatedFormatted || 'Belum pernah diperbarui'}</span>
            </div>
          </div>
        </section>

        {/* Kolom Kanan: Domisili & Kontak + Riwayat Kunjungan Poliklinik (_p20) */}
        <div className="space-y-6">
          <section className="overflow-hidden rounded-2xl bg-white shadow-card">
            <div className="flex items-center justify-between bg-surface-low px-5 py-4">
              <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
                <MapPin className="size-4 text-brand" /> Domisili &amp; Kontak Pasien
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-[11px] font-bold uppercase text-ink-muted">ALAMAT LENGKAP KTP &amp; TINGGAL</p>
                <p className="mt-1.5 rounded-xl bg-surface-low p-4 text-xs leading-relaxed text-ink">{pasien.alamat}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-surface-low p-4">
                  <p className="text-[11px] text-ink-muted">Kontak Darurat</p>
                  <p className="mt-1 text-sm font-bold text-ink">{pasien.nama_kontak_darurat || 'Belum diisi'}</p>
                </div>
                <div className="rounded-xl bg-surface-low p-4">
                  <p className="text-[11px] text-ink-muted">Nomor Telepon</p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-ink">
                    <Phone className="size-4 text-brand" /> {pasien.kontak_darurat}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl bg-white shadow-card">
            <div className="flex items-center justify-between bg-surface-low px-5 py-4">
              <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
                <CalendarDays className="size-4 text-brand" /> Riwayat Kunjungan Poliklinik
              </h2>
              <Badge tone="neutral">{riwayat.length} kunjungan terakhir</Badge>
            </div>
            {riwayat.length > 0 ? (
              <div className="divide-y divide-line">
                {riwayat.map((r) => (
                  <div key={r.id_reservasi} className="grid items-center gap-2 px-5 py-3.5 sm:grid-cols-[110px_1fr_1fr_auto] text-xs">
                    <div>
                      <b className="text-ink">{fmtDate(r.tanggal)}</b>
                      <p className="text-[11px] text-ink-muted">REG-{r.id_reservasi}</p>
                    </div>
                    <div>
                      <p className="font-bold text-ink">{r.nama_poli}</p>
                      <p className="text-[11px] text-ink-soft">{r.nama_dokter}</p>
                    </div>
                    <p className="font-medium text-ink-soft">{r.nama_diagnosis || 'Pemeriksaan Poliklinik'}</p>
                    <Badge tone="success">SELESAI</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="p-6 text-xs text-ink-muted">Belum ada riwayat kunjungan selesai yang tercatat.</p>
            )}
          </section>
        </div>
      </div>

      {/* Modal Pemutakhiran Data Pasien (_p3–_p13) */}
      <Modal
        open={modalBuka}
        onClose={() => setModalBuka(false)}
        title="Pemutakhiran Data Pasien"
        icon={UserCog}
        maxWidth="max-w-2xl"
      >
        {isBlocked && (
          <div className="rounded-2xl bg-surface-low p-5 text-ink">
            <p className="flex items-center gap-2 text-xs font-extrabold"><Lock className="size-4" /> Jadwal pembaruan profil</p>
            <p className="mt-2 text-xs leading-relaxed">
              Profil dapat diperbarui kembali pada {fmtDate(infoPembaruan.nextAvailableAt || updateResult?.nextAvailableAt)}.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-white p-3 text-xs text-ink">
                <p className="text-[11px] font-bold uppercase text-ink-muted">PEMBARUAN TERAKHIR</p>
                <p className="mt-1 font-bold">{infoPembaruan.lastUpdatedFormatted || updateResult?.lastUpdatedFormatted}</p>
              </div>
              <div className="rounded-xl bg-white p-3 text-xs text-ink">
                <p className="text-[11px] font-bold uppercase text-ink-muted">INTERVAL BERJALAN</p>
                <p className="mt-1 font-bold text-danger">{infoPembaruan.daysElapsed ?? updateResult?.daysElapsed ?? 0} Hari <span className="text-ink-muted">(&lt; 365 Hari)</span></p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="secondary" onClick={() => setModalBuka(false)}>Tutup</Button>
            </div>
          </div>
        )}

        {!isBlocked && (
          <form onSubmit={submitUpdate} className="space-y-4">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-soft">
              <Lock className="size-3.5" /> FORMULIR IDENTITAS
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold">
                NIK / No. KTP Pasien
                <input disabled value={pasien.nik || ''} className="mt-1 h-10 w-full rounded-xl bg-surface-mid px-3 text-xs text-ink-muted" />
              </label>
              <label className="text-xs font-semibold">
                Nama Lengkap Sesuai KTP
                <input value={form.nama_lengkap} onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })} className="mt-1 h-10 w-full rounded-xl bg-surface-input px-3 text-xs outline-none focus:ring-2 focus:ring-brand/30" />
              </label>
              <label className="text-xs font-semibold">
                Tempat Lahir
                <input value={form.tempat_lahir} onChange={(e) => setForm({ ...form, tempat_lahir: e.target.value })} className="mt-1 h-10 w-full rounded-xl bg-surface-input px-3 text-xs outline-none focus:ring-2 focus:ring-brand/30" />
              </label>
              <label className="text-xs font-semibold">
                Tanggal Lahir
                <input type="date" value={form.tanggal_lahir} onChange={(e) => setForm({ ...form, tanggal_lahir: e.target.value })} className="mt-1 h-10 w-full rounded-xl bg-surface-input px-3 text-xs outline-none focus:ring-2 focus:ring-brand/30" />
              </label>
              <label className="text-xs font-semibold">
                Jenis Kelamin
                <select value={form.jenis_kelamin} onChange={(e) => setForm({ ...form, jenis_kelamin: e.target.value })} className="mt-1 h-10 w-full rounded-xl bg-surface-input px-3 text-xs outline-none">
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </label>
              <label className="text-xs font-semibold">
                Golongan Darah
                <select value={form.golongan_darah} onChange={(e) => setForm({ ...form, golongan_darah: e.target.value })} className="mt-1 h-10 w-full rounded-xl bg-surface-input px-3 text-xs outline-none">
                  <option value="">-- Pilih --</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </label>
              <label className="text-xs font-semibold">
                Nama Kontak Darurat
                <input value={form.nama_kontak_darurat} onChange={(e) => setForm({ ...form, nama_kontak_darurat: e.target.value })} className="mt-1 h-10 w-full rounded-xl bg-surface-input px-3 text-xs outline-none focus:ring-2 focus:ring-brand/30" />
              </label>
              <label className="text-xs font-semibold">
                Nomor Telepon Darurat
                <input value={form.kontak_darurat} onChange={(e) => setForm({ ...form, kontak_darurat: e.target.value })} className="mt-1 h-10 w-full rounded-xl bg-surface-input px-3 text-xs outline-none focus:ring-2 focus:ring-brand/30" />
              </label>
            </div>
            <label className="block text-xs font-semibold">
              Alamat Domisili Sesuai KTP
              <textarea rows={2} value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} className="mt-1 w-full rounded-xl bg-surface-input p-3 text-xs outline-none focus:ring-2 focus:ring-brand/30" />
            </label>
            <div className="flex items-center justify-between border-t border-line pt-4">
              {Object.keys(props.errors || {}).length > 0 && <p role="alert" className="field-error">{Object.values(props.errors)[0]}</p>}
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setModalBuka(false)}>Tutup</Button>
                <Button type="submit" disabled={sibuk} icon={Lock}>Mutakhirkan Data Pasien</Button>
              </div>
            </div>
          </form>
        )}
      </Modal>
    </AppLayout>
  );
}
