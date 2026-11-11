// RG-IM-001 | UI-018 | Pop-up Pembatalan Reservasi | Penulis: RG
// STATUS: BELUM DIKERJAKAN (kerangka awal). Ganti isinya mengikuti Figma dan Modul 2 bagian 3.7 (UI-018).
// Komponen pop-up. Dipanggil dari halaman induk dengan <BatalReservasiModal open={...} onClose={...} />.
import Modal from '../../Components/ui/Modal';
import Button from '../../Components/ui/Button';

export default function BatalReservasiModal({ open, onClose }) {
  return (
    <Modal
      open={open} onClose={onClose} title="Pop-up Pembatalan Reservasi"
      footer={<Button variant="secondary" onClick={onClose}>Tutup</Button>}
    >
      Kerangka UI-018 (RG-IM-001). Belum dikerjakan.
    </Modal>
  );
}
