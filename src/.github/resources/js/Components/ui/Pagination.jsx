// Components/ui/Pagination.jsx
// Nomor halaman. Pakai bersama teks "Menampilkan x-y dari z ...".
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/cn';

export default function Pagination({ halaman, totalHalaman, onUbah }) {
  const tombol = 'flex size-8 items-center justify-center rounded-lg text-xs font-bold transition-colors';
  return (
    <nav className="flex items-center gap-1.5" aria-label="Halaman">
      <button type="button" aria-label="Halaman sebelumnya" disabled={halaman <= 1}
        onClick={() => onUbah(halaman - 1)}
        className={cn(tombol, 'bg-surface-low text-ink-soft disabled:opacity-40')}>
        <ChevronLeft className="size-4" />
      </button>
      {Array.from({ length: totalHalaman }, (_, i) => i + 1).map((n) => (
        <button key={n} type="button" onClick={() => onUbah(n)} aria-current={n === halaman ? 'page' : undefined}
          className={cn(tombol, n === halaman ? 'bg-brand text-white' : 'bg-surface-low text-ink hover:bg-surface-mid')}>
          {n}
        </button>
      ))}
      <button type="button" aria-label="Halaman berikutnya" disabled={halaman >= totalHalaman}
        onClick={() => onUbah(halaman + 1)}
        className={cn(tombol, 'bg-surface-low text-ink disabled:opacity-40')}>
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
