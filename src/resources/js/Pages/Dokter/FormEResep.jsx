import { useState } from 'react';
import { router } from '@inertiajs/react';
import { ClipboardPlus, FileText, PlusCircle, Send, Trash2 } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/ui/Button';
import Badge from '../../Components/ui/Badge';
import { toast } from '../../Components/ui/Toast';
import { rute } from '../../lib/rute';

const fieldClass = 'h-10 min-w-0 w-full rounded-lg bg-surface-mid px-3 text-xs outline-none focus:ring-2 focus:ring-brand/30';

export default function FormEResep({ antreanId, pasienServer, idDiagnosis, obatServer = [] }) {
  const pasien = pasienServer;
  const isServerData = Boolean(pasienServer);
  const [obat, setObat] = useState([{ id: 1, id_obat: null, nama: '', dosis: '', satuan: '', aturan: '' }]);
  const [error, setError] = useState('');

  function ubahObat(id, field, value) {
    setObat((current) => current.map((item) => item.id === id ? { ...item, [field]: value } : item));
  }

  function tambahObat() {
    setObat((current) => [...current, { id: Date.now() + Math.random(), nama: '', sediaan: '', dosis: '', satuan: '', aturan: '' }]);
  }

  function kirimResep(event) {
    event.preventDefault();
    if (!obat.length || obat.some((item) => !item.nama.trim() || !item.dosis.trim() || !item.satuan.trim() || !item.aturan.trim())) {
      setError('Lengkapi nama obat, dosis, jumlah, dan aturan pakai pada setiap baris.');
      return;
    }

    if (isServerData) {
      const daftarObat = obat.map((item) => ({
        id_obat: item.id_obat ?? obatServer.find((option) => option.nama_obat.toLowerCase() === item.nama.trim().toLowerCase())?.id_obat,
        dosis: item.dosis.trim(),
        jumlah_obat: Number.parseInt(item.satuan, 10),
        aturan_pakai: item.aturan.trim(),
      }));
      if (daftarObat.some((item) => !item.id_obat || !Number.isInteger(item.jumlah_obat) || item.jumlah_obat < 1)) {
        setError('Pilih nama obat yang tersedia dan isi jumlah dalam angka, misalnya 30.');
        return;
      }
      router.post('/dokter/e-resep', { id_pasien: pasienServer.id_pasien, id_diagnosis: idDiagnosis, daftar_obat: daftarObat }, {
        onSuccess: () => { toast.success('E-Resep tersimpan di database.'); router.visit(rute.apoteker.notifikasiEResep); },
        onError: (errors) => setError(errors.eresep || errors.daftar_obat || 'E-Resep gagal disimpan.'),
      });
      return;
    }

    setError('E-Resep memerlukan data diagnosis dan pasien dari database.');
  }

  if (!pasien) return <AppLayout role="dokter" title="Formulir E-Resep"><p className="rounded-xl bg-white p-6">Data pasien atau diagnosis untuk antrean ini tidak tersedia.</p></AppLayout>;
  return (
    <AppLayout role="dokter" title="Formulir E-Resep Pasien" contentClassName="pl-3 pr-9 xl:pl-[27px] xl:pr-[100px]">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div><p className="text-[9px] font-semibold uppercase tracking-wide text-brand">Pelayanan Rawat Jalan › Instalasi Farmasi › Formulir E-Resep</p><h1 className="mt-1 flex items-center gap-2 text-[28px] font-bold">Formulir E-Resep Pasien <Badge tone="success">Database</Badge></h1><p className="text-[13px] text-ink-muted">Pemberian resep obat elektronik terhubung dengan instalasi farmasi.</p></div>
        <div className="rounded-xl bg-white px-4 py-2 text-right shadow-card"><small className="block text-[9px] uppercase text-ink-muted">ID Antrean</small><b className="text-xs">{antreanId}</b></div>
      </header>

      <form onSubmit={kirimResep} className="space-y-5">
        <section className="rounded-2xl border-l-4 border-brand bg-white p-4 shadow-card">
            <div className="mb-3 flex items-center justify-between"><h2 className="flex items-center gap-2 text-base font-bold"><ClipboardPlus className="size-5 text-brand" />Data Pasien &amp; Konteks Klinis</h2></div>
          <div className="grid gap-2 md:grid-cols-5">
            {[
              ['ID Pasien', pasien.id_pasien], ['Nama Pasien', pasien.nama], ['NIK', pasien.nik],
              ['Diagnosis Utama', pasien.diagnosis ?? '—'], ['ID Diagnosis', idDiagnosis],
            ].map(([label, value]) => <div key={label} className="rounded-lg bg-surface-low px-3 py-2"><small className="block text-[9px] font-semibold uppercase text-ink-muted">{label}</small><b className="text-[11px]">{value}</b></div>)}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-card">
          <div className="flex items-center justify-between border-b border-line pb-3"><div><h2 className="flex items-center gap-2 text-base font-bold"><FileText className="size-5 text-brand" />Daftar Peresepan Obat</h2><p className="text-[11px] text-ink-muted">Sesuaikan sediaan, jumlah unit, dan instruksi konsumsi obat rawat jalan</p></div><span className="rounded bg-surface-low px-2 py-1 text-[9px]">Daftar obat dari database</span></div>
          <div className="mt-3 hidden grid-cols-[32px_2fr_1fr_1fr_2fr_30px] gap-2 bg-surface-mid px-3 py-3 text-[10px] font-semibold md:grid"><span>#</span><span>Nama Obat &amp; Sediaan</span><span>Dosis</span><span>Jumlah</span><span>Aturan Pakai (Signa)</span><span /></div>
          {obat.map((item, index) => <div key={item.id} className="grid gap-2 border-b border-line py-3 md:grid-cols-[32px_2fr_1fr_1fr_2fr_30px] md:items-start">
            <span className="pt-2 text-center text-xs font-bold">{index + 1}</span>
            <label className="text-[9px] text-ink-muted">Nama obat<input className={fieldClass} value={item.nama} onChange={(e) => ubahObat(item.id, 'nama', e.target.value)} list="daftar-obat-database" placeholder="Pilih obat dari database" /></label>
            <label className="text-[9px] text-ink-muted">Dosis<input className={fieldClass} value={item.dosis} onChange={(e) => ubahObat(item.id, 'dosis', e.target.value)} placeholder="5 mg" /></label>
            <label className="text-[9px] text-ink-muted">Jumlah<input className={fieldClass} value={item.satuan} onChange={(e) => ubahObat(item.id, 'satuan', e.target.value)} placeholder="Jumlah unit" /></label>
            <label className="text-[9px] text-ink-muted">Aturan pakai<input className={fieldClass} value={item.aturan} onChange={(e) => ubahObat(item.id, 'aturan', e.target.value)} placeholder="1 x 1 tablet setelah makan" /></label>
            <button type="button" aria-label={`Hapus ${item.nama || 'baris obat'}`} onClick={() => setObat((current) => current.filter((entry) => entry.id !== item.id))} className="mt-6 flex size-8 items-center justify-center rounded text-danger hover:bg-danger-light"><Trash2 className="size-4" /></button>
          </div>)}
          <datalist id="daftar-obat-database">{obatServer.map((item) => <option key={item.id_obat} value={item.nama_obat} />)}</datalist>
          <Button type="button" variant="secondary" icon={PlusCircle} className="mt-3" onClick={tambahObat}>Tambah Baris Obat</Button>
        </section>

        {error && <p role="alert" className="rounded-lg bg-danger-light p-3 text-xs text-danger">{error}</p>}
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-4 shadow-card">
          <div className="rounded-lg bg-surface-low px-4 py-2 text-xs"><b className="block text-[9px] uppercase text-ink-muted">Total Item Obat</b>{obat.length} Jenis Obat</div>
          <div className="flex gap-2"><Button type="button" variant="secondary" onClick={() => router.visit(rute.dokter.antreanPeriksa)}>Batal</Button><Button type="submit" icon={Send}>Kirim E-Resep</Button></div>
        </section>
      </form>
    </AppLayout>
  );
}
