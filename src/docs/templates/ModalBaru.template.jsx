// [INISIAL]-IM-[NNN] | UI-[NNN] | [Nama Pop-up sesuai Modul 2] | Penulis: [INISIAL]
// Sumber desain: Figma node [id node]. Sumber kebutuhan: Modul 2 bagian 3.7 (UI-[NNN]).
// Dipanggil dari halaman induk: <NamaModal open={terbuka} onClose={() => setTerbuka(false)} onKonfirmasi={...} />
//
// CARA PAKAI: salin ke resources/js/Components/[Peran]/[NamaModal].jsx, isi tanda [ ... ], hapus blok "CARA PAKAI".
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function NamaModal({ open, onClose, onKonfirmasi }) {
  return (
    <Modal
      open={open} onClose={onClose} title="Judul Pop-up"
      description="Kalimat penjelasan singkat (opsional)."
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Batal</Button>
          <Button onClick={onKonfirmasi}>Ya, Lanjutkan</Button>
        </>
      )}
    >
      Isi pop-up.
    </Modal>
  );
}
