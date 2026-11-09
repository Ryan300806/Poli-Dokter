// MF-IM-005 | UI-005 | Edit Data Pasien (Pop-up) | Penulis: MF
// STATUS: BELUM DIKERJAKAN (kerangka awal). Ganti isinya mengikuti Figma dan Modul 2 bagian 3.7 (UI-005).
// Komponen pop-up. Dipanggil dari halaman induk dengan <EditDataModal open={...} onClose={...} />.
import Modal from '../../Components/ui/Modal';
import Button from '../../Components/ui/Button';

export default function EditDataModal({ open, onClose }) {
  return (
    <Modal
      open={open} onClose={onClose} title="Edit Data Pasien (Pop-up)"
      footer={<Button variant="secondary" onClick={onClose}>Tutup</Button>}
    >
      Kerangka UI-005 (MF-IM-005). Belum dikerjakan.
    </Modal>
  );
}
