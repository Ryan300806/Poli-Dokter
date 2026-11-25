import { useForm } from '@inertiajs/react';
import Button from './Button';

export default function PenerimaanStok({ idResep, items }) {
  const { data, setData, post, errors, processing, reset } = useForm({ id_obat: '', jumlah: '', nomor_bukti: '' });
  const obat = [...new Map(items.map((item) => [item.id_obat, item.nama])).entries()];
  function simpan(event) {
    event.preventDefault();
    if (!processing) post(`/apoteker/e-resep/${idResep}/stok`, { preserveScroll: true, onSuccess: () => reset() });
  }
  return (
    <details className="rounded-xl border border-line bg-white p-4">
      <summary className="cursor-pointer text-sm font-semibold text-brand-dark">Catat penerimaan stok</summary>
      <form onSubmit={simpan} className="mt-3 space-y-3">
        <p className="text-xs text-ink-soft">Isi setelah obat datang dan jumlah fisiknya diperiksa. Satu nomor bukti dipakai sekali per jenis obat.</p>
        <label className="field-label">Obat
          <select className="field-input" value={data.id_obat} required onChange={(e) => setData('id_obat', e.target.value)}>
            <option value="">Pilih obat</option>
            {obat.map(([id,nama]) => <option key={id} value={id}>{nama}</option>)}
          </select>
        </label>
        <label className="field-label">Jumlah diterima
          <input className="field-input" type="number" min="1" step="1" required value={data.jumlah} onChange={(e) => setData('jumlah', e.target.value)} />
        </label>
        <label className="field-label">Nomor bukti penerimaan
          <input className="field-input" maxLength={80} required value={data.nomor_bukti} onChange={(e) => setData('nomor_bukti', e.target.value)} />
        </label>
        {Object.keys(errors).length > 0 && <p role="alert" className="field-error">{Object.values(errors)[0]}</p>}
        <Button type="submit" variant="outline" disabled={processing}>{processing ? 'Menyimpan…' : 'Simpan penerimaan'}</Button>
      </form>
    </details>
  );
}
