// lib/format.js: fungsi format tampilan yang dipakai banyak halaman.
export function tanggalHariIni(tanggal = new Date()) {
  return tanggal.toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function inisial(nama = '') {
  const kata = nama.replace(/^(dr|ns|apt)\.?\s+/i, '').trim().split(/\s+/);
  return ((kata[0]?.[0] ?? '') + (kata[1]?.[0] ?? '')).toUpperCase();
}
