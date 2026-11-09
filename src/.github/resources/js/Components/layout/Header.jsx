// Components/layout/Header.jsx
// Header atas (Figma: Header 1280x64). Isi: logo, kolom pencarian, bantuan, notifikasi, profil.
// Sumber isi: Modul 2 (Kolom Pencarian, Ikon Notifikasi dengan titik merah, Profil Pengguna).
import { HelpCircle, Bell, Search } from 'lucide-react';
import Logo from './Logo';
import { inisial } from '../../lib/format';
import { toast } from '../ui/Toast';

export default function Header({ user, adaNotifikasi = true, onCari }) {
  return (
    <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between bg-white px-6 shadow-header">
      <div className="flex items-center gap-4">
        <Logo />
        <div className="leading-none">
          <p className="text-base font-semibold tracking-[-0.4px] text-ink-brand">Outpatient Care</p>
          <p className="mt-0.5 text-[11px] font-semibold tracking-[0.44px] text-ink-nav">Rumah Sakit Citra Medika</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <form className="relative" role="search" onSubmit={(e) => { e.preventDefault(); onCari?.(new FormData(e.currentTarget).get('q')); }}>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-3 -translate-y-1/2 text-ink-nav" />
          <input
            name="q" type="search" placeholder="Cari nama pasien, No. RM, atau NIK..."
            className="h-10 w-80 rounded-lg bg-surface-input pl-9 pr-4 text-xs tracking-[0.12px] text-ink-nav placeholder:text-ink-nav focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </form>

        <div className="flex items-center gap-2">
          <button type="button" aria-label="Bantuan" onClick={() => toast.info('Pusat bantuan belum tersedia.')}
            className="rounded-lg p-2 text-ink-nav hover:bg-surface-low"><HelpCircle className="size-5" /></button>
          <button type="button" aria-label="Notifikasi" onClick={() => toast.info('Belum ada notifikasi baru.')}
            className="relative rounded-lg p-2 text-ink-nav hover:bg-surface-low">
            <Bell className="size-5" />
            {adaNotifikasi && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-danger ring-2 ring-white" />}
          </button>
        </div>

        <span className="h-8 w-px bg-line-blue" />

        <div className="flex items-center gap-4">
          <span className="relative">
            <span className="flex size-8 items-center justify-center rounded-full bg-brand-light-active text-xs font-bold text-brand-dark ring-1 ring-line-blue">
              {inisial(user.nama)}
            </span>
            <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-brand ring-2 ring-white" />
          </span>
          <div className="leading-none">
            <p className="text-xs font-semibold tracking-[0.24px] text-ink-brand">{user.nama}</p>
            <p className="mt-1 text-[11px] font-medium tracking-[0.44px] text-brand">{user.peran}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
