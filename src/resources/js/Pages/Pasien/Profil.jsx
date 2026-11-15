import { useState } from 'react';
import { BadgeCheck, CalendarDays, Contact, MapPin, Phone, ShieldCheck, UserCog, UserRound } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import PageHeader from '../../Components/ui/PageHeader';
import Badge from '../../Components/ui/Badge';
import Button from '../../Components/ui/Button';
import EditDataModal from '../../Components/Pasien/EditDataModal';

const formatTanggal = (value) => value ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value.slice(0, 10)}T00:00:00`)) : '—';
function BarisData({ label, children }) {
  return <div className="flex items-center justify-between gap-4 border-b border-line/60 py-3 text-[13px] last:border-b-0"><span className="text-ink-soft">{label}</span><span className="text-right font-medium text-ink">{children}</span></div>;
}

export default function Profil({ pasien = {}, riwayat = [], infoPembaruan = {} }) {
  const [modalBuka, setModalBuka] = useState(false);
  return <AppLayout role="pasien" title="Profil Pasien">
    <div className="flex flex-col gap-6">
      <PageHeader title="Profil Pasien Terintegrasi" actions={<Button icon={UserCog} onClick={() => setModalBuka(true)}>Mutakhirkan Data Pasien</Button>}>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-brand"><Contact className="size-3.5"/>Modul data pasien terpusat</span>
        <Badge tone="success" icon={BadgeCheck} className="uppercase">Status: terverifikasi</Badge>
      </PageHeader>
      {!infoPembaruan.canUpdate && infoPembaruan.nextAvailableAt && <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-ink-soft">Pemutakhiran profil berikutnya tersedia pada <b>{formatTanggal(infoPembaruan.nextAvailableAt)}</b>. Data tetap dapat dilihat selama masa tunggu.</p>}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <section className="overflow-hidden rounded-2xl bg-white shadow-card">
          <header className="flex items-center justify-between gap-3 bg-surface-low px-5 py-4"><h2 className="flex items-center gap-3 text-base font-semibold text-ink"><Contact className="size-5 text-brand"/>Identifikasi Pasien</h2><Badge tone="neutral" className="rounded-md">ID P-{String(pasien.id_pasien ?? '').padStart(4, '0')}</Badge></header>
          <div className="flex flex-col gap-4 p-5">
            <div className="flex gap-4 rounded-xl bg-surface-low p-4"><div className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-surface-mid text-ink-muted"><UserRound className="size-8"/></div><div className="min-w-0 flex-1"><p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">Nama lengkap pasien</p><p className="text-xl font-bold leading-7 text-ink">{pasien.nama_lengkap}</p><div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-1.5 text-[13px]"><span className="text-[10px] font-medium text-ink-muted">NIK</span><span className="font-semibold tracking-wide text-ink">{pasien.nik?.slice(0, 6)}{'•'.repeat(6)}{pasien.nik?.slice(-4)}</span></div></div></div>
            <div><BarisData label="Tempat / Tanggal Lahir">{pasien.tempat_lahir}, {formatTanggal(pasien.tanggal_lahir)}</BarisData><BarisData label="Jenis Kelamin">{pasien.jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki'}</BarisData><BarisData label="Golongan Darah"><span className="rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-600">{pasien.golongan_darah || 'Belum diketahui'}</span></BarisData><BarisData label="Nomor Rekam Medis">P-{String(pasien.id_pasien ?? '').padStart(4, '0')}</BarisData></div>
            <div className="rounded-lg bg-brand-light px-3 py-2.5 text-xs text-brand-dark"><span className="flex items-center gap-2 font-medium"><ShieldCheck className="size-4"/>Data identitas terhubung dengan akun pasien</span></div>
          </div>
          <footer className="flex items-center gap-2 bg-surface-low px-5 py-3 text-[11px] font-medium text-ink-soft"><ShieldCheck className="size-3.5 text-brand"/>Informasi identitas tersimpan pada rekam medis pasien.</footer>
        </section>
        <div className="flex flex-col gap-6">
          <section className="overflow-hidden rounded-2xl bg-white shadow-card"><header className="flex items-center justify-between gap-3 bg-surface-low px-5 py-4"><h2 className="flex items-center gap-3 text-base font-semibold text-ink"><MapPin className="size-5 text-brand"/>Domisili & Kontak Pasien</h2><Badge tone="success" className="uppercase">Data terverifikasi</Badge></header><div className="flex flex-col gap-4 p-5"><div><p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">Alamat lengkap</p><p className="rounded-xl bg-surface-low p-4 text-sm leading-6 text-ink">{pasien.alamat}</p></div><div className="grid gap-4 sm:grid-cols-2"><div className="rounded-xl bg-surface-low p-4"><p className="text-xs text-ink-muted">Nama kontak darurat</p><p className="mt-1 font-semibold text-ink">{pasien.nama_kontak_darurat || 'Belum diisi'}</p></div><div className="rounded-xl bg-surface-low p-4"><p className="text-xs text-ink-muted">Nomor telepon</p><p className="mt-1 flex items-center gap-2 font-semibold text-ink"><Phone className="size-4 text-brand"/>{pasien.kontak_darurat}</p></div></div></div></section>
          <section className="overflow-hidden rounded-2xl bg-white shadow-card"><header className="flex items-center justify-between bg-surface-low px-5 py-4"><h2 className="flex items-center gap-3 text-base font-semibold text-ink"><CalendarDays className="size-5 text-brand"/>Riwayat Kunjungan Poliklinik</h2><Badge tone="neutral">{riwayat.length} kunjungan</Badge></header>
            {riwayat.length ? <div className="divide-y divide-line/60">{riwayat.map((item) => <div key={item.id_reservasi} className="grid gap-2 px-5 py-4 sm:grid-cols-[120px_1fr_auto]"><div><b className="text-sm text-ink">{formatTanggal(item.tanggal)}</b><p className="text-[10px] text-ink-muted">REG-{item.id_reservasi}</p></div><div><p className="text-sm font-semibold text-ink">{item.nama_poli}</p><p className="text-xs text-ink-soft">{item.nama_dokter}</p></div><Badge tone="success" className="self-center uppercase">Selesai</Badge></div>)}</div> : <p className="p-6 text-sm text-ink-muted">Belum ada kunjungan selesai yang tercatat.</p>}
            <footer className="border-t border-line/60 px-5 py-3 text-xs text-ink-muted">Riwayat kunjungan menampilkan reservasi yang sudah selesai.</footer>
          </section>
        </div>
      </div>
      <EditDataModal open={modalBuka} onClose={() => setModalBuka(false)} pasien={pasien} infoPembaruan={infoPembaruan}/>
    </div>
  </AppLayout>;
}
