// Data contoh untuk UI-010 (Dasbor Pasien). Bentuknya sama dengan data yang nanti dikirim BE.
// Tanggal dibuat relatif terhadap hari ini supaya label "Hari Ini / Besok" selalu terlihat saat didemokan.
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

export const pasienContoh = {
  nama: 'Karina',
  nik: '327104******0002',
};

// Satu objek = satu kunjungan terkonfirmasi (dipakai oleh kartu di halaman DAN pop-up detail tiket)
export const kunjunganContoh = [
  {
    id: 1,
    tanggal: tanggalOffset(0),
    jam: '09:00',
    sesi: 'Pagi',
    poli: 'Poli Penyakit Dalam',
    dokter: 'dr. Andi Pratama, Sp.PD',
    gedung: 'Gedung A',
    lokasi: 'Gedung A, Lt. 2',
    ruang: 'Ruang 204',
    nomorAntrean: 'A-012',
    estimasiDipanggil: '09:15',
    antreanSebelum: 3,
    sedangMelayani: 'A-009',
  },
  {
    id: 2,
    tanggal: tanggalOffset(1),
    jam: '10:00',
    sesi: 'Pagi',
    poli: 'Poli Anak',
    dokter: 'dr. Faluppi, Sp.A',
    gedung: 'Gedung A',
    lokasi: 'Gedung A, Lt. 2',
    ruang: 'Ruang 205',
    nomorAntrean: 'A-007',
    estimasiDipanggil: '10:20',
    antreanSebelum: 2,
    sedangMelayani: 'A-004',
  },
];