export function bacaDemo(key, nilaiAwal) {
  if (typeof window === 'undefined') return nilaiAwal;

  try {
    const tersimpan = window.localStorage.getItem(key);
    return tersimpan ? JSON.parse(tersimpan) : nilaiAwal;
  } catch (error) {
    console.error(`Gagal membaca data demo "${key}".`, error);
    return nilaiAwal;
  }
}

export function simpanDemo(key, nilai) {
  if (typeof window === 'undefined') {
    throw new Error('Penyimpanan demo hanya tersedia di browser.');
  }

  window.localStorage.setItem(key, JSON.stringify(nilai));
}
