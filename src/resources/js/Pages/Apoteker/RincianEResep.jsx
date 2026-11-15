import { useState } from 'react';
import { router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardList, PackageCheck, ShieldAlert, XCircle } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/ui/Button';
import Badge from '../../Components/ui/Badge';
import Modal from '../../Components/ui/Modal';
import { toast } from '../../Components/ui/Toast';
import { rute } from '../../lib/rute';

export default function RincianEResep({ eresepId, resepServer }) {
  const resep = resepServer;
  const [modalTolak, setModalTolak] = useState(false);
  const [alasan, setAlasan] = useState('');
  const [error, setError] = useState('');
  const [statusTersimpan, setStatusTersimpan] = useState(null);
  const statusResep = statusTersimpan ?? resep?.status;

  function setujui() {
    router.post(`/apoteker/e-resep/${eresepId}/status`, { statusBaru: 'siap_diserahkan' }, {
      onSuccess: () => router.visit(rute.apoteker.pengirimanObat(resep.id)),
      onError: () => toast.error('Status E-Resep gagal diperbarui.'),
    });
  }

  function tolakResep() {
    if (!alasan.trim()) {
      setError('Alasan penolakan wajib diisi.');
      return;
    }
    router.post(`/apoteker/e-resep/${eresepId}/status`, { statusBaru: 'ditolak', alasanPenolakan: alasan.trim() }, {
      onSuccess: () => { setStatusTersimpan('Ditolak'); setModalTolak(false); toast.success('E-Resep ditolak dan status tersimpan.'); },
      onError: () => toast.error('Status E-Resep gagal diperbarui.'),
    });
  }

  const totalObat = resep.items?.length ?? 0;
  if (!resep) return <AppLayout role="apoteker" title="Rincian E-Resep"><p className="rounded-xl bg-white p-6">Data E-Resep tidak ditemukan di database.</p></AppLayout>;

  return (
    <AppLayout role="apoteker" title="Rincian E-Resep" contentClassName="pl-3 pr-9 xl:pl-[27px] xl:pr-[100px]">
      <div className="flex flex-wrap items-center justify-between gap-3"><Button variant="ghost" icon={ArrowLeft} onClick={() => router.visit(rute.apoteker.notifikasiEResep)}>Kembali ke Notifikasi</Button><Badge tone={statusResep === 'Ditolak' ? 'danger' : 'success'} dot>{statusResep}</Badge></div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-[10px] font-semibold uppercase tracking-wide text-brand">Farmasi Rawat Jalan • Telaah Resep</p><h1 className="mt-1 flex items-center gap-2 text-[28px] font-bold">Rincian E-Resep <Badge tone="success">Database</Badge></h1><p className="text-[13px] text-ink-muted">Periksa kelengkapan resep, ketersediaan obat, dan catatan dokter.</p></div>
        <div className="rounded-xl bg-white px-4 py-2 shadow-card"><small className="block text-[9px] uppercase text-ink-muted">Nomor E-Resep Digital</small><b className="text-sm">{resep.id}</b></div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-4">
          <article className="rounded-2xl bg-white p-5 shadow-card">
            <div className="flex items-start justify-between gap-3"><div><h2 className="text-base font-bold">{resep.pasien}</h2><p className="mt-1 text-[11px] text-ink-muted">ID Pasien {resep.pasienId} • Poli {resep.poli ?? 'Belum tercatat'}</p></div></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">{[['Dokter Penulis', resep.dokter], ['Waktu Resep', new Date(resep.tanggal).toLocaleString('id-ID')], ['Jumlah Obat', `${totalObat} jenis obat`]].map(([label, value]) => <div key={label} className="rounded-lg bg-surface-low p-3"><small className="block text-[9px] uppercase text-ink-muted">{label}</small><b className="text-xs">{value}</b></div>)}</div>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow-card">
            <div className="flex items-center justify-between"><div><h2 className="flex items-center gap-2 text-base font-bold"><ClipboardList className="size-5 text-brand" />Detail Peresepan</h2><p className="text-[11px] text-ink-muted">Telaah sediaan, dosis, jumlah, dan instruksi konsumsi.</p></div><Badge tone="neutral">{totalObat} item</Badge></div>
            <div className="mt-4 space-y-3">{resep.items?.map((item, index) => {
              const stok = item.jumlah_stok;
              return <div key={`${item.nama}-${index}`} className="rounded-xl bg-surface-low p-4">
                <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-sm font-bold">{index + 1}. {item.nama}</p><p className="mt-1 text-[11px] text-ink-muted">{item.dosis} • {item.satuan}</p></div><Badge tone={stok > 0 ? 'success' : 'warning'} dot>{stok > 0 ? 'Tersedia' : 'Stok perlu diperiksa'}</Badge></div>
                <p className="mt-3 text-xs"><b>Aturan pakai:</b> {item.aturan}</p>
                {item.batch && <p className="mt-1 text-[10px] text-ink-muted">{item.batch}</p>}
                {stok !== undefined && <p className={`mt-2 text-[10px] font-semibold ${stok > 0 ? 'text-brand-dark' : 'text-warning'}`}>Stok: {stok} unit</p>}
              </div>;
            })}</div>
          </article>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl bg-white p-5 shadow-card">
            <h2 className="flex items-center gap-2 font-bold"><PackageCheck className="size-5 text-brand" />Ketersediaan Obat</h2>
            <p className="mt-1 text-[10px] text-ink-muted">Jumlah stok dari database inventaris.</p>
            <div className="mt-3 space-y-2">{resep.items?.map((item) => {
              const stok = item.jumlah_stok;
              return <div key={item.nama} className="flex items-center justify-between gap-2 border-b border-line py-2 text-[11px]"><span>{item.nama}</span><b className={stok > 0 ? 'text-brand-dark' : 'text-warning'}>{stok ?? 0} unit</b></div>;
            })}</div>
          </section>
          {statusResep === 'Ditolak' && <div className="rounded-xl bg-danger-light p-4 text-xs text-danger"><ShieldAlert className="mb-2 size-5" /><b>Resep ditolak.</b><p className="mt-1">{resep.alasan_penolakan || 'Tidak ada alasan tercatat.'}</p></div>}
          <div className="space-y-2 rounded-2xl bg-white p-4 shadow-card">
            <Button icon={ArrowRight} className="w-full" onClick={setujui} disabled={statusResep === 'Ditolak'}>Setujui &amp; Siapkan Obat</Button>
            <Button variant="outline" icon={XCircle} className="w-full" onClick={() => setModalTolak(true)} disabled={statusResep === 'Ditolak'}>Tolak Resep</Button>
          </div>
        </aside>
      </section>

      <Modal open={modalTolak} onClose={() => setModalTolak(false)} title="Tolak E-Resep" description="Tuliskan alasan agar dokter dapat menindaklanjuti." footer={<><Button variant="secondary" onClick={() => setModalTolak(false)}>Batal</Button><Button variant="danger" icon={XCircle} onClick={tolakResep}>Konfirmasi Penolakan</Button></>}>
        <label className="block text-xs font-semibold">Alasan penolakan<textarea value={alasan} onChange={(e) => { setAlasan(e.target.value); setError(''); }} className="mt-2 min-h-24 w-full rounded-lg bg-surface-low p-3 text-xs outline-none focus:ring-2 focus:ring-brand/30" placeholder="Contoh: dosis perlu dikonfirmasi ke dokter..." /></label>
        {error && <p role="alert" className="mt-2 text-xs text-danger">{error}</p>}
      </Modal>
    </AppLayout>
  );
}
