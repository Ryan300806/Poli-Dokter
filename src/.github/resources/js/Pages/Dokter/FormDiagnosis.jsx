// KH-IM-005 | UI-011 | Form Diagnosis | Penulis: KH
// STATUS: BELUM DIKERJAKAN (kerangka awal). Ganti isinya mengikuti Figma dan Modul 2 bagian 3.7 (UI-011).
// Rute: GET /dokter/form-diagnosis/{antrean?}  (nama rute dokter.form-diagnosis)
import AppLayout from '../../Layouts/AppLayout';
import PageHeader from '../../Components/ui/PageHeader';
import Callout from '../../Components/ui/Callout';

export default function FormDiagnosis() {
  return (
    <AppLayout role="dokter" title="Form Diagnosis">
      <PageHeader title="Form Diagnosis" />
      <Callout>Kerangka UI-011 (KH-IM-005). Belum dikerjakan.</Callout>
    </AppLayout>
  );
}
