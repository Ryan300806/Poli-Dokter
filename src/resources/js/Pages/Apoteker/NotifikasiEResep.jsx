// RG-IM-004 | UI-021 | Notifikasi Apoteker | Penulis: RG
// STATUS: BELUM DIKERJAKAN (kerangka awal). Ganti isinya mengikuti Figma dan Modul 2 bagian 3.7 (UI-021).
// Rute: GET /apoteker/notifikasi-eresep  (nama rute apoteker.notifikasi-eresep)
import AppLayout from '../../Layouts/AppLayout';
import PageHeader from '../../Components/ui/PageHeader';
import Callout from '../../Components/ui/Callout';

export default function NotifikasiEResep() {
  return (
    <AppLayout role="apoteker" title="Notifikasi Apoteker">
      <PageHeader title="Notifikasi Apoteker" />
      <Callout>Kerangka UI-021 (RG-IM-004). Belum dikerjakan.</Callout>
    </AppLayout>
  );
}
