import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, ClipboardPlus, FileText, Lock, PlusCircle, Send, Trash2 } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/ui/Button';
import Badge from '../../Components/ui/Badge';
import { toast } from '../../Components/ui/Toast';
import { rute } from '../../lib/rute';

const mapDaftarObat = (daftar = []) => (daftar.length
  ? daftar.map((item, idx) => ({
      id: `${item.id_obat ?? 'new'}-${idx}`,
      id_obat: item.id_obat ?? null,
      nama: item.nama_obat ?? '',
      dosis: item.dosis ?? '',
      satuan: item.jumlah_obat != null ? String(item.jumlah_obat) : '',
      aturan: item.aturan_pakai ?? '',
    }))
  : [{ id: 1, id_obat: null, nama: '', dosis: '', satuan: '', aturan: '' }]);

export default function FormEResep({ antreanId, pasienServer, idDiagnosis, obatServer = [], eresepServer = null }) {
  const modeEdit = Boolean(eresepServer?.id_e_resep);
  const statusResep = eresepServer?.status_e_resep ?? null;
  const dapatDiedit = !modeEdit || ['terkirim', 'ditolak'].includes(statusResep);

  const [obat, setObat] = useState(() => mapDaftarObat(eresepServer?.daftar_obat));
  const [error, setError] = useState('');
  const [sibuk, setSibuk] = useState(false);

  useEffect(() => {
    if (eresepServer?.daftar_obat) {
      setObat(mapDaftarObat(eresepServer.daftar_obat));
    }
  }, [eresepServer]);

  function ubahObat(id, field, value) {
    setObat((curr) => curr.map((item) => {
      if (item.id !== id) return item;
      if (field === 'nama') {
        const match = obatServer.find((o) => o.nama_obat.toLowerCase() === value.trim().toLowerCase());
        return { ...item, nama: value, id_obat: match?.id_obat ?? null };
      }
      return { ...item, [field]: value };
    }));
  }

  function tambahBaris() {
    setObat((curr) => [...curr, { id: Date.now() + Math.random(), id_obat: null, nama: '', dosis: '', satuan: '', aturan: '' }]);
  }

  function kirimResep(e) {
    e.preventDefault();
    if (!dapatDiedit || sibuk) return;

    if (!obat.length || obat.some((i) => !i.nama.trim() || !i.dosis.trim() || !i.satuan.trim() || !i.aturan.trim())) {
      setError('Lengkapi nama obat, dosis, jumlah, dan aturan pakai pada setiap baris.');
      return;
    }

    const daftarObat = obat.map((i) => ({
      id_obat: i.id_obat ?? obatServer.find((o) => o.nama_obat.toLowerCase() === i.nama.trim().toLowerCase())?.id_obat,
      dosis: i.dosis.trim(),
      jumlah_obat: Number(i.satuan),
      aturan_pakai: i.aturan.trim(),
    }));

    if (daftarObat.some((i) => !i.id_obat || !Number.isInteger(i.jumlah_obat) || i.jumlah_obat < 1)) {
      setError('Pilih obat yang terdaftar di database dan isi jumlah angka minimal 1.');
      return;
    }

    setSibuk(true);
    if (modeEdit) {
      router.put(`/dokter/e-resep/${eresepServer.id_e_resep}`, { daftar_obat: daftarObat, versi: eresepServer.versi }, {
        preserveScroll: true,
        onSuccess: () => { setError(''); toast.success('E-Resep berhasil diperbarui & dikirim ulang.'); },
        onFinish: () => setSibuk(false),
        onError: (errs) => setError(Object.values(errs)[0] || 'Gagal memperbarui E-Resep.'),
      });
    } else {
      router.post('/dokter/e-resep', {
        id_pasien: pasienServer.id_pasien,
        id_diagnosis: idDiagnosis,
        daftar_obat: daftarObat,
      }, {
        onFinish: () => setSibuk(false),
        onError: (errs) => setError(Object.values(errs)[0] || 'Gagal mengirim E-Resep.'),
      });
    }
  }

  return (
    <AppLayout role="dokter" title="Formulir E-Resep Pasien">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-brand">PELAYANAN RAWAT JALAN &gt; INSTALASI FARMASI &gt; FORMULIR E-RESEP</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-ink">Formulir E-Resep Pasien</h1>
          <p className="mt-1 text-xs text-ink-soft">Pemberian resep obat elektronik terhubung langsung dengan instalasi farmasi.</p>
        </div>
        <div className="rounded-2xl bg-white px-4 py-2.5 text-right shadow-card">
          <small className="block text-[11px] font-bold uppercase text-ink-muted">ID ANTREAN</small>
          <b className="text-sm text-brand">#{antreanId}</b>
        </div>
      </header>

      {modeEdit && statusResep === 'ditolak' && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-danger/30 bg-danger-light p-4 text-xs text-danger">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-bold text-sm">E-Resep #{eresepServer.id_e_resep} Ditolak oleh Farmasi</p>
            <p className="mt-1"><b>Alasan penolakan:</b> {eresepServer.alasan_penolakan || 'Tidak ada alasan tercatat.'}</p>
            <p className="mt-1 text-ink-soft">Perbaiki daftar obat di bawah ini, lalu klik <b>Simpan &amp; Kirim Ulang E-Resep</b>.</p>
          </div>
        </div>
      )}

      {modeEdit && statusResep === 'terkirim' && (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-brand-light p-4 text-xs text-brand-dark">
          <span className="flex items-center gap-2"><CheckCircle2 className="size-5 text-brand" /> E-Resep <b>#{eresepServer.id_e_resep}</b> sudah terkirim dan masih dapat diedit sebelum ditelaah farmasi.</span>
          <Badge tone="success">Status: Terkirim</Badge>
        </div>
      )}

      {modeEdit && !dapatDiedit && (
        <div className="flex items-center gap-2 rounded-2xl bg-surface-mid p-4 text-xs text-ink-soft">
          <Lock className="size-5 text-ink-muted" />
          <span>E-Resep <b>#{eresepServer.id_e_resep}</b> berstatus <b>{statusResep}</b> sehingga terkunci (read-only).</span>
        </div>
      )}

      <form onSubmit={kirimResep} className="space-y-5">
        <section className="rounded-2xl border-l-4 border-brand bg-white p-5 shadow-card">
          <h2 className="flex items-center gap-2 text-base font-bold text-ink">
            <ClipboardPlus className="size-5 text-brand" /> Data Pasien &amp; Konteks Klinis
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ['NO. REKAM MEDIS', pasienServer.rm],
              ['NAMA PASIEN', `${pasienServer.nama} (${pasienServer.umur ?? '—'} Th)`],
              ['NIK', pasienServer.nik],
              ['DIAGNOSIS UTAMA', pasienServer.diagnosis],
              ['DOKTER PEMERIKSA', pasienServer.dokter],
            ].map(([label, val]) => (
              <div key={label} className="rounded-xl bg-surface-low p-3">
                <small className="block text-[11px] font-bold uppercase text-ink-muted">{label}</small>
                <b className="mt-0.5 block text-xs text-ink">{val}</b>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-card">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h2 className="flex items-center gap-2 text-base font-bold text-ink">
                <FileText className="size-5 text-brand" /> Daftar Peresepan Obat
              </h2>
              <p className="text-[11px] text-ink-muted">Pilih obat dari daftar formularium rumah sakit.</p>
            </div>
            <Badge tone="neutral">Stok Real-Time Database</Badge>
          </div>

          <div className="mt-3 space-y-3">
            {obat.map((item, idx) => {
              const info = obatServer.find((o) => o.id_obat === item.id_obat || o.nama_obat.toLowerCase() === item.nama.trim().toLowerCase());
              return (
                <div key={item.id} className="grid gap-2.5 border-b border-line pb-3 md:grid-cols-[30px_2fr_1fr_1fr_2fr_36px] md:items-end">
                  <span className="pb-2.5 text-center text-xs font-bold">{idx + 1}</span>
                  <label className="text-[11px] font-semibold text-ink-soft">
                    Nama Obat {info && <span className={`ml-1 font-bold ${info.jumlah_stok > 0 ? 'text-brand' : 'text-danger'}`}>(Stok: {info.jumlah_stok})</span>}
                    <input
                      disabled={sibuk || !dapatDiedit}
                      list="daftar-obat-db"
                      value={item.nama}
                      onChange={(e) => ubahObat(item.id, 'nama', e.target.value)}
                      placeholder="Ketik / pilih obat..."
                      className="mt-1 h-10 w-full rounded-xl bg-surface-input px-3 text-xs text-ink outline-none focus:ring-2 focus:ring-brand/30"
                    />
                  </label>
                  <label className="text-[11px] font-semibold text-ink-soft">
                    Dosis
                    <input
                      disabled={sibuk || !dapatDiedit}
                      value={item.dosis}
                      onChange={(e) => ubahObat(item.id, 'dosis', e.target.value)}
                      placeholder="500 mg"
                      className="mt-1 h-10 w-full rounded-xl bg-surface-input px-3 text-xs text-ink outline-none"
                    />
                  </label>
                  <label className="text-[11px] font-semibold text-ink-soft">
                    Jumlah
                    <input
                      disabled={sibuk || !dapatDiedit}
                      type="number"
                      min={1}
                      value={item.satuan}
                      onChange={(e) => ubahObat(item.id, 'satuan', e.target.value)}
                      placeholder="10"
                      className="mt-1 h-10 w-full rounded-xl bg-surface-input px-3 text-xs text-ink outline-none"
                    />
                  </label>
                  <label className="text-[11px] font-semibold text-ink-soft">
                    Aturan Pakai (Signa)
                    <input
                      disabled={sibuk || !dapatDiedit}
                      value={item.aturan}
                      onChange={(e) => ubahObat(item.id, 'aturan', e.target.value)}
                      placeholder="3 x 1 setelah makan"
                      className="mt-1 h-10 w-full rounded-xl bg-surface-input px-3 text-xs text-ink outline-none"
                    />
                  </label>
                  {dapatDiedit && (
                    <button
                      type="button"
                      onClick={() => setObat((c) => c.filter((x) => x.id !== item.id))}
                      className="flex h-10 items-center justify-center rounded-xl text-danger hover:bg-danger-light"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <datalist id="daftar-obat-db">
            {obatServer.map((o) => <option key={o.id_obat} value={o.nama_obat} label={`Stok: ${o.jumlah_stok}`} />)}
          </datalist>

          {dapatDiedit && (
            <Button type="button" variant="softBrand" icon={PlusCircle} className="mt-4" onClick={tambahBaris}>
              Tambah Baris Obat
            </Button>
          )}
        </section>

        {error && <p className="rounded-xl bg-danger-light p-3 text-xs font-semibold text-danger">{error}</p>}

        <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-card">
          <div className="rounded-xl bg-surface-low px-4 py-2 text-xs">
            <small className="block text-[11px] font-bold uppercase text-ink-muted">TOTAL ITEM OBAT</small>
            <b>{obat.length} Jenis Obat</b>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => router.visit(rute.dokter.antreanPeriksa)}>Kembali ke Antrean</Button>
            {dapatDiedit && (
              <Button type="submit" disabled={sibuk} icon={Send}>{modeEdit ? 'Simpan & Kirim Ulang E-Resep' : 'Kirim E-Resep'}</Button>
            )}
          </div>
        </section>
      </form>
    </AppLayout>
  );
}
