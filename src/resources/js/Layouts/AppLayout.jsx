// Layouts/AppLayout.jsx
// Kerangka SEMUA halaman setelah login: Header + Sidebar + area isi + Toast.
// Pemakaian di halaman:
//   <AppLayout role="dokter" title="Antrean Periksa"> ...isi halaman... </AppLayout>
// role: 'pasien' | 'dokter' | 'perawat' | 'apoteker' (menentukan menu sidebar).
// Data pengguna diambil dari props bersama Inertia (auth.user) bila BE sudah menyediakannya,
// jika belum memakai pengguna contoh dari lib/menu.js.
import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import Header from '../Components/layout/Header';
import Sidebar from '../Components/layout/Sidebar';
import { Toaster } from '../Components/ui/Toast';
import { PERAN } from '../lib/menu';
import { toast } from '../Components/ui/Toast';

export default function AppLayout({ role, title, children, contentClassName }) {
  const { props } = usePage();
  const user = props.auth?.user ?? PERAN[role].demo;
  const headerRingkas = role === 'pasien' || title === 'Riwayat Medis';
  const tinggiHeader = headerRingkas ? 'pt-16' : 'pt-[78px]';
  const jarakKonten = role === 'pasien' ? 'pt-2' : 'pt-6';
  const paddingKonten = contentClassName ?? 'pl-3 pr-9';
  useEffect(() => {
    if (props.flash?.success) toast.success(props.flash.success);
    if (props.flash?.info) toast.info(props.flash.info);
  }, [props.flash?.success, props.flash?.info]);

  return (
    <>
      <Head title={`${title} | SIM-RS Rawat Jalan`} />
      <Header user={user} role={role} compact={headerRingkas} />
      <Sidebar role={role} compact={headerRingkas} />
      <main className={`min-h-screen pb-10 pl-64 ${tinggiHeader}`}>
        <div className={`flex flex-col gap-6 ${paddingKonten} ${jarakKonten}`}>{children}</div>
      </main>
      <Toaster />
    </>
  );
}
