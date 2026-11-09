// RG-IM-003 | UI-020 | Form E-Resep (Dokter) | Penulis: RG
// STATUS: BELUM DIKERJAKAN (kerangka awal). Ganti isinya mengikuti Figma dan Modul 2 bagian 3.7 (UI-020).
// Rute: GET /dokter/form-eresep/{antrean?}  (nama rute dokter.form-eresep)
import AppLayout from '../../Layouts/AppLayout';
import PageHeader from '../../Components/ui/PageHeader';
import Callout from '../../Components/ui/Callout';

export default function FormEResep() {
  return (
    <AppLayout role="dokter" title="Form E-Resep (Dokter)">
      <PageHeader title="Form E-Resep (Dokter)" />
      <Callout>Kerangka UI-020 (RG-IM-003). Belum dikerjakan.</Callout>
    </AppLayout>
  );
}
