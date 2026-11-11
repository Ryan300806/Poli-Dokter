// RG-IM-006 | UI-023 | Pengiriman Obat | Penulis: RG
// STATUS: BELUM DIKERJAKAN (kerangka awal). Ganti isinya mengikuti Figma dan Modul 2 bagian 3.7 (UI-023).
// Rute: GET /apoteker/pengiriman-obat/{eresep?}  (nama rute apoteker.pengiriman-obat)
import AppLayout from '../../Layouts/AppLayout';
import PageHeader from '../../Components/ui/PageHeader';
import Callout from '../../Components/ui/Callout';

export default function PengirimanObat() {
  return (
    <AppLayout role="apoteker" title="Pengiriman Obat">
      <PageHeader title="Pengiriman Obat" />
      <Callout>Kerangka UI-023 (RG-IM-006). Belum dikerjakan.</Callout>
    </AppLayout>
  );
}
