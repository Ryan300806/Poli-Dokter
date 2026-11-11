// lib/cn.js: gabungkan nama kelas, abaikan nilai kosong. Contoh: cn('px-3', aktif && 'bg-brand')
export const cn = (...kelas) => kelas.filter(Boolean).join(' ');
