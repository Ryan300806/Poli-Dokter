// MH-IM-006 | UI-017 | Form Observasi (TD, Suhu, BB) | Penulis: MH
// STATUS: BELUM DIKERJAKAN (kerangka awal). Ganti isinya mengikuti Figma dan Modul 2 bagian 3.7 (UI-017).
// Rute: GET /perawat/form-observasi/{antrean?}  (nama rute perawat.form-observasi)
import AppLayout from '../../Layouts/AppLayout';
import PageHeader from '../../Components/ui/PageHeader';
import Callout from '../../Components/ui/Callout';

export default function FormObservasi() {
  return (
    <AppLayout role="perawat" title="Form Observasi (TD, Suhu, BB)">
      <PageHeader title="Form Observasi (TD, Suhu, BB)" />
      <Callout>Kerangka UI-017 (MH-IM-006). Belum dikerjakan.</Callout>
    </AppLayout>
  );
}
