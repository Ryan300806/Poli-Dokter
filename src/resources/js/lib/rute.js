// lib/rute.js
// SATU-SATUNYA tempat yang boleh menulis URL halaman. Jangan menulis '/dokter/...' langsung di komponen.
// URL ini harus sama persis dengan routes/fe/*.php. Jika ada URL yang berubah, ubah di dua tempat itu saja.

const dengan = (dasar, id) => (id ? `${dasar}/${id}` : dasar);

export const rute = {
  // Autentikasi (MF)
  registrasi: '/registrasi',
  login: '/login',
  logout: '/logout', // POST, ditangani BE

  // Pasien
  pasien: {
    beranda: '/pasien/beranda', // UI-003 (MF)
    profil: '/pasien/profil', // UI-004 (MF)
    simpanProfil: '/pasien/profil',
    penjadwalanPoli: '/pasien/penjadwalan-poli', // UI-007 (KH)
    riwayatReservasi: '/pasien/riwayat-reservasi', // UI-008 (KH)
    dasbor: '/pasien/dasbor', // UI-010 (KH)
    jadwalSaya: '/pasien/jadwal-saya', // UI-012 (MH)
    reservasi: '/pasien/reservasi',
    ubahReservasi: (id) => `/pasien/reservasi/${id}/jadwal`,
    batalkanReservasi: (id) => `/pasien/reservasi/${id}`,
  },

  // Dokter
  dokter: {
    jadwalSaya: '/dokter/jadwal-saya', // UI-009 (KH)
    antreanPeriksa: '/dokter/antrean-periksa', // UI-014 (MH)
    riwayatMedis: (antreanId) => dengan('/dokter/riwayat-medis', antreanId), // UI-015 (MH)
    formDiagnosis: (antreanId) => dengan('/dokter/form-diagnosis', antreanId), // UI-011 (KH)
    formEResep: (antreanId) => dengan('/dokter/form-eresep', antreanId), // UI-020 (RG)
  },

  // Perawat
  perawat: {
    triage: '/perawat/triage', // UI-006 (MF)
    antreanTriage: '/perawat/antrean-triage', // UI-016 (MH)
    formObservasi: (antreanId) => dengan('/perawat/form-observasi', antreanId), // UI-017 (MH)
  },

  // Apoteker
  apoteker: {
    notifikasiEResep: '/apoteker/notifikasi-eresep', // UI-021 (RG)
    rincianEResep: (eresepId) => dengan('/apoteker/rincian-eresep', eresepId), // UI-022 (RG)
    pengirimanObat: (eresepId) => dengan('/apoteker/pengiriman-obat', eresepId), // UI-023 (RG)
  },
};
