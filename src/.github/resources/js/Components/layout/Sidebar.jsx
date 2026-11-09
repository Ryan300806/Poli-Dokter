// Components/layout/Sidebar.jsx
// Menu samping (Figma: Aside 256px). Isi menu diambil dari lib/menu.js sesuai peran.
// Menu yang aktif ditentukan dari URL saat ini. Menu tanpa href menampilkan toast "belum tersedia".
import { Link, usePage } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
import { PERAN } from '../../lib/menu';
import { rute } from '../../lib/rute';
import { cn } from '../../lib/cn';
import { toast } from '../ui/Toast';

function Butir({ item, aktif, onKosong }) {
  const Ikon = item.ikon;
  const kelas = cn(
    'flex w-full items-center gap-4 rounded-lg px-4 py-2 text-left text-base text-ink-nav transition-colors',
    aktif
      ? 'border-l-4 border-brand bg-brand-light-active font-bold'
      : 'hover:bg-surface-low',
  );
  const isi = (<><Ikon className="size-[18px] shrink-0" /><span>{item.label}</span></>);
  if (!item.href) return <button type="button" className={kelas} onClick={() => onKosong(item)}>{isi}</button>;
  return <Link href={item.href} className={kelas} aria-current={aktif ? 'page' : undefined}>{isi}</Link>;
}

export default function Sidebar({ role }) {
  const { url } = usePage();
  const peran = PERAN[role];
  const path = url.split('?')[0];
  const aktif = (href) => href && (path === href || path.startsWith(`${href}/`));
  const kosong = (item) => toast.info(`Halaman "${item.label}" belum termasuk dalam 23 UI Modul 2.`);

  return (
    <aside className="fixed bottom-0 left-0 top-16 z-20 flex w-64 flex-col bg-white shadow-aside">
      <nav className="flex-1 overflow-y-auto px-4 py-6" aria-label="Menu utama">
        <p className="px-4 pb-1 text-xl font-semibold uppercase tracking-[0.55px] text-ink-nav">{peran.judulMenu}</p>
        <ul className="mt-1 flex flex-col gap-1">
          {peran.menu.map((item) => (
            <li key={item.label}><Butir item={item} aktif={aktif(item.href)} onKosong={kosong} /></li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-line px-4 py-4">
        {peran.menuSistem && (
          <ul className="mb-1">
            {peran.menuSistem.map((item) => (
              <li key={item.label}><Butir item={item} aktif={false} onKosong={kosong} /></li>
            ))}
          </ul>
        )}
        <Link href={rute.logout} method="post" as="button"
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-base font-semibold text-danger hover:bg-danger-light">
          <LogOut className="size-4" />Keluar Sesi
        </Link>
      </div>
    </aside>
  );
}
