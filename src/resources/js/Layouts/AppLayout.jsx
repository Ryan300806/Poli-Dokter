import { Head, Link, router, usePage } from '@inertiajs/react';
import {
  Activity, Bell, CalendarDays, ClipboardList, FileText, Home,
  LogOut, Search, Stethoscope, Ticket, UserRound, Users,
} from 'lucide-react';
import { cn } from '../lib/cn';
import { rute } from '../lib/rute';
import { ToastContainer } from '../Components/ui/Toast';

const MENUS = {
  pasien: {
    judul: 'PORTAL PASIEN',
    items: [
      { label: 'Beranda Pasien', href: rute.pasien.beranda, icon: Home },
      { label: 'Penjadwalan Poli', href: rute.pasien.penjadwalanPoli, icon: CalendarDays },
      { label: 'Riwayat & Jadwal', href: rute.pasien.riwayatReservasi, icon: Ticket },
      { label: 'Profile Pasien', href: rute.pasien.profil, icon: UserRound },
    ],
  },
  perawat: {
    judul: 'LAYANAN PERAWAT',
    items: [
      { label: 'Triase Rawat Jalan', href: rute.perawat.antreanTriage, icon: Activity },
    ],
  },
  dokter: {
    judul: 'LAYANAN DOKTER',
    items: [
      { label: 'Antrean Periksa', href: rute.dokter.antreanPeriksa, icon: Users },
      { label: 'Jadwal Saya', href: rute.dokter.jadwalSaya, icon: CalendarDays },
      { label: 'Riwayat Medis', href: rute.dokter.riwayatMedis(), icon: ClipboardList },
    ],
  },
  apoteker: {
    judul: 'PELAYANAN RAWAT JALAN',
    items: [
      { label: 'Beranda Farmasi', href: rute.apoteker.notifikasiEResep, icon: FileText },
    ],
  },
};

export default function AppLayout({ role = 'pasien', title = 'Outpatient Care', children }) {
  const { url, props } = usePage();
  const user = props.auth?.user;
  const flash = props.flash || {};
  const menuGroup = MENUS[role] || MENUS.pasien;
  const currentPath = url.split('?')[0];

  function keluar() {
    router.post(rute.logout);
  }

  return (
    <>
      <Head title={`${title} — Outpatient Care`} />
      <div className="min-h-screen bg-surface text-ink flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-white px-5">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-white font-extrabold text-lg shadow-sm">
              +
            </span>
            <div>
              <p className="text-sm font-bold leading-tight text-ink">Outpatient Care</p>
              <p className="text-[11px] text-ink-muted">Rumah Sakit Citra Medika</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 rounded-xl bg-surface-low px-3 py-2 w-72 text-xs text-ink-muted">
              <Search className="size-4 shrink-0" />
              <span>Sistem Rawat Jalan Terintegrasi</span>
            </div>
            <span className="relative flex size-9 items-center justify-center rounded-xl bg-surface-low text-ink-soft">
              <Bell className="size-4" />
              <span className="absolute top-2 right-2 size-1.5 rounded-full bg-danger" />
            </span>
            <div className="flex items-center gap-2.5 border-l border-line pl-4">
              <span className="flex size-9 items-center justify-center rounded-full bg-brand-light-active text-xs font-bold text-brand-dark">
                {(user?.nama || 'U').slice(0, 2).toUpperCase()}
              </span>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold leading-tight text-ink">{user?.nama || 'Pengguna'}</p>
                <p className="text-[10px] text-ink-muted">{user?.peran || role}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-1">
          {/* Sidebar */}
          <aside className="hidden md:flex md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:overflow-y-auto w-64 shrink-0 flex-col justify-between border-r border-line bg-white p-4">
            <div>
              <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                {menuGroup.judul}
              </p>
              <nav className="mt-1 space-y-1">
                {menuGroup.items.map((item) => {
                  const Icon = item.icon;
                  const aktif = currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href + '/'));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition',
                        aktif
                          ? 'bg-brand-light-active text-brand-dark shadow-xs'
                          : 'text-ink-soft hover:bg-surface-low hover:text-ink'
                      )}
                    >
                      <Icon className={cn('size-4 shrink-0', aktif ? 'text-brand' : 'text-ink-muted')} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <button
              type="button"
              onClick={keluar}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-danger hover:bg-danger-light transition cursor-pointer"
            >
              <LogOut className="size-4" />
              <span>Keluar Sesi</span>
            </button>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-5 md:p-7 overflow-x-hidden">
            <div className="mx-auto max-w-6xl space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>

      <ToastContainer flashSuccess={flash.success} flashInfo={flash.info} />
    </>
  );
}
