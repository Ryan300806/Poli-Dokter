import { useEffect, useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { AlertCircle, BadgeCheck, Contact, LockKeyhole, ShieldCheck } from 'lucide-react';
import Modal from '../../Components/ui/Modal';
import Button from '../../Components/ui/Button';
import { rute } from '../../lib/rute';

const formatTanggal = (value) => value ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(value)) : 'Belum pernah diperbarui';
const elapsed = (date) => {
  if (!date) return '—';
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
  if (minutes < 60) return `${Math.max(1, minutes)} menit`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} jam`;
  return `${Math.floor(minutes / 1440)} hari`;
};

function Field({ label, error, className = '', ...props }) {
  return <label className={`grid min-w-0 gap-1.5 text-[11px] font-semibold text-ink-soft ${className}`}>{label}<input className="h-10 w-full rounded-lg border border-line bg-surface-low px-3 text-sm font-normal text-ink outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:text-ink-muted" {...props}/>{error && <span role="alert" className="font-normal text-danger">{error}</span>}</label>;
}

export default function EditDataModal({ open, onClose, pasien, infoPembaruan = {} }) {
  const { props } = usePage();
  const [hasil, setHasil] = useState(null);
  const form = useForm({
    nama_lengkap: pasien?.nama_lengkap ?? '',
    tempat_lahir: pasien?.tempat_lahir ?? '',
    tanggal_lahir: pasien?.tanggal_lahir ?? '',
    golongan_darah: pasien?.golongan_darah ?? '',
    alamat: pasien?.alamat ?? '',
    nama_kontak_darurat: pasien?.nama_kontak_darurat ?? '',
    kontak_darurat: pasien?.kontak_darurat ?? '',
  });
  const hasilServer = props.flash?.profileUpdateResult;
  const blocked = hasil === 'blocked';
  const sukses = hasil === 'success';
  const dateTerakhir = hasilServer?.lastUpdatedAt ?? infoPembaruan.lastUpdatedAt;
  const hariBerjalan = hasilServer?.daysElapsed ?? infoPembaruan.daysElapsed;
  const labelInterval = hasilServer?.intervalLabel ?? (hariBerjalan === null || hariBerjalan === undefined ? 'Belum ada pemutakhiran' : `${hariBerjalan} hari`);
  const bisaMutakhirkan = infoPembaruan.canUpdate !== false;

  useEffect(() => {
    if (!open) return;
    form.setData({
      nama_lengkap: pasien?.nama_lengkap ?? '',
      tempat_lahir: pasien?.tempat_lahir ?? '',
      tanggal_lahir: pasien?.tanggal_lahir ?? '',
      golongan_darah: pasien?.golongan_darah ?? '',
      alamat: pasien?.alamat ?? '',
      nama_kontak_darurat: pasien?.nama_kontak_darurat ?? '',
      kontak_darurat: pasien?.kontak_darurat ?? '',
    });
    form.clearErrors();
    setHasil(null);
  // Reset only when the dialog opens. A successful response updates pasien while keeping the dialog open.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (hasilServer?.status) setHasil(hasilServer.status);
  }, [hasilServer]);

  function simpan() {
    if (!bisaMutakhirkan) {
      setHasil('blocked');
      return;
    }
    form.put(rute.pasien.simpanProfil, {
      preserveScroll: true,
      onSuccess: () => setHasil('success'),
      onError: (errors) => setHasil(errors.pemutakhiran ? 'blocked' : null),
    });
  }

  const readOnly = sukses || blocked;
  const disabled = readOnly || form.processing;

  return <Modal
    open={open}
    onClose={onClose}
    title="Pemutakhiran Data Pasien"
    icon={Contact}
    size="xl"
    footer={(
      <div className="flex w-full flex-col-reverse items-center justify-between gap-3 sm:flex-row">
        <p className="flex items-center gap-2 text-[10px] font-medium text-ink-muted"><ShieldCheck className="size-4 text-brand"/>Sesi keamanan aktif (otentikasi NIK terverifikasi)</p>
        {readOnly ? <Button variant="secondary" onClick={onClose}>Tutup</Button> : <Button icon={LockKeyhole} loading={form.processing} onClick={simpan}>Mutakhirkan Data Pasien</Button>}
      </div>
    )}
  >
    <div className="max-h-[70vh] overflow-y-auto">
      {(sukses || blocked) && <section className={`mb-5 rounded-xl p-4 ${sukses ? 'bg-brand-light-active text-brand-dark' : 'bg-red-50 text-red-700'}`}>
        <h3 className={`flex items-center gap-2 text-xs font-bold uppercase ${sukses ? 'text-brand' : 'text-red-700'}`}>
          {sukses ? <BadgeCheck className="size-5"/> : <AlertCircle className="size-5"/>}
          {sukses ? 'Update Berhasil!' : 'Update Data Gagal'}
        </h3>
        <p className="mt-2 text-xs leading-5">{sukses ? 'Data pasien berhasil diperbarui dan tersimpan pada rekam medis.' : (form.errors.pemutakhiran || 'Sistem mendeteksi data profil baru saja dimutakhirkan. Pemutakhiran mandiri hanya dapat dilakukan satu kali setiap 365 hari.')}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg bg-white/80 p-3"><p className="text-[9px] font-bold uppercase tracking-wide text-ink-muted">Pembaruan terakhir</p><p className="mt-1 text-xs font-semibold">{dateTerakhir ? formatTanggal(dateTerakhir) : 'Hari ini'} <span className="font-normal text-ink-muted">({sukses ? 'baru saja' : elapsed(dateTerakhir)} lalu)</span></p></div>
          <div className="rounded-lg bg-white/80 p-3"><p className="text-[9px] font-bold uppercase tracking-wide text-ink-muted">Interval berjalan</p><p className="mt-1 text-xs font-semibold">{sukses ? '0 hari' : labelInterval} <span className="font-normal text-ink-muted">({sukses ? '365 hari untuk pembaruan berikutnya' : '< 365 hari'})</span></p></div>
        </div>
      </section>}

      {!blocked && <>
        {!sukses && <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-ink"><LockKeyhole className="size-3.5 text-ink-muted"/>Formulir identitas</p>}
        <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
          <Field label="NIK / No. KTP Pasien" value={pasien?.nik ?? ''} readOnly disabled />
          <Field label="Nama Lengkap Sesuai KTP" value={form.data.nama_lengkap} onChange={(e) => form.setData('nama_lengkap', e.target.value)} error={form.errors.nama_lengkap} disabled={disabled}/>
          <Field label="Tempat Lahir" value={form.data.tempat_lahir} onChange={(e) => form.setData('tempat_lahir', e.target.value)} error={form.errors.tempat_lahir} disabled={disabled}/>
          <Field label="Tanggal Lahir" type="date" value={form.data.tanggal_lahir} onChange={(e) => form.setData('tanggal_lahir', e.target.value)} error={form.errors.tanggal_lahir} disabled={disabled}/>
          <label className="grid gap-1.5 text-[11px] font-semibold text-ink-soft">Golongan Darah<select value={form.data.golongan_darah} onChange={(e) => form.setData('golongan_darah', e.target.value)} disabled={disabled} className="h-10 rounded-lg border border-line bg-surface-low px-3 text-sm font-normal text-ink outline-none focus:border-brand disabled:cursor-not-allowed disabled:text-ink-muted"><option value="">Belum diketahui</option>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((g) => <option key={g}>{g}</option>)}</select></label>
          <Field label="Nama Kontak Darurat" value={form.data.nama_kontak_darurat} onChange={(e) => form.setData('nama_kontak_darurat', e.target.value)} error={form.errors.nama_kontak_darurat} disabled={disabled}/>
          <Field label="Nomor WhatsApp / Telepon Aktif" value={form.data.kontak_darurat} onChange={(e) => form.setData('kontak_darurat', e.target.value)} error={form.errors.kontak_darurat} disabled={disabled}/>
          <label className="grid gap-1.5 text-[11px] font-semibold text-ink-soft sm:col-span-2">Alamat Domisili Sesuai KTP<textarea rows={3} value={form.data.alamat} onChange={(e) => form.setData('alamat', e.target.value)} disabled={disabled} className="w-full resize-y rounded-lg border border-line bg-surface-low px-3 py-2 text-sm font-normal text-ink outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:text-ink-muted"/>{form.errors.alamat && <span role="alert" className="font-normal text-danger">{form.errors.alamat}</span>}</label>
        </div>
      </>}
    </div>
  </Modal>;
}
