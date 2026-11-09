// [INISIAL]-IM-[NNN] | UI-[NNN] | [Nama Halaman sesuai Modul 2] | Penulis: [INISIAL]
// Sumber desain: Figma node [id node]. Sumber kebutuhan: Modul 2 bagian 3.7 (UI-[NNN]).
// Rute: GET [/url]  (routes/fe/[inisial].php, nama rute [peran.nama-halaman])
// Props dari BE (opsional, bila belum ada dipakai data contoh): { [nama props] }
//
// CARA PAKAI TEMPLATE:
// 1. Salin berkas ini ke resources/js/Pages/[Peran]/[NamaHalaman].jsx (ganti isi kerangka yang sudah ada).
// 2. Isi semua tanda [ ... ] di komentar atas. Hapus komentar "CARA PAKAI" ini.
// 3. Ganti nama fungsi, role, dan title. Susun isi halaman dari Components/ui.
import { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import PageHeader from '../../Components/ui/PageHeader';
import Button from '../../Components/ui/Button';
import { toast } from '../../Components/ui/Toast';
import { rute } from '../../lib/rute';
// Data contoh (hapus bila halaman tidak butuh data): import { dataContoh } from '../../data/[namaDataContoh]';

export default function NamaHalaman(/* { dataDariBE = dataContoh } */) {
  // 1) State halaman (pencarian, filter, modal yang terbuka, dan sebagainya)
  const [contoh, setContoh] = useState(false);

  // 2) Fungsi aksi (satu fungsi untuk satu aksi pengguna, beri komentar singkat)
  function aksiContoh() {
    toast.success('Pesan sesuai Modul 2.');
  }

  // 3) Tampilan. Urutan blok mengikuti urutan elemen di Modul 2 dan Figma, dari atas ke bawah.
  return (
    <AppLayout role="dokter" title="Nama Halaman">
      <PageHeader title="Nama Halaman" />
      {/* Blok 1: ... */}
      {/* Blok 2: ... */}
    </AppLayout>
  );
}
