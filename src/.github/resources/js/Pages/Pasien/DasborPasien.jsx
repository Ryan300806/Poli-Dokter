// KH-IM-004 | UI-010 | Dasbor Pasien (Beranda) | Penulis: KH
// STATUS: BELUM DIKERJAKAN (kerangka awal). Ganti isinya mengikuti Figma dan Modul 2 bagian 3.7 (UI-010).
// Rute: GET /pasien/dasbor  (nama rute pasien.dasbor)
import AppLayout from '../../Layouts/AppLayout';
import PageHeader from '../../Components/ui/PageHeader';
import Callout from '../../Components/ui/Callout';

export default function DasborPasien() {
  return (
    <AppLayout role="pasien" title="Dasbor Pasien (Beranda)">
      <PageHeader title="Dasbor Pasien (Beranda)" />
      <Callout>Kerangka UI-010 (KH-IM-004). Belum dikerjakan.</Callout>
    </AppLayout>
  );
}
