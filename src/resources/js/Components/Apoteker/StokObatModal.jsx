import { useEffect, useState } from 'react';
import { Check, Info, Minus, Plus, X } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { evaluasiStokObat } from '../../lib/evaluasiStokObat';

function jumlahTerbatas(nilai, stok) {
  const angka = Number.isFinite(nilai) ? Math.trunc(nilai) : 0;
  return Math.min(stok, Math.max(0, angka));
}

export default function StokObatModal({ open, onClose, items = [] }) {
  const [pilihan, setPilihan] = useState({});
  const daftarObat = Array.isArray(items) ? items : [];

  useEffect(() => {
    if (!open) return undefined;

    const sebelumnya = document.body.style.overflow;
    const tutupDenganEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', tutupDenganEscape);

    return () => {
      document.body.style.overflow = sebelumnya;
      document.removeEventListener('keydown', tutupDenganEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  function ubahPilihan(index, dipilih, stok) {
    setPilihan((sebelumnya) => ({
      ...sebelumnya,
      [index]: {
        dipilih,
        jumlah: dipilih
          ? jumlahTerbatas(sebelumnya[index]?.jumlah ?? 0, stok)
          : 0,
      },
    }));
  }

  function ubahJumlah(index, delta, stok) {
    setPilihan((sebelumnya) => {
      const jumlahSebelumnya = sebelumnya[index]?.jumlah ?? 0;
      return {
        ...sebelumnya,
        [index]: {
          dipilih: sebelumnya[index]?.dipilih ?? false,
          jumlah: jumlahTerbatas(jumlahSebelumnya + delta, stok),
        },
      };
    });
  }

  const jumlahDipilih = Object.values(pilihan).filter((item) => item?.dipilih && item.jumlah > 0).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="stok-obat-title"
        className="relative flex max-h-[calc(100vh-32px)] w-full max-w-[897px] flex-col overflow-hidden rounded-xl bg-white shadow-xl"
      >
        <h2 id="stok-obat-title" className="sr-only">Stok Obat</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup pop-up stok obat"
          className="absolute right-2 top-2 z-10 rounded-lg p-2 text-ink-muted hover:bg-surface-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          <X className="size-4" />
        </button>

        <div className="overflow-auto">
          <table className="w-full min-w-[780px] table-fixed border-collapse text-left">
            <colgroup>
              <col className="w-[8%]" />
              <col className="w-[30%]" />
              <col className="w-[21%]" />
              <col className="w-[19%]" />
              <col className="w-[22%]" />
            </colgroup>
            <thead className="bg-surface-mid text-[10px] font-bold uppercase tracking-[0.5px] text-ink-soft">
              <tr>
                <th scope="col" className="px-3 py-4 text-center">Pilih</th>
                <th scope="col" className="px-3 py-4">Nama Obat</th>
                <th scope="col" className="px-3 py-3">Dosis &amp; Aturan</th>
                <th scope="col" className="px-3 py-3">Stok / Preview</th>
                <th scope="col" className="px-3 py-4">Status Ketersediaan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {daftarObat.map((item, index) => {
                const evaluasiStok = evaluasiStokObat(item);
                const stok = evaluasiStok.stokTercatat;
                const jumlahResep = evaluasiStok.jumlahResep;
                const dipilih = Boolean(pilihan[index]?.dipilih);
                const jumlah = pilihan[index]?.jumlah ?? 0;
                const nama = item.nama || item.nama_obat || 'Nama obat tidak tersedia';
                const dapatDipilih = stok !== null && stok > 0;

                return (
                  <tr key={`${item.id_obat ?? nama}-${index}`} className="align-middle">
                    <td className="px-3 py-5 text-center">
                      <input
                        type="checkbox"
                        checked={dipilih}
                        disabled={!dapatDipilih}
                        aria-label={`Pilih ${nama} untuk pratinjau jumlah`}
                        onChange={(event) => ubahPilihan(index, event.target.checked, stok ?? 0)}
                        className="size-5 accent-brand disabled:cursor-not-allowed disabled:opacity-40"
                      />
                    </td>
                    <td className="px-3 py-5">
                      <b className="block break-words text-[13px] leading-5 text-ink">{nama}</b>
                      <small className="mt-1 block text-[10px] text-ink-muted">
                        Jumlah resep: {jumlahResep === null ? 'Tidak tersedia' : `${jumlahResep} unit`}
                      </small>
                    </td>
                    <td className="px-3 py-5 text-[11px] leading-5 text-ink-soft">
                      <b className="block font-semibold text-ink">{item.dosis || 'Dosis tidak tersedia'}</b>
                      <span>{item.aturan || 'Aturan pakai tidak tersedia'}</span>
                    </td>
                    <td className="px-3 py-5">
                      <span className="block text-[12px] font-semibold text-ink">
                        {stok === null ? 'Belum tercatat' : `${stok.toLocaleString('id-ID')} unit`}
                      </span>
                      <span className="mt-1 block text-[9px] text-ink-muted">{evaluasiStok.ringkasan}</span>
                      <small className="mt-2 block text-[9px] text-ink-muted">Jumlah pratinjau</small>
                      <div className="mt-1 flex items-center gap-2">
                        <button
                          type="button"
                          aria-label={`Kurangi jumlah ${nama}`}
                          disabled={!dipilih || jumlah <= 0}
                          onClick={() => ubahJumlah(index, -1, stok ?? 0)}
                          className="flex size-7 items-center justify-center rounded-full text-brand hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Minus className="size-4" />
                        </button>
                        <output aria-live="polite" className="min-w-7 text-center text-[12px] font-medium text-ink">
                          {jumlah}
                        </output>
                        <button
                          type="button"
                          aria-label={`Tambah jumlah ${nama}`}
                          disabled={!dipilih || stok === null || jumlah >= stok}
                          onClick={() => ubahJumlah(index, 1, stok ?? 0)}
                          className="flex size-7 items-center justify-center rounded-full text-brand hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Plus className="size-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-5">
                      <Badge tone={evaluasiStok.tone} dot>{evaluasiStok.label}</Badge>
                    </td>
                  </tr>
                );
              })}
              {daftarObat.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-10 text-center text-xs text-ink-muted">
                    Data obat tidak tersedia pada E-Resep ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="space-y-3 border-t border-line p-4 sm:p-5">
          <p className="flex items-start gap-2 rounded-lg bg-info-light p-3 text-[10px] text-ink-soft">
            <Info className="mt-0.5 size-3.5 shrink-0 text-info" />
            Jumlah yang dipilih hanya pratinjau lokal. Stok yang tampil adalah jumlah agregat dari database; batch dan lokasi rak tidak tersedia.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[10px] text-ink-muted">
              {jumlahDipilih} item dipilih untuk pratinjau · Alokasi tidak disimpan
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={onClose}>Tutup</Button>
              <Button
                icon={Check}
                disabled
                title="Alokasi stok belum didukung backend."
              >
                Konfirmasi Alokasi
              </Button>
            </div>
          </div>
          <p className="text-right text-[10px] font-medium text-warning">
            Konfirmasi alokasi nonaktif: backend belum menyediakan endpoint alokasi stok.
          </p>
        </footer>
      </section>
    </div>
  );
}
