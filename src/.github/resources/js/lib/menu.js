// lib/menu.js
// Isi menu sidebar per peran. Sumber: Modul 2 (Sidebar Menu tiap peran) dan Figma (Aside).
// href berupa string atau fungsi tanpa argumen. Jika href kosong, menu belum punya UI di Modul 2
// dan akan menampilkan toast "belum tersedia" saat diklik.
import {
  LayoutGrid, CalendarDays, Users, History, ClipboardList, FileText, Home, CalendarCheck,
  Calendar, IdCard, BriefcaseMedical, List, BellRing, ScrollText, FlaskConical, Package, Settings,
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
    demo: { nama: 'dr. Andi Pratama, Sp.PD', peran: 'Dokter Spesialis Poli' },
    menu: [
      { label: 'Beranda', ikon: LayoutGrid, href: null },
      { label: 'Jadwal Saya', ikon: CalendarDays, href: rute.dokter.jadwalSaya },
      { label: 'Antrean Periksa', ikon: Users, href: rute.dokter.antreanPeriksa },
      { label: 'Riwayat Medis', ikon: History, href: rute.dokter.riwayatMedis() },
      { label: 'Form Diagnosis', ikon: ClipboardList, href: rute.dokter.formDiagnosis() },
      { label: 'E-Resep', ikon: FileText, href: rute.dokter.formEResep() },
    ],
  },
  perawat: {
    judulMenu: 'Portal Perawat',
    labelPeran: 'Perawat',
    demo: { nama: 'Ns. Rina Marlina', peran: 'Perawat' },
    menu: [
      { label: 'Beranda Utama', ikon: LayoutGrid, href: null },
      { label: 'Triase Rawat Jalan', ikon: BriefcaseMedical, href: rute.perawat.antreanTriage },
      { label: 'Daftar Pasien Poli', ikon: List, href: null },
    ],
  },
  apoteker: {
    judulMenu: 'Pelayanan Rawat Jalan',
    labelPeran: 'Apoteker',
    demo: { nama: 'Apt. Dimas Prakoso', peran: 'Apoteker' },
    menu: [
      { label: 'Beranda Apoteker', ikon: LayoutGrid, href: null },
      { label: 'Notifikasi E-Resep', ikon: BellRing, href: rute.apoteker.notifikasiEResep },
      { label: 'Daftar E-Resep', ikon: ScrollText, href: rute.apoteker.rincianEResep() },
      { label: 'Peracikan Obat', ikon: FlaskConical, href: null },
      { label: 'Pengiriman Obat', ikon: Package, href: rute.apoteker.pengirimanObat() },
      { label: 'Riwayat Pengiriman', ikon: History, href: null },
    ],
    menuSistem: [{ label: 'Pengaturan', ikon: Settings, href: null }],
  },
};
