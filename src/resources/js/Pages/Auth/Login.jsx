// MF-IM-002 | UI-002 | Login | Penulis: MF
// STATUS: BELUM DIKERJAKAN (kerangka awal). Ganti isinya mengikuti Figma dan Modul 2 bagian 3.7 (UI-002).
import { Head } from '@inertiajs/react';
import Callout from '../../Components/ui/Callout';

// Halaman tanpa Header/Sidebar (belum login), jadi tidak memakai AppLayout.
export default function Login() {
  return (
    <>
      <Head title="Login | SIM-RS Rawat Jalan" />
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 p-6">
        <h1 className="text-[31px] font-bold leading-10 text-ink">Login</h1>
        <Callout>Kerangka UI-002 (MF-IM-002). Belum dikerjakan.</Callout>
      </div>
    </>
  );
}
