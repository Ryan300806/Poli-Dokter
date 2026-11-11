// MH-IM-001 | UI-012 | Jadwal Saya Pasien (termasuk form ubah jadwal) | Penulis: MH
// STATUS: BELUM DIKERJAKAN (kerangka awal). Ganti isinya mengikuti Figma dan Modul 2 bagian 3.7 (UI-012).
// Rute: GET /pasien/jadwal-saya  (nama rute pasien.jadwal-saya)
import AppLayout from '../../Layouts/AppLayout';
import PageHeader from '../../Components/ui/PageHeader';
import Callout from '../../Components/ui/Callout';

export default function JadwalSaya() {
  return (
    <AppLayout role="pasien" title="Jadwal Saya Pasien (termasuk form ubah jadwal)">
      <PageHeader title="Jadwal Saya Pasien (termasuk form ubah jadwal)" />
      <Callout>Kerangka UI-012 (MH-IM-001). Belum dikerjakan.</Callout>
    </AppLayout>
  );
}
