// RG-IM-002 | UI-019 | Pop-up Hapus Slot | Penulis: RG
// STATUS: BELUM DIKERJAKAN (kerangka awal). Ganti isinya mengikuti Figma dan Modul 2 bagian 3.7 (UI-019).
// Komponen pop-up. Dipanggil dari halaman induk dengan <HapusSlotModal open={...} onClose={...} />.
import Modal from '../../Components/ui/Modal';
import Button from '../../Components/ui/Button';

export default function HapusSlotModal({ open, onClose }) {
  return (
    <Modal
      open={open} onClose={onClose} title="Pop-up Hapus Slot"
      footer={<Button variant="secondary" onClick={onClose}>Tutup</Button>}
    >
      Kerangka UI-019 (RG-IM-002). Belum dikerjakan.
    </Modal>
  );
}
