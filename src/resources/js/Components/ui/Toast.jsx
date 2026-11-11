// Components/ui/Toast.jsx
// Notifikasi singkat. Cara pakai di halaman mana pun (tanpa provider):
//   import { toast } from '../../Components/ui/Toast';
//   toast.success('Berhasil Booking');   toast.error('Kuota Slot Penuh');   toast.info('...');
// <Toaster /> sudah dipasang di AppLayout, jangan dipasang lagi di halaman.
// Teks pesan harus mengikuti Modul 2 (lihat tabel pesan di docs/panduan-fe.md).
import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { cn } from '../../lib/cn';

let daftar = [];
const pendengar = new Set();
const sebar = () => pendengar.forEach((fn) => fn(daftar));

function hapus(id) {
  daftar = daftar.filter((t) => t.id !== id);
  sebar();
}
function tampil(jenis, pesan) {
  const id = Date.now() + Math.random();
  daftar = [...daftar, { id, jenis, pesan }];
  sebar();
  setTimeout(() => hapus(id), 4000);
}

export const toast = {
  success: (pesan) => tampil('success', pesan),
  error: (pesan) => tampil('error', pesan),
  info: (pesan) => tampil('info', pesan),
};

const GAYA = {
  success: { ikon: CheckCircle2, kelas: 'text-brand' },
  error: { ikon: XCircle, kelas: 'text-danger' },
  info: { ikon: Info, kelas: 'text-info' },
};

export function Toaster() {
  const [isi, setIsi] = useState(daftar);
  useEffect(() => {
    pendengar.add(setIsi);
    return () => pendengar.delete(setIsi);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2" aria-live="polite">
      {isi.map((t) => {
        const { ikon: Ikon, kelas } = GAYA[t.jenis];
        return (
          <div key={t.id} role="status" className="flex min-w-72 max-w-sm items-start gap-3 rounded-xl bg-white p-4 shadow-lg ring-1 ring-line">
            <Ikon className={cn('mt-0.5 size-5 shrink-0', kelas)} />
            <p className="flex-1 text-[13px] font-medium text-ink">{t.pesan}</p>
            <button type="button" aria-label="Tutup" onClick={() => hapus(t.id)} className="text-ink-muted"><X className="size-4" /></button>
          </div>
        );
      })}
    </div>
  );
}
