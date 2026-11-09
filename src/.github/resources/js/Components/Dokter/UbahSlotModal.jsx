// MH-IM-002 | UI-013 | Pop-up Konfirmasi Ubah Slot Dokter | Penulis: MH
// STATUS: BELUM DIKERJAKAN (kerangka awal). Ganti isinya mengikuti Figma dan Modul 2 bagian 3.7 (UI-013).
// Komponen pop-up. Dipanggil dari halaman induk dengan <UbahSlotModal open={...} onClose={...} />.
import Modal from '../../Components/ui/Modal';
import Button from '../../Components/ui/Button';

export default function UbahSlotModal({ open, onClose }) {
  return (
    <Modal
      open={open} onClose={onClose} title="Pop-up Konfirmasi Ubah Slot Dokter"
      footer={<Button variant="secondary" onClick={onClose}>Tutup</Button>}
    >
      Kerangka UI-013 (MH-IM-002). Belum dikerjakan.
    </Modal>
  );
}
