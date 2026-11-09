// MH-IM-004 | UI-015 | Riwayat Medis / Dasbor | Penulis: MH
// STATUS: BELUM DIKERJAKAN (kerangka awal). Ganti isinya mengikuti Figma dan Modul 2 bagian 3.7 (UI-015).
// Rute: GET /dokter/riwayat-medis/{antrean?}  (nama rute dokter.riwayat-medis)
import AppLayout from '../../Layouts/AppLayout';
import PageHeader from '../../Components/ui/PageHeader';
import Callout from '../../Components/ui/Callout';

export default function RiwayatMedis() {
  return (
    <AppLayout role="dokter" title="Riwayat Medis / Dasbor">
      <PageHeader title="Riwayat Medis / Dasbor" />
      <Callout>Kerangka UI-015 (MH-IM-004). Belum dikerjakan.</Callout>
    </AppLayout>
  );
}
