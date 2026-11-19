const dengan = (dasar, id) => (id ? `${dasar}/${id}` : dasar);

export const rute = {
  registrasi: '/registrasi',
  login: '/login',
  logout: '/logout',

  pasien: {
    beranda: '/pasien/beranda',
    penjadwalanPoli: '/pasien/penjadwalan-poli',
    reservasi: '/pasien/reservasi',
    riwayatReservasi: '/pasien/riwayat-reservasi',
    ubahReservasi: (id) => `/pasien/reservasi/${id}/jadwal`,
    batalkanReservasi: (id) => `/pasien/reservasi/${id}`,
    profil: '/pasien/profil',
  },

  perawat: {
    antreanTriage: '/perawat/antrean-triage',
    formObservasi: (id) => dengan('/perawat/form-observasi', id),
  },

  dokter: {
    antreanPeriksa: '/dokter/antrean-periksa',
    jadwalSaya: '/dokter/jadwal-saya',
    riwayatMedis: (id) => dengan('/dokter/riwayat-medis', id),
    formDiagnosis: (id) => dengan('/dokter/form-diagnosis', id),
    formEResep: (id) => dengan('/dokter/form-eresep', id),
  },

  apoteker: {
    notifikasiEResep: '/apoteker/notifikasi-eresep',
    rincianEResep: (id) => dengan('/apoteker/rincian-eresep', id),
    pengirimanObat: (id) => dengan('/apoteker/pengiriman-obat', id),
  },
};
