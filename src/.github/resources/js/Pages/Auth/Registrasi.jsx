// MF-IM-001 | UI-001 | Registrasi Pasien Baru | Penulis: MF
// STATUS: BELUM DIKERJAKAN (kerangka awal). Ganti isinya mengikuti Figma dan Modul 2 bagian 3.7 (UI-001).
import { Head } from '@inertiajs/react';
import Callout from '../../Components/ui/Callout';

// Halaman tanpa Header/Sidebar (belum login), jadi tidak memakai AppLayout.
export default function Registrasi() {
  return (
    <>
      <Head title="Registrasi Pasien Baru | SIM-RS Rawat Jalan" />
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 p-6">
        <h1 className="text-[31px] font-bold leading-10 text-ink">Registrasi Pasien Baru</h1>
        <Callout>Kerangka UI-001 (MF-IM-001). Belum dikerjakan.</Callout>
      </div>
    </>
  );
}
