// KH-IM-002 | UI-008 | Riwayat Reservasi / Tiket Antrean | Penulis: KH
// STATUS: BELUM DIKERJAKAN (kerangka awal). Ganti isinya mengikuti Figma dan Modul 2 bagian 3.7 (UI-008).
// Rute: GET /pasien/riwayat-reservasi  (nama rute pasien.riwayat-reservasi)
import AppLayout from '../../Layouts/AppLayout';
import PageHeader from '../../Components/ui/PageHeader';
import Callout from '../../Components/ui/Callout';

export default function RiwayatReservasi() {
  return (
    <AppLayout role="pasien" title="Riwayat Reservasi / Tiket Antrean">
      <PageHeader title="Riwayat Reservasi / Tiket Antrean" />
      <Callout>Kerangka UI-008 (KH-IM-002). Belum dikerjakan.</Callout>
    </AppLayout>
  );
}
