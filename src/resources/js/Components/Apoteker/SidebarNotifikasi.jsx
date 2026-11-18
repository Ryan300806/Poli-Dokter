import { Link } from '@inertiajs/react';
import { LayoutGrid, LogOut } from 'lucide-react';
import { rute } from '../../lib/rute';

export default function SidebarNotifikasi() {
  return (
    <aside className="fixed bottom-0 left-0 top-[72px] z-20 flex w-[240px] flex-col border-r border-line bg-white">
      <nav className="flex-1 px-[15px] pt-[30px]" aria-label="Menu Apoteker">
        <p className="text-[17px] font-bold uppercase leading-[22px] tracking-[0.25px] text-ink-soft">
          Pelayanan Rawat
          <br />
          Jalan
        </p>
        <Link
          href={rute.apoteker.notifikasiEResep}
          aria-current="page"
          className="mt-[17px] flex h-[45px] items-center gap-2 rounded-lg border-l-[4px] border-brand bg-brand-light-active px-[10px] text-sm font-bold text-ink"
        >
          <LayoutGrid className="size-[17px] shrink-0" />
          Beranda
        </Link>
      </nav>

      <div className="mx-[15px] border-t border-line px-5 py-[17px]">
        <Link
          href={rute.logout}
          method="post"
          as="button"
          className="flex w-full items-center gap-3 text-sm font-semibold text-danger hover:text-danger/80"
        >
          <LogOut className="size-4" />
          Keluar Sesi
        </Link>
      </div>
    </aside>
  );
}
