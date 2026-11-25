import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Activity, CalendarDays, ClipboardList, FileText, Home, LogOut, Menu, Ticket, UserRound, Users } from 'lucide-react';
import { rute } from '../lib/rute';
import Brand from '../Components/ui/Brand';
import Modal from '../Components/ui/Modal';
import { ToastContainer } from '../Components/ui/Toast';

const menus = {
  pasien: [
    [rute.pasien.beranda, 'Beranda pasien', Home],
    [rute.pasien.penjadwalanPoli, 'Penjadwalan poli', CalendarDays],
    [rute.pasien.riwayatReservasi, 'Riwayat & jadwal', Ticket],
    [rute.pasien.profil, 'Profil pasien', UserRound],
  ],
  perawat: [[rute.perawat.antreanTriage, 'Antrean triase', Activity]],
  dokter: [
    [rute.dokter.antreanPeriksa, 'Antrean periksa', Users],
    [rute.dokter.jadwalSaya, 'Jadwal saya', CalendarDays],
    [rute.dokter.riwayatMedis(), 'Riwayat medis', ClipboardList],
  ],
  apoteker: [[rute.apoteker.notifikasiEResep, 'Antrean e-resep', FileText]],
};

function Navigation({ role, path, onNavigate }) {
  const items = menus[role] || menus.pasien;
  const current = items.find(([href]) => path === href || path.startsWith(href + '/'))?.[0]
    || (path === '/pasien/jadwal-saya' || path.startsWith('/pasien/reservasi/') ? rute.pasien.riwayatReservasi : items[0][0]);
  return (
    <nav aria-label="Menu layanan" className="space-y-1">
      {items.map(([href, label, Icon]) => (
        <Link key={href} href={href} aria-current={href === current ? 'page' : undefined}
          onClick={onNavigate} className="portal-link">
          <Icon size={18} aria-hidden="true" />{label}
        </Link>
      ))}
    </nav>
  );
}

export default function AppLayout({ role = 'pasien', title, children }) {
  const { url, props } = usePage();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = props.auth?.user || {};
  const initials = (user.nama || '').trim().split(/\s+/).slice(0, 2).map((word) => word[0]).join('');
  const path = url.split('?')[0];
  const menuTitle = role === 'pasien' ? 'Portal pasien' : role === 'apoteker' ? 'Layanan farmasi' : `Layanan ${role}`;
  const exitButton = (
    <button type="button" className="portal-link w-full text-danger" onClick={() => router.post(rute.logout)}>
      <LogOut size={17} aria-hidden="true" /> Keluar sesi
    </button>
  );

  return (
    <>
      <Head title={`${title} · RS Citra Medika`} />
      <a href="#isi-utama" className="skip-link">Lewati ke isi halaman</a>
      <div className="portal-shell">
        <header className="portal-topbar">
          <div className="flex items-center gap-3">
            <button type="button" className="grid size-11 place-items-center rounded-lg border border-line md:hidden"
              aria-label="Buka menu layanan" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
              <Menu size={20} />
            </button>
            <Brand />
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight">{user.nama}</p>
              <p className="mt-0.5 text-[11px] text-ink-soft">{user.peran || menuTitle}</p>
            </div>
            <span className="grid size-9 place-items-center rounded-full bg-brand-light-active text-xs font-bold text-brand-dark" aria-label={user.nama}>{initials}</span>
          </div>
        </header>
        <div className="portal-body">
          <aside className="portal-sidebar">
            <div className="sticky top-24 flex flex-col gap-3">
              <p className="px-3 text-[11px] font-semibold uppercase tracking-widest text-ink-muted">{menuTitle}</p>
              <Navigation role={role} path={path} />
            </div>
            <div className="sticky bottom-4 mt-auto border-t border-line bg-white pt-3">{exitButton}</div>
          </aside>
          <main id="isi-utama" tabIndex={-1} className="portal-main">
            <div className="mx-auto max-w-6xl space-y-6">{children}</div>
          </main>
        </div>
      </div>
      <Modal open={menuOpen} onClose={() => setMenuOpen(false)} title={menuTitle} maxWidth="max-w-sm">
        <Navigation role={role} path={path} onNavigate={() => setMenuOpen(false)} />
        <div className="mt-4 border-t border-line pt-3">{exitButton}</div>
      </Modal>
      <ToastContainer flashSuccess={props.flash?.success} flashInfo={props.flash?.info} />
    </>
  );
}
