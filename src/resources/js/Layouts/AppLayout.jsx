// Layouts/AppLayout.jsx
// Kerangka SEMUA halaman setelah login: Header + Sidebar + area isi + Toast.
// Pemakaian di halaman:
//   <AppLayout role="dokter" title="Antrean Periksa"> ...isi halaman... </AppLayout>
// role: 'pasien' | 'dokter' | 'perawat' | 'apoteker' (menentukan menu sidebar).
// Data pengguna diambil dari props bersama Inertia (auth.user) bila BE sudah menyediakannya,
// jika belum memakai pengguna contoh dari lib/menu.js.
import { Head, usePage } from '@inertiajs/react';
import Header from '../Components/layout/Header';
import Sidebar from '../Components/layout/Sidebar';
import { Toaster } from '../Components/ui/Toast';
import { PERAN } from '../lib/menu';

export default function AppLayout({ role, title, children }) {
  const { props } = usePage();
  const user = props.auth?.user ?? PERAN[role].demo;

  return (
    <>
      <Head title={`${title} | SIM-RS Rawat Jalan`} />
      <Header user={user} />
      <Sidebar role={role} />
      <main className="min-h-screen pb-10 pl-64 pt-16">
        <div className="flex flex-col gap-6 pl-3 pr-9 pt-2">{children}</div>
      </main>
      <Toaster />
    </>
  );
}
