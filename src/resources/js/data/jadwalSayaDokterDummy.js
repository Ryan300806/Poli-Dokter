// Data contoh untuk UI-009 (Jadwal Saya Dokter). Bentuknya sama dengan data yang nanti dikirim BE.
// Tanggal dibuat relatif terhadap hari ini supaya halaman selalu punya data saat didemokan.
function keISO(d) {
  const bulan = String(d.getMonth() + 1).padStart(2, '0');
  const hari = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${bulan}-${hari}`;
}

function tanggalOffset(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return keISO(d);
}

export const praktikContoh = {
  poli: 'Poli Penyakit Dalam',
  ruang: 'Ruang 304',
};

// kapasitas = jumlah maksimum pasien pada slot, terisi = jumlah pasien yang sudah terdaftar
export const jadwalContoh = [
  // Kemarin (dipakai untuk perbandingan "dari kemarin")
  { id: 1, tanggal: tanggalOffset(-1), jamMulai: '08:00', jamSelesai: '09:00', kapasitas: 8, terisi: 8 },
  { id: 2, tanggal: tanggalOffset(-1), jamMulai: '09:00', jamSelesai: '10:00', kapasitas: 8, terisi: 7 },
  { id: 3, tanggal: tanggalOffset(-1), jamMulai: '13:00', jamSelesai: '14:00', kapasitas: 6, terisi: 5 },
  // Hari ini
  { id: 4, tanggal: tanggalOffset(0), jamMulai: '08:00', jamSelesai: '09:00', kapasitas: 8, terisi: 8 },
  { id: 5, tanggal: tanggalOffset(0), jamMulai: '09:00', jamSelesai: '10:00', kapasitas: 8, terisi: 6 },
  { id: 6, tanggal: tanggalOffset(0), jamMulai: '10:00', jamSelesai: '11:00', kapasitas: 8, terisi: 3 },
  { id: 7, tanggal: tanggalOffset(0), jamMulai: '13:00', jamSelesai: '14:00', kapasitas: 6, terisi: 5 },
  { id: 8, tanggal: tanggalOffset(0), jamMulai: '14:00', jamSelesai: '15:00', kapasitas: 6, terisi: 2 },
  // Besok
  { id: 9, tanggal: tanggalOffset(1), jamMulai: '08:00', jamSelesai: '09:00', kapasitas: 8, terisi: 2 },
  { id: 10, tanggal: tanggalOffset(1), jamMulai: '09:00', jamSelesai: '10:00', kapasitas: 8, terisi: 0 },
];

// status: 'siap' | 'menunggu'
export const pasienTerdaftarContoh = [
  { id: 1, tanggal: tanggalOffset(0), nama: 'Budi Santoso', antrean: 'A-012', jam: '09:00', status: 'siap' },
  { id: 2, tanggal: tanggalOffset(0), nama: 'Siti Nurhaliza', antrean: 'A-013', jam: '09:15', status: 'menunggu' },
  { id: 3, tanggal: tanggalOffset(0), nama: 'Rian Hidayat', antrean: 'A-014', jam: '09:30', status: 'menunggu' },
  { id: 4, tanggal: tanggalOffset(0), nama: 'Dewi Sartika', antrean: 'A-015', jam: '09:45', status: 'menunggu' },
  { id: 5, tanggal: tanggalOffset(0), nama: 'Ahmad Faisal', antrean: 'A-016', jam: '10:00', status: 'menunggu' },
];