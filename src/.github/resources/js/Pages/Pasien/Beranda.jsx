// MF-IM-003 | UI-003 | Beranda Pasien | Penulis: MF
// STATUS: BELUM DIKERJAKAN (kerangka awal). Ganti isinya mengikuti Figma dan Modul 2 bagian 3.7 (UI-003).
// Rute: GET /pasien/beranda  (nama rute pasien.beranda)
import AppLayout from '../../Layouts/AppLayout';
import PageHeader from '../../Components/ui/PageHeader';
import Callout from '../../Components/ui/Callout';

export default function Beranda() {
  return (
    <AppLayout role="pasien" title="Beranda Pasien">
      <PageHeader title="Beranda Pasien" />
      <Callout>Kerangka UI-003 (MF-IM-003). Belum dikerjakan.</Callout>
    </AppLayout>
  );
}
