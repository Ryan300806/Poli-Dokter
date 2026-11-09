// KH-IM-003 | UI-009 | Jadwal Saya Dokter (termasuk pop-up Tambah Slot) | Penulis: KH
// STATUS: BELUM DIKERJAKAN (kerangka awal). Ganti isinya mengikuti Figma dan Modul 2 bagian 3.7 (UI-009).
// Rute: GET /dokter/jadwal-saya  (nama rute dokter.jadwal-saya)
import AppLayout from '../../Layouts/AppLayout';
import PageHeader from '../../Components/ui/PageHeader';
import Callout from '../../Components/ui/Callout';

export default function JadwalSaya() {
  return (
    <AppLayout role="dokter" title="Jadwal Saya Dokter (termasuk pop-up Tambah Slot)">
      <PageHeader title="Jadwal Saya Dokter (termasuk pop-up Tambah Slot)" />
      <Callout>Kerangka UI-009 (KH-IM-003). Belum dikerjakan.</Callout>
    </AppLayout>
  );
}
