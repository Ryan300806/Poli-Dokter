import { useState } from 'react';
import { router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, ClipboardCheck, ShieldCheck, UserRound } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/ui/Button';
import Badge from '../../Components/ui/Badge';
import { toast } from '../../Components/ui/Toast';
import { rute } from '../../lib/rute';

export default function PengirimanObat({ eresepId, eresepServer }) {
  const resep = eresepServer;
  const [identitasSesuai, setIdentitasSesuai] = useState(false);
  const [konselingSelesai, setKonselingSelesai] = useState(false);
  const [sibuk, setSibuk] = useState(false);
  const sudahDiserahkan = resep?.status === 'Obat Sudah Diberikan';

  function konfirmasiPenyerahan() {
    if (!identitasSesuai || !konselingSelesai) {
      toast.error('Centang verifikasi identitas dan konfirmasi konseling obat terlebih dahulu.');
      return;
    }

    if (sibuk) return;
    setSibuk(true);
    router.post(`/apoteker/e-resep/${eresepId}/status`, {
      statusBaru: 'selesai', versi: resep.versi, identitasSesuai, konselingSelesai,
    }, {
      onError: (errs) => toast.error(Object.values(errs)[0] || 'Penyerahan belum tersimpan.'),
      onFinish: () => setSibuk(false),
    });
  }

  return (
    <AppLayout role="apoteker" title="Pengecekan & Penyerahan Obat">
      <div className="flex items-center justify-between">
        <Button variant="ghost" icon={ArrowLeft} onClick={() => router.visit(rute.apoteker.notifikasiEResep)}>
          Kembali ke Notifikasi
        </Button>
        <Badge tone="success" dot>{resep.status}</Badge>
      </div>

      <header>
        <p className="text-[11px] font-bold uppercase tracking-wider text-brand">FARMASI RAWAT JALAN • LOKET PENYERAHAN OBAT</p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-ink">Pengecekan &amp; Penyerahan Obat Pasien</h1>
        <p className="mt-1 text-xs text-ink-soft">Verifikasi identitas pasien dan pemeriksaan kesesuaian obat sebelum penyerahan di loket farmasi.</p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-5">
          <section className="rounded-2xl border-l-4 border-brand bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <small className="block text-[11px] font-bold uppercase text-ink-muted">NOMOR E-RESEP DIGITAL</small>
                <b className="text-base text-ink">#{resep.id}</b>
              </div>
              <Badge tone="success">{sudahDiserahkan ? 'Obat Sudah Diberikan' : 'Siap Diserahkan'}</Badge>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs">
              <div><small className="block text-ink-muted">Nama Pasien</small><b>{resep.pasien}</b></div>
              <div><small className="block text-ink-muted">No. Rekam Medis</small><b>{resep.rm}</b></div>
              <div><small className="block text-ink-muted">Dokter Penulis</small><b>{resep.dokter}</b></div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
                <UserRound className="size-4 text-brand" /> 1. Verifikasi Identitas Pengambil Obat
              </h2>
              <Badge tone={sudahDiserahkan ? 'success' : 'warning'}>{sudahDiserahkan ? 'Diserahkan' : 'Cocokkan di loket'}</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 text-xs">
              <div className="rounded-xl bg-surface-low p-3"><small className="block text-ink-muted">Nama Lengkap</small><b>{resep.pasien}</b></div>
              <div className="rounded-xl bg-surface-low p-3"><small className="block text-ink-muted">NIK</small><b>{resep.nik}</b></div>
              <div className="rounded-xl bg-surface-low p-3"><small className="block text-ink-muted">Tanggal Lahir</small><b>{resep.tanggal_lahir}</b></div>
            </div>
            {!sudahDiserahkan && (<label className="flex items-center gap-2.5 text-xs font-medium text-ink-soft cursor-pointer">
              <input type="checkbox" checked={identitasSesuai} disabled={sibuk} onChange={(e) => setIdentitasSesuai(e.target.checked)} className="size-4 accent-brand" />
              <span>Saya telah mencocokkan nama dan NIK/RM dengan identitas pengambil obat.</span>
            </label>)}
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-card space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
              <ClipboardCheck className="size-4 text-brand" /> 2. Pemeriksaan Kesesuaian Obat &amp; Konseling
            </h2>
            <div className="space-y-2.5">
              {resep.items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-xl bg-surface-low p-3.5 text-xs">
                  <div>
                    <b className="text-ink">{item.nama}</b>
                    <p className="mt-0.5 text-[11px] text-ink-soft">{item.dosis} • {item.satuan} unit • Aturan: <b>{item.aturan}</b></p>
                  </div>
                  <Badge tone="success">Stok: {item.jumlah_stok ?? 0}</Badge>
                </div>
              ))}
            </div>
            {!sudahDiserahkan && (<label className="flex items-start gap-2.5 rounded-xl bg-brand-light-active p-3.5 text-xs font-medium text-brand-dark cursor-pointer">
              <input type="checkbox" checked={konselingSelesai} disabled={sibuk} onChange={(e) => setKonselingSelesai(e.target.checked)} className="mt-0.5 size-4 accent-brand" />
              <span>Instruksi cara minum, dosis, dan aturan penyimpanan obat telah dijelaskan kepada pasien di loket penyerahan.</span>
            </label>)}
          </section>
        </div>

        <aside className="rounded-2xl border-t-4 border-brand bg-white p-5 shadow-card space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand text-white">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-ink">Konfirmasi Obat</h2>
              <p className="text-[11px] text-ink-muted">Farmasi Rawat Jalan</p>
            </div>
          </div>

          <div className="space-y-2 border-y border-line py-3 text-xs">
            <p className="flex justify-between"><span className="text-ink-muted">Status Penyiapan:</span><b className="text-brand">{resep.status}</b></p>
            <p className="flex justify-between"><span className="text-ink-muted">Pasien:</span><b>{resep.pasien}</b></p>
            <p className="flex justify-between"><span className="text-ink-muted">Total Item:</span><b>{new Set(resep.items.map((item) => item.id_obat)).size} jenis obat</b></p>
          </div>

          <Button
            icon={CheckCircle2}
            className="w-full h-11"
            disabled={sibuk || sudahDiserahkan || !identitasSesuai || !konselingSelesai}
            onClick={konfirmasiPenyerahan}
          >
            {sudahDiserahkan ? 'Obat Sudah Diberikan' : 'Konfirmasi Penyerahan'}
          </Button>
        </aside>
      </div>
    </AppLayout>
  );
}
