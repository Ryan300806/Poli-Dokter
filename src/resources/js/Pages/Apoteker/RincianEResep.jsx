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

  const adaStokKurang = Boolean(resep?.items?.some((i) => Number(i.jumlah_stok ?? 0) < Number(i.jumlah_obat ?? 0)));
  const sudahSelesai = resep?.status === 'Obat Sudah Diberikan';
  const ditolak = resep?.status === 'Ditolak';

  function setujui() {
    if (adaStokKurang) {
      toast.error('Stok obat tidak mencukupi untuk resep ini.');
      return;
    }
    router.post(`/apoteker/e-resep/${eresepId}/status`, { statusBaru: 'siap_diserahkan' }, {
      onSuccess: () => router.visit(rute.apoteker.pengirimanObat(resep.id)),
      onError: (errs) => toast.error(errs.stok || 'Gagal memperbarui status E-Resep.'),
    });
  }

  function tolakResep() {
    if (!alasan.trim()) {
      setError('Alasan penolakan wajib diisi agar dokter dapat memperbaikinya.');
      return;
    }
    router.post(`/apoteker/e-resep/${eresepId}/status`, { statusBaru: 'ditolak', alasanPenolakan: alasan.trim() }, {
      onSuccess: () => { setModalTolak(false); toast.success('E-Resep ditolak dan dikembalikan ke dokter.'); },
      onError: () => toast.error('Gagal menolak E-Resep.'),
    });
  }

  return (
    <AppLayout role="apoteker" title="Rincian & Cek Stok E-Resep">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" icon={ArrowLeft} onClick={() => router.visit(rute.apoteker.notifikasiEResep)}>
          Kembali ke Notifikasi
        </Button>
        <Badge tone={ditolak ? 'danger' : 'success'} dot>{resep.status}</Badge>
      </div>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-brand">FARMASI RAWAT JALAN • TELAAH RESEP</p>
          <h1 className="mt-1 text-3xl font-extrabold text-ink">Rincian E-Resep &amp; Ketersediaan Stok</h1>
        </div>
        <div className="rounded-2xl bg-white px-4 py-2.5 shadow-card">
          <small className="block text-[9px] font-bold uppercase text-ink-muted">NOMOR E-RESEP</small>
          <b className="text-sm text-brand">#{resep.id}</b>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[1.5fr_0.85fr]">
        <div className="space-y-5">
          <section className="rounded-2xl bg-white p-5 shadow-card">
            <h2 className="text-base font-bold text-ink">{resep.pasien} <Badge tone="neutral">{resep.rm}</Badge></h2>
            <p className="mt-1 text-xs text-ink-muted">Poli: <b>{resep.poli}</b> • Diagnosis: <b>{resep.diagnosis}</b></p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs">
              <div className="rounded-xl bg-surface-low p-3"><small className="block text-[9px] font-bold uppercase text-ink-muted">DOKTER PENULIS</small><b>{resep.dokter}</b></div>
              <div className="rounded-xl bg-surface-low p-3"><small className="block text-[9px] font-bold uppercase text-ink-muted">WAKTU KIRIM</small><b>{new Date(resep.tanggal).toLocaleString('id-ID')}</b></div>
              <div className="rounded-xl bg-surface-low p-3"><small className="block text-[9px] font-bold uppercase text-ink-muted">TOTAL ITEM</small><b>{resep.items?.length ?? 0} Jenis Obat</b></div>
            </div>
          </section>

          {/* Tabel Cek Stok Fisik Farmasi (_p36) */}
          <section className="rounded-2xl bg-white shadow-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-line p-5">
              <h2 className="flex items-center gap-2 text-base font-bold text-ink">
                <ClipboardList className="size-5 text-brand" /> Detail Peresepan &amp; Stok Fisik Farmasi
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-low text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  <tr>
                    <th className="px-5 py-3">Nama Obat &amp; Sediaan</th>
                    <th className="px-4 py-3">Dosis &amp; Aturan</th>
                    <th className="px-4 py-3 text-center">Butuh</th>
                    <th className="px-4 py-3 text-center">Stok Farmasi</th>
                    <th className="px-5 py-3 text-right">Status Ketersediaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {resep.items?.map((item, idx) => {
                    const stok = Number(item.jumlah_stok ?? 0);
                    const butuh = Number(item.jumlah_obat ?? 0);
                    const cukup = stok >= butuh;
                    return (
                      <tr key={`${item.id_obat}-${idx}`}>
                        <td className="px-5 py-4 font-bold text-ink">{item.nama}</td>
                        <td className="px-4 py-4">
                          <p className="font-bold text-ink">{item.dosis}</p>
                          <p className="text-[11px] text-ink-soft">{item.aturan}</p>
                        </td>
                        <td className="px-4 py-4 text-center font-bold">{butuh}</td>
                        <td className={`px-4 py-4 text-center font-extrabold ${cukup ? 'text-brand-dark' : 'text-danger'}`}>
                          {stok} unit
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Badge tone={cukup ? 'success' : stok > 0 ? 'warning' : 'danger'}>
                            {cukup ? 'Tersedia Lengkap' : stok > 0 ? 'Stok Kurang' : 'Obat Tidak Tersedia'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl bg-white p-5 shadow-card">
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
              <PackageCheck className="size-5 text-brand" /> Ringkasan Ketersediaan
            </h2>
            <div className="mt-3 space-y-2">
              {resep.items?.map((item, i) => {
                const stok = Number(item.jumlah_stok ?? 0);
                const butuh = Number(item.jumlah_obat ?? 0);
                const cukup = stok >= butuh;
                return (
                  <div key={i} className="flex items-center justify-between border-b border-line py-2 text-xs last:border-b-0">
                    <span className="text-ink-soft">{item.nama}</span>
                    <b className={cukup ? 'text-brand-dark' : 'text-danger'}>{stok} / {butuh} unit</b>
                  </div>
                );
              })}
            </div>
          </section>

          {adaStokKurang && !ditolak && !sudahSelesai && (
            <div role="alert" className="rounded-2xl bg-warning-light p-4 text-xs text-warning">
              <b>Stok obat tidak mencukupi!</b>
              <p className="mt-1">Beberapa item melebihi stok gudang. Tolak resep agar dokter dapat mengganti obat/jumlahnya.</p>
            </div>
          )}

          {ditolak && (
            <div className="rounded-2xl bg-danger-light p-4 text-xs text-danger">
              <ShieldAlert className="mb-1.5 size-5" />
              <b>Resep Ditolak</b>
              <p className="mt-1">{resep.alasan_penolakan || 'Tidak ada alasan tercatat.'}</p>
            </div>
          )}

          <div className="space-y-2.5 rounded-2xl bg-white p-4 shadow-card">
            {resep.status === 'Siap Diserahkan' ? (
              <Button icon={ArrowRight} className="w-full" onClick={() => router.visit(rute.apoteker.pengirimanObat(resep.id))}>
                Lanjut ke Penyerahan Obat
              </Button>
            ) : (
              <Button
                icon={CheckCircle2}
                className="w-full"
                disabled={ditolak || sudahSelesai || adaStokKurang}
                onClick={setujui}
              >
                Setujui &amp; Siapkan Obat
              </Button>
            )}
            <Button
              variant="softDanger"
              icon={XCircle}
              className="w-full"
              disabled={ditolak || sudahSelesai}
              onClick={() => setModalTolak(true)}
            >
              Tolak Resep
            </Button>
          </div>
        </aside>
      </div>

      <Modal
        open={modalTolak}
        onClose={() => setModalTolak(false)}
        title="Tolak E-Resep"
        subtitle="Alasan penolakan akan tampil di halaman Dokter untuk diperbaiki."
        footer={(
          <>
            <Button variant="secondary" onClick={() => setModalTolak(false)}>Batal</Button>
            <Button variant="danger" icon={XCircle} onClick={tolakResep}>Konfirmasi Penolakan</Button>
          </>
        )}
      >
        <label className="block text-xs font-bold">
          Alasan Penolakan <span className="text-danger">*</span>
          <textarea
            rows={3}
            value={alasan}
            onChange={(e) => { setAlasan(e.target.value); setError(''); }}
            placeholder="Contoh: Stok obat habis atau dosis perlu dikonfirmasi ulang..."
            className="mt-2 w-full rounded-xl bg-surface-input p-3 text-xs outline-none focus:ring-2 focus:ring-brand/30"
          />
        </label>
        {error && <p className="mt-2 text-xs font-semibold text-danger">{error}</p>}
      </Modal>
    </AppLayout>
  );
}
