import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { BadgeCheck, CalendarDays, Contact, MapPin, Pencil, Phone, Save, ShieldCheck, UserRound, X } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import PageHeader from '../../Components/ui/PageHeader';
import Button from '../../Components/ui/Button';
import { rute } from '../../lib/rute';

const formatTanggal = (value) => new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`));
function Field({ label, name, value, onChange, error, ...props }) { return <label className="grid gap-1.5 text-xs font-semibold text-ink-soft">{label}<input name={name} value={value ?? ''} onChange={onChange} className="h-10 rounded-lg border border-line bg-white px-3 text-sm font-normal text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" {...props}/>{error && <span className="font-normal text-danger">{error}</span>}</label>; }

export default function Profil({ pasien = {}, riwayat = [] }) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ nama_lengkap: pasien.nama_lengkap ?? '', tempat_lahir: pasien.tempat_lahir ?? '', tanggal_lahir: pasien.tanggal_lahir ?? '', alamat: pasien.alamat ?? '', jenis_kelamin: pasien.jenis_kelamin ?? 'L', kontak_darurat: pasien.kontak_darurat ?? '', nama_kontak_darurat: pasien.nama_kontak_darurat ?? '' });
  const [errors, setErrors] = useState({});
  useEffect(() => {
    setForm({ nama_lengkap: pasien.nama_lengkap ?? '', tempat_lahir: pasien.tempat_lahir ?? '', tanggal_lahir: pasien.tanggal_lahir ?? '', alamat: pasien.alamat ?? '', jenis_kelamin: pasien.jenis_kelamin ?? 'L', kontak_darurat: pasien.kontak_darurat ?? '', nama_kontak_darurat: pasien.nama_kontak_darurat ?? '' });
  }, [pasien]);
  function change(e) { setForm({ ...form, [e.target.name]: e.target.value }); setErrors({ ...errors, [e.target.name]: undefined }); }
  function save(e) { e.preventDefault(); router.put(rute.pasien.simpanProfil, form, { preserveScroll: true, onError: setErrors, onSuccess: () => setEdit(false) }); }

  return <AppLayout role="pasien" title="Profil Pasien">
    <PageHeader title="Profil Pasien Terintegrasi" actions={<Button icon={edit ? X : Pencil} variant={edit ? 'secondary' : 'primary'} onClick={() => setEdit(!edit)}>{edit ? 'Tutup Perubahan' : 'Mutakhirkan Data Pasien'}</Button>}>
      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand"><Contact className="size-4"/>Data pasien terpusat</span><span className="inline-flex items-center gap-1 rounded-full bg-brand-light-active px-3 py-1 text-xs font-semibold text-brand"><BadgeCheck className="size-4"/>Data tersimpan</span>
    </PageHeader>
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <section className="overflow-hidden rounded-2xl bg-white shadow-card">
        <header className="flex items-center justify-between bg-surface-low px-5 py-4"><h2 className="flex items-center gap-2 font-semibold text-ink"><Contact className="size-5 text-brand"/>Identifikasi Pasien</h2><span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-ink-soft">ID P-{String(pasien.id_pasien ?? '').padStart(4, '0')}</span></header>
        <div className="p-5"><div className="flex items-center gap-4 rounded-xl bg-surface-low p-4"><span className="flex size-16 items-center justify-center rounded-xl bg-surface-mid text-ink-muted"><UserRound className="size-8"/></span><div><p className="text-[10px] font-semibold uppercase text-ink-muted">Nama lengkap pasien</p><p className="text-lg font-bold text-ink">{pasien.nama_lengkap}</p><p className="mt-1 text-xs text-ink-soft">NIK {pasien.nik?.slice(0, 6)}{'•'.repeat(6)}{pasien.nik?.slice(-4)}</p></div></div>
          {edit ? <form onSubmit={save} className="mt-4 grid gap-4">{Object.entries(errors).map(([key,value]) => value && <p key={key} className="text-sm text-danger">{value}</p>)}
            <Field label="Nama lengkap" name="nama_lengkap" value={form.nama_lengkap} onChange={change} error={errors.nama_lengkap}/><div className="grid gap-4 sm:grid-cols-2"><Field label="Tempat lahir" name="tempat_lahir" value={form.tempat_lahir} onChange={change} error={errors.tempat_lahir}/><Field label="Tanggal lahir" name="tanggal_lahir" type="date" value={form.tanggal_lahir} onChange={change} error={errors.tanggal_lahir}/></div>
            <label className="grid gap-1.5 text-xs font-semibold text-ink-soft">Jenis kelamin<select name="jenis_kelamin" value={form.jenis_kelamin} onChange={change} className="h-10 rounded-lg border border-line bg-white px-3 text-sm font-normal text-ink"><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></label>
            <Field label="Alamat" name="alamat" value={form.alamat} onChange={change} error={errors.alamat}/><div className="grid gap-4 sm:grid-cols-2"><Field label="Nama kontak darurat" name="nama_kontak_darurat" value={form.nama_kontak_darurat} onChange={change} error={errors.nama_kontak_darurat}/><Field label="Nomor kontak darurat" name="kontak_darurat" value={form.kontak_darurat} onChange={change} error={errors.kontak_darurat} inputMode="tel"/></div><div className="flex justify-end"><Button icon={Save} onClick={save}>Simpan perubahan</Button></div>
          </form> : <div className="mt-4 divide-y divide-line/60 text-sm"><p className="flex justify-between gap-3 py-3"><span className="text-ink-soft">Tempat / tanggal lahir</span><b className="text-right">{pasien.tempat_lahir}, {pasien.tanggal_lahir ? formatTanggal(pasien.tanggal_lahir) : '—'}</b></p><p className="flex justify-between gap-3 py-3"><span className="text-ink-soft">Jenis kelamin</span><b>{pasien.jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki'}</b></p><p className="flex justify-between gap-3 py-3"><span className="text-ink-soft">Nomor rekam medis</span><b>P-{String(pasien.id_pasien ?? '').padStart(4, '0')}</b></p></div>}
        </div><footer className="flex items-center gap-2 bg-surface-low px-5 py-3 text-xs text-ink-soft"><ShieldCheck className="size-4 text-brand"/>Informasi identitas Anda dijaga di portal pasien.</footer>
      </section>
      <div className="grid gap-6">
        <section className="overflow-hidden rounded-2xl bg-white shadow-card"><header className="bg-surface-low px-5 py-4"><h2 className="flex items-center gap-2 font-semibold text-ink"><MapPin className="size-5 text-brand"/>Domisili & Kontak Pasien</h2></header><div className="grid gap-4 p-5"><div><p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">Alamat</p><p className="rounded-xl bg-surface-low p-4 text-sm leading-6 text-ink">{pasien.alamat}</p></div><div className="rounded-xl bg-surface-low p-4"><p className="text-xs font-semibold text-ink-muted">Kontak darurat</p><p className="mt-2 text-sm font-semibold text-ink">{pasien.nama_kontak_darurat || 'Kontak Darurat'}</p><p className="mt-1 flex items-center gap-2 text-sm text-ink-soft"><Phone className="size-4 text-brand"/>{pasien.kontak_darurat}</p><a className="mt-2 inline-flex text-xs font-semibold text-brand" href={`tel:${pasien.kontak_darurat}`}>Hubungi kontak</a></div></div></section>
        <section className="overflow-hidden rounded-2xl bg-white shadow-card"><header className="flex items-center justify-between bg-surface-low px-5 py-4"><h2 className="flex items-center gap-2 font-semibold text-ink"><CalendarDays className="size-5 text-brand"/>Riwayat Kunjungan Poliklinik</h2><span className="rounded-full bg-white px-3 py-1 text-xs text-ink-soft">{riwayat.length} kunjungan</span></header>
          {riwayat.length ? <div className="divide-y divide-line/60">{riwayat.map((item) => <div key={item.id_reservasi} className="grid gap-1 px-5 py-4 sm:grid-cols-[130px_1fr_auto]"><b className="text-sm text-ink">{formatTanggal(item.tanggal)}</b><div><p className="text-sm font-semibold text-ink">{item.nama_poli}</p><p className="text-xs text-ink-soft">dr. {item.nama_dokter}</p></div><span className="self-center rounded-full bg-brand-light-active px-3 py-1 text-[10px] font-bold uppercase text-brand">Selesai</span></div>)}</div> : <p className="p-6 text-sm text-ink-muted">Belum ada kunjungan selesai yang tercatat.</p>}
          <footer className="border-t border-line/60 px-5 py-3 text-xs text-ink-muted">Riwayat kunjungan menampilkan reservasi yang sudah selesai.</footer>
        </section>
      </div>
    </div>
  </AppLayout>;
}
