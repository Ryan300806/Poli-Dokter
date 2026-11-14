import { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { ArrowLeft, Check, CheckCircle2, ClipboardCheck, Copy, PackageCheck, Printer, ShieldCheck, UserRound } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/ui/Button';
import Badge from '../../Components/ui/Badge';
import Modal from '../../Components/ui/Modal';
import { toast } from '../../Components/ui/Toast';
import { resepApotekerDemo } from '../../data/apotekerDemo';
import { bacaDemo, simpanDemo } from '../../lib/demoStorage';
import { rute } from '../../lib/rute';

function ambilSemua() {
  const dynamic = bacaDemo('polidokter-demo-eresep', []);
  const statuses = bacaDemo('polidokter-demo-eresep-status', {});
  const gabungan = [...dynamic, ...resepApotekerDemo];
  return gabungan.filter((item, index) => gabungan.findIndex((resep) => resep.id === item.id) === index)
    .map((item) => ({ ...item, ...(statuses[item.id] ?? {}) }));
}

function Langkah({ nomor, judul, sub, aktif, selesai }) {
  return <div className={`flex flex-1 items-center gap-2 rounded-full px-3 py-2 ${aktif ? 'bg-brand-light-active text-brand-dark' : selesai ? 'bg-brand-light text-brand-dark' : 'bg-surface-low text-ink-muted'}`}><span className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${aktif || selesai ? 'bg-brand text-white' : 'bg-surface-mid'}`}>{selesai ? <Check className="size-3" /> : nomor}</span><span><b className="block text-[9px] uppercase">{judul}</b><small className="text-[8px]">{sub}</small></span></div>;
}

export default function PengirimanObat({ eresepId }) {
  const resepDaftar = useMemo(ambilSemua, []);
  const resep = resepDaftar.find((item) => item.id === eresepId) ?? resepDaftar.find((item) => item.status === 'Siap Diserahkan') ?? resepDaftar[0];
  const [identitasSesuai, setIdentitasSesuai] = useState(false);
  const [modalKonfirmasi, setModalKonfirmasi] = useState(false);
  const sudahDiserahkan = resep.status === 'Obat Sudah Diberikan';

  function konfirmasiPenyerahan() {
    if (!identitasSesuai) {
      toast.error('Centang verifikasi identitas pasien sebelum mengonfirmasi.');
      return;
    }
    try {
      const dynamic = bacaDemo('polidokter-demo-eresep', []);
      const updated = dynamic.map((item) => item.id === resep.id ? { ...item, status: 'Obat Sudah Diberikan', dibaca: true, diserahkanPada: new Date().toISOString() } : item);
      simpanDemo('polidokter-demo-eresep', updated);
      const statuses = bacaDemo('polidokter-demo-eresep-status', {});
      simpanDemo('polidokter-demo-eresep-status', { ...statuses, [resep.id]: { ...(statuses[resep.id] ?? {}), status: 'Obat Sudah Diberikan', dibaca: true, diserahkanPada: new Date().toISOString() } });
      setModalKonfirmasi(false);
      toast.success('Penyerahan obat tercatat pada data demo browser.');
      router.visit(rute.apoteker.notifikasiEResep);
    } catch (error) {
      console.error('Gagal menyimpan penyerahan obat demo.', error);
      toast.error('Penyerahan obat belum tersimpan. Periksa izin penyimpanan browser lalu coba lagi.');
    }
  }

  const receipt = resepDaftar.find((item) => item.id === 'RX-20251115-1234');

  return (
    <AppLayout role="apoteker" title="Penyerahan Obat Pasien" contentClassName="pl-3 pr-9 xl:pl-[27px] xl:pr-[100px]">
      <div className="flex items-center justify-between"><Button variant="ghost" icon={ArrowLeft} onClick={() => router.visit(rute.apoteker.notifikasiEResep)}>Kembali ke Resep</Button><Badge tone="success" dot>Antrean Loket: F-042</Badge></div>
      <header><p className="text-[9px] font-semibold uppercase tracking-wide text-brand">UI-023: Farmasi Rawat Jalan • Loket Penyerahan Obat 2 • Demo Lokal</p><h1 className="mt-1 text-[27px] font-bold">Penyerahan Obat Pasien</h1><p className="text-[13px] text-ink-muted">Verifikasi identitas pasien dan pemeriksaan kesesuaian obat sebelum penyerahan di loket farmasi.</p></header>

      <div className="flex flex-wrap gap-2"><Langkah nomor="1" judul="Tahap 01" sub="Identifikasi Pasien" selesai /><Langkah nomor="2" judul="Tahap 02 • Sedang Berlangsung" sub="Pemeriksaan Obat & Telaah" aktif /><Langkah nomor="3" judul="Tahap 03" sub="Konfirmasi Penyerahan" /></div>

      <div className="grid items-start gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-4">
          <section className="overflow-hidden rounded-2xl border-l-4 border-brand bg-white shadow-card">
            <div className="flex items-center justify-between bg-surface-low p-4"><div><small className="block text-[9px] uppercase text-ink-muted">Nomor E-Resep Digital</small><b className="text-sm">{resep.id}</b></div><Badge tone={sudahDiserahkan ? 'success' : 'success'} dot>{sudahDiserahkan ? 'Obat Sudah Diberikan' : 'Obat Selesai Diracik (Siap Diserahkan)'}</Badge></div>
            <div className="grid gap-3 p-4 sm:grid-cols-4">{[['Nama Pasien', resep.pasien], ['No. Rekam Medis', resep.rm], ['Dokter Penulis', resep.dokter], ['Waktu Siap Obat', new Date(resep.tanggal).toLocaleString('id-ID')]].map(([label, value]) => <div key={label}><small className="block text-[9px] text-ink-muted">{label}</small><b className="text-[10px]">{value}</b></div>)}</div>
          </section>

          <section className="rounded-2xl bg-white p-4 shadow-card">
            <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-sm font-bold"><UserRound className="size-4 text-brand" />Verifikasi Identitas Pengambil Obat</h2><Badge tone="warning">Wajib diperiksa</Badge></div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">{[['Nama Lengkap Pasien', resep.pasien], ['No. Rekam Medis (RM)', resep.rm], ['Tanggal Lahir & Usia', '14 Mei 1979 • 45 Tahun']].map(([label, value]) => <div key={label} className="rounded-lg bg-surface-low p-3"><small className="block text-[9px] text-ink-muted">{label}</small><b className="text-[11px]">{value}</b></div>)}</div>
            <label className="mt-3 flex cursor-pointer items-start gap-2 text-[11px]"><input type="checkbox" checked={identitasSesuai} onChange={(e) => setIdentitasSesuai(e.target.checked)} className="mt-0.5 accent-brand" /><span>Saya telah mencocokkan nama dan nomor rekam medis dengan identitas pengambil obat.</span></label>
          </section>

          <section className="rounded-2xl bg-white p-4 shadow-card">
            <h2 className="flex items-center gap-2 text-sm font-bold"><ClipboardCheck className="size-4 text-brand" />Pemeriksaan Kesesuaian Obat &amp; Konseling Farmasi</h2>
            <div className="mt-3 space-y-2">{resep.items?.map((item, index) => <div key={`${item.nama}-${index}`} className="rounded-xl bg-surface-low p-3"><div className="flex items-start justify-between gap-3"><div><b className="text-xs">{item.nama}</b><small className="mt-1 block text-[9px] text-ink-muted">{item.satuan} • <Badge tone="success">{item.nama.toLowerCase().includes('puyer') ? 'Racikan' : 'Oral'}</Badge></small><p className="mt-2 flex items-center gap-1 text-[10px]"><CheckCircle2 className="size-3 text-brand" />Aturan Pakai: {item.aturan}</p></div><Badge tone="success">Terverifikasi</Badge></div><small className="mt-1 block text-[9px] text-ink-muted">{item.batch}</small></div>)}</div>
            <p className="mt-3 rounded-lg bg-brand-light-active p-3 text-[10px] text-brand-dark"><b>Instruksi cara minum, efek samping, dan aturan penyimpanan</b> telah dijelaskan dengan jelas kepada pasien atau perwakilan keluarga di loket penyerahan.</p>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border-t-4 border-brand bg-white p-4 shadow-card">
            <h2 className="flex items-center gap-2 font-bold"><ShieldCheck className="size-5 text-brand" />Ringkasan Loket</h2><p className="text-[10px] text-ink-muted">Farmasi Rawat Jalan Lantai 1</p>
            <div className="mt-4 space-y-3 text-[11px]"><p className="flex justify-between"><span>Status Penyiapan:</span><b className="text-brand-dark">● 100% Siap</b></p><p className="flex justify-between"><span>Petugas Peracik:</span><b>AA. Dimas Kurniawan</b></p><p className="flex justify-between"><span>Apoteker Verifikator:</span><b>apt. Siti Rahma, S.Farm</b></p><p className="flex justify-between"><span>Loket Penyerahan:</span><b>Loket 2 Rawat Jalan</b></p><p className="flex justify-between"><span>Penjamin / Tarif:</span><Badge tone="success">{resep.jaminan}</Badge></p></div>
            <p className="mt-4 rounded-lg bg-surface-low p-3 text-[10px] text-ink-soft"><InfoIcon />Obat telah diserahkan kepada {resep.pasien}. Pastikan tanda tangan formulir digital telah tersimpan.</p>
            <Button className="mt-3 w-full" icon={CheckCircle2} onClick={() => setModalKonfirmasi(true)} disabled={sudahDiserahkan}>{sudahDiserahkan ? 'Penyerahan Selesai' : 'Konfirmasi Penyerahan'}</Button>
            <Button variant="ghost" className="mt-1 w-full" icon={Printer} onClick={() => window.print()}>Cetak Bukti Penyerahan</Button>
            <p className="mt-3 text-center text-[8px] text-ink-muted">Standar Pelayanan Kefarmasian RS Citra Medika • ISO 9001:2015</p>
          </section>

          {receipt && <section className="rounded-2xl border-l-4 border-brand bg-white p-4 shadow-card"><div className="flex items-center justify-between"><small className="text-[9px] uppercase text-ink-muted">Nomor Resep Digital Baru</small><Badge tone="success">Obat Sudah Siap Diberikan</Badge></div><h3 className="mt-2 text-sm font-bold">{receipt.id}</h3><div className="mt-3 grid grid-cols-2 gap-2 text-[10px]"><span>Nama Pasien<br /><b>{receipt.pasien}</b></span><span>No. Rekam Medis<br /><b>{receipt.rm}</b></span><span>Dokter yang meresepkan<br /><b>{receipt.dokter}</b></span><span>Waktu Obat Siap<br /><b>{new Date(receipt.tanggal).toLocaleString('id-ID')}</b></span></div></section>}
        </aside>
      </div>

      <Modal open={modalKonfirmasi} onClose={() => setModalKonfirmasi(false)} title="Konfirmasi Penyerahan Obat" description={`Resep ${resep.id} • ${resep.pasien}`} footer={<><Button variant="secondary" onClick={() => setModalKonfirmasi(false)}>Batal</Button><Button icon={CheckCircle2} disabled={!identitasSesuai} onClick={konfirmasiPenyerahan}>Konfirmasi Penyerahan</Button></>}>
        Pastikan semua obat telah diserahkan dan identitas pasien telah diverifikasi. Tindakan ini hanya mencatat simulasi di browser.
      </Modal>
    </AppLayout>
  );
}

function InfoIcon() {
  return <Copy className="mr-1 inline size-3 text-brand" />;
}
