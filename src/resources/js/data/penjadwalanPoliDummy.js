// Data contoh untuk UI-007 (Penjadwalan Poli). Bentuknya sama dengan data yang nanti dikirim BE.
// hariPraktik: 0 = Minggu, 1 = Senin, ... 6 = Sabtu
// slot.kuota = total kuota sesi, slot.sisa = sisa kuota (0 berarti penuh)
export const poliContoh = [
  { id: 1, nama: 'Poli Penyakit Dalam' },
  { id: 2, nama: 'Poli Anak' },
  { id: 3, nama: 'Poli Jantung' },
];

export const dokterContoh = [
  {
    id: 1,
    idPoli: 1,
    nama: 'dr. Andi Pratama, Sp.PD',
    sip: '449/SIP-DS/2021',
    rating: 4.9,
    ulasan: 128,
    ruang: 'Ruang 204',
    hariPraktik: [1, 2, 3, 4, 5],
    slot: [
      { id: 101, jam: '08:00', kuota: 5, sisa: 3 },
      { id: 102, jam: '09:00', kuota: 5, sisa: 2 },
      { id: 103, jam: '10:00', kuota: 5, sisa: 1 },
      { id: 104, jam: '11:00', kuota: 5, sisa: 0 },
    ],
  },
  {
    id: 2,
    idPoli: 1,
    nama: 'dr. Rina Kusuma, Sp.PD',
    sip: '449/SIP-DS/2022',
    rating: 4.8,
    ulasan: 76,
    ruang: 'Ruang 205',
    hariPraktik: [2, 4],
    slot: [
      { id: 201, jam: '13:00', kuota: 4, sisa: 4 },
      { id: 202, jam: '14:00', kuota: 4, sisa: 2 },
    ],
  },
  {
    id: 3,
    idPoli: 2,
    nama: 'dr. Faluppi, Sp.A',
    sip: '449/SIP-DS/2021',
    rating: 4.9,
    ulasan: 93,
    ruang: 'Ruang 204',
    hariPraktik: [1, 2, 3, 4, 5, 6],
    slot: [
      { id: 301, jam: '08:00', kuota: 5, sisa: 3 },
      { id: 302, jam: '09:00', kuota: 5, sisa: 2 },
      { id: 303, jam: '10:00', kuota: 5, sisa: 1 },
      { id: 304, jam: '11:00', kuota: 5, sisa: 0 },
    ],
  },
  {
    id: 4,
    idPoli: 3,
    nama: 'dr. Budi Hartono, Sp.JP',
    sip: '449/SIP-DS/2020',
    rating: 4.7,
    ulasan: 54,
    ruang: 'Ruang 301',
    hariPraktik: [1, 3, 5],
    slot: [
      { id: 401, jam: '10:00', kuota: 4, sisa: 2 },
      { id: 402, jam: '11:00', kuota: 4, sisa: 4 },
    ],
  },
];