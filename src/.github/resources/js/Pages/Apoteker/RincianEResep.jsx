// RG-IM-005 | UI-022 | Rincian E-Resep & Ketersediaan Obat | Penulis: RG
// STATUS: BELUM DIKERJAKAN (kerangka awal). Ganti isinya mengikuti Figma dan Modul 2 bagian 3.7 (UI-022).
// Rute: GET /apoteker/rincian-eresep/{eresep?}  (nama rute apoteker.rincian-eresep)
import AppLayout from '../../Layouts/AppLayout';
import PageHeader from '../../Components/ui/PageHeader';
import Callout from '../../Components/ui/Callout';

export default function RincianEResep() {
  return (
    <AppLayout role="apoteker" title="Rincian E-Resep & Ketersediaan Obat">
      <PageHeader title="Rincian E-Resep & Ketersediaan Obat" />
      <Callout>Kerangka UI-022 (RG-IM-005). Belum dikerjakan.</Callout>
    </AppLayout>
  );
}
