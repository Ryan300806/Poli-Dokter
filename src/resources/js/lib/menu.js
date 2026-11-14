// lib/menu.js
// Isi menu sidebar per peran. Sumber: Modul 2 (Sidebar Menu tiap peran) dan Figma (Aside).
// href berupa string atau fungsi tanpa argumen. Jika href kosong, menu belum punya UI di Modul 2
// dan akan menampilkan toast "belum tersedia" saat diklik.
import {
  LayoutGrid, CalendarDays, History, ClipboardList, FileText, Home, CalendarCheck,
  Calendar, IdCard, BriefcaseMedical,
} from 'lucide-react';
import { rute } from './rute';

export const PERAN = {
  pasien: {
    judulMenu: 'Portal Pasien',
    labelPeran: 'Pasien',
    demo: { nama: 'Karina', peran: 'Pasien' },
    menu: [
      { label: 'Beranda Pasien', ikon: Home, href: rute.pasien.beranda },
      { label: 'Penjadwalan Poli', ikon: CalendarCheck, href: rute.pasien.penjadwalanPoli },
      { label: 'Riwayat & Jadwal', ikon: Calendar, href: rute.pasien.jadwalSaya },
      { label: 'Profile Pasien', ikon: IdCard, href: rute.pasien.profil },
    ],
  },
  dokter: {
    judulMenu: 'Layanan Dokter',
    labelPeran: 'Dokter Spesialis Poli',
    demo: { nama: 'Ns. Siti Rahma, S.Kep', peran: 'Dokter', avatar: '/images/figma/staff-avatar.jpeg' },
    menu: [
      { label: 'Beranda', ikon: LayoutGrid, href: rute.dokter.antreanPeriksa },
      { label: 'Jadwal Saya', ikon: CalendarDays, href: rute.dokter.jadwalSaya },
      { label: 'Riwayat Medis', ikon: History, href: rute.dokter.riwayatMedis() },
      { label: 'Form Diagnosis', ikon: ClipboardList, href: rute.dokter.formDiagnosis() },
      { label: 'E-Resep', ikon: FileText, href: rute.dokter.formEResep() },
    ],
  },
  perawat: {
    judulMenu: 'Layanan Perawat',
    labelPeran: 'Perawat',
    demo: { nama: 'Ns. Siti Rahma, S.Kep', peran: 'Perawat', avatar: '/images/figma/staff-avatar.jpeg' },
    menu: [
      { label: 'Beranda', ikon: LayoutGrid, href: rute.perawat.antreanTriage },
      { label: 'Triase Rawat Jalan', ikon: BriefcaseMedical, href: rute.perawat.formObservasi() },
    ],
  },
  apoteker: {
    judulMenu: 'Pelayanan Rawat Jalan',
    labelPeran: 'Apoteker',
    demo: { nama: 'apt. Siti Rahma, S.Farm', peran: 'Apoteker Farmasi', avatar: '/images/figma/staff-avatar.jpeg' },
    menu: [
      { label: 'Beranda', ikon: LayoutGrid, href: rute.apoteker.notifikasiEResep },
    ],
  },
};
