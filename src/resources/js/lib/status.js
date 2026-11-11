// lib/status.js
// Pemetaan status Modul 2 ke tampilan Badge. Pakai ini supaya warna status sama di semua halaman.
export const STATUS_PEMERIKSAAN = {
  menunggu: { label: 'Menunggu Giliran', tone: 'neutral', dot: true },
  sedang: { label: 'Sedang Diperiksa', tone: 'solid', dot: true },
  selesai: { label: 'Selesai', tone: 'muted', check: true },
};

export const OPSI_FILTER_STATUS = [
  { value: 'semua', label: 'Semua Status' },
  { value: 'menunggu', label: 'Menunggu' },
  { value: 'sedang', label: 'Sedang Diperiksa' },
  { value: 'selesai', label: 'Selesai' },
];
